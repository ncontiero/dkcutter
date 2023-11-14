import type { ContextProps } from "@/helpers/getConfig";

import path from "node:path";
import fs from "fs-extra";
import nunjucks from "nunjucks";

import { handleError } from "@/utils/handleError";

export async function createProject(
  ctx: ContextProps,
  dir = path.join(process.cwd(), "template"),
  output = ".",
  ignorePatterns: RegExp[] = [/(hooks|\.(png|jpg|jpeg|ico|svg|gif|webp))$/i],
) {
  try {
    const outputFolder = path.resolve(output);
    const templatePath = path.resolve(dir);

    nunjucks.configure({ autoescape: true });

    fs.readdirSync(templatePath).forEach((file) => {
      if (ignorePatterns.some((pattern) => pattern.test(file))) {
        return;
      }

      const filePath = path.join(templatePath, file);
      const treatedName = nunjucks.renderString(file, ctx);
      const outputFilePath = path.join(outputFolder, treatedName);

      const itemStat = fs.lstatSync(path.resolve(filePath));

      if (itemStat.isDirectory()) {
        fs.mkdirSync(outputFilePath, { recursive: true });
        createProject(ctx, filePath, outputFilePath);
      } else if (itemStat.isFile()) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        fs.writeFileSync(
          outputFilePath,
          nunjucks.renderString(fileContent, ctx),
        );
      }
    });
  } catch (err) {
    handleError(err);
  }
}
