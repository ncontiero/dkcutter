import type { ContextProps } from "@/helpers/getConfig";

import { formatKeyMessage } from "@/utils";
import { isArray } from "@/utils/dataHandler";
import { program } from "./program";

/**
 * Creates command-line options based on the provided context properties and parses them using cac.
 * @param {ContextProps} context - The context object containing properties for options.
 * @returns {Record<string, any>} - The parsed options from the command line.
 */
export function createCliOptions(context: ContextProps): Record<string, any> {
  for (const [key, value] of Object.entries(context)) {
    if (key.startsWith("_")) continue;
    const flag = `--${key}`;
    const typeValue =
      typeof value === "string" || isArray(value) ? "<string>" : "[boolean]";
    program.option(`${flag} ${typeValue}`, formatKeyMessage(key));
  }

  const parsed = program.parse(process.argv, { run: false });

  // Remove the "--" key that cac adds by default to store args after double dash
  if ("--" in parsed.options) {
    delete parsed.options["--"];
  }

  // cac might parse options as numbers if they look like numbers.
  // But we want to keep them as strings.
  // This loop attempts to retrieve the original string.
  const rawArgs = program.rawArgs.slice(2);
  for (const [key, value] of Object.entries(parsed.options)) {
    if (
      typeof value !== "number" &&
      (!isArray(value) || value.some((v) => typeof v !== "number"))
    ) {
      continue;
    }

    const kebabKey = key.replaceAll(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    const matchKey = `--${key}`;
    const matchKebab = `--${kebabKey}`;
    const vals: string[] = [];

    for (let i = 0; i < rawArgs.length; i++) {
      const arg = rawArgs[i];
      if (arg === matchKey || arg === matchKebab) {
        const rawValue = rawArgs[++i];
        if (!rawValue || rawValue.startsWith("-")) continue;
        vals.push(rawValue);
        continue;
      }

      if (arg.startsWith(`${matchKey}=`) || arg.startsWith(`${matchKebab}=`)) {
        vals.push(arg.slice(arg.indexOf("=") + 1));
      }
    }

    if (vals.length > 0) {
      parsed.options[key] = isArray(value) ? vals : vals.at(-1);
    }
  }

  return parsed.options;
}
