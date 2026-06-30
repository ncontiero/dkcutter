import { z, ZodError } from "zod";
import { logger } from "./logger";

export function handleError(error: unknown) {
  logger.error("An error occurred during project generation.");

  if (typeof error === "string") {
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
