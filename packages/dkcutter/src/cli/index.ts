import type { CLIOptions } from "@/types";
import * as p from "@clack/prompts";
import { bgCyan, black, cyan, dim } from "ansis";
import { dkcutterVersion } from "@/consts";
import { handleError } from "@/utils/handleError";
import { dkcutter } from "..";
import { program } from "./program";

process.on("SIGINT", handleError);
process.on("SIGTERM", handleError);
process.on("uncaughtException", handleError);
process.on("unhandledRejection", handleError);

/**
 * Handles the command-line interface (CLI) execution for the dkcutter tool.
 *
 * This function processes command-line arguments, retrieves options and template information,
 * and triggers the dkcutter process to create a project based on the specified template and options.
 *
 * @returns {Promise<void>} - A promise that resolves once the CLI execution is completed.
 */
async function cli(): Promise<void> {
  try {
    process.env.DKCUTTER_IS_CLI = "true";

    const parsed = program.parse(process.argv, { run: false });
    const options = parsed.options as CLIOptions;
    const template = parsed.args[0];

    if (options.help || options.version) {
      return;
    }

    if (!template && !options.init) {
      program.outputHelp();
      return;
    }

    p.intro(`${bgCyan(black(" DKCutter "))} ${dim(`v${dkcutterVersion}`)}`);
    p.note(cyan("Let's create something amazing!"), "DKCutter");

    if (options.init) {
      await dkcutter({
        template: "gh:ncontiero/dkcutter",
        options,
        extraContext: {},
      });
      return;
    }

    await dkcutter({
      template,
      options,
      extraContext: {},
    });
  } catch (error) {
    handleError(error);
  }
}

await cli();
