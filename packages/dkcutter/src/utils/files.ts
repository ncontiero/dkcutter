import fsSync, {
  type CopyOptions,
  type MakeDirectoryOptions,
  type PathLike,
  type RmOptions,
} from "node:fs";
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
export async function remove(
  path: PathLike,
  options?: RmOptions,
): Promise<void> {
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
export async function copy(
  src: string,
  dest: string,
  options?: CopyOptions,
): Promise<void> {
  return fs.cp(src, dest, { recursive: true, ...options });
}

/**
 * Checks whether a given path is accessible.
 * It returns a boolean indicating the existence or accessibility of the path.
 *
 * @param path The path to check for accessibility.
 * @returns A promise that resolves to true if the path is accessible, or false if it is not.
 */
export async function pathExists(path: PathLike): Promise<boolean> {
  return fs.access(path).then(
    () => true,
    () => false,
  );
}

/**
 * Creates a directory at the given path.
 * This function ensures directory creation is recursive by default while allowing custom options.
 *
 * @param path The path of the directory to create.
 * @param options Optional directory creation options that override or extend the default recursive behavior.
 * @returns A promise that resolves when the directory has been created.
 */
export async function mkdir(
  path: PathLike,
  options?: MakeDirectoryOptions,
): Promise<string | undefined> {
  return fs.mkdir(path, { recursive: true, ...options });
}

/**
 * Empties a directory at the given path and recreates it as an empty folder.
 * This ensures any previous contents are removed before the directory is used again.
 *
 * @param path The path of the directory to empty and recreate.
 * @returns A promise that resolves once the directory has been removed and recreated.
 */
export async function emptyDir(path: PathLike): Promise<void> {
  await remove(path);
  await mkdir(path);
}

/**
 * Renames or moves a file or directory from one path to another.
 * Falls back to copying and removing the original when a cross-device rename is not allowed.
 *
 * @param oldPath The current path of the file or directory.
 * @param newPath The new path where the file or directory should be moved or renamed.
 * @returns A promise that resolves when the rename or fallback move operation has completed.
 * @throws Re-throws any error that is not related to cross-device rename limitations.
 */
export async function rename(oldPath: string, newPath: string): Promise<void> {
  try {
    await fs.rename(oldPath, newPath);
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    if ("code" in error && error.code === "EXDEV") {
      await copy(oldPath, newPath);
      await remove(oldPath);
    } else {
      throw error;
    }
  }
}

/**
 * Reads a JSON file from the given path and parses its contents into a JavaScript value.
 * This function provides a typed interface to read and deserialize JSON files asynchronously.
 *
 * @param filePath The path to the JSON file to read.
 * @returns A promise that resolves to the parsed JSON content typed as `T`.
 */
export async function readJsonFile<T = unknown>(filePath: string): Promise<T> {
  const fileContent = await fs.readFile(filePath, "utf-8");
  return JSON.parse(fileContent) as T;
}

/**
 * Reads a JSON file from the given path and synchronously parses its contents into a JavaScript value.
 * This function provides a typed interface to read and deserialize JSON files in a blocking manner.
 *
 * @param filePath The path to the JSON file to read.
 * @returns The parsed JSON content typed as `T`.
 */
export function readJsonFileSync<T = unknown>(filePath: string): T {
  const fileContent = fsSync.readFileSync(filePath, "utf-8");
  return JSON.parse(fileContent) as T;
}

interface WriteJsonFileOptions {
  /**
   * The number of spaces or string to use for indentation in the JSON output.
   * If not provided, defaults to 2 spaces.
   */
  spaces?: number | string;
}

/**
 * Writes a JavaScript value as JSON to a file at the given path.
 * This function ensures the target directory exists and formats the JSON output with optional spacing.
 *
 * @param filePath The path to the JSON file to write.
 * @param data The data to serialize and write as JSON.
 * @param options Optional formatting options.
 * @returns A promise that resolves once the JSON file has been written.
 */
export async function writeJsonFile<T = unknown>(
  filePath: string,
  data: T,
  options?: WriteJsonFileOptions,
): Promise<void> {
  await mkdir(path.dirname(filePath));
  await fs.writeFile(
    filePath,
    JSON.stringify(data, null, options?.spaces ?? 2),
    "utf-8",
  );
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
    await remove(path.join(PKG_ROOT, CONFIG_FILE_NAME));
    await remove(templateFolder);
  }

  await remove(RENDERED_HOOKS_FOLDER());
  await remove(HOOKS_FOLDER());
}
