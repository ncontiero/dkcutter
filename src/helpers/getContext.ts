import type { Command } from "commander";
import type { ConfigProps, ContextProps } from "./getConfig";

import prompts from "prompts";
import nunjucks from "nunjucks";
import { z } from "zod";

import { formatKeyMessage } from "@/utils/formatKeyMessage";
import { handleError } from "@/utils/handleError";
import { treatData } from "@/utils/treatData";

interface GetContext {
  program: Command;
  config: ConfigProps;
}

function returnObject(config: ConfigProps) {
  const internal: ContextProps = {};
  const external: ContextProps = {};

  Object.entries(config).forEach(([key, value]) => {
    const newValue = typeof value === "object" ? value.value : value;
    if (key.startsWith("_")) {
      internal[key] = newValue;
    } else {
      external[key] = newValue;
    }
  });

  return { internal, external };
}

export async function getContext({ config }: GetContext) {
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
    const answers = await prompts(
      [
        ...Object.entries(config).map(([key, objValues]) => {
          if (typeof objValues !== "object") return { type: null, name: key };
          if (key.startsWith("_")) return { type: null, name: key };
          const { value } = objValues;
          return {
            type: typeof value === "boolean" ? "toggle" : "text",
            name: key,
            message: objValues.promptMessage || formatKeyMessage(key),
            initial: (_, values) => {
              return typeof value !== "string"
                ? value
                : nunjucks.renderString(value, values);
            },
            validate: (promptValue) => {
              if (
                typeof promptValue === "string" &&
                objValues.validateRegex &&
                !z
                  .string()
                  .regex(objValues.validateRegex.regex)
                  .safeParse(promptValue).success
              ) {
                return (
                  objValues.validateRegex.message ||
                  "This field is required. Please enter a valid value."
                );
              }
              return true;
            },
            active: "Yes",
            inactive: "No",
          } as prompts.PromptObject<keyof typeof config>;
        }),
      ],
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
