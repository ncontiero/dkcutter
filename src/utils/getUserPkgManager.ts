export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export const getUserPkgManager = (): PackageManager => {
  // This environment variable is set by npm and yarn but pnpm seems less consistent
  const userAgent = process.env.npm_config_user_agent;

  if (!userAgent) {
    return "npm";
  }
  switch (true) {
    case userAgent.startsWith("yarn"):
      return "yarn";
    case userAgent.startsWith("pnpm"):
      return "pnpm";
    case userAgent.startsWith("bun"):
      return "bun";
    default:
      return "npm";
  }
};
