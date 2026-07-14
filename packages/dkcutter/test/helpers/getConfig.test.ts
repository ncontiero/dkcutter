import { afterEach, describe, expect, it, vi } from "vitest";
import { getConfig } from "@/helpers/getConfig";

const INVALID_CONFIG_REGEX = /Invalid configuration found/;

// Mock lilconfig
vi.mock("lilconfig", () => {
  return {
    lilconfig: vi.fn(() => ({
      search: vi.fn(async (cwd: string) => {
        if (cwd === "/valid") {
          return Promise.resolve({
            config: {
              projectName: "My Project",
              useTypescript: true,
              framework: {
                value: "react",
                choices: [
                  { value: "react", title: "React" },
                  { value: "vue", title: "Vue" },
                ],
                choicesType: "select",
              },
            },
          });
        }
        if (cwd === "/valid-with-dkcutter") {
          return Promise.resolve({
            config: {
              projectName: "My App",
              _dkcutter: {
                engines: {
                  dkcutter: ">=6.0.0",
                },
              },
            },
          });
        }
        if (cwd === "/invalid") {
          return Promise.resolve({
            config: {
              projectName: 123, // Invalid type for value
            },
          });
        }
        return Promise.resolve(null);
      }),
    })),
  };
});

describe("helpers/getConfig", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return null if no config is found", async () => {
    const config = await getConfig("/not-found");
    expect(config).toBeNull();
  });

  it("should parse and return valid configuration", async () => {
    const config = await getConfig("/valid");
    expect(config).not.toBeNull();
    expect(config?.templateConfig?.projectName).toBe("My Project");
    expect(config?.templateConfig?.useTypescript).toBe(true);

    // Ensure nested object is preserved
    const framework = config?.templateConfig?.framework as {
      value: string;
      choicesType: string;
    };
    expect(framework.value).toBe("react");
    expect(framework.choicesType).toBe("select");
  });

  it("should parse and return valid configuration with _dkcutter", async () => {
    const config = await getConfig("/valid-with-dkcutter");
    expect(config).not.toBeNull();
    expect(config?.templateConfig?.projectName).toBe("My App");

    // Ensure _dkcutter is removed from templateConfig
    expect(config?.templateConfig).not.toHaveProperty("_dkcutter");

    // Ensure dkcutterConfig is correctly parsed
    expect(config?.dkcutterConfig?.engines?.dkcutter).toBe(">=6.0.0");
  });

  it("should throw an error for invalid configuration schema", async () => {
    await expect(getConfig("/invalid")).rejects.toThrow(INVALID_CONFIG_REGEX);
  });
});
