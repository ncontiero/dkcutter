import type { DKCutterContext } from "./getConfig";

import path from "node:path";
import { execa } from "execa";
import fs from "fs-extra";

import { HOOKS_FOLDER, PKG_ROOT, RENDERED_HOOKS_FOLDER } from "@/consts";
import { getUserPkgManager } from "@/utils/getUserPkgManager";
import { structureRender } from "./structureRender";

/**
 * Configures and renders hooks for DKCutter based on the provided context and directory.
 * @param {DKCutterContext} context - The DKCutter context containing configuration data.
 * @param {string} [dir] - The directory to configure hooks in. Defaults to the current working directory.
 */
export async function configureHooks(
  context: DKCutterContext,
  dir: string = process.cwd(),
) {
  const hooksFolder = HOOKS_FOLDER(dir);
  const renderedHooksFolder = RENDERED_HOOKS_FOLDER();

  if (!(await fs.exists(hooksFolder))) return;
  await fs.emptyDir(renderedHooksFolder);

  await structureRender({
    context,
    directory: hooksFolder,
    output: renderedHooksFolder,
  });
}

interface RunHook {
  /**
   * The directory to run the hook in.
   * @default process.cwd()
   */
  dir?: string;
  /**
   * The hook to run.
   */
  hook: "postGenProject" | "preGenProject";
}

/**
 * Runs a specific hook script based on the provided configuration.
 * @param {RunHook} options - Object containing the directory and the hook script to run.
 */
export async function runHook({ dir = process.cwd(), hook }: RunHook) {
  try {
    const pkgManager = getUserPkgManager();
    const hooksPattern = new RegExp(`^${hook}\\.(js|ts)$`);
    const renderedHooksFolder = RENDERED_HOOKS_FOLDER();

    const hookFile = (await fs.readdir(renderedHooksFolder)).find((file) =>
      hooksPattern.test(file),
    );
    if (!hookFile) return; // No hook found.

    const hookPath = path.join(renderedHooksFolder, hookFile);

    const isBun = pkgManager === "bun";
    const isTs = hookFile.endsWith(".ts");
    const tsx = path.join(PKG_ROOT, "node_modules", ".bin", "tsx");
    const file = isBun ? "bun" : isTs ? tsx : "node";
    const args = isBun ? ["run", hookPath] : [hookPath];

    await execa(file, args, {
      cwd: dir,
      stdout: "inherit",
      stdin: "inherit",
      stderr: "inherit",
    }); // Run hook.
  } catch (error) {
    const msg = `Failed to run hook: ${hook}.`;
    if (error instanceof Error) {
      throw new TypeError(`${msg}\n${error.message}`);
    } else {
      throw new TypeError(msg);
    }
  }
}
