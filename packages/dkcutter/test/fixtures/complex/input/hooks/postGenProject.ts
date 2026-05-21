import path from "node:path";
import { remove } from "dkcutter/utils";
import { updatePackageJson } from "./utils/updatePackageJson";

const projectRootDir = path.resolve(".");

export const toBoolean = (value: string) => {
  return value === "true";
};

async function main() {
  const hasDatabase = toBoolean("{{ dkcutter.database }}");
  if (!hasDatabase) {
    await remove(path.join(projectRootDir, "db"));
  }

  const hasEslint = toBoolean("{{ dkcutter.isEslint }}");
  const scripts: Record<string, string> = {
    dev: "echo 'running'",
    ...(hasEslint ? { lint: "eslint ." } : {}),
  };
  await updatePackageJson({ projectDir: projectRootDir, scripts });
}

await main();
