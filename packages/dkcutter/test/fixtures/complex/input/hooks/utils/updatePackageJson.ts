import fs from "node:fs/promises";
import { getPackageInfo } from "dkcutter/utils";

interface UpdatePackageJsonProps {
  scripts?: Record<string, string>;
  projectDir: string;
}

export async function updatePackageJson({
  projectDir,
  scripts = {},
}: UpdatePackageJsonProps) {
  const { packageJson, packageJsonPath } = await getPackageInfo(projectDir);

  packageJson.scripts = { ...packageJson.scripts, ...scripts };

  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

  return packageJson;
}
