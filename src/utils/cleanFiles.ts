import fs from "fs-extra";
import path from "node:path";

import {
  CONFIG_FILE_NAME,
  HOOKS_FOLDER,
  PKG_ROOT,
  PKG_TEMPLATE,
  RENDERED_HOOKS_FOLDER,
} from "@/consts";

interface CleanFiles {
  generatedProjectRoot?: string;
  templateFolder?: string;
  isLocalProject?: boolean;
}

export function cleanFiles({
  generatedProjectRoot,
  templateFolder = PKG_TEMPLATE,
  isLocalProject = false,
}: CleanFiles) {
  if (generatedProjectRoot) {
    fs.removeSync(generatedProjectRoot);
  }

  if (!isLocalProject) {
    fs.removeSync(path.join(PKG_ROOT, CONFIG_FILE_NAME));
    fs.removeSync(templateFolder);
  }

  fs.removeSync(RENDERED_HOOKS_FOLDER);
  fs.removeSync(HOOKS_FOLDER());
}
