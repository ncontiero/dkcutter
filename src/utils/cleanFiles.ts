import path from "node:path";
import fs from "fs-extra";

import {
  CONFIG_FILE_NAME,
  HOOKS_FOLDER,
  PKG_ROOT,
  PKG_TEMPLATE,
  RENDERED_HOOKS_FOLDER,
} from "@/consts";

interface CleanFiles {
  /**
   * The path to the generated project root.
   */
  generatedProjectRoot?: string;
  /**
   * The path to the template folder.
   */
  templateFolder?: string;
  /**
   * Indicates if the project is a local project.
   */
  isLocalProject?: boolean;
}

/**
 * Cleans up files and folders related to a generated project based on specified parameters.
 *
 * This function handles the removal of specific files and directories associated with a generated project,
 * including the project root, template folder, configuration file, rendered hooks, and hooks folder.
 *
 * @param {props} CleanFiles - The parameters to use for cleaning up the generated project.
 * @returns {Promise<void>} - A promise that resolves once the cleanup is completed.
 */
export async function cleanFiles({
  generatedProjectRoot,
  templateFolder = PKG_TEMPLATE,
  isLocalProject = false,
}: CleanFiles): Promise<void> {
  if (generatedProjectRoot) {
    await fs.remove(generatedProjectRoot);
  }

  if (!isLocalProject) {
    await fs.remove(path.join(PKG_ROOT, CONFIG_FILE_NAME));
    await fs.remove(templateFolder);
  }

  await fs.remove(RENDERED_HOOKS_FOLDER());
  await fs.remove(HOOKS_FOLDER());
}
