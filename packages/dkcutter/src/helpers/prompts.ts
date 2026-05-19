import type { ConfigObjectProps, ConfigProps, ContextProps } from "./getConfig";
import prompts from "prompts";
import { z } from "zod";

import { formatKeyMessage } from "@/utils";
import { isArray, isObject } from "@/utils/dataHandler";
import { renderer } from "@/utils/renderer";

type NormalizedConfig = Exclude<ConfigObjectProps, string | boolean | string[]>;

function normalizeConfigObject(config: ConfigObjectProps): NormalizedConfig {
  if (isArray(config)) {
    return {
      value: config[0],
      choices: config.map((val) => ({ value: val })),
    };
  }
  if (!isObject(config)) {
    return { value: config };
  }
  if (isArray(config.value)) {
    return {
      ...config,
      value: config.value[0],
      choices: config.value.map((val) => ({ value: val })),
    };
  }

  return config;
}

function getPromptType(
  answers: prompts.Answers<string>,
  normalizedValues: NormalizedConfig,
  haveChoices: boolean | undefined,
  isBoolean: boolean,
): prompts.PromptType | null {
  if (normalizedValues.disabled) {
    const condition = renderer.renderString(normalizedValues.disabled, answers);
    if (condition === "true") {
      return null;
    }
  }
  return haveChoices
    ? (normalizedValues.choicesType ?? "select")
    : isBoolean
      ? "toggle"
      : "text";
}

function getPromptChoices(
  answers: prompts.Answers<string>,
  choices: NormalizedConfig["choices"],
  haveChoices: boolean | undefined,
  initialValue: unknown,
) {
  if (!haveChoices || !choices) return [];
  return choices.map((choice) => {
    const disabled =
      renderer.renderString(choice.disabled || "false", answers) === "true";
    const title = `${choice.title || choice.value}${
      disabled && choice.helpTextForDisabled
        ? ` (${choice.helpTextForDisabled})`
        : ""
    }`;

    return {
      ...choice,
      title: renderer.renderString(title, answers),
      disabled,
      selected: choice.selected
        ? renderer.renderString(choice.selected, answers) === "true"
        : choice.value === initialValue,
      description: choice.description
        ? renderer.renderString(choice.description, answers)
        : undefined,
    };
  });
}

function getPromptInitialValue(
  answers: prompts.Answers<string>,
  initialValue: string | boolean,
  choices: NormalizedConfig["choices"],
  haveChoices: boolean | undefined,
): string | number | boolean {
  const valueRendered =
    typeof initialValue === "string"
      ? renderer.renderString(initialValue, answers)
      : initialValue;

  if (haveChoices && choices) {
    const index = choices.findIndex((choice) => choice.value === valueRendered);
    return index === -1 ? 0 : index;
  }

  return valueRendered;
}

function validatePromptValue(
  promptValue: unknown,
  validateRegex: NormalizedConfig["validateRegex"],
) {
  if (!validateRegex || typeof promptValue !== "string") return true;

  const message = validateRegex.message ?? "Please enter a valid value.";
  return (
    z.string().regex(validateRegex.regex).safeParse(promptValue).success ||
    message
  );
}

/**
 * Creates a prompt object based on the provided key and configuration object values.
 * @param {[string, ConfigObjectProps]} [key, objValues] - A tuple containing the key and configuration object values.
 * @returns {prompts.PromptObject<keyof ConfigProps>} - A prompt object for user interaction.
 */
export function createPromptObject([key, objValues]: [
  string,
  ConfigObjectProps,
]): prompts.PromptObject {
  if (key.startsWith("_")) {
    return { type: null, name: key };
  }

  const normalizedValues = normalizeConfigObject(objValues);
  const { value, validateRegex, promptMessage, choices } = normalizedValues;
  const initialValue = isArray(value) ? value[0] : value;
  const haveChoices = choices && choices.length > 0;
  const isBoolean = typeof value === "boolean";

  return {
    type: (_, answers) =>
      getPromptType(answers, normalizedValues, haveChoices, isBoolean),
    name: key,
    message: (_, values) =>
      promptMessage
        ? renderer.renderString(promptMessage, values)
        : formatKeyMessage(key),
    choices: (_, answers) =>
      getPromptChoices(answers, choices, haveChoices, initialValue),
    initial: (_, answers) =>
      getPromptInitialValue(answers, initialValue, choices, haveChoices),
    validate: (promptValue) => validatePromptValue(promptValue, validateRegex),
    hint: "- Space to select. Return to submit",
    instructions: false,
    active: "Yes",
    inactive: "No",
  };
}

/**
 * Creates prompt objects for each configuration item with additional context and prompts the user for input.
 * @param {ConfigProps} config - The configuration object to generate prompt objects from.
 * @param {ContextProps} extraContext - Additional context data to override prompts.
 * @returns {Promise<prompts.Answers<string>>} - A Promise resolving to the user's answers.
 */
export async function createPromptObjects(
  config: ConfigProps,
  extraContext: ContextProps,
): Promise<prompts.Answers<string>> {
  prompts.override(extraContext);
  return prompts(
    Object.entries(config).map((c) => createPromptObject(c)),
    {
      onCancel: () => {
        throw new Error("\nInstallation aborted by user.");
      },
    },
  );
}
