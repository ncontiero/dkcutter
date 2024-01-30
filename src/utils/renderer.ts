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

const globals = {
  pkgManager: getUserPkgManager(),
  now: new Date(),
};

renderer.addGlobal("dkcutter", globals);
renderer.addGlobal("colors", colors);

renderer.addFilter("wordCount", (str: string, count: string) => {
  return count ? str.split(count).length - 1 : str.length;
});
