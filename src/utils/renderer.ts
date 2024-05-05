import type { ContextProps, DKCutterContext } from "@/helpers/getConfig";

import nunjucks from "nunjucks";
import * as colors from "colorette";

import { getUserPkgManager } from "./getUserPkgManager";

/**
 * Returns the default renderer for the DKCutter template.
 * @returns {nunjucks.Environment} - The default renderer.
 */
export const renderer = nunjucks.configure({ autoescape: true });

/**
 * Sets the context for the renderer by updating the DKCutter context with the provided data.
 * @param {ContextProps} ctx - The context data to set for the renderer.
 * @returns {DKCutterContext} - The updated DKCutter context.
 */
export function setRendererContext(ctx: ContextProps): DKCutterContext {
  const dkcutter = renderer.getGlobal("dkcutter");
  const newCtx = { ...dkcutter, ...ctx };
  renderer.addGlobal("dkcutter", newCtx);
  return { dkcutter: newCtx };
}

/**
 * Updates a field in the DKCutter context with a new value after rendering the string.
 * @param {string} field - The field in the context to update.
 * @param {string} newValue - The new value to set for the field.
 * @param {boolean} [returnV=false] - Flag indicating whether to return the updated value.
 */
function updateContext(
  field: string,
  newValue: string,
  returnV: boolean = false,
) {
  const msgError = "In `dkcutter.update()` the";
  if (typeof field !== "string") {
    throw new TypeError(
      `${msgError} field must be a string, got ${typeof field}`,
    );
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

/**
 * Adds a value to a field in the DKCutter context after rendering the string.
 * @param {string} field - The field in the context to add the value to.
 * @param {string} value - The value to add to the field.
 * @param {boolean} [returnV=false] - Flag indicating whether to return the updated value.
 */
function addValueToContext(
  field: string,
  value: string,
  returnV: boolean = false,
) {
  const msgError = "In `dkcutter.add()` the";
  if (typeof field !== "string") {
    throw new TypeError(
      `${msgError} field must be a string, got ${typeof field}`,
    );
  }
  const dkcutter = renderer.getGlobal("dkcutter");
  dkcutter[field] = renderer.renderString(value, dkcutter);
  if (returnV) return dkcutter[field];
}

const globals = {
  pkgManager: getUserPkgManager(),
  now: new Date(),
  update: updateContext,
  add: addValueToContext,
};

renderer.addGlobal("dkcutter", globals);
renderer.addGlobal("colors", colors);

renderer.addFilter("wordCount", (str: string, count: string) => {
  return count ? str.split(count).length - 1 : str.length;
});
