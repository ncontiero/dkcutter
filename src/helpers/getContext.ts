import type { Command } from "commander";
import type { ConfigProps, ContextProps, ConfigObjectProps } from "./getConfig";

import prompts from "prompts";
import nunjucks from "nunjucks";
import { z } from "zod";

import { formatKeyMessage } from "@/utils/strings";
import { handleError } from "@/utils/handleError";
import { treatData } from "@/utils/treatData";

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
  const { value, validateRegex } = objValues;
  const isBoolean = typeof value === "boolean";
  const isString = typeof value === "string";

  return {
    type: isBoolean ? "toggle" : "text",
    name: key,
    message: objValues.promptMessage || formatKeyMessage(key),
    initial: (_, values) =>
      isString ? nunjucks.renderString(value, values) : value,
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

export async function getContext({ config, skip = false }: GetContext) {
  const { internal: internalCtx, external: externalCtx } = returnObject(config);
  let context = { ...internalCtx, ...externalCtx };

  // Object.entries(config).forEach(([key, value]) => {
  //   if (key.startsWith("_")) return;
  //   const description =
  //     typeof value === "object" ? value.promptMessage : formatKeyMessage(key);
  //   program.createArgument(`[${key}]`, description);
  // });

  // program.parse(process.argv);

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
