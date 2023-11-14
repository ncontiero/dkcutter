import path from "node:path";
import fs from "fs-extra";
import prompts from "prompts";
import { execa } from "execa";
import chalk from "chalk";
import ora from "ora";

import { handleError } from "@/utils/handleError";
import { isGitInstalled } from "./git";
import { PKG_ROOT, CONFIG_FILE_NAME } from "@/consts";

interface GetTemplateProps {
  url: string;
  outputDir: string;
  templateFolder?: string;
}

export async function getTemplate({
  url,
  outputDir,
  templateFolder = "template",
}: GetTemplateProps) {
  try {
    const spinner = ora("Downloading template...").start();
    const output = path.resolve(outputDir);

    if (fs.pathExistsSync(output)) {
      spinner.stop();
      const { overwriteTemplate } = await prompts({
        type: "confirm",
        name: "overwriteTemplate",
        message: `${chalk.redBright.bold(
          "Warning:",
        )} Template already exists. Overwrite?`,
      });
      if (!overwriteTemplate) {
        throw new Error("Creating template cancelled!");
      }
    }

    spinner.start();
    if (!isGitInstalled(process.cwd())) {
      throw new Error("Git is not installed");
    }

    const cloneOutput = path.join(output, "output");
    const templateOutput = path.join(cloneOutput, templateFolder);
    const hooksFolder = path.join(cloneOutput, "hooks");

    await execa("git", ["clone", url, cloneOutput]);
    if (fs.existsSync(hooksFolder)) {
      fs.copySync(hooksFolder, path.join(PKG_ROOT, "hooks"));
    }
    fs.copyFileSync(
      path.join(cloneOutput, CONFIG_FILE_NAME),
      path.join(PKG_ROOT, CONFIG_FILE_NAME),
    );
    fs.copySync(templateOutput, output);
    fs.removeSync(cloneOutput);

    spinner.succeed("Template downloaded successfully.");
  } catch (err) {
    handleError(err);
  }
}
