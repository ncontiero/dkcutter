import path from "node:path";
import fs from "fs-extra";
import { execa } from "execa";
import ora from "ora";

import { isGitInstalled } from "./git";
import { logger } from "@/utils/logger";
import { PKG_ROOT, CONFIG_FILE_NAME, HOOKS_FOLDER } from "@/consts";

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
    logger.break();
    const spinner = ora("Downloading template...").start();
    const output = path.resolve(outputDir);

    if (!isGitInstalled()) {
      throw new Error("Git is not installed");
    }

    const cloneOutput = path.join(output, "output");
    const templateOutput = path.join(cloneOutput, templateFolder);
    const hooksFolder = HOOKS_FOLDER(cloneOutput);

    await execa("git", ["clone", url, cloneOutput]);
    if (await fs.exists(hooksFolder)) {
      await fs.copy(hooksFolder, HOOKS_FOLDER());
    }
    await fs.copyFile(
      path.join(cloneOutput, CONFIG_FILE_NAME),
      path.join(PKG_ROOT, CONFIG_FILE_NAME),
    );
    await fs.copy(templateOutput, output);
    await fs.remove(cloneOutput);

    spinner.succeed("Template downloaded successfully.\n");
  } catch (err) {
    const msg = "Failed to download template.";
    if (err instanceof Error) {
      throw new Error(`${msg}\n${err.message}`);
    } else {
      throw new Error(msg);
    }
  }
}
