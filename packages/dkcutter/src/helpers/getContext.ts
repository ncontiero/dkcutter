import type {
  ChoicesTypeEnumProps,
  ConfigChoiceProps,
  ConfigObjectProps,
  ConfigProps,
  ContextProps,
} from "./getConfig";

import { z, ZodError } from "zod";
import { createCliOptions } from "@/cli/options";
import { NUNJUCKS_PATTERN } from "@/consts";
import { ValidationError } from "@/helpers/errors";
import {
  getDefaultValue,
  isArray,
  isMultiselect as isMultiselectFunc,
  isObject,
} from "@/utils/dataHandler";
import { renderer, renderUnescaped } from "@/utils/renderer";
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
 */
function contextSchema(
  key: string,
  context: ContextProps,
  regex?: RegExp,
  choices?: ConfigChoiceProps[],
  choicesType?: ChoicesTypeEnumProps,
  regexMessage?: string,
) {
  const value = context[key];
  const availableChoices = choices?.filter(
    (c) => renderer.renderString(c.disabled || "false", context) !== "true",
  );

  const baseSchema = z
    .string()
    .or(z.boolean())
    .or(z.array(z.string()))
    .transform((val) => val.toString());

  const choiceSchema = choices
    ? baseSchema.refine(
        (val) => {
          if (val && choicesType === "multiselect") {
            const selectedChoices = val.trim().split(",");
            return selectedChoices.every(
              (choice) =>
                choice === "none" ||
                availableChoices?.some((c) => c.value === choice.trim()),
            );
          }
          return availableChoices?.some((c) => c.value === val);
        },
        {
          error: `Invalid value for ${key}: '${String(value)}'. Valid choices: ${availableChoices?.map((c) => c.value).join(", ") ?? ""}`,
          path: [key],
        },
      )
    : baseSchema;

  const regexSchema = regex
    ? choiceSchema.refine((val) => (val ? regex.test(val) : true), {
        error: regexMessage ?? `Invalid format for ${key}: '${String(value)}'.`,
        path: [key],
      })
    : choiceSchema;

  const booleanTransform = regexSchema.transform((val) =>
    val === "true" ? true : val === "false" ? false : val,
  );

  const typeSchema = booleanTransform.refine(
    (val) => {
      return (
        (typeof val === "string" && val.trim().length > 0) ||
        typeof val === "boolean"
      );
    },
    {
      error: `Value for ${key} cannot be empty.`,
      path: [key],
    },
  );

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

/**
 * Validates and normalizes a single context value against its configuration.
 * @param {string} key - The key of the value to validate.
 * @param {unknown} value - The value to validate.
 * @param {ConfigProps} config - The template configuration.
 * @param {ContextProps} context - The current context (used for error messages and choice conditions).
 * @returns {ContextProps[string]} - The validated value.
 * @throws {ValidationError} - If the value is invalid.
 */
function validateValue(
  key: string,
  value: unknown,
  config: ConfigProps,
  context: ContextProps,
): ContextProps[string] {
  const configValue = config[key];
  const regex =
    !isArray(configValue) && isObject(configValue)
      ? configValue.validateRegex?.regex
      : undefined;
  const regexMessage =
    !isArray(configValue) && isObject(configValue)
      ? configValue.validateRegex?.message
      : undefined;
  const choices = isArray(configValue)
    ? configValue.map((val) => ({ value: val }))
    : isObject(configValue)
      ? isArray(configValue.value)
        ? configValue.value.map((val) => ({ value: val }))
        : configValue.choices
      : undefined;
  const choicesType = isMultiselectFunc(configValue) ? "multiselect" : "select";

  try {
    return contextSchema(
      key,
      { ...context, [key]: value as ContextProps[string] },
      regex,
      choices,
      choicesType,
      regexMessage,
    ).parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError(`Invalid value for "${key}".`, {
        cause: error,
        zodError: error,
      });
    }
    throw error;
  }
}

/**
 * Validates values that were derived from templates (e.g. `"{{ projectName|lower }}"`)
 * after they have been rendered, since they cannot be validated beforehand.
 * @param {ContextProps} context - The rendered context.
 * @param {ConfigProps} config - The template configuration.
 * @param {Set<string>} keys - The keys whose values were derived from templates.
 * @returns {ContextProps} - The validated context.
 */
function validateDerivedValues(
  context: ContextProps,
  config: ConfigProps,
  keys: Set<string>,
): ContextProps {
  for (const key of keys) {
    const value = context[key];
    if (value == null || NUNJUCKS_PATTERN.test(String(value))) continue;
    context[key] = validateValue(key, value, config, context);
  }
  return context;
}

/**
 * Returns the public keys whose values are still Nunjucks templates.
 * @param {ContextProps} context - The context to inspect.
 * @returns {Set<string>} - The keys with template values.
 */
function getDerivedKeys(context: ContextProps): Set<string> {
  const keys = new Set<string>();
  for (const [key, value] of Object.entries(context)) {
    if (
      !key.startsWith("_") &&
      typeof value === "string" &&
      NUNJUCKS_PATTERN.test(value)
    ) {
      keys.add(key);
    }
  }
  return keys;
}

interface HandleContextReturn {
  fullContext: ContextProps;
  cliOptions: ContextProps;
}

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
  if (process.env.DKCUTTER_IS_CLI === "true") {
    cliOptions = createCliOptions(context);
  }

  const mergedContext = { ...context, ...extraContext, ...cliOptions };

  for (const [key, value] of Object.entries(mergedContext)) {
    const isDynamic = typeof value === "string" && NUNJUCKS_PATTERN.test(value);
    if (key.startsWith("_") || isDynamic) continue;

    mergedContext[key] = validateValue(key, value, config, mergedContext);
    handleValuesDisabled(key, config[key], mergedContext);
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
      context[key] = renderUnescaped(value, context);
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
  let context = { ...external, ...internal };

  const { fullContext, cliOptions } = handleContext(
    context,
    config,
    extraContext,
  );

  if (skip) {
    const derivedKeys = getDerivedKeys(fullContext);
    return validateDerivedValues(
      renderContext(fullContext),
      config,
      derivedKeys,
    );
  }
  const answers = await createPromptObjects(config, {
    ...extraContext,
    ...cliOptions,
  });

  for (const [key, value] of Object.entries(answers)) {
    if ([value].flat().length === 0) {
      const configValue = config[key];
      const defaultValue = getDefaultValue(configValue);
      answers[key] = Array.isArray(defaultValue)
        ? defaultValue
        : [defaultValue as string];
    }
  }
  context = { ...answers, ...internal }; // Re-assign context with answers

  const derivedKeys = getDerivedKeys(context);
  return validateDerivedValues(renderContext(context), config, derivedKeys);
}
