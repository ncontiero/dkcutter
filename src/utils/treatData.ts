import type { ContextProps } from "@/helpers/getConfig";

import { renderer } from "./renderer";

export function treatData(data: ContextProps): ContextProps {
  const processedEntries = Object.entries(data).map(([key, value]) => {
    if (typeof value === "string") {
      return [key, renderer.renderString(value, data)];
    }
    return [key, value];
  });
  return Object.fromEntries(processedEntries);
}
