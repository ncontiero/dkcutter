import type { ContextProps } from "./getConfig";

import path from "node:path";
import fs from "fs-extra";
import { execaSync } from "execa";

import { structureRender } from "./structureRender";
import { HOOKS_FOLDER, RENDERED_HOOKS_FOLDER } from "@/consts";

export async function configureHooks(ctx: ContextProps, dir = process.cwd()) {
  const hooksFolder = HOOKS_FOLDER(dir);

  if (!fs.existsSync(hooksFolder)) return;
  fs.ensureDirSync(RENDERED_HOOKS_FOLDER);

  await structureRender(ctx, hooksFolder, RENDERED_HOOKS_FOLDER);
}

interface RunHooks {
  dir?: string;
  runHook: "postGenProject.js" | "preGenProject.js";
}

export function runHooks({ dir = process.cwd(), runHook }: RunHooks) {
  try {
    const hookPath = path.join(RENDERED_HOOKS_FOLDER, runHook);

    if (!fs.existsSync(hookPath)) return;

    execaSync("node", [hookPath], {
      cwd: dir,
      stdout: "inherit",
      stdin: "inherit",
    }); // Run hook.
    fs.removeSync(hookPath); // Remove hook file from hooks folder.
  } catch (error) {
    const msg = `Failed to run hook: ${runHook}.`;
    if (error instanceof Error) {
      throw new Error(`${msg}\n${error.message}`);
    } else {
      throw new Error(msg);
    }
  }
}
