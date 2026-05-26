import type { ContextProps, DKCutterContext } from "@/helpers/getConfig";

import * as colors from "colorette";
import nunjucks from "nunjucks";

import { getUserPkgManager } from ".";

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
  const dkcutter = renderer.getGlobal("dkcutter") as ContextProps;
  const newCtx = { ...dkcutter, ...ctx };
  renderer.addGlobal("dkcutter", newCtx);
  return { dkcutter: newCtx };
}

/**
 * Converts a string value that represents a boolean into its boolean equivalent, or returns the original string.
 * This helper is used to interpret case-insensitive "true"/"false" values while preserving non-boolean strings.
 *
 * @param {string} value - The string value to check and convert.
 * @returns {boolean|string} - `true` or `false` if the input matches those strings (case-insensitive), otherwise the original string.
 */
function verifyBoolean(value: string): boolean | string {
  const lowerValue = value.trim().toLowerCase();
  if (lowerValue === "true") return true;
  if (lowerValue === "false") return false;
  return value;
}

/**
 * Updates a field in the DKCutter context with a new value after rendering the string.
 * @param {string} field - The field in the context to update.
 * @param {string} newValue - The new value to set for the field.
 * @param {boolean} [returnV] - Flag indicating whether to return the updated value. (default: `false`)
 * @returns {string|undefined} - The updated value if `returnV` is `true`, otherwise `undefined`.
 * @throws {TypeError} - If the `field` argument is not a string.
 * @throws {Error} - If the `field` does not exist in the DKCutter context.
 * @example
 * dkcutter.update("author", "Jane Doe");
 */
function updateContext(
  field: string,
  newValue: string,
  returnV: boolean = false,
): string | boolean | undefined {
  const msgError = "In `dkcutter.update()` the";
  if (typeof field !== "string") {
    throw new TypeError(
      `${msgError} field must be a string, got ${typeof field}`,
    );
  }
  const dkcutter = renderer.getGlobal("dkcutter") as ContextProps;
  if (dkcutter[field] == null) {
    throw new Error(
      `${msgError} field "${field}" does not exist in the context`,
    );
  }
  dkcutter[field] = verifyBoolean(renderer.renderString(newValue, dkcutter));
  if (returnV) return dkcutter[field];
}

/**
 * Adds a value to a field in the DKCutter context after rendering the string.
 * @param {string} field - The field in the context to add the value to.
 * @param {string} value - The value to add to the field.
 * @param {boolean} [returnV] - Flag indicating whether to return the updated value. (default: `false`)
 * @returns {string|undefined} - The updated value if `returnV` is `true`, otherwise `undefined`.
 * @throws {TypeError} - If the `field` argument is not a string.
 * @throws {Error} - If the `field` does not exist in the DKCutter context.
 * @example
 * dkcutter.add("author", "John Doe");
 */
function addValueToContext(
  field: string,
  value: string,
  returnV: boolean = false,
): string | boolean | undefined {
  const msgError = "In `dkcutter.add()` the";
  if (typeof field !== "string") {
    throw new TypeError(
      `${msgError} field must be a string, got ${typeof field}`,
    );
  }
  const dkcutter = renderer.getGlobal("dkcutter") as ContextProps;
  dkcutter[field] = verifyBoolean(renderer.renderString(value, dkcutter));
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
