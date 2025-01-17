import { Command } from "commander";
import { PKG_ROOT } from "@/consts";
import { getPackageInfo } from "@/utils/getPackageInfo";

export const program = new Command()
  .name("dkcutter")
  .description("A command-line utility that creates projects from templates.")
  .version(
    getPackageInfo(PKG_ROOT).packageJson.version || "4.2.0",
    "-v, --version",
    "Display the version number.",
  )
  .usage("[options] [template] [extra-context-options]...")
  .option(
    "-y, --default",
    "Do not prompt for parameters and/or use the template's default values.",
    false,
  )
  .option(
    "-o, --output <path>",
    "Where to output the generated project dir into.",
    process.cwd(),
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
    false,
  )
  .option(
    "-k, --keep-project-on-failure",
    "Keep the generated project dir on failure.",
    false,
  )
  .argument("[template]", "The url or path of the template.")
  .allowExcessArguments(true)
  .allowUnknownOption(true)
  .parse(process.argv);
