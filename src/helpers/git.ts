import which from "which";

export function isGitInstalled(): boolean {
  return !!which.sync("git", { nothrow: true });
}
