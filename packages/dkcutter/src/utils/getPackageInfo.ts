import type { PackageJson } from "type-fest";

import path from "node:path";
import { readJsonFile, readJsonFileSync } from "./files";

export async function getPackageInfo(dir: string) {
  const packageJsonPath = path.join(dir, "package.json");
  const packageJson = await readJsonFile<PackageJson>(packageJsonPath);

  return { packageJsonPath, packageJson };
}

export function getPackageInfoSync(dir: string) {
  const packageJsonPath = path.join(dir, "package.json");
  const packageJson = readJsonFileSync<PackageJson>(packageJsonPath);

  return { packageJsonPath, packageJson };
}
