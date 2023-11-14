import type { ContextProps } from "@/helpers/getConfig";

import path from "node:path";
import fs from "fs-extra";
import nunjucks from "nunjucks";

import { handleError } from "@/utils/handleError";

const env = nunjucks.configure({ autoescape: true });

export async function createProject(
  ctx: ContextProps,
  dir = path.join(process.cwd(), "template"),
  output = ".",
  ignorePatterns: RegExp[] = [/(hooks|\.(png|jpg|jpeg|ico|svg|gif|webp))$/i],
) {
  try {
    const outputFolder = path.resolve(output);
    const templatePath = path.resolve(dir);

    const files = await fs.readdir(templatePath);

    for (const file of files) {
      if (ignorePatterns.some((pattern) => pattern.test(file))) {
        continue;
      }

      const filePath = path.join(templatePath, file);
      const treatedName = env.renderString(file, ctx);
      const outputFilePath = path.join(outputFolder, treatedName);

      const itemStat = await fs.lstat(filePath);

      if (itemStat.isDirectory()) {
        await fs.mkdir(outputFilePath, { recursive: true });
        await createProject(ctx, filePath, outputFilePath);
      } else if (itemStat.isFile()) {
        const fileContent = await fs.readFile(filePath, "utf-8");
        await fs.writeFile(outputFilePath, env.renderString(fileContent, ctx));
      }
    }
  } catch (err) {
    handleError(err);
  }
}
