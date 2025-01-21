export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

/**
 * Determines the package manager being used based on the user agent environment variable.
 * @returns {PackageManager} - The detected package manager (npm, yarn, pnpm, or bun).
 */
export function getUserPkgManager(): PackageManager {
  // This environment variable is set by npm and yarn but pnpm seems less consistent
  const userAgent = process.env.npm_config_user_agent;

  if (userAgent) {
    if (userAgent.startsWith("yarn")) {
      return "yarn";
    } else if (userAgent.startsWith("pnpm")) {
      return "pnpm";
    } else if (userAgent.startsWith("bun")) {
      return "bun";
    }
  }
  return "npm";
}
