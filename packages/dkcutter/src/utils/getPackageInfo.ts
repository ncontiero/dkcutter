import type { PackageJson } from "@/types/packageJson";
import { join } from "node:path";
import { readJsonFile } from "./files";

export interface PackageInfo {
  packageJsonPath: string;
  packageJson: PackageJson;
}

/**
 * Retrieves the package.json information for a given directory asynchronously.
 * Returns both the resolved path to the package.json file and its parsed contents.
 *
 * @param dir - Directory in which to look for the package.json file.
 * @returns An object containing the packageJsonPath and the parsed packageJson contents.
 */
export async function getPackageInfo(dir: string): Promise<PackageInfo> {
  const packageJsonPath = join(dir, "package.json");
  const packageJson = await readJsonFile<PackageJson>(packageJsonPath);

  return { packageJsonPath, packageJson };
}
