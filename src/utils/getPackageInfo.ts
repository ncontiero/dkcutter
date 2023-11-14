import type { PackageJson } from "type-fest";

import path from "node:path";
import fs from "fs-extra";

export function getPackageInfo(dir: string) {
  const packageJsonPath = path.join(dir, "package.json");
  const packageJson = fs.readJSONSync(packageJsonPath) as PackageJson;

  return { packageJsonPath, packageJson };
}
