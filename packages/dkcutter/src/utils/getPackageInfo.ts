import type { PackageJson } from "type-fest";

import path from "node:path";
import { readJsonFile, readJsonFileSync } from "./files";

/**
 * Retrieves the package.json information for a given directory asynchronously.
 * Returns both the resolved path to the package.json file and its parsed contents.
 *
 * @param dir - Directory in which to look for the package.json file.
 * @returns An object containing the packageJsonPath and the parsed packageJson contents.
 */
export async function getPackageInfo(
  dir: string,
): Promise<{ packageJsonPath: string; packageJson: PackageJson }> {
  const packageJsonPath = path.join(dir, "package.json");
  const packageJson = await readJsonFile<PackageJson>(packageJsonPath);

  return { packageJsonPath, packageJson };
}

/**
 * Retrieves the package.json information for a given directory synchronously.
 * Returns both the resolved path to the package.json file and its parsed contents.
 *
 * @param dir - Directory in which to look for the package.json file.
 * @returns An object containing the packageJsonPath and the parsed packageJson contents.
 */
export function getPackageInfoSync(
  dir: string,
): { packageJsonPath: string; packageJson: PackageJson } {
  const packageJsonPath = path.join(dir, "package.json");
  const packageJson = readJsonFileSync<PackageJson>(packageJsonPath);

  return { packageJsonPath, packageJson };
}
