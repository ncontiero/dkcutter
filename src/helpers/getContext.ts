import type { Command } from "commander";
import type { ConfigProps, ContextProps, ConfigObjectProps } from "./getConfig";

import prompts from "prompts";
import { z } from "zod";

import { formatKeyMessage } from "@/utils/strings";
import { handleError } from "@/utils/handleError";
import { treatData } from "@/utils/treatData";
import { renderer } from "@/utils/renderer";

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
  const { value, validateRegex, promptMessage } = objValues;
  const isBoolean = typeof value === "boolean";
  const isString = typeof value === "string";
  const message = (_: unknown, values: prompts.Answers<string>) =>
    promptMessage
      ? renderer.renderString(promptMessage, values)
      : formatKeyMessage(key);

  return {
    type: isBoolean ? "toggle" : "text",
    name: key,
    message,
    initial: (_, values) =>
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

function optionValueSchema(key: string, type: "<string>" | "[boolean]") {
  return z
    .string()
    .optional()
    .transform((val) =>
      val === "false" || val === "true" ? val !== "false" : val,
    )
    .refine((val) => (type === "<string>" ? val : typeof val === "boolean"), {
      message: `Enter a valid value in ${key}.`,
      path: [key],
    });
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
    const typeValue = typeof value === "string" ? "<string>" : "[boolean]";
    program.option(`--${key} ${typeValue}`, formatKeyMessage(key), (value) =>
      optionValueSchema(`--${key}`, typeValue).parse(value),
    );
  });
  program.parse(process.argv);

  const opts = program.opts();
  prompts.override(opts);
  context = { ...context, ...opts };

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
