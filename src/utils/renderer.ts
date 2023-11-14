import nunjucks from "nunjucks";

import { getUserPkgManager } from "./getUserPkgManager";

const globals = {
  pkgManager: getUserPkgManager(),
  now: new Date(),
};

export const renderer = nunjucks.configure({ autoescape: true });
renderer.addGlobal("dkcutter", globals);
