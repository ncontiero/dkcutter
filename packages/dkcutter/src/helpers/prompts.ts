import type { ConfigObjectProps, ConfigProps, ContextProps } from "./getConfig";
import prompts from "prompts";
import { z } from "zod";

import { isArray, isObject } from "@/utils/dataHandler";
import { renderer } from "@/utils/renderer";
import { formatKeyMessage } from "@/utils/strings";

function normalizeConfigObject(
  config: ConfigObjectProps,
): Exclude<ConfigObjectProps, string | boolean | string[]> {
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

/**
 * Creates a prompt object based on the provided key and configuration object values.
 * @param {[string, ConfigObjectProps]} [key, objValues] - A tuple containing the key and configuration object values.
 * @returns {prompts.PromptObject<keyof ConfigProps>} - A prompt object for user interaction.
 */
export function createPromptObject([key, objValues]: [
  string,
  ConfigObjectProps,
]): prompts.PromptObject<keyof ConfigProps> {
  if (key.startsWith("_")) {
    return { type: null, name: key };
  }

  const normalizedValues = normalizeConfigObject(objValues);
  const {
    value,
    validateRegex,
    promptMessage,
    choices,
    choicesType = "select",
  } = normalizedValues;
  const initialValue = isArray(value) ? value[0] : value;
  const haveChoices = choices && choices.length > 0;

  const message = (_: unknown, values: prompts.Answers<string>) =>
    promptMessage
      ? renderer.renderString(promptMessage, values)
      : formatKeyMessage(key);

  const isBoolean = typeof value === "boolean";
  const getType = (answers: prompts.Answers<string>) => {
    if (normalizedValues.disabled) {
      const condition = renderer.renderString(
        normalizedValues.disabled,
        answers,
      );
      if (condition === "true") {
        return null;
      }
    }
    return haveChoices ? choicesType : isBoolean ? "toggle" : "text";
  };

  const getChoices = (answers: prompts.Answers<string>) => {
    if (!haveChoices) return [];
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
  };

  return {
    type: (_, answers) => getType(answers),
    name: key,
    message,
    choices: (_, answers) => getChoices(answers),
    initial: (_, answers) => {
      const valueRendered =
        typeof initialValue === "string"
          ? renderer.renderString(initialValue, answers)
          : initialValue;

      if (haveChoices) {
        const index = choices.findIndex(
          (choice) => choice.value === valueRendered,
        );
        return index === -1 ? 0 : index;
      }

      return valueRendered;
    },
    validate: (promptValue) =>
      typeof promptValue === "string" && validateRegex
        ? z.string().regex(validateRegex.regex).safeParse(promptValue).success
          ? true
          : (validateRegex.message ?? "Please enter a valid value.")
        : true,
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
  return await prompts(
    Object.entries(config).map((c) => createPromptObject(c)),
    {
      onCancel: () => {
        throw new Error("\nInstallation aborted by user.");
      },
    },
  );
}
