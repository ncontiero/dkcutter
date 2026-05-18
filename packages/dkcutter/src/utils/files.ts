import type { CopyOptions, PathLike, RmOptions } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
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
 * Removes a file or directory at the given path.
 * The removal is recursive and forced by default, with optional overrides.
 *
 * @param path The path to the file or directory to remove.
 * @param options Optional removal options that override or extend the default recursive and force behavior.
 * @returns A promise that resolves when the removal operation has completed.
 */
export async function remove(path: PathLike, options?: RmOptions) {
  return fs.rm(path, { recursive: true, force: true, ...options });
}

/**
 * Copies files or directories from a source path to a destination path.
 * The copy is recursive by default, with optional overrides.
 *
 * @param src Source path to copy.
 * @param dest Destination path to copy to.
 * @param options Optional copy options that override or extend the default recursive behavior.
 * @returns A promise that resolves when the copy operation has completed.
 */
export async function copy(src: string, dest: string, options?: CopyOptions) {
  return fs.cp(src, dest, { recursive: true, ...options });
}

/**
 * Checks whether a given path is accessible.
 * It returns a boolean indicating the existence or accessibility of the path.
 *
 * @param path The path to check for accessibility.
 * @returns A promise that resolves to true if the path is accessible, or false if it is not.
 */
export async function pathExists(path: PathLike) {
  return fs.access(path).then(
    () => true,
    () => false,
  );
}

/**
 * Empties a directory at the given path and recreates it as an empty folder.
 * This ensures any previous contents are removed before the directory is used again.
 *
 * @param path The path of the directory to empty and recreate.
 * @returns A promise that resolves once the directory has been removed and recreated.
 */
export async function emptyDir(path: PathLike) {
  await remove(path);
  await fs.mkdir(path, { recursive: true });
}

/**
 * Cleans up files and folders related to a generated project based on specified parameters.
 *
 * This function handles the removal of specific files and directories associated with a generated project,
 * including the project root, template folder, configuration file, rendered hooks, and hooks folder.
 *
 * @param {CleanFiles} options - The parameters to use for cleaning up the generated project.
 * @returns {Promise<void>} - A promise that resolves once the cleanup is completed.
 */
export async function cleanFiles({
  generatedProjectRoot,
  templateFolder = PKG_TEMPLATE,
  isLocalProject = false,
}: CleanFiles): Promise<void> {
  if (generatedProjectRoot) {
    await remove(generatedProjectRoot);
  }

  if (!isLocalProject) {
    await remove(path.join(PKG_ROOT, CONFIG_FILE_NAME), {
      recursive: true,
      force: true,
    });
    await remove(templateFolder);
  }

  await remove(RENDERED_HOOKS_FOLDER());
  await remove(HOOKS_FOLDER());
}
