import type { PackageJson } from "type-fest";

import fs from "node:fs";
import path from "node:path";

export function getPackageInfo(dir: string) {
  const packageJsonPath = path.join(dir, "package.json");
  const packageJsonRaw = fs.readFileSync(packageJsonPath, "utf-8");
  const packageJson = JSON.parse(packageJsonRaw) as PackageJson;

  return { packageJsonPath, packageJson };
}
