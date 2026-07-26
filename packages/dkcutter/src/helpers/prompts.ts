import type { ConfigObjectProps, ConfigProps, ContextProps } from "./getConfig";
import * as p from "@clack/prompts";
import { z } from "zod";
import { formatKeyMessage } from "@/utils";
import { isArray, isObject } from "@/utils/dataHandler";
import { renderer } from "@/utils/renderer";
import { PromptCancelledError } from "./errors";

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
  answers: ContextProps,
  normalizedValues: NormalizedConfig,
  haveChoices: boolean | undefined,
): "text" | "confirm" | "select" | "multiselect" | null {
  if (normalizedValues.disabled) {
    const condition = renderer.renderString(normalizedValues.disabled, answers);
    if (condition === "true") return null;
  }

  if (haveChoices) return normalizedValues.choicesType ?? "select";

  const isBoolean = typeof normalizedValues.value === "boolean";
  return isBoolean ? "confirm" : "text";
}

function getPromptChoices(
  answers: ContextProps,
  choices: NormalizedConfig["choices"],
  haveChoices: boolean | undefined,
  initialValue: unknown,
) {
  if (!haveChoices || !choices) return [];

  return choices.map((choice) => {
    const disabled =
      renderer.renderString(choice.disabled || "false", answers) === "true";

    const helpTextForDisabled =
      disabled && choice.helpTextForDisabled
        ? choice.helpTextForDisabled
        : undefined;
    const hint = helpTextForDisabled ?? choice.description;

    return {
      value: choice.value,
      label: renderer.renderString(choice.title || choice.value, answers),
      hint: hint ? renderer.renderString(hint, answers) : undefined,
      disabled,
      selected: choice.selected
        ? renderer.renderString(choice.selected, answers) === "true"
        : choice.value === initialValue,
    };
  });
}

const requiredStringSchema = z.string().min(1);
function getValidateSchema(validateRegex: NormalizedConfig["validateRegex"]) {
  if (!validateRegex) {
    return requiredStringSchema;
  }

  return requiredStringSchema.regex(
    validateRegex.regex,
    validateRegex.message ?? "Please enter a valid value.",
  );
}

export async function createPromptObjects(
  config: ConfigProps,
  extraContext: ContextProps,
): Promise<ContextProps> {
  const promptGroup: p.PromptGroup<
    Record<string, string | boolean | string[] | symbol>
  > = {};

  for (const [key, objValues] of Object.entries(config)) {
    if (key.startsWith("_")) {
      promptGroup[key] = () => undefined;
      continue;
    }

    promptGroup[key] = async ({ results }) => {
      if (key in extraContext) {
        return extraContext[key];
      }

      const answers = { ...extraContext, ...results };
      const normalizedValues = normalizeConfigObject(objValues);
      const haveChoices = !!(
        normalizedValues.choices && normalizedValues.choices.length > 0
      );
      const type = getPromptType(answers, normalizedValues, haveChoices);

      if (!type) return undefined;

      const initialValue = isArray(normalizedValues.value)
        ? normalizedValues.value[0]
        : normalizedValues.value;

      const renderedInitial =
        typeof initialValue === "string"
          ? renderer.renderString(initialValue, answers)
          : initialValue;

      const message = normalizedValues.promptMessage
        ? renderer.renderString(normalizedValues.promptMessage, answers)
        : formatKeyMessage(key);

      if (type === "text") {
        const initial = renderedInitial as string;
        return p.text({
          message,
          initialValue: initial,
          placeholder: initial,
          defaultValue: initial,
          validate: getValidateSchema(normalizedValues.validateRegex),
        });
      }

      if (type === "confirm") {
        return p.confirm({ message, initialValue: renderedInitial as boolean });
      }

      if (type === "select" || type === "multiselect") {
        const options = getPromptChoices(
          answers,
          normalizedValues.choices,
          haveChoices,
          initialValue,
        );
        const selectedChoices = options.filter(
          (c) => c.selected && !c.disabled,
        );

        if (type === "select") {
          const initialValueStr =
            selectedChoices.length > 0
              ? selectedChoices[0].value
              : renderedInitial;

          return p.select({ message, options, initialValue: initialValueStr });
        }

        // Handling multiselect
        const initialValuesArr =
          selectedChoices.length > 0
            ? selectedChoices.map((c) => c.value)
            : [renderedInitial as string];

        return p.multiselect({
          message,
          options,
          initialValues: initialValuesArr,
        });
      }
    };
  }

  const answers = await p.group(promptGroup, {
    onCancel: () => {
      p.cancel("Installation aborted by user.");
      throw new PromptCancelledError("Installation aborted by user.");
    },
  });

  const finalAnswers: ContextProps = { ...extraContext };
  for (const [key, objValues] of Object.entries(config)) {
    if (key.startsWith("_")) {
      const normalizedValues = normalizeConfigObject(objValues);
      finalAnswers[key] = isArray(normalizedValues.value)
        ? normalizedValues.value[0]
        : normalizedValues.value;
    } else {
      finalAnswers[key] = answers[key] ?? finalAnswers[key];
    }
  }

  return finalAnswers;
}
