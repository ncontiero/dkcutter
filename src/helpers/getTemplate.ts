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
  directoryOpt?: string;
  checkout?: string;
}

export async function getTemplate({
  url,
  outputDir,
  templateFolder = "template",
  directoryOpt = "",
  checkout,
}: GetTemplateProps) {
  try {
    logger.break();
    const spinner = ora("Downloading template...").start();
    const output = path.resolve(outputDir);

    if (!isGitInstalled()) {
      throw new Error("Git is not installed");
    }

    const cloneOutput = path.join(output, "output");
    const resolvedDirectoryOpt = path.join(cloneOutput, directoryOpt);
    const templateOutput = path.join(resolvedDirectoryOpt, templateFolder);
    const hooksFolder = HOOKS_FOLDER(resolvedDirectoryOpt);
    const templateConfig = path.join(resolvedDirectoryOpt, CONFIG_FILE_NAME);

    await execa("git", ["clone", url, cloneOutput]);
    if (checkout) {
      await execa("git", ["checkout", ...checkout.split(" ")], {
        cwd: cloneOutput,
      });
    }

    if (!(await fs.exists(resolvedDirectoryOpt))) {
      throw new Error(`Directory ${directoryOpt} not found.`);
    }
    if (!(await fs.exists(templateOutput))) {
      throw new Error(`Template folder not found.`);
    }
    if (await fs.exists(hooksFolder)) {
      await fs.copy(hooksFolder, HOOKS_FOLDER());
    }
    if (!(await fs.exists(templateConfig))) {
      throw new Error(`Config ${CONFIG_FILE_NAME} file not found.`);
    }

    await fs.copyFile(templateConfig, path.join(PKG_ROOT, CONFIG_FILE_NAME));
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
