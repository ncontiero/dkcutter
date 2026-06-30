import type { ContextProps, DKCutterContext } from "@/helpers/getConfig";

import * as colors from "ansis";
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
 * Applies a rendered value to a specific field in the DKCutter context and optionally returns the result.
 * This helper centralizes validation and conditional existence checks for context field updates used by other context utilities.
 *
 * @param {string} actionName - The name of the action used for error messaging context.
 * @param {string} field - The name of the field in the DKCutter context to set or validate.
 * @param {string} value - The raw string value to render with the current context before assignment.
 * @param {boolean} [returnV] - Whether the function should return the newly assigned value instead of `undefined`.
 * @param {boolean} [checkExists] - When `true`, ensures the field already exists in the context before updating.
 * @returns {string|boolean|undefined} - The updated field value when `returnV` is `true`, otherwise `undefined`.
 * @throws {TypeError} - If `field` is not provided as a string.
 * @throws {Error} - If `checkExists` is `true` and the target field is missing from the DKCutter context.
 */
function setContextField(
  actionName: "update" | "add",
  field: string,
  value: string,
  returnV: boolean = false,
  checkExists: boolean = false,
): string | boolean | undefined {
  if (typeof field !== "string") {
    throw new TypeError(
      `In \`dkcutter.${actionName}()\` the field must be a string, got ${typeof field}`,
    );
  }

  const dkcutter = renderer.getGlobal("dkcutter") as ContextProps;

  if (checkExists && dkcutter[field] == null) {
    throw new Error(
      `In \`dkcutter.${actionName}()\` the field "${field}" does not exist in the context`,
    );
  }

  dkcutter[field] = verifyBoolean(renderer.renderString(value, dkcutter));
  if (returnV) return dkcutter[field];
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
  return setContextField("update", field, newValue, returnV, true);
}

/**
 * Adds a value to a field in the DKCutter context after rendering the string.
 * @param {string} field - The field in the context to add the value to.
 * @param {string} value - The value to add to the field.
 * @param {boolean} [returnV] - Flag indicating whether to return the updated value. (default: `false`)
 * @returns {string|undefined} - The updated value if `returnV` is `true`, otherwise `undefined`.
 * @throws {TypeError} - If the `field` argument is not a string.
 * @example
 * dkcutter.add("author", "John Doe");
 */
function addValueToContext(
  field: string,
  value: string,
  returnV: boolean = false,
): string | boolean | undefined {
  return setContextField("add", field, value, returnV, false);
}

const globals = {
  pkgManager: getUserPkgManager(),
  now: new Date(),
  update: updateContext,
  add: addValueToContext,
};

renderer.addGlobal("dkcutter", globals);

type ColorFn = (...args: string[]) => string;
const nunjucksColors: Record<string, ColorFn> = {};
for (const [key, value] of Object.entries(colors)) {
  if (typeof value === "function") {
    nunjucksColors[key] = (...args: string[]) => (value as ColorFn)(...args);
  }
}
renderer.addGlobal("colors", nunjucksColors);

renderer.addFilter("wordCount", (str: string, count: string) => {
  return count ? str.split(count).length - 1 : str.length;
});
