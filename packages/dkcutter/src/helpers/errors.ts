import { z, ZodError } from "zod";
import { logger } from "@/utils/logger";

export class DKCutterError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "DKCutterError";
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ConfigError extends DKCutterError {
  public readonly zodError?: ZodError;
  name = "ConfigError";

  constructor(
    message: string,
    options?: ErrorOptions & { zodError?: ZodError },
  ) {
    super(message, options);
    this.zodError = options?.zodError;
  }
}

export class EngineError extends DKCutterError {
  name = "EngineError";
}
export class TemplateError extends DKCutterError {
  name = "TemplateError";
}
export class HookConfigError extends DKCutterError {
  name = "HookConfigError";
}
export class HookExecutionError extends DKCutterError {
  name = "HookExecutionError";
}
export class RenderError extends DKCutterError {
  name = "RenderError";
}
export class ValidationError extends DKCutterError {
  name = "ValidationError";
}

export function handleError(error: unknown) {
  logger.error("An error occurred during project generation.");

  if (error instanceof ConfigError && error.zodError) {
    logger.error(error.message);
    logger.error(z.prettifyError(error.zodError));
  } else if (error instanceof DKCutterError) {
    logger.error(error.message);
  } else if (typeof error === "string") {
    logger.error(error);
  } else if (error instanceof ZodError) {
    logger.error(z.prettifyError(error));
  } else if (error instanceof Error) {
    logger.error(error.message);
  } else {
    logger.error("Something went wrong. Please try again.");
  }

  process.exit(1);
}
