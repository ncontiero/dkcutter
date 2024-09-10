import type {
  ChoicesTypeEnumProps,
  ConfigChoiceProps,
  ConfigObjectProps,
  ConfigObjectValue,
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
import { logger } from "@/utils/logger";
import { renderer } from "@/utils/renderer";
import { createPromptObjects } from "./prompts";

/**
 * Generates a Zod schema based on the provided configuration value, key, regex, choices, and choices type.
 *
 * This function constructs a Zod schema for validating and transforming configuration values.
 * It handles different types of values, choices, regex patterns, and multiselect options.
 *
 * @param {ConfigObjectValue} value - The configuration value to validate.
 * @param {string} key - The key associated with the configuration value.
 * @param {RegExp} [regex] - Optional regular expression pattern for validation.
 * @param {ConfigChoiceProps[]} [choices] - Optional array of valid choices for the value.
 * @param {ChoicesTypeEnumProps} [choicesType] - Optional type of choices (e.g., multiselect).
 * @returns {z.ZodType<any, any, any>} - The Zod schema for the provided configuration value.
 */
function contextSchema(
  value: ConfigObjectValue,
  key: string,
  regex?: RegExp,
  choices?: ConfigChoiceProps[],
  choicesType?: ChoicesTypeEnumProps,
): z.ZodType<any, any, any> {
  const err = {
    message: `Invalid value for ${key}: '${value}'.${choices ? ` Valid choices: ${choices.map((c) => c.value).join(", ")}` : ""}`,
    path: [key],
  };
  const baseSchema = z
    .string()
    .or(z.boolean())
    .transform((val) => val.toString())
    .optional();

  const choiceSchema = choices
    ? baseSchema.refine((val) => {
        if (val && choicesType === "multiselect") {
          return val
            .split(",")
            .every((choice) => choices.some((c) => c.value === choice));
        }
        return choices.some((c) => c.value === val);
      }, err)
    : baseSchema;

  const regexSchema = regex
    ? choiceSchema.refine((val) => (val ? regex.test(val) : true), err)
    : choiceSchema;

  const booleanTransform = regexSchema.transform((val) =>
    val === "false" || val === "true" ? val !== "false" : val,
  );

  const typeSchema = booleanTransform.refine((val) => {
    return (
      (typeof val === "string" && val.trim().length > 0) ||
      typeof val === "boolean"
    );
  }, err);

  return typeSchema.transform((v) => {
    if (choicesType === "multiselect" && typeof v === "string") {
      return v.split(",");
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
      logger.warn(`Option '${key}' is disabled with value "${contextValue}".`);
      context[key] = defaultValue;
    }
  }
}

type HandleContextReturn = {
  context: ContextProps;
  extraContext: ContextProps;
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
): HandleContextReturn {
  let newContext: HandleContextReturn = { context, extraContext: {} };
  if (process.argv.includes("--dkcutter.isCli=true")) {
    newContext = { ...newContext, extraContext: createCliOptions(context) };
  }
  context = { ...newContext.context, ...newContext.extraContext };
  for (const [key, value] of Object.entries(context)) {
    if (
      key.startsWith("_") ||
      (typeof value === "string" && NUNJUCKS_PATTERN.test(value))
    )
      continue;
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
    contextSchema(value, key, regex, choices, choicesType).parse(value);
    handleValuesDisabled(key, configValue, context);
  }
  newContext.context = context;
  return newContext;
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

  for (const [key, value] of Object.entries(config)) {
    const isMultiselect = isMultiselectFunc(value);
    const target = key.startsWith("_") ? internal : external;
    if (isArray(value)) {
      target[key] = isMultiselect ? [value[0]] : value[0];
    } else if (isObject(value)) {
      const v = isArray(value.value) ? value.value[0] : value.value;
      target[key] = isMultiselect && typeof v === "string" ? [v] : v;
    } else {
      target[key] =
        isMultiselect && typeof value === "string" ? [value] : value;
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
  let context = { ...internal, ...external, ...extraContext };
  const { context: newContext, extraContext: newExtraContext } = handleContext(
    context,
    config,
  );
  context = { ...newContext, ...newExtraContext };
  extraContext = { ...extraContext, ...newExtraContext };

  if (skip) {
    return renderContext(context);
  }
  const answers = await createPromptObjects(config, extraContext);

  for (const [key, value] of Object.entries(answers)) {
    if ([value].flat().length === 0) {
      const configValue = config[key];
      const defaultValue = getDefaultValue(configValue);
      answers[key] = [defaultValue];
    }
  }
  context = { ...internal, ...answers };

  return renderContext(context);
}
