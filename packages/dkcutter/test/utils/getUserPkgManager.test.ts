import { afterEach, describe, expect, it, vi } from "vitest";
import { getUserPkgManager } from "@/utils/getUserPkgManager";

describe("utils/getUserPkgManager", () => {
  const originalEnv = process.env.npm_config_user_agent;

  afterEach(() => {
    process.env.npm_config_user_agent = originalEnv;
    vi.restoreAllMocks();
  });

  it("should return yarn when user agent starts with yarn", () => {
    process.env.npm_config_user_agent =
      "yarn/1.22.19 npm/? node/v16.14.2 linux x64";
    expect(getUserPkgManager()).toBe("yarn");
  });

  it("should return pnpm when user agent starts with pnpm", () => {
    process.env.npm_config_user_agent =
      "pnpm/8.6.0 npm/? node/v18.16.0 linux x64";
    expect(getUserPkgManager()).toBe("pnpm");
  });

  it("should return bun when user agent starts with bun", () => {
    process.env.npm_config_user_agent =
      "bun/1.0.0 npm/? node/v18.16.0 linux x64";
    expect(getUserPkgManager()).toBe("bun");
  });

  it("should return npm when user agent starts with npm", () => {
    process.env.npm_config_user_agent =
      "npm/9.5.1 node/v18.16.0 linux x64 workspaces/false";
    expect(getUserPkgManager()).toBe("npm");
  });

  it("should default to npm if user agent is undefined", () => {
    delete process.env.npm_config_user_agent;
    expect(getUserPkgManager()).toBe("npm");
  });

  it("should default to npm if user agent is not recognized", () => {
    process.env.npm_config_user_agent = "unknown-manager/1.0";
    expect(getUserPkgManager()).toBe("npm");
  });
});
