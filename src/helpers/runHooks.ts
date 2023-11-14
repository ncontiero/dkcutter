import type { ContextProps } from "./getConfig";

import path from "node:path";
import fs from "fs-extra";
import { execaSync } from "execa";
import nunjucks from "nunjucks";

import { handleError } from "@/utils/handleError";
import { PKG_TEMPLATE } from "@/consts";

const env = nunjucks.configure({ autoescape: true });

export async function configureHooks(ctx: ContextProps, dir = process.cwd()) {
  try {
    const supportedFiles = ["postGenProject.js", "preGenProject.js"];
    const hooksFolder = path.join(dir, "hooks");

    const hooksRenderedFolder = path.join(PKG_TEMPLATE, "hooks");
    fs.existsSync(hooksRenderedFolder) && fs.removeSync(hooksRenderedFolder);
    fs.mkdirSync(hooksRenderedFolder, { recursive: true });

    supportedFiles.forEach((hook) => {
      const hookPath = path.join(hooksFolder, hook);

      if (!fs.existsSync(hookPath)) return; // Skip hook if it doesn't exist.
      if (fs.existsSync(path.join(hooksRenderedFolder, hook))) return; // Skip hook if it's already rendered.

      const renderedHookPath = path.join(hooksRenderedFolder, hook);
      const hookContent = fs.readFileSync(hookPath, "utf-8");
      const renderedHookContent = env.renderString(hookContent, ctx);

      // Render hook with nunjucks.
      fs.writeFileSync(renderedHookPath, renderedHookContent);
    });
  } catch (err) {
    handleError(err);
  }
}

interface RunHooks {
  dir?: string;
  runHook: "postGenProject.js" | "preGenProject.js";
}

export async function runHooks({ dir = process.cwd(), runHook }: RunHooks) {
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
