import { join, resolve } from "node:path";
import fs from "fs-extra";
import ora from "ora";

import { DKCUTTER_PATTERN, PKG_ROOT, PKG_TEMPLATE } from "@/consts";
import { type ContextProps, getConfig } from "@/helpers/getConfig";
import { getContext } from "@/helpers/getContext";
import { getTemplate, templateIsValid } from "@/helpers/getTemplate";
import { configureHooks, runHook } from "@/helpers/hooks";
import { structureRender } from "@/helpers/structureRender";
import { type DKCutter, optionsSchema } from "@/types";
import { cleanFiles } from "@/utils/cleanFiles";
import { handleError } from "@/utils/handleError";
import { colorize, logger } from "@/utils/logger";
import { renderer, setRendererContext } from "@/utils/renderer";

process.on("SIGINT", handleError);
process.on("SIGTERM", handleError);
process.on("uncaughtException", handleError);
process.on("unhandledRejection", handleError);

/**
 * Run DKCutter just as if using it from the command line.
 *
 * @param {DKCutter} props - The props for the DKCutter.
 * @returns {Promise<ContextProps>} - The context props.
 */
export async function dkcutter(props: DKCutter): Promise<ContextProps> {
  const { template, extraContext = {}, options: opts = {} } = props;

  let generatedProjectRoot;
  let isLocalProject = false;
  let templateFolder;
  let keepProjectOnFailure = false;

  try {
    if (!template || template.trim().length === 0) {
      throw new Error("No template specified. Please specify a template.");
    }

    const options = optionsSchema.parse(opts);
    const output = resolve(options.output);
    keepProjectOnFailure = options.keepProjectOnFailure;

    if (!(await fs.exists(output))) {
      throw new Error(`Output path ${output} does not exist.`);
    }

    isLocalProject = (await fs.exists(template))
      ? (await fs.lstat(template)).isDirectory()
      : false;
    templateFolder = isLocalProject ? join(template, "template") : PKG_TEMPLATE;
    const projectRoot = isLocalProject ? template : PKG_ROOT;

    const templateData = templateIsValid(template);
    if (!isLocalProject) {
      await getTemplate({
        url: templateData,
        outputDir: PKG_TEMPLATE,
        directoryOpt: options.directory,
        checkout: options.checkout,
      });
    } else if (!isLocalProject || !(await fs.exists(templateFolder))) {
      throw new Error("No template found. Please specify a valid url or path!");
    }

    const config = await getConfig(projectRoot);
    if (!config) throw new Error("No configuration found. Please try again.");
    const context = setRendererContext(
      await getContext({ config, skip: options.default, extraContext }),
    );

    const spinner = ora(colorize("info", "Creating project...")).start();

    generatedProjectRoot = (await fs.readdir(templateFolder))[0];
    if (
      !generatedProjectRoot ||
      DKCUTTER_PATTERN.test(generatedProjectRoot) === false
    ) {
      throw new Error("No template project found. Please try again.");
    }
    generatedProjectRoot = renderer.renderString(generatedProjectRoot, context);
    generatedProjectRoot = resolve(output, generatedProjectRoot);

    if ((await fs.exists(generatedProjectRoot)) && !options.overwrite) {
      const path = generatedProjectRoot;
      generatedProjectRoot = undefined;
      throw new Error(`Project already exists at ${path}. Please try again.`);
    }
    await fs.emptyDir(generatedProjectRoot);

    await configureHooks(context, projectRoot);
    await runHook({ hook: "preGenProject", dir: generatedProjectRoot });

    await structureRender({ context, directory: templateFolder, output });

    spinner.stop();
    await runHook({ hook: "postGenProject", dir: generatedProjectRoot });
    logger.break();
    spinner.start();

    await cleanFiles({ isLocalProject, templateFolder });

    spinner.succeed(colorize("success", "Project created!"));
    return context.dkcutter;
  } catch (error) {
    if (keepProjectOnFailure) {
      generatedProjectRoot = undefined;
      logger.warn("Project creation failed. Keeping project dir.");
    }
    await cleanFiles({ generatedProjectRoot, isLocalProject, templateFolder });
    handleError(error);
    return {};
  }
}
