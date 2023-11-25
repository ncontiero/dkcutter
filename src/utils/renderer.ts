import nunjucks from "nunjucks";
import * as colors from "colorette";

import { getUserPkgManager } from "./getUserPkgManager";

const globals = {
  pkgManager: getUserPkgManager(),
  now: new Date(),
};

export const renderer = nunjucks.configure({ autoescape: true });
renderer.addGlobal("dkcutter", globals);
renderer.addGlobal("colors", colors);
