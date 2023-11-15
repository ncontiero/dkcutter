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
import { handleError } from "@/utils/handleError";
import { treatData } from "@/utils/treatData";
import { renderer } from "@/utils/renderer";
import { logger } from "@/utils/logger";

interface GetContext {
  program: Command;
  config: ConfigProps;
  skip?: boolean;
}

function returnObject(config: ConfigProps) {
  const internal: ContextProps = {};
  const external: ContextProps = {};

  Object.entries(config).forEach(([key, value]) => {
    const newValue = typeof value === "object" ? value.value : value;
    const target = key.startsWith("_") ? internal : external;
    target[key] = newValue;
  });
  return { internal, external };
}

function createPromptObject([key, objValues]: [string, ConfigObjectProps]) {
  if (typeof objValues !== "object" || key.startsWith("_")) {
    return { type: null, name: key };
  }
  const { value, validateRegex, promptMessage, choices, disabled } = objValues;
  const isBoolean = typeof value === "boolean";
  const isString = typeof value === "string";
  const message = (_: unknown, values: prompts.Answers<string>) =>
    promptMessage
      ? renderer.renderString(promptMessage, values)
      : formatKeyMessage(key);

  function show(values: prompts.Answers<string>, disabled: string) {
    const condition = renderer.renderString(disabled, values);
    if (condition === "false") return "toggle";
    return null;
  }

  return {
    type: disabled
      ? (_, values) => show(values, disabled)
      : choices
        ? "select"
        : isBoolean
          ? "toggle"
          : "text",
    name: key,
    message,
    choices,
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

  return z
    .string()
    .optional()
    .refine(
      (val) =>
        choices && val ? choices.find((choice) => choice.value === val) : true,
      err,
    )
    .refine((val) => (regex && val ? regex.test(val) : true), err)
    .transform((val) =>
      val === "false" || val === "true" ? val !== "false" : val,
    )
    .refine(
      (val) =>
        type === "<string>"
          ? typeof val === "string"
            ? val
            : false
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
      typeof configValue === "object"
        ? configValue.validateRegex?.regex
        : undefined;
    const choices =
      typeof configValue === "object" ? configValue.choices : undefined;
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
    if (typeof value === "object") {
      const disabled =
        value.disabled && renderer.renderString(value.disabled, context);
      if (disabled === "true") {
        logger.warn(`Option --${key} is disabled.`);
        delete context[key];
        delete opts[key];
      }
    }
  }
  prompts.override(opts);

  try {
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
  } catch (err) {
    handleError(err);
  }

  return treatData(context);
}
