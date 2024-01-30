import type { ContextProps, DKCutterContext } from "@/helpers/getConfig";

import nunjucks from "nunjucks";
import * as colors from "colorette";

import { getUserPkgManager } from "./getUserPkgManager";

export const renderer = nunjucks.configure({ autoescape: true });

export function setRendererContext(ctx: ContextProps): DKCutterContext {
  const dkcutter = renderer.getGlobal("dkcutter");
  const newCtx = { ...dkcutter, ...ctx };
  renderer.addGlobal("dkcutter", newCtx);
  return { dkcutter: newCtx };
}
function updateContext(field: string, newValue: string, returnV = false) {
  const msgError = "In `dkcutter.update()` the";
  if (typeof field !== "string") {
    throw new Error(`${msgError} field must be a string, got ${typeof field}`);
  }
  const dkcutter = renderer.getGlobal("dkcutter");
  if (!dkcutter[field]) {
    throw new Error(
      `${msgError} field "${field}" does not exist in the context`,
    );
  }
  dkcutter[field] = renderer.renderString(newValue, dkcutter);
  if (returnV) return dkcutter[field];
}

const globals = {
  pkgManager: getUserPkgManager(),
  now: new Date(),
  update: updateContext,
};

renderer.addGlobal("dkcutter", globals);
renderer.addGlobal("colors", colors);

renderer.addFilter("wordCount", (str: string, count: string) => {
  return count ? str.split(count).length - 1 : str.length;
});
