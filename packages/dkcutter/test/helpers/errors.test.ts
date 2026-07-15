import {
  type Mock,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { z } from "zod";
import { ConfigError, handleError, TemplateError } from "@/helpers/errors";
import { logger } from "@/utils/logger";

vi.mock("@/utils/logger", () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe("Errors Helper", () => {
  let mockExit: Mock<(code?: number | string | null) => never>;

  beforeEach(() => {
    mockExit = vi
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should log ZodError cleanly inside ConfigError", () => {
    const zodError = new z.ZodError([
      { code: "custom", path: ["foo"], message: "bar" },
    ]);
    const error = new ConfigError("Invalid config", { zodError });

    handleError(error);

    expect(logger.error).toHaveBeenCalledWith(
      "An error occurred during project generation.",
    );
    expect(logger.error).toHaveBeenCalledWith("Invalid config");
    // Zod error formatting check
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("bar"));
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it("should log custom DKCutterError message", () => {
    const error = new TemplateError("Template not found", {
      cause: new Error("ENOENT"),
    });

    handleError(error);

    expect(logger.error).toHaveBeenCalledWith("Template not found");
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it("should handle string errors", () => {
    handleError("String error");

    expect(logger.error).toHaveBeenCalledWith("String error");
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it("should handle generic Error instances", () => {
    const error = new Error("Generic error");

    handleError(error);

    expect(logger.error).toHaveBeenCalledWith("Generic error");
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it("should handle unknown error types with fallback message", () => {
    handleError(12345);

    expect(logger.error).toHaveBeenCalledWith(
      "Something went wrong. Please try again.",
    );
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
