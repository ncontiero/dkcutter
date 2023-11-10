import { execSync } from "child_process";

export function isGitInstalled(dir: string): boolean {
  try {
    execSync("git --version", { cwd: dir });
    return true;
  } catch (_e) {
    return false;
  }
}
