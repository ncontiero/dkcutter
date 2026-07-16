import type { DKCutterConfigProps, DKCutterContext } from "@/helpers/getConfig";

import fs from "node:fs/promises";
import { join, normalize, relative, resolve } from "node:path";

import { isBinaryFile } from "isbinaryfile";
import { glob } from "tinyglobby";
import { RenderError } from "@/helpers/errors";
import { mkdir } from "@/utils";
import { renderer } from "@/utils/renderer";

interface RenderOptions {
  /**
   * The DKCutter context containing configuration data.
   */
  context: DKCutterContext;
  /**
   * The directory path of the template.
   * @default path.join(process.cwd(), "template")
   */
  directory?: string;
  /**
   * The output directory path for the rendered files.
   * @default "."
   */
  output?: string;
  /**
   * Whether the files being rendered are hooks.
   * Ensures deterministic sequential rendering prioritizing preGen hooks.
   * @default false
   */
  isHooks?: boolean;
  /**
   * DKCutter configuration object.
   */
  dkcutterConfig?: DKCutterConfigProps;
  /**
   * Internal set of files to ignore completely.
   */
  ignoreFiles?: Set<string>;
  /**
   * Internal set of files to copy without rendering.
   */
  copyWithoutRenderFiles?: Set<string>;
  /**
   * Internal string representing the root template directory.
   */
  rootDirectory?: string;
}

async function processTemplateFile(
  file: string,
  templatePath: string,
  outputFolder: string,
  context: DKCutterContext,
  isHooks?: boolean,
  ignoreFiles?: Set<string>,
  copyWithoutRenderFiles?: Set<string>,
  rootDirectory?: string,
) {
  const filePath = join(templatePath, file);
  const treatedName = renderer.renderString(file, context);
  const outputFilePath = join(outputFolder, treatedName);

  const itemStat = await fs.lstat(filePath);

  const relativePath = rootDirectory
    ? join(relative(rootDirectory, templatePath), file)
    : file;

  if (ignoreFiles?.has(relativePath)) {
    return;
  }

  if (itemStat.isDirectory()) {
    await mkdir(outputFilePath);
    await structureRender({
      context,
      directory: filePath,
      output: outputFilePath,
      isHooks,
      ignoreFiles,
      copyWithoutRenderFiles,
      rootDirectory,
    });
  } else if (itemStat.isFile()) {
    try {
      if (
        (await isBinaryFile(filePath)) ||
        copyWithoutRenderFiles?.has(relativePath)
      ) {
        await fs.copyFile(filePath, outputFilePath);
      } else {
        const fileContent = await fs.readFile(filePath, "utf-8");
        const renderedContent = renderer.renderString(fileContent, context);
        await fs.writeFile(outputFilePath, renderedContent);
      }

      const fileMode = itemStat.mode & 0o777;
      await fs.chmod(outputFilePath, fileMode);
    } catch (error) {
      if (error instanceof Error) {
        throw new RenderError(
          `Error processing file ${filePath}:\n${error.message}`,
          { cause: error },
        );
      } else {
        throw new RenderError(`Unknown error processing file ${filePath}`, {
          cause: error,
        });
      }
    }
  }
}

const TRAILING_SLASHES_REGEX = /[\\/]+$/;

/**
 * Renders and structures files from a template directory based on the provided context and options.
 * @param {RenderOptions} props - Object containing context, directory, output, and ignore patterns.
 */
export async function structureRender(props: RenderOptions) {
  const {
    context,
    directory = join(process.cwd(), "template"),
    output = ".",
    isHooks = false,
    dkcutterConfig,
  } = props;

  let { ignoreFiles, copyWithoutRenderFiles, rootDirectory } = props;

  const templatePath = resolve(directory);
  const outputFolder = resolve(output);

  const ignoreGlob = dkcutterConfig?.ignore ?? [];
  const copyWithoutRenderGlob = dkcutterConfig?.copyWithoutRender ?? [];

  if (!rootDirectory) {
    rootDirectory = templatePath;
    if (ignoreGlob.length > 0) {
      const ignored = await glob(ignoreGlob, {
        cwd: rootDirectory,
        dot: true,
        onlyFiles: false,
      });
      if (ignored.length > 0) {
        ignoreFiles = new Set(
          ignored.map((file) =>
            normalize(file).replace(TRAILING_SLASHES_REGEX, ""),
          ),
        );
      }
    }
    if (copyWithoutRenderGlob.length > 0) {
      const copied = await glob(copyWithoutRenderGlob, {
        cwd: rootDirectory,
        dot: true,
        onlyFiles: false,
      });
      if (copied.length > 0) {
        copyWithoutRenderFiles = new Set(
          copied.map((file) =>
            normalize(file).replace(TRAILING_SLASHES_REGEX, ""),
          ),
        );
      }
    }
  }

  const files = await fs.readdir(templatePath);

  if (isHooks) {
    files.sort((a, b) => {
      const isAPre = a.toLowerCase().includes("pregen");
      const isBPre = b.toLowerCase().includes("pregen");
      if (isAPre && !isBPre) return -1;
      if (!isAPre && isBPre) return 1;
      return a.localeCompare(b);
    });

    for (const file of files) {
      await processTemplateFile(
        file,
        templatePath,
        outputFolder,
        context,
        isHooks,
        ignoreFiles,
        copyWithoutRenderFiles,
        rootDirectory,
      );
    }
  } else {
    await Promise.all(
      files.map(async (file) =>
        processTemplateFile(
          file,
          templatePath,
          outputFolder,
          context,
          isHooks,
          ignoreFiles,
          copyWithoutRenderFiles,
          rootDirectory,
        ),
      ),
    );
  }
}
