import path from "node:path";
import fs from "fs-extra";
import ora from "ora";
import { Command } from "commander";
import { z } from "zod";

import { getTemplate } from "@/helpers/getTemplate";
import { type ContextProps, getConfig } from "@/helpers/getConfig";
import { getContext } from "@/helpers/getContext";
import { structureRender } from "@/helpers/structureRender";
import { configureHooks, runHooks } from "@/helpers/runHooks";
import { handleError } from "@/utils/handleError";
import { getPackageInfo } from "@/utils/getPackageInfo";
import { renderer, setRendererContext } from "@/utils/renderer";
import { cleanFiles } from "@/utils/cleanFiles";
import { colorize, logger } from "@/utils/logger";
import { PKG_ROOT, PKG_TEMPLATE } from "@/consts";

import { type CLIProps, cliOptionsSchema } from "./schema";

process.on("SIGINT", handleError);
process.on("SIGTERM", handleError);

/**
 * Constructs an array of command line options based on the provided extra context.
 * @param {Record<string, any>} extraContext - An object containing additional context information.
 * @returns {string[]} - An array of strings representing command line options.
 */
function constructOptions(extraContext: Record<string, any>): string[] {
  return Object.entries(extraContext).reduce((acc, [key, value]) => {
    if (value === true) {
      acc.push(`--${key}`);
    } else {
      acc.push(`--${key}`, value);
    }
    return acc;
  }, [] as string[]);
}

export async function cli(props: CLIProps): Promise<ContextProps> {
  const {
    template,
    options: cliOptions = {},
    isCli = true,
    extraContext = {},
  } = props;

  process.argv = [
    ...process.argv,
    ...constructOptions(extraContext),
    ...constructOptions(cliOptions),
  ];

  let generatedProjectRoot;
  let isLocalProject = false;
  let templateFolder;
  let keepProjectOnFailure = false;

  try {
    const { packageJson } = getPackageInfo(PKG_ROOT);

    const program = new Command()
      .name("dkcutter")
      .description(
        "A command-line utility that creates projects from templates.",
      )
      .version(
        packageJson.version || "1.0.0",
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
      .allowUnknownOption(true)
      .parse(process.argv);

    const options = cliOptionsSchema.parse(program.opts());
    const output = path.resolve(options.output);
    keepProjectOnFailure = options.keepProjectOnFailure;

    if (!fs.existsSync(output)) {
      throw new Error(`Output path ${output} does not exist.`);
    }

    const { args } = program;
    const templateArg = isCli ? args[0] : template;
    if (!templateArg) program.help();

    isLocalProject = templateArg.startsWith(".");
    templateFolder = isLocalProject
      ? path.join(templateArg, "template")
      : PKG_TEMPLATE;
    const projectRoot = isLocalProject ? templateArg : PKG_ROOT;

    const templateArgSchema = z
      .string()
      .transform((val) =>
        val.startsWith("gh:") ? `https://github.com/${val.slice(3)}` : val,
      )
      .transform((val) =>
        val.startsWith("bb:") ? `https://bitbucket.org/${val.slice(3)}` : val,
      )
      .transform((val) =>
        val.startsWith("gl:") ? `https://gitlab.com/${val.slice(3)}` : val,
      )
      .refine((val) => !val.startsWith("."))
      .or(z.string().url())
      .or(
        z
          .string()
          .refine((val) => val.startsWith("git") || val.startsWith("hg")),
      )
      .safeParse(templateArg);

    if (templateArgSchema.success) {
      await getTemplate({
        url: templateArgSchema.data,
        outputDir: PKG_TEMPLATE,
        directoryOpt: options.directory,
        checkout: options.checkout,
      });
    } else if (!isLocalProject) {
      throw new Error("Invalid template. Please specify a valid url or path!");
    } else if (!fs.existsSync(templateFolder)) {
      throw new Error("No template found. Please specify a valid url or path!");
    }

    const config = await getConfig(projectRoot);
    if (!config) throw new Error("No configuration found. Please try again.");
    const ctx = setRendererContext(
      await getContext({ config, program, skip: options.default }),
    );

    const spinner = ora(colorize("info", "Creating project...")).start();

    generatedProjectRoot = fs.readdirSync(templateFolder)[0];
    if (!generatedProjectRoot || !generatedProjectRoot.startsWith("{{")) {
      throw new Error("No template project found. Please try again.");
    }
    generatedProjectRoot = renderer.renderString(generatedProjectRoot, ctx);
    generatedProjectRoot = path.resolve(output, generatedProjectRoot);

    if (fs.existsSync(generatedProjectRoot) && !options.overwrite) {
      const path = generatedProjectRoot;
      generatedProjectRoot = undefined;
      throw new Error(`Project already exists at ${path}. Please try again.`);
    } else if (options.overwrite) {
      fs.removeSync(generatedProjectRoot);
    }
    fs.ensureDirSync(generatedProjectRoot);

    await configureHooks(ctx, projectRoot);
    runHooks({ runHook: "preGenProject", dir: generatedProjectRoot });

    await structureRender(ctx, templateFolder, output);

    spinner.stop();
    runHooks({ runHook: "postGenProject", dir: generatedProjectRoot });
    logger.break();
    spinner.start();

    cleanFiles({ isLocalProject, templateFolder });

    spinner.succeed(colorize("success", "Project created!"));
    return ctx.dkcutter;
  } catch (error) {
    if (keepProjectOnFailure) {
      generatedProjectRoot = undefined;
      logger.warn("Project creation failed. Keeping project dir.");
    }
    cleanFiles({ generatedProjectRoot, isLocalProject, templateFolder });
    handleError(error);
    return {};
  }
}
