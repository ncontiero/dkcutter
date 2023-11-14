import { logger } from "@/utils/logger";

export function handleError(error: unknown) {
  logger.error("Aborting installation...");

  if (typeof error === "string") {
    logger.error(error);
  } else if (error instanceof Error) {
    logger.error(error.message);
  } else {
    logger.error("Something went wrong. Please try again.");
  }

  process.exit(1);
}
