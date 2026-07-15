import type { DKCutterContext } from "@/helpers/getConfig";

import fs from "node:fs/promises";
import { join, resolve } from "node:path";

import { isBinaryFile } from "isbinaryfile";
import { IGNORE_FILE_PATTERN } from "@/consts";
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
   * Patterns to ignore during rendering.
   * @default [/.(png|jpg|jpeg|ico|svg|gif|webp)$/i]
   */
  ignorePatterns?: RegExp[];
  /**
   * Whether the files being rendered are hooks.
   * Ensures deterministic sequential rendering prioritizing preGen hooks.
   * @default false
   */
  isHooks?: boolean;
}

async function processTemplateFile(
  file: string,
  templatePath: string,
  outputFolder: string,
  context: DKCutterContext,
  ignorePatterns: RegExp[],
  isHooks?: boolean,
) {
  const filePath = join(templatePath, file);
  const treatedName = renderer.renderString(file, context);
  const outputFilePath = join(outputFolder, treatedName);

  const itemStat = await fs.lstat(filePath);

  if (itemStat.isDirectory()) {
    await mkdir(outputFilePath);
    await structureRender({
      context,
      directory: filePath,
      output: outputFilePath,
      ignorePatterns,
      isHooks,
    });
  } else if (itemStat.isFile()) {
    try {
      if (
        ignorePatterns.some((pattern) => pattern.test(file)) ||
        (await isBinaryFile(filePath))
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

/**
 * Renders and structures files from a template directory based on the provided context and options.
 * @param {RenderOptions} props - Object containing context, directory, output, and ignore patterns.
 */
export async function structureRender(props: RenderOptions) {
  const {
    context,
    directory = join(process.cwd(), "template"),
    output = ".",
    ignorePatterns = [IGNORE_FILE_PATTERN],
    isHooks = false,
  } = props;

  const templatePath = resolve(directory);
  const outputFolder = resolve(output);

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
        ignorePatterns,
        isHooks,
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
          ignorePatterns,
          isHooks,
        ),
      ),
    );
  }
}
