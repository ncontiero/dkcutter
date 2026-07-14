import fs from "node:fs/promises";
import { join, resolve } from "node:path";
import semver from "semver";

import { DKCUTTER_PATTERN, PKG_ROOT, PKG_TEMPLATE } from "@/consts";
import {
  type ContextProps,
  type DKCutterContext,
  getConfig,
} from "@/helpers/getConfig";
import { getContext } from "@/helpers/getContext";
import { getTemplate, templateIsValid } from "@/helpers/getTemplate";
import { configureHooks, runHook } from "@/helpers/hooks";
import { structureRender } from "@/helpers/structureRender";
import { type DKCutter, type OptionsSchema, optionsSchema } from "@/types";
import { cleanFiles, emptyDir, pathExists } from "@/utils/files";
import { handleError } from "@/utils/handleError";
import { logger } from "@/utils/logger";
import { renderer, setRendererContext } from "@/utils/renderer";
import { clackSpinner } from "@/utils/spinner";
import pkg from "../package.json" with { type: "json" };

interface SetupPathsResult {
  output: string;
  isLocalProject: boolean;
  templateFolder: string;
  projectRoot: string;
}

async function setupPaths(
  template: string,
  options: OptionsSchema,
): Promise<SetupPathsResult> {
  const output = resolve(options.output);

  if (!(await pathExists(output))) {
    throw new Error(`Output path ${output} does not exist.`);
  }

  const isLocalProject = (await pathExists(template))
    ? (await fs.lstat(template)).isDirectory()
    : false;
  const templateFolder = isLocalProject
    ? join(template, "template")
    : PKG_TEMPLATE;
  const projectRoot = isLocalProject ? template : PKG_ROOT;

  return { output, isLocalProject, templateFolder, projectRoot };
}

async function prepareTemplate(
  template: string,
  isLocalProject: boolean,
  templateFolder: string,
  options: OptionsSchema,
): Promise<void> {
  if (!isLocalProject) {
    const templateData = templateIsValid(template);
    await getTemplate({
      url: templateData,
      outputDir: PKG_TEMPLATE,
      directoryOpt: options.directory,
      checkout: options.checkout,
    });
  } else if (!(await pathExists(templateFolder))) {
    throw new Error("No template found. Please specify a valid url or path!");
  }
}

async function resolveProjectRoot(
  output: string,
  templateFolder: string,
  context: DKCutterContext,
): Promise<string> {
  const templateFiles = await fs.readdir(templateFolder);
  let generatedProjectRoot = templateFiles.find((file) =>
    DKCUTTER_PATTERN.test(file),
  );
  if (!generatedProjectRoot) {
    throw new Error("No template project found. Please try again.");
  }
  generatedProjectRoot = renderer.renderString(generatedProjectRoot, context);
  return resolve(output, generatedProjectRoot);
}

async function renderProject(
  generatedProjectRoot: string,
  output: string,
  templateFolder: string,
  context: DKCutterContext,
  projectRoot: string,
): Promise<void> {
  await emptyDir(generatedProjectRoot);

  await configureHooks(context, projectRoot);
  await runHook({ hook: "preGenProject", dir: generatedProjectRoot });

  await structureRender({ context, directory: templateFolder, output });

  await runHook({ hook: "postGenProject", dir: generatedProjectRoot });
}

/**
 * Run DKCutter just as if using it from the command line.
 *
 * @param {DKCutter} props - The props for the DKCutter.
 * @returns {Promise<ContextProps>} - The context props.
 */
export async function dkcutter(props: DKCutter): Promise<ContextProps> {
  const { template, extraContext = {}, options: opts = {} } = props;

  let generatedProjectRoot: string | undefined;
  let isLocalProject = false;
  let templateFolder = PKG_TEMPLATE;
  let keepProjectOnFailure = false;

  try {
    clackSpinner.start("Initializing...");

    if (!template || template.trim().length === 0) {
      throw new Error("No template specified. Please specify a template.");
    }

    const options = optionsSchema.parse(opts);
    keepProjectOnFailure = options.keepProjectOnFailure;

    const paths = await setupPaths(template, options);
    isLocalProject = paths.isLocalProject;
    templateFolder = paths.templateFolder;

    await prepareTemplate(template, isLocalProject, templateFolder, options);

    const config = await getConfig(paths.projectRoot);
    if (!config) throw new Error("No configuration found. Please try again.");

    const { dkcutterConfig, templateConfig } = config;

    const currentDKCutterVersion = pkg.version;
    const requiredVersion = dkcutterConfig.engines?.dkcutter;
    if (
      requiredVersion &&
      !semver.satisfies(currentDKCutterVersion, requiredVersion)
    ) {
      throw new Error(
        `Your DKCutter version (${currentDKCutterVersion}) does not satisfy the template's required version (${requiredVersion}).`,
      );
    }

    clackSpinner.stop();

    const context = setRendererContext(
      await getContext({
        config: templateConfig,
        skip: options.default,
        extraContext,
      }),
    );

    clackSpinner.start("Generating project...");

    generatedProjectRoot = await resolveProjectRoot(
      paths.output,
      templateFolder,
      context,
    );

    if ((await pathExists(generatedProjectRoot)) && !options.overwrite) {
      const path = generatedProjectRoot;
      generatedProjectRoot = undefined; // prevent deletion in catch block
      throw new Error(
        `Project already exists at ${path}.\nPlease try again with a different output path or enable overwrite option.`,
      );
    }

    await renderProject(
      generatedProjectRoot,
      paths.output,
      templateFolder,
      context,
      paths.projectRoot,
    );

    await cleanFiles({ isLocalProject, templateFolder });

    clackSpinner.stop("All done! Happy coding!");
    return context.dkcutter;
  } catch (error) {
    clackSpinner.stop();
    if (keepProjectOnFailure) {
      generatedProjectRoot = undefined;
      logger.warn("Project creation failed. Keeping project dir.");
    }
    await cleanFiles({ generatedProjectRoot, isLocalProject, templateFolder });
    handleError(error);
    return {};
  }
}

export type { DKCutter, Options } from "@/types";
