import type { DKCutterContext } from "./getConfig";

import path from "node:path";
import fs from "fs-extra";
import { execaSync } from "execa";

import { getUserPkgManager } from "@/utils/getUserPkgManager";
import { HOOKS_FOLDER, PKG_ROOT, RENDERED_HOOKS_FOLDER } from "@/consts";
import { structureRender } from "./structureRender";

export async function configureHooks(
  ctx: DKCutterContext,
  dir = process.cwd(),
) {
  const hooksFolder = HOOKS_FOLDER(dir);

  if (!fs.existsSync(hooksFolder)) return;
  fs.ensureDirSync(RENDERED_HOOKS_FOLDER);

  await structureRender(ctx, hooksFolder, RENDERED_HOOKS_FOLDER);
}

interface RunHooks {
  dir?: string;
  runHook: "postGenProject" | "preGenProject";
}

export function runHooks({ dir = process.cwd(), runHook }: RunHooks) {
  try {
    const pkgManager = getUserPkgManager();
    const supportedHooks = [`${runHook}.js`, `${runHook}.ts`];

    const hookFile = supportedHooks.find((hook) =>
      fs.existsSync(path.join(RENDERED_HOOKS_FOLDER, hook)),
    );
    if (!hookFile) return; // No hook found.

    const hookPath = path.join(RENDERED_HOOKS_FOLDER, hookFile);

    const isBun = pkgManager === "bun";
    const isTs = hookFile.endsWith(".ts");
    const tsx = path.join(PKG_ROOT, "node_modules", ".bin", "tsx");
    const file = isBun ? "bun" : isTs ? tsx : "node";
    const args = isBun ? ["run", hookPath] : [hookPath];

    execaSync(file, args, {
      cwd: dir,
      stdout: "inherit",
      stdin: "inherit",
      stderr: "inherit",
    }); // Run hook.
    fs.removeSync(hookPath); // Remove hook file from hooks folder.
  } catch (error) {
    const msg = `Failed to run hook: ${runHook}.`;
    if (error instanceof Error) {
      throw new TypeError(`${msg}\n${error.message}`);
    } else {
      throw new TypeError(msg);
    }
  }
}
