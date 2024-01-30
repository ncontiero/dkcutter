import type { DKCutterContext } from "@/helpers/getConfig";

import path from "node:path";
import fs from "fs-extra";

import { renderer } from "@/utils/renderer";

export async function structureRender(
  ctx: DKCutterContext,
  dir = path.join(process.cwd(), "template"),
  output = ".",
  ignorePatterns: RegExp[] = [/.(png|jpg|jpeg|ico|svg|gif|webp)$/i],
) {
  const outputFolder = path.resolve(output);
  const templatePath = path.resolve(dir);

  const files = await fs.readdir(templatePath);

  for (const file of files) {
    const filePath = path.join(templatePath, file);
    const treatedName = renderer.renderString(file, ctx);
    const outputFilePath = path.join(outputFolder, treatedName);

    const itemStat = await fs.lstat(filePath);

    if (itemStat.isDirectory()) {
      await fs.mkdir(outputFilePath, { recursive: true });
      await structureRender(ctx, filePath, outputFilePath);
    } else if (itemStat.isFile()) {
      if (ignorePatterns.some((pattern) => pattern.test(file))) {
        await fs.copyFile(filePath, outputFilePath);
        continue;
      }
      const fileContent = await fs.readFile(filePath, "utf-8");
      await fs.writeFile(
        outputFilePath,
        renderer.renderString(fileContent, ctx),
      );
    }
  }
}
