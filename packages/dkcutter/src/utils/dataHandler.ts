import type { ConfigObjectProps, ConfigObjectValue } from "@/helpers/getConfig";

export function isObject(value: unknown): value is object {
  return value != null && typeof value === "object";
}
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}
/**
 * Checks if a ConfigObjectProps value represents a multiselect option.
 * @param {ConfigObjectProps} value - The value to check.
 * @returns {boolean} - True if the value is a multiselect option, false otherwise.
 */
export function isMultiselect(value: ConfigObjectProps): boolean {
  if (!isArray(value) && isObject(value)) {
    return value.choicesType === "multiselect";
  }
  return false;
}

/**
 * Extracts the initial value from a configuration property.
 * @param {ConfigObjectProps} configValue - The configuration property.
 */
export function getInitialValue(configValue: ConfigObjectProps) {
  if (isArray(configValue)) {
    return configValue[0];
  }

  if (isObject(configValue)) {
    const { value } = configValue;
    if (isArray(value)) {
      return value[0];
    }
    return value;
  }

  return configValue;
}

/**
 * Returns the default value based on the provided configuration object.
 *
 * This function determines the default value by checking the configuration object and its properties.
 * If the configuration value is an array or object, it retrieves the initial value accordingly.
 * It also checks if the value is for a multiselect option and handles string splitting if needed.
 *
 * @param {ConfigObjectProps} configValue - The configuration object to extract the default value from.
 * @returns {ConfigObjectValue} - The default value based on the configuration object.
 */
export function getDefaultValue(
  configValue: ConfigObjectProps,
): ConfigObjectValue {
  const initialValue = getInitialValue(configValue);

  if (isMultiselect(configValue) && typeof initialValue === "string") {
    return initialValue.split(",").map((s) => s.trim());
  }

  return initialValue;
}
