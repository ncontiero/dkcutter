import path from "node:path";
import fs from "fs-extra";
import { execa } from "execa";
import ora from "ora";
import which from "which";

import { logger } from "@/utils/logger";
import { CONFIG_FILE_NAME, HOOKS_FOLDER, PKG_ROOT } from "@/consts";

interface GetTemplateProps {
  url: string;
  outputDir: string;
  templateFolder?: string;
  directoryOpt?: string;
  checkout?: string;
}

export function isVSCInstalled(repoType: "hg" | "git"): boolean {
  return !!which.sync(repoType, { nothrow: true });
}

function identifyRepoType(repoUrl: string) {
  if (repoUrl.startsWith("hg") || repoUrl.includes("bitbucket")) {
    return "hg";
  }
  return "git";
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
    const repoType = identifyRepoType(url);

    if (!isVSCInstalled(repoType)) {
      throw new Error(`${repoType} is not installed`);
    }

    const cloneOutput = path.join(output, "output");
    const resolvedDirectoryOpt = path.join(cloneOutput, directoryOpt);
    const templateOutput = path.join(resolvedDirectoryOpt, templateFolder);
    const hooksFolder = HOOKS_FOLDER(resolvedDirectoryOpt);
    const templateConfig = path.join(resolvedDirectoryOpt, CONFIG_FILE_NAME);

    if (url.startsWith("git") || url.startsWith("ssh")) {
      spinner.stop();
    }
    await execa(repoType, ["clone", url, cloneOutput]);
    spinner.start();
    if (checkout) {
      const checkoutParams = [...checkout.split(" ")];
      // Avoid Mercurial "--config" and "--debugger" injection vulnerability
      if (repoType === "hg") {
        checkoutParams.unshift("--");
      }
      await execa(repoType, ["checkout", ...checkoutParams], {
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
  } catch (error) {
    const msg = "Failed to download template.";
    if (error instanceof Error) {
      throw new TypeError(`${msg}\n${error.message}`);
    } else {
      throw new TypeError(`${msg}\nUnknown error: ${error}\n`);
    }
  }
}
