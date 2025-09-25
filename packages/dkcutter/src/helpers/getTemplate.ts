import { join, resolve } from "node:path";
import { execa } from "execa";
import fs from "fs-extra";
import ora from "ora";
import which from "which";

import z from "zod";
import {
  CONFIG_FILE_NAME,
  GIT_HG_URL_REGEX,
  HOOKS_FOLDER,
  PKG_ROOT,
  REPO_PREFIXES,
} from "@/consts";

type RepoType = "hg" | "git";
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
 * @param {RepoType} repoType - The type of version control system to check for (Mercurial or Git).
 * @returns {Promise<boolean>} - True if the specified VCS is installed, false otherwise.
 */
export async function isVSCInstalled(repoType: RepoType): Promise<boolean> {
  return !!(await which(repoType, { nothrow: true }));
}

/**
 * Identifies the type of version control system (VCS) based on the repository URL.
 * @param {string} repoUrl - The URL of the repository to determine the VCS type for.
 * @returns {RepoType} - The identified VCS type (Mercurial or Git).
 */
function identifyRepoType(repoUrl: string): RepoType {
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
  const spinner = ora("Downloading template...").start();
  const output = resolve(outputDir);

  try {
    const repoType = identifyRepoType(url);
    if (!(await isVSCInstalled(repoType))) {
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
    if (!(await fs.exists(templateConfig))) {
      throw new Error(`Config ${CONFIG_FILE_NAME} file not found.`);
    }

    if (await fs.exists(hooksFolder)) {
      await fs.copy(hooksFolder, HOOKS_FOLDER());
    }

    await fs.copyFile(templateConfig, join(PKG_ROOT, CONFIG_FILE_NAME));
    await fs.copy(templateOutput, output);
    await fs.remove(cloneOutput);

    spinner.succeed("Template downloaded successfully.");
  } catch (error) {
    const msg = "Failed to download template.";
    if (error instanceof Error) {
      throw new TypeError(`${msg}\n${error.message}`);
    } else {
      throw new TypeError(`${msg}\nUnknown error: ${error}\n`);
    }
  }
}

const finalUrlValidator = z
  .url({ protocol: /^https?$/ })
  .or(z.string().regex(GIT_HG_URL_REGEX));
const templateSchema = z
  .string()
  .transform((val) => {
    const foundPrefix = Object.keys(REPO_PREFIXES).find((prefix) =>
      val.startsWith(prefix),
    );

    if (foundPrefix) {
      const baseUrl = REPO_PREFIXES[foundPrefix as keyof typeof REPO_PREFIXES];
      return `${baseUrl}${val.slice(foundPrefix.length)}`;
    }
    return val;
  })
  .refine((val) => finalUrlValidator.safeParse(val).success, {
    error:
      "Template must be a valid repository URL or a recognized shorthand (e.g., gh:user/repo).",
  });

/**
 * Determines if a given template string is a valid template URL or shorthand.
 * @param {string} template - The template string to validate.
 * @returns {string} - The result of the validation, containing the parsed template if valid, or an error if invalid.
 */
export function templateIsValid(template: string): string {
  return templateSchema.parse(template);
}
