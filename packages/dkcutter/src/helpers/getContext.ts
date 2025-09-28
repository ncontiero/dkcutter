import type {
  ChoicesTypeEnumProps,
  ConfigChoiceProps,
  ConfigObjectProps,
  ConfigProps,
  ContextProps,
} from "./getConfig";

import { z } from "zod";
import { createCliOptions } from "@/cli/options";
import { NUNJUCKS_PATTERN } from "@/consts";
import {
  getDefaultValue,
  isArray,
  isMultiselect as isMultiselectFunc,
  isObject,
} from "@/utils/dataHandler";
import { renderer } from "@/utils/renderer";
import { createPromptObjects } from "./prompts";

/**
 * Generates a Zod schema based on the provided configuration value, key, regex, choices, and choices type.
 *
 * This function constructs a Zod schema for validating and transforming configuration values.
 * It handles different types of values, choices, regex patterns, and multiselect options.
 *
 * @param {string} key - The key associated with the configuration value.
 * @param {ContextProps} context - The context object containing configuration values.
 * @param {RegExp} [regex] - Optional regular expression pattern for validation.
 * @param {ConfigChoiceProps[]} [choices] - Optional array of valid choices for the value.
 * @param {ChoicesTypeEnumProps} [choicesType] - Optional type of choices (e.g., multiselect).
 * @returns {z.ZodType<any, any, any>} - The Zod schema for the provided configuration value.
 */
function contextSchema(
  key: string,
  context: ContextProps,
  regex?: RegExp,
  choices?: ConfigChoiceProps[],
  choicesType?: ChoicesTypeEnumProps,
): z.ZodType<any, any, any> {
  const value = context[key];
  const availableChoices = choices?.filter(
    (c) => renderer.renderString(c.disabled || "false", context) !== "true",
  );

  const err = {
    error: `Invalid value for ${key}: '${value}'.${availableChoices ? ` Valid choices: ${availableChoices.map((c) => c.value).join(", ")}` : ""}`,
    path: [key],
  };
  const baseSchema = z
    .string()
    .or(z.boolean())
    .or(z.array(z.string()))
    .transform((val) => val.toString())
    .optional();

  const choiceSchema = choices
    ? baseSchema.refine((val) => {
        if (val && choicesType === "multiselect") {
          const selectedChoices = val.trim().split(",");
          return selectedChoices.every(
            (choice) =>
              choice === "none" ||
              availableChoices?.some((c) => c.value === choice.trim()),
          );
        }
        return availableChoices?.some((c) => c.value === val);
      }, err)
    : baseSchema;

  const regexSchema = regex
    ? choiceSchema.refine((val) => (val ? regex.test(val) : true), err)
    : choiceSchema;

  const booleanTransform = regexSchema.transform((val) =>
    val === "true" ? true : val === "false" ? false : val,
  );

  const typeSchema = booleanTransform.refine((val) => {
    return (
      (typeof val === "string" && val.trim().length > 0) ||
      typeof val === "boolean"
    );
  }, err);

  return typeSchema.transform((v) => {
    if (choicesType === "multiselect" && typeof v === "string") {
      return v.split(",").map((s) => s.trim());
    }
    return v;
  });
}

/**
 * Handles disabled values for a specific option based on the configuration properties and context values.
 * @param {string} key - The key of the option to handle disabled values for.
 * @param {ConfigObjectProps} configValue - The configuration object defining the option properties.
 * @param {ContextProps} context - The context object containing the option values.
 */
function handleValuesDisabled(
  key: string,
  configValue: ConfigObjectProps,
  context: ContextProps,
) {
  const contextValue = context[key];
  const defaultValue = getDefaultValue(configValue);
  if (isObject(configValue) && !isArray(configValue)) {
    const disabled =
      configValue.disabled &&
      renderer.renderString(configValue.disabled, context);
    const choice = configValue.choices?.find(
      (choice) => choice.value === context[key],
    );
    const disabledChoice = renderer.renderString(
      choice?.disabled || "false",
      context,
    );
    if (
      (disabled === "true" || disabledChoice === "true") &&
      contextValue !== defaultValue
    ) {
      context[key] = defaultValue;
    }
  }
}

type HandleContextReturn = {
  fullContext: ContextProps;
  cliOptions: ContextProps;
};
/**
 * Handles context properties based on configuration and command-line arguments.
 *
 * This function processes the context properties by updating them according to the configuration and CLI options.
 * It iterates through the context properties, validates them using a schema, and handles disabled values.
 *
 * @param {ContextProps} context - The context object containing properties to be handled.
 * @param {ConfigProps} config - The configuration object used for validation and transformation.
 * @returns {HandleContextReturn} - The updated context object and extra context object.
 */
function handleContext(
  context: ContextProps,
  config: ConfigProps,
  extraContext: ContextProps,
): HandleContextReturn {
  let cliOptions: ContextProps = {};
  if (process.argv.includes("--dkcutter.isCli=true")) {
    cliOptions = createCliOptions(context);
  }

  const mergedContext = { ...context, ...extraContext, ...cliOptions };

  for (const [key, value] of Object.entries(mergedContext)) {
    const isDynamic = typeof value === "string" && NUNJUCKS_PATTERN.test(value);
    if (key.startsWith("_") || isDynamic) continue;

    const configValue = config[key];
    const regex =
      !isArray(configValue) && isObject(configValue)
        ? configValue.validateRegex?.regex
        : undefined;
    const choices = isArray(configValue)
      ? configValue.map((val) => ({ value: val }))
      : isObject(configValue)
        ? isArray(configValue.value)
          ? configValue.value.map((val) => ({ value: val }))
          : configValue.choices
        : undefined;
    const choicesType = isMultiselectFunc(configValue)
      ? "multiselect"
      : "select";

    contextSchema(key, mergedContext, regex, choices, choicesType).parse(value);
    handleValuesDisabled(key, configValue, mergedContext);
  }

  return { fullContext: mergedContext, cliOptions };
}

/**
 * Creates internal and external contexts based on the provided configuration.
 * @param {ConfigProps} config - The configuration object to create contexts from.
 * @returns {{ internal: ContextProps, external: ContextProps }} - Internal and external contexts.
 */
function createContext(config: ConfigProps): {
  internal: ContextProps;
  external: ContextProps;
} {
  const internal: ContextProps = {};
  const external: ContextProps = {};
  delete config.$schema;

  for (const [key, value] of Object.entries(config)) {
    const isMultiselect = isMultiselectFunc(value);
    const target = key.startsWith("_") ? internal : external;
    if (isArray(value)) {
      target[key] = value[0];
    } else if (isObject(value)) {
      const v = isArray(value.value) ? value.value[0] : value.value;
      if (isMultiselect && typeof v === "string") {
        target[key] = v.split(",").map((s) => s.trim());
      } else {
        target[key] = v;
      }
    } else {
      target[key] = value;
    }
  }
  return { internal, external };
}

/**
 * Renders string values within the context object using a renderer.
 * @param {ContextProps} context - The context object to render string values for.
 * @returns {ContextProps} - The context object with rendered string values.
 */
export function renderContext(context: ContextProps): ContextProps {
  for (const [key, value] of Object.entries(context)) {
    if (typeof value === "string") {
      context[key] = renderer.renderString(value, context);
    }
  }
  return context;
}

interface GetContext {
  /**
   * The configuration object to create contexts from.
   */
  config: ConfigProps;
  /**
   * Extra context to add to the context.
   */
  extraContext?: ContextProps;
  /**
   * Whether to skip the prompts.
   */
  skip?: boolean;
}

/**
 * Retrieves and processes context data based on the provided configuration and user input.
 * @param {GetContext} options - Object containing configuration, skip flag, and extra context data.
 * @returns {Promise<ContextProps>} - A Promise that resolves after processing the context data.
 */
export async function getContext({
  config,
  skip = false,
  extraContext = {},
}: GetContext): Promise<ContextProps> {
  const { internal, external } = createContext(config);
  let context = { ...internal, ...external };

  const { fullContext, cliOptions } = handleContext(
    context,
    config,
    extraContext,
  );

  if (skip) {
    return renderContext(fullContext);
  }
  const answers = await createPromptObjects(config, {
    ...extraContext,
    ...cliOptions,
  });

  for (const [key, value] of Object.entries(answers)) {
    if ([value].flat().length === 0) {
      const configValue = config[key];
      const defaultValue = getDefaultValue(configValue);
      answers[key] = [defaultValue];
    }
  }
  context = { ...internal, ...answers }; // Re-assign context with answers

  return renderContext(context);
}
