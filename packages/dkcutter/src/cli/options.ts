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

  return parsed.options;
}
