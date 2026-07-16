import type { Stats } from "node:fs";
import fs from "node:fs/promises";
import { resolve } from "node:path";
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

vi.mock("isbinaryfile", () => ({
  isBinaryFile: vi.fn((filePath: string) => {
    return (
      filePath.endsWith(".png") ||
      filePath.endsWith(".woff") ||
      filePath.endsWith(".mp4")
    );
  }),
}));

vi.mock("tinyglobby", () => ({
  glob: vi.fn((patterns: string[]) => {
    if (patterns.includes("ignored.ts") || patterns.includes("ignored-dir")) {
      return ["ignored.ts", "ignored-dir"];
    }
    if (patterns.includes("copy-me.ts")) {
      return ["copy-me.ts"];
    }
    return [];
  }),
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
      if (dir === resolve("/template")) return Promise.resolve(["src"]);
      if (dir === resolve("/template/src"))
        return Promise.resolve(["index.ts"]);
      return Promise.resolve([]);
    });

    vi.mocked(
      fs.lstat as unknown as (path: string) => Promise<Stats>,
    ).mockImplementation(async (path) => {
      return Promise.resolve({
        isDirectory: () => path.toString() === resolve("/template/src"),
        isFile: () => path.toString() !== resolve("/template/src"),
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

  it("should skip files or directories matching ignore config", async () => {
    vi.mocked(
      fs.readdir as unknown as (path: string) => Promise<string[]>,
    ).mockResolvedValue(["ignored.ts", "index.ts"]);

    vi.mocked(
      fs.lstat as unknown as (path: string) => Promise<Stats>,
    ).mockResolvedValue({
      isDirectory: () => false,
      isFile: () => true,
      mode: 0o777,
    } as unknown as Stats);

    await structureRender({
      context: { dkcutter: {} },
      directory: "/template",
      output: "/output",
      dkcutterConfig: { ignore: ["ignored.ts"] },
    });

    expect(fs.readFile).toHaveBeenCalledTimes(1);
    expect(fs.writeFile).toHaveBeenCalledTimes(1);
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining("index.ts"),
      expect.any(String),
    );
  });

  it("should copy without rendering files matching copyWithoutRender config", async () => {
    vi.mocked(
      fs.readdir as unknown as (path: string) => Promise<string[]>,
    ).mockResolvedValue(["copy-me.ts", "index.ts"]);

    vi.mocked(
      fs.lstat as unknown as (path: string) => Promise<Stats>,
    ).mockResolvedValue({
      isDirectory: () => false,
      isFile: () => true,
      mode: 0o777,
    } as unknown as Stats);

    await structureRender({
      context: { dkcutter: {} },
      directory: "/template",
      output: "/output",
      dkcutterConfig: { copyWithoutRender: ["copy-me.ts"] },
    });

    expect(fs.copyFile).toHaveBeenCalledTimes(1);
    expect(fs.copyFile).toHaveBeenCalledWith(
      expect.stringContaining("copy-me.ts"),
      expect.stringContaining("copy-me.ts"),
    );
    expect(fs.readFile).toHaveBeenCalledTimes(1);
    expect(fs.writeFile).toHaveBeenCalledTimes(1);
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining("index.ts"),
      expect.any(String),
    );
  });
});
