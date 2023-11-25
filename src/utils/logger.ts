import util from "node:util";
import { parentPort, isMainThread } from "node:worker_threads";
import { blue, yellow, green, red } from "colorette";

type LOG_TYPE = "info" | "success" | "error" | "warn";

const colorFunctions = {
  info: blue,
  success: green,
  error: red,
  warn: yellow,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const colorize = (type: LOG_TYPE, data: any) => {
  return colorFunctions[type] ? colorFunctions[type](data) : data;
};

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
