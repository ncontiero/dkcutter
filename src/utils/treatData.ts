import type { ContextProps } from "@/helpers/getConfig";

import { renderer } from "./renderer";

export function treatData(data: ContextProps): ContextProps {
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      const newValue = renderer.renderString(value, data);
      data[key] = newValue;
    }
  }
  return data;
}
