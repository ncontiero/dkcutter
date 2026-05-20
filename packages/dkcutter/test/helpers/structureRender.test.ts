import type { Stats } from "node:fs";
import fs from "node:fs/promises";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { structureRender } from "@/helpers/structureRender";
import { renderer } from "@/utils/renderer";

vi.mock("node:fs/promises", () => ({
  default: {
    readdir: vi.fn(),
    lstat: vi.fn(),
    mkdir: vi.fn(),
    readFile: vi.fn(),
    writeFile: vi.fn(),
    copyFile: vi.fn(),
    chmod: vi.fn(),
  },
}));

vi.mock("@/utils/renderer", () => ({
  renderer: {
    renderString: vi.fn((str: string) =>
      str.replace("{{projectName}}", "MockProject"),
    ),
  },
}));

describe("helpers/structureRender", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should process normal text files using nunjucks renderer", async () => {
    vi.mocked(
      fs.readdir as unknown as (path: string) => Promise<string[]>,
    ).mockResolvedValue(["index.ts", "package.json"]);

    vi.mocked(
      fs.lstat as unknown as (path: string) => Promise<Stats>,
    ).mockResolvedValue({
      isDirectory: () => false,
      isFile: () => true,
      mode: 0o777,
    } as unknown as Stats);

    vi.mocked(fs.readFile).mockResolvedValue("console.log('{{projectName}}');");

    await structureRender({
      context: { dkcutter: {} },
      directory: "/template",
      output: "/output",
    });

    expect(fs.readFile).toHaveBeenCalledTimes(2);
    // eslint-disable-next-line ts/unbound-method
    expect(renderer.renderString).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalledTimes(2);
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining("index.ts"),
      "console.log('MockProject');",
    );
  });

  it("should ignore binary files and use copyFile instead", async () => {
    vi.mocked(
      fs.readdir as unknown as (path: string) => Promise<string[]>,
    ).mockResolvedValue(["image.png", "font.woff", "video.mp4"]);

    vi.mocked(
      fs.lstat as unknown as (path: string) => Promise<Stats>,
    ).mockResolvedValue({
      isDirectory: () => false,
      isFile: () => true,
      mode: 0o666,
    } as unknown as Stats);

    await structureRender({
      context: { dkcutter: {} },
      directory: "/template",
      output: "/output",
    });

    expect(fs.copyFile).toHaveBeenCalledTimes(3);
    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  it("should process nested directories recursively", async () => {
    vi.mocked(
      fs.readdir as unknown as (path: string) => Promise<string[]>,
    ).mockImplementation(async (dir) => {
      if (dir === "/template") return Promise.resolve(["src"]);
      if (dir === "/template/src") return Promise.resolve(["index.ts"]);
      return Promise.resolve([]);
    });

    vi.mocked(
      fs.lstat as unknown as (path: string) => Promise<Stats>,
    ).mockImplementation(async (path) => {
      return Promise.resolve({
        isDirectory: () => path.toString().endsWith("src"),
        isFile: () => !path.toString().endsWith("src"),
        mode: 0o777,
      } as unknown as Stats);
    });

    vi.mocked(fs.readFile).mockResolvedValue("test");

    await structureRender({
      context: { dkcutter: {} },
      directory: "/template",
      output: "/output",
    });

    expect(fs.mkdir).toHaveBeenCalled();
    expect(fs.readdir).toHaveBeenCalledTimes(2);
  });
});
