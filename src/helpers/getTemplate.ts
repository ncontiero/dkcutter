import { join, resolve } from "node:path";
import fs from "fs-extra";
import ora from "ora";
import which from "which";
import { execa } from "execa";

import { logger } from "@/utils/logger";
import { CONFIG_FILE_NAME, HOOKS_FOLDER, PKG_ROOT } from "@/consts";

interface GetTemplateProps {
  /**
   * The URL of the template repository.
   */
  url: string;
  /**
   * The output directory where the template will be downloaded.
   */
  outputDir: string;
  /**
   * The directory inside the template repository to download.
   */
  directoryOpt?: string;
  /**
   * The branch, tag or commit to checkout.
   */
  checkout?: string;
}

/**
 * Checks if a specific version control system (VCS) is installed.
 * @param {"hg" | "git"} repoType - The type of version control system to check for (Mercurial or Git).
 * @returns {boolean} - True if the specified VCS is installed, false otherwise.
 */
export function isVSCInstalled(repoType: "hg" | "git"): boolean {
  return !!which.sync(repoType, { nothrow: true });
}

/**
 * Identifies the type of version control system (VCS) based on the repository URL.
 * @param {string} repoUrl - The URL of the repository to determine the VCS type for.
 * @returns {"hg" | "git"} - The identified VCS type (Mercurial or Git).
 */
function identifyRepoType(repoUrl: string): "hg" | "git" {
  if (repoUrl.startsWith("hg") || repoUrl.includes("bitbucket")) {
    return "hg";
  }
  return "git";
}

/**
 * Downloads a template from a specified URL and performs necessary setup actions.
 * @param {GetTemplateProps} options - Object containing URL, output directory, optional directory, and checkout information.
 * @returns {Promise<void>} - A Promise that resolves once the template is downloaded and set up.
 */
export async function getTemplate({
  url,
  outputDir,
  directoryOpt = "",
  checkout,
}: GetTemplateProps): Promise<void> {
  try {
    logger.break();
    const spinner = ora("Downloading template...").start();
    const output = resolve(outputDir);
    const repoType = identifyRepoType(url);

    if (!isVSCInstalled(repoType)) {
      throw new Error(`${repoType} is not installed`);
    }

    const cloneOutput = join(output, "output");
    const resolvedDirectoryOpt = join(cloneOutput, directoryOpt);
    const templateOutput = join(resolvedDirectoryOpt, "template");
    const hooksFolder = HOOKS_FOLDER(resolvedDirectoryOpt);
    const templateConfig = join(resolvedDirectoryOpt, CONFIG_FILE_NAME);

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

    await fs.copyFile(templateConfig, join(PKG_ROOT, CONFIG_FILE_NAME));
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
