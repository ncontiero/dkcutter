import nunjucks from "nunjucks";
import chalk from "chalk";

import { getUserPkgManager } from "./getUserPkgManager";

const globals = {
  pkgManager: getUserPkgManager(),
  now: new Date(),
};

export const renderer = nunjucks.configure({ autoescape: true });
renderer.addGlobal("dkcutter", globals);
renderer.addGlobal("chalk", chalk);
