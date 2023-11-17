import type { ContextProps } from "./getConfig";

import path from "node:path";
import fs from "fs-extra";
import { execaSync } from "execa";

import { structureRender } from "./structureRender";
import { handleError } from "@/utils/handleError";
import { PKG_TEMPLATE } from "@/consts";

export async function configureHooks(ctx: ContextProps, dir = process.cwd()) {
  try {
    const hooksFolder = path.join(dir, "hooks");
    const hooksRenderedFolder = path.join(PKG_TEMPLATE, "hooks");

    if (!fs.existsSync(hooksFolder)) return;
    fs.ensureDirSync(hooksRenderedFolder);

    await structureRender(ctx, hooksFolder, hooksRenderedFolder);
  } catch (err) {
    handleError(err);
  }
}

interface RunHooks {
  dir?: string;
  runHook: "postGenProject.js" | "preGenProject.js";
}

export function runHooks({ dir = process.cwd(), runHook }: RunHooks) {
  try {
    const hooksFolder = path.join(PKG_TEMPLATE, "hooks");
    const hookPath = path.join(hooksFolder, runHook);

    if (!fs.existsSync(hooksFolder)) return;
    if (!fs.existsSync(hookPath)) return;

    execaSync("node", [hookPath], { cwd: dir }); // Run hook.
    fs.removeSync(hookPath); // Remove hook file from hooks folder.
  } catch (err) {
    handleError(err);
  }
}
