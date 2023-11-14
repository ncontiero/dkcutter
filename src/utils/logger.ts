import chalk from "chalk";

export function createLogger(color: (text: string) => string) {
  return (...args: unknown[]) => console.log(color(args.toString()));
}

export const logger = {
  error: createLogger(chalk.red),
  warn: createLogger(chalk.yellow),
  info: createLogger(chalk.cyan),
  success: createLogger(chalk.green),
  break: () => console.log(""),
};
