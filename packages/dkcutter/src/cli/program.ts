import type { CLIOptions } from "@/types";
import { cac } from "cac";
import { dkcutterVersion } from "@/consts";
import { dkcutter } from "..";

export const program = cac("dkcutter");

program
  .usage("[template] [options] [extra-context-options]...")
  .version(dkcutterVersion)
  .help();

program
  .option(
    "--init",
    "[DEPRECATED: Use the init command] Initialize a base DKCutter template.",
    { default: false },
  )
  .option(
    "-y, --default",
    "Do not prompt for parameters and/or use the template's default values.",
    { default: false },
  )
  .option(
    "-o, --output <path>",
    "Where to output the generated project dir into.",
    { default: process.cwd() },
  )
  .option(
    "-d, --directory <path>",
    "Directory within repo that holds dkcutter.json file for advanced repositories with multi templates in it.",
  )
  .option(
    "-c, --checkout <checkout>",
    "branch, tag or commit to checkout after git clone.",
  )
  .option(
    "-f, --overwrite",
    "Overwrite the output directory if it already exists.",
    { default: false },
  )
  .option(
    "-k, --keep-project-on-failure",
    "Keep the generated project dir on failure.",
    { default: false },
  );

program
  .command("init", "Initialize a base DKCutter template.")
  .action(async (options: CLIOptions) => {
    await dkcutter({
      template: "gh:ncontiero/dkcutter",
      options,
      extraContext: {},
    });
  });
