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

function returnObject(config: ConfigProps) {
  const internal: ContextProps = {};
  const external: ContextProps = {};

  for (const [key, value] of Object.entries(config)) {
    const target = key.startsWith("_") ? internal : external;
    if (Array.isArray(value)) {
      target[key] = value[0];
    } else if (typeof value === "object") {
      target[key] = Array.isArray(value.value) ? value.value[0] : value.value;
    } else {
      target[key] = value;
    }
  }
  return { internal, external };
}

function createPromptObject([key, objValues]: [string, ConfigObjectProps]) {
  if (key.startsWith("_")) {
    return { type: null, name: key };
  } else if (Array.isArray(objValues)) {
    const choices = objValues.map((val) => ({ value: val }));
    return createPromptObject([key, { value: objValues[0], choices }]);
  } else if (typeof objValues !== "object") {
    return createPromptObject([key, { value: objValues }]);
  } else if (typeof objValues === "object" && Array.isArray(objValues.value)) {
    const choices = objValues.value.map((val) => ({ value: val }));
    return createPromptObject([key, { value: objValues.value[0], choices }]);
  }
  const { value, validateRegex, promptMessage, choices, disabled } = objValues;
  const isBoolean = typeof value === "boolean";
  const isString = typeof value === "string";
  const isArray = Array.isArray(value);
  const message = (_: unknown, values: prompts.Answers<string>) =>
    promptMessage
      ? renderer.renderString(promptMessage, values)
      : formatKeyMessage(key);

  const show = (values: prompts.Answers<string>, disabled: string) => {
    const condition = renderer.renderString(disabled, values);
    return condition === "false" ? "toggle" : null;
  };
  const getType = () => {
    if (disabled)
      return (_: unknown, values: prompts.Answers<string>) =>
        show(values, disabled);
    if (choices || isArray) return "select";
    if (isBoolean) return "toggle";
    return "text";
  };

  return {
    type: getType(),
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
      type === "<string>" ? typeof val === "string" : typeof val === "boolean",
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
    const isArray = Array.isArray(configValue);
    const regex =
      !isArray && typeof configValue === "object"
        ? configValue.validateRegex?.regex
        : undefined;
    const choices = isArray
      ? configValue.map((val) => ({ value: val }))
      : typeof configValue === "object"
        ? Array.isArray(configValue.value)
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
    if (typeof value === "object" && !Array.isArray(value)) {
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
