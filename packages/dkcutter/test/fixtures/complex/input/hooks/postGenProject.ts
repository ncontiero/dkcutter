import { remove } from "dkcutter/utils";
import path from "node:path";

const projectRootDir = path.resolve(".");

export const toBoolean = (value: string) => {
  return value === "true";
};

const hasDatabase = "{{ dkcutter.database }}";
if (!toBoolean(hasDatabase)) {
  remove(path.join(projectRootDir, "db"));
}
