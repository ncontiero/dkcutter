import type { DKCutterContext } from "@/helpers/getConfig";

import { join, resolve } from "node:path";
import fs from "fs-extra";

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
    ignorePatterns = [/.(png|jpg|jpeg|ico|svg|gif|webp)$/i],
  } = props;

  const templatePath = resolve(directory);
  const outputFolder = resolve(output);

  const files = await fs.readdir(templatePath);

  const processFile = async (file: string) => {
    const filePath = join(templatePath, file);
    const treatedName = renderer.renderString(file, context);
    const outputFilePath = join(outputFolder, treatedName);

    const itemStat = await fs.lstat(filePath);

    if (itemStat.isDirectory()) {
      await fs.mkdir(outputFilePath, { recursive: true });
      await structureRender({
        context,
        directory: filePath,
        output: outputFilePath,
      });
    } else if (itemStat.isFile()) {
      const fileMode = itemStat.mode & 0o777;

      if (ignorePatterns.some((pattern) => pattern.test(file))) {
        await fs.copyFile(filePath, outputFilePath);
      } else {
        const fileContent = await fs.readFile(filePath, "utf-8");
        await fs.writeFile(
          outputFilePath,
          renderer.renderString(fileContent, context),
        );
      }

      await fs.chmod(outputFilePath, fileMode);
    }
  };

  await Promise.all(files.map((file) => processFile(file)));
}
