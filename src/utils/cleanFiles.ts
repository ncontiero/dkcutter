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
  if (generatedProjectRoot && fs.existsSync(generatedProjectRoot)) {
    fs.removeSync(generatedProjectRoot);
  }

  // Config file
  !isLocalProject && fs.removeSync(path.join(PKG_ROOT, CONFIG_FILE_NAME));
  // Hooks
  fs.existsSync(RENDERED_HOOKS_FOLDER) && fs.removeSync(RENDERED_HOOKS_FOLDER);
  !isLocalProject && fs.existsSync(HOOKS_FOLDER());
  !isLocalProject && fs.removeSync(templateFolder);
}
