import type { ContextProps } from "./getConfig";

import path from "node:path";
import fs from "fs-extra";
import { execaSync } from "execa";

import { handleError } from "@/utils/handleError";
import { renderer } from "@/utils/renderer";
import { PKG_TEMPLATE } from "@/consts";

export function configureHooks(ctx: ContextProps, dir = process.cwd()) {
  try {
    const supportedFiles = ["postGenProject.js", "preGenProject.js"];
    const hooksFolder = path.join(dir, "hooks");
    const hooksRenderedFolder = path.join(PKG_TEMPLATE, "hooks");

    fs.ensureDirSync(hooksRenderedFolder);

    for (const hook of supportedFiles) {
      const hookPath = path.join(hooksFolder, hook);
      const renderedHookPath = path.join(hooksRenderedFolder, hook);

      if (!fs.pathExistsSync(hookPath)) continue; // Skip hook if it doesn't exist.
      if (fs.pathExistsSync(renderedHookPath)) continue; // Skip hook if it's already rendered.

      const hookContent = fs.readFileSync(hookPath, "utf-8");
      const renderedHookContent = renderer.renderString(hookContent, ctx);

      // Render hook with nunjucks.
      fs.writeFileSync(renderedHookPath, renderedHookContent);
    }
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

    if (fs.existsSync(hookPath)) {
      execaSync("node", [hookPath], { cwd: dir }); // Run hook.
      fs.removeSync(hookPath); // Remove hook file from hooks folder.
    } else {
      throw new Error(`Hook ${runHook} not supported.`);
    }
  } catch (err) {
    handleError(err);
  }
}
