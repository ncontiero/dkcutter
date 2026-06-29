import { log as clackLog } from "@clack/prompts";
import { blue, green, red, yellow } from "ansis";

export type LOG_TYPE = "info" | "success" | "error" | "warn";

const colorFunctions = {
  info: blue,
  success: green,
  error: red,
  warn: yellow,
};

export function colorize(type: LOG_TYPE, text: unknown): string {
  return colorFunctions[type]?.(text) ?? text;
}

export function createLogger(type: LOG_TYPE, ...data: unknown[]) {
  const message = data.map((d) => colorize(type, d)).join(" ");
  switch (type) {
    case "info":
      clackLog.info(message);
      break;
    case "success":
      clackLog.success(message);
      break;
    case "warn":
      clackLog.warn(message);
      break;
    case "error":
      clackLog.error(message);
      break;
    default:
      clackLog.message(message);
  }
}

export function createLoggerMethod(type: LOG_TYPE) {
  return (...args: unknown[]) => createLogger(type, ...args);
}

export const logger = {
  error: createLoggerMethod("error"),
  warn: createLoggerMethod("warn"),
  info: createLoggerMethod("info"),
  success: createLoggerMethod("success"),
  break: () => clackLog.message(""),
};
