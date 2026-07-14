import type { ContextProps } from "@/helpers/getConfig";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { dkcutter } from "@/index";

// Helper to recursively read a directory and return a map of relative path to content
async function readDirectoryContents(
  dir: string,
  baseDir = dir,
): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);

    if (entry.isDirectory()) {
      const subContents = await readDirectoryContents(fullPath, baseDir);
      Object.assign(result, subContents);
    } else {
      const content = await fs.readFile(fullPath, "utf-8");
      result[relativePath] = content;
    }
  }

  return result;
}

describe("Integration: Fixtures", () => {
  const fixturesDir = path.resolve(__dirname, "fixtures");
  const tempOutputsDir = path.join(os.tmpdir(), "dkcutter-fixtures");

  afterAll(async () => {
    // Cleanup the temporary outputs directory after all tests
    try {
      await fs.rm(tempOutputsDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  beforeEach(() => {
    vi.spyOn(process, "exit").mockImplementation(() => {
      return undefined as never;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Helper to generate a project programmatically
  async function generateProject(
    fixtureName: string,
    outputName: string,
    extraContext?: ContextProps,
  ) {
    const fixturePath = path.join(fixturesDir, fixtureName);
    const inputPath = path.join(fixturePath, "input");
    const testOutputDir = path.join(tempOutputsDir, outputName);

    await fs.mkdir(testOutputDir, { recursive: true });

    const result = await dkcutter({
      template: inputPath,
      extraContext,
      options: {
        default: true,
        output: testOutputDir,
      },
    });

    return { testOutputDir, result };
  }

  // Helper to validate a valid generation case
  async function validateValidCase(
    fixtureName: string,
    expectedOutputName: string,
    extraContext?: ContextProps,
  ) {
    const expectedOutputPath = path.join(
      fixturesDir,
      fixtureName,
      "output",
      expectedOutputName,
    );
    const uniqueOutputName = `${fixtureName}-${expectedOutputName}-${Date.now()}`;

    const { testOutputDir } = await generateProject(
      fixtureName,
      uniqueOutputName,
      extraContext,
    );

    const expectedContents = await readDirectoryContents(expectedOutputPath);
    const generatedProjectPath = path.join(testOutputDir, expectedOutputName);
    const actualContents = await readDirectoryContents(generatedProjectPath);

    const expectedPaths = Object.keys(expectedContents).sort();
    const actualPaths = Object.keys(actualContents).sort();

    expect(actualPaths).toEqual(expectedPaths);

    for (const filePath of expectedPaths) {
      expect(actualContents[filePath]).toBe(expectedContents[filePath]);
    }
  }

  // Helper to validate an invalid generation case
  async function validateInvalidCase(
    fixtureName: string,
    extraContext?: ContextProps,
  ) {
    const uniqueOutputName = `${fixtureName}-invalid-${Date.now()}`;
    const { testOutputDir, result } = await generateProject(
      fixtureName,
      uniqueOutputName,
      extraContext,
    );

    // Should return empty context on failure
    expect(result).toEqual({});

    // process.exit should have been called with 1
    // eslint-disable-next-line ts/unbound-method
    expect(process.exit).toHaveBeenCalledWith(1);

    // The output directory should be empty (or not created)
    const actualContents = await readDirectoryContents(testOutputDir);
    expect(Object.keys(actualContents).length).toBe(0);
  }

  it("should process simple fixture correctly using default config", async () => {
    await validateValidCase("simple", "my-app");
  });

  it("should process simple fixture with custom extraContext (projectName)", async () => {
    await validateValidCase("simple", "custom-app", {
      projectName: "Custom App",
      useTypescript: false,
    });
  });

  it('should process simple fixture with custom extraContext (useTypescript as string "false")', async () => {
    await validateValidCase("simple", "custom-app", {
      projectName: "Custom App",
      useTypescript: "false",
    });
  });

  it("should process simple fixture with custom extraContext (projectSlug != projectName)", async () => {
    await validateValidCase("simple", "my-app-slug", {
      projectName: "My App",
      projectSlug: "my-app-slug",
    });
  });

  it("should fail to process simple fixture with invalid extraContext (empty projectName)", async () => {
    // Empty projectName string violates the min(1) zod string validation constraint
    await validateInvalidCase("simple", { projectName: "" });
  });

  describe("Engine Validation", () => {
    it("should fail to process fixture with invalid engine range", async () => {
      await validateInvalidCase("invalid-engine-range");
    });

    it("should fail to process fixture with unsatisfied engine requirement", async () => {
      await validateInvalidCase("unsatisfied-engine");
    });
  });

  describe("Complex Fixture", () => {
    it("should process complex fixture correctly using default config", async () => {
      await validateValidCase("complex", "default-app");
    });

    it("should process complex fixture retaining db directory when database is true", async () => {
      await validateValidCase("complex", "with-db-app", {
        projectSlug: "with-db-app",
        database: true,
      });
    });

    it("should process complex fixture updating global context based on extraContext (tools: 'none')", async () => {
      await validateValidCase("complex", "no-tools-app", {
        projectSlug: "no-tools-app",
        tools: "none",
        framework: "vue",
      });
    });

    it("should fail to process complex fixture with invalid choice", async () => {
      // "angular" is not in the choices for framework
      await validateInvalidCase("complex", { framework: "angular" });
    });
  });
});
