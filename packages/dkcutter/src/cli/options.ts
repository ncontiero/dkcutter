import type { OptionValues } from "commander";
import type { ContextProps } from "@/helpers/getConfig";

import { isArray } from "@/utils/dataHandler";
import { formatKeyMessage } from "@/utils/strings";
import { program } from "./program";

/**
 * Creates command-line options based on the provided context properties and parses them using Commander.
 * @param {ContextProps} context - The context object containing properties for options.
 * @returns {OptionValues} - The parsed options from the command line.
 */
export function createCliOptions(context: ContextProps): OptionValues {
  for (const [key, value] of Object.entries(context)) {
    if (key.startsWith("_")) continue;
    const flag = `--${key}`;
    const typeValue =
      typeof value === "string" || isArray(value) ? "<string>" : "[boolean]";
    program.option(`${flag} ${typeValue}`, formatKeyMessage(key));
  }

  program.parse(process.argv);
  return program.opts();
}
