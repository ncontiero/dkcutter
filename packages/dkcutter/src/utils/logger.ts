/* eslint-disable no-console */
import util from "node:util";
import { isMainThread, parentPort } from "node:worker_threads";
import { blue, green, red, yellow } from "colorette";

export type LOG_TYPE = "info" | "success" | "error" | "warn";

const colorFunctions = {
  info: blue,
  success: green,
  error: red,
  warn: yellow,
};

function toLogString(value: unknown): string {
  if (typeof value === "string") return value;
  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null ||
    value === undefined
  )
    return String(value);

  if (typeof value === "bigint" || typeof value === "symbol") {
    return value.toString();
  }

  try {
    // Try JSON first for objects/arrays to preserve structure
    return JSON.stringify(value);
  } catch {
    // Fallback to default string conversion
    return String(value);
  }
}

export function colorize(type: LOG_TYPE, data: unknown): string {
  const text = toLogString(data);
  return colorFunctions[type]?.(text) ?? text;
}

export function createLogger(type: LOG_TYPE, ...data: unknown[]) {
  const args = data.map((item) => colorize(type, item));
  const messageType = type === "error" ? "error" : "log";
  const formattedMessage = util.format(...args);

  if (!isMainThread) {
    parentPort?.postMessage({
      type: messageType,
      text: formattedMessage,
    });
    return;
  }

  if (type === "error") {
    console.error(...args);
  } else {
    console.log(...args);
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
  break: () => console.log(""),
};
