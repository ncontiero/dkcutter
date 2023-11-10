import type { ContextProps } from "@/helpers/getConfig";

import nunjucks from "nunjucks";

export function treatData(data: ContextProps): ContextProps {
  const processedData = { ...data };
  Object.entries(data).map(([key, value]) => {
    if (typeof value !== "string") {
      return null;
    }
    processedData[key] = nunjucks.renderString(value, data);
    return null;
  });
  return processedData;
}
