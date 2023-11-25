import path from "node:path";
import { fileURLToPath } from "node:url";

// With the move to TSUP as a build tool, this keeps path routes in other files (installers, loaders, etc) in check more easily.
// Path is in relation to a single index.js file inside ./dist
const __filename = fileURLToPath(import.meta.url);
const distPath = path.dirname(__filename);
export const PKG_ROOT = path.join(distPath, "../");
export const PKG_TEMPLATE = path.join(PKG_ROOT, "template");

export const CONFIG_FILE_NAME = "dkcutter.json";

// Hooks
export const HOOKS_FOLDER = (dir: string = PKG_ROOT) => path.join(dir, "hooks");
export const RENDERED_HOOKS_FOLDER = path.join(PKG_ROOT, "rendered-hooks");
