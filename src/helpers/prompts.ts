import type { ConfigObjectProps, ConfigProps, ContextProps } from "./getConfig";
import prompts from "prompts";
import { z } from "zod";

import { isArray, isObject } from "@/utils/dataHandler";
import { renderer } from "@/utils/renderer";
import { formatKeyMessage } from "@/utils/strings";

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
  } else if (isArray(objValues)) {
    const choices = objValues.map((val) => ({ value: val }));
    return createPromptObject([key, { value: objValues[0], choices }]);
  } else if (!isObject(objValues)) {
    return createPromptObject([key, { value: objValues }]);
  } else if (isObject(objValues) && isArray(objValues.value)) {
    const choices = objValues.value.map((val) => ({ value: val }));
    return createPromptObject([
      key,
      { ...objValues, value: objValues.value[0], choices },
    ]);
  }
  const {
    value,
    validateRegex,
    promptMessage,
    choices,
    disabled,
    choicesType = "select",
  } = objValues;
  const isBoolean = typeof value === "boolean";
  const isString = typeof value === "string";
  const message = (_: unknown, values: prompts.Answers<string>) =>
    promptMessage
      ? renderer.renderString(promptMessage, values)
      : formatKeyMessage(key);

  const getType = (answers: prompts.Answers<string>) => {
    let type: prompts.PromptType | null =
      choices || isArray(value) ? choicesType : isBoolean ? "toggle" : "text";
    if (disabled) {
      const condition = renderer.renderString(disabled, answers);
      type = condition === "false" ? type : null;
    }
    return type;
  };
  const getChoices = (answers: prompts.Answers<string>) => {
    return choices?.map((choice) => ({
      ...choice,
      title: renderer.renderString(choice.title || choice.value, answers),
      disabled:
        renderer.renderString(choice.disabled || "false", answers) === "true",
      selected: choice.value === (isArray(value) ? value[0] : value),
    }));
  };

  return {
    type: (_, answers) => getType(answers),
    name: key,
    message,
    choices: (_, answers) => getChoices(answers),
    initial: choices
      ? choices.findIndex((choice) => choice.value === value)
      : (_, values) =>
          isString
            ? renderer.renderString(value, values)
            : (value as prompts.InitialReturnValue),
    validate: (promptValue) =>
      typeof promptValue === "string" && validateRegex
        ? z.string().regex(validateRegex.regex).safeParse(promptValue).success
          ? true
          : validateRegex.message || "Please enter a valid value."
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
