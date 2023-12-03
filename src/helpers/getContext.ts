import type { Command } from "commander";
import type {
  ConfigProps,
  ContextProps,
  ConfigObjectProps,
  ConfigChoiceProps,
} from "./getConfig";

import prompts from "prompts";
import { z } from "zod";

import { formatKeyMessage } from "@/utils/strings";
import { treatData } from "@/utils/treatData";
import { renderer } from "@/utils/renderer";
import { logger } from "@/utils/logger";

interface GetContext {
  program: Command;
  config: ConfigProps;
  skip?: boolean;
}

function isObject(value: unknown): value is object {
  return value != null && typeof value === "object";
}
function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function returnObject(config: ConfigProps) {
  const internal: ContextProps = {};
  const external: ContextProps = {};

  for (const [key, value] of Object.entries(config)) {
    const target = key.startsWith("_") ? internal : external;
    if (isArray(value)) {
      target[key] = value[0];
    } else if (isObject(value)) {
      target[key] = isArray(value.value) ? value.value[0] : value.value;
    } else {
      target[key] = value;
    }
  }
  return { internal, external };
}

function createPromptObject([key, objValues]: [string, ConfigObjectProps]) {
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
  const { value, validateRegex, promptMessage, choices, disabled } = objValues;
  const isBoolean = typeof value === "boolean";
  const isString = typeof value === "string";
  const message = (_: unknown, values: prompts.Answers<string>) =>
    promptMessage
      ? renderer.renderString(promptMessage, values)
      : formatKeyMessage(key);

  const getType = (answers: prompts.Answers<string>) => {
    let type: string | null =
      choices || isArray(value) ? "select" : isBoolean ? "toggle" : "text";
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
          isString ? renderer.renderString(value, values) : value,
    validate: (promptValue) =>
      typeof promptValue === "string" && validateRegex
        ? z.string().regex(validateRegex.regex).safeParse(promptValue).success
          ? true
          : validateRegex.message || "Please enter a valid value."
        : true,
    active: "Yes",
    inactive: "No",
  } as prompts.PromptObject<keyof ConfigProps>;
}

function optionValueSchema(
  key: string,
  type: "<string>" | "[boolean]",
  regex?: RegExp,
  choices?: ConfigChoiceProps[],
) {
  const err = {
    message: `Enter a valid value in ${key}.`,
    path: [key],
  };
  const baseSchema = z.string().optional();

  const choiceSchema = choices
    ? baseSchema.refine(
        (val) => choices.some((choice) => choice.value === val),
        err,
      )
    : baseSchema;

  const regexSchema = regex
    ? choiceSchema.refine((val) => (val ? regex.test(val) : true), err)
    : choiceSchema;

  const booleanTransform = regexSchema.transform((val) =>
    val === "false" || val === "true" ? val !== "false" : val,
  );

  return booleanTransform.refine(
    (val) =>
      type === "<string>"
        ? typeof val === "string" && val.trim().length > 0
        : typeof val === "boolean",
    err,
  );
}

export async function getContext({
  config,
  program,
  skip = false,
}: GetContext) {
  const { internal: internalCtx, external: externalCtx } = returnObject(config);
  let context = { ...internalCtx, ...externalCtx };

  Object.entries(context).forEach(([key, value]) => {
    if (key.startsWith("_")) return;
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
    const flag = `--${key}`;
    const typeValue = typeof value === "string" ? "<string>" : "[boolean]";
    program.option(`${flag} ${typeValue}`, formatKeyMessage(key), (value) =>
      optionValueSchema(flag, typeValue, regex, choices).parse(value),
    );
  });
  program.parse(process.argv);

  const opts = program.opts();
  context = { ...context, ...opts };
  for (const key in opts) {
    const value = config[key];
    const defaultValue = isArray(value)
      ? value[0]
      : isObject(value)
        ? isArray(value.value)
          ? value.value[0]
          : value.value
        : value;
    if (isObject(value) && !isArray(value)) {
      const disabled =
        value.disabled && renderer.renderString(value.disabled, context);
      const choice = value.choices?.find(
        (choice) => choice.value === opts[key],
      );
      const disabledChoice = renderer.renderString(
        choice?.disabled || "false",
        context,
      );
      if (disabled === "true") {
        logger.warn(`Option --${key} is disabled.`);
        context[key] = defaultValue;
        opts[key] = defaultValue;
      } else if (disabledChoice === "true") {
        logger.warn(`Option --${key} is disabled with value "${opts[key]}".`);
        context[key] = defaultValue;
        opts[key] = defaultValue;
      }
    }
  }
  prompts.override(opts);

  if (skip) {
    return treatData(context);
  }
  const answers = await prompts(
    Object.entries(config).map(createPromptObject),
    {
      onCancel: () => {
        throw new Error("\nInstallation aborted by user.");
      },
    },
  );

  context = { ...internalCtx, ...answers };

  return treatData(context);
}
