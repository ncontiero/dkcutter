import { z, ZodError } from "zod";
import { logger } from "@/utils/logger";

export class DKCutterError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "DKCutterError";
    Error.captureStackTrace(this, this.constructor);
  }
}

export abstract class DKCutterZodError extends DKCutterError {
  public readonly zodError?: ZodError;
  name = "DKCutterZodError";

  constructor(
    message: string,
    options?: ErrorOptions & { zodError?: ZodError },
  ) {
    super(message, options);
    this.zodError = options?.zodError;
  }
}

export class ConfigError extends DKCutterZodError {
  name = "ConfigError";
}
export class TemplateError extends DKCutterZodError {
  name = "TemplateError";
}
export class EngineError extends DKCutterError {
  name = "EngineError";
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

  if (error instanceof DKCutterZodError && error.zodError) {
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
