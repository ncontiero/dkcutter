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
    process.argv.push("--dkcutter.isCli=true");

    const options = program.opts();
    const template = program.args[0];

    if (options.init) {
      await dkcutter({
        template: "gh:ncontiero/dkcutter",
        options,
        extraContext: {},
      });
      return;
    }

    if (!template) program.help();

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
