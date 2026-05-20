import { describe, expect, it } from "vitest";
import { renderer, setRendererContext } from "@/utils/renderer";

describe("utils/renderer", () => {
  describe("setRendererContext", () => {
    it("should set and update the dkcutter global context", () => {
      // First setting
      const initialCtx = setRendererContext({
        projectName: "Test Project",
        value: true,
      });
      expect(initialCtx.dkcutter).toMatchObject({
        projectName: "Test Project",
        value: true,
      });

      const globalCtx = renderer.getGlobal("dkcutter") as Record<
        string,
        unknown
      >;
      expect(globalCtx).toMatchObject({
        projectName: "Test Project",
        value: true,
      });

      // Updating context
      const updatedCtx = setRendererContext({
        projectName: "Updated Project",
        newField: "123",
      });
      expect(updatedCtx.dkcutter).toMatchObject({
        projectName: "Updated Project",
        value: true,
        newField: "123",
      });

      const updatedGlobalCtx = renderer.getGlobal("dkcutter") as Record<
        string,
        unknown
      >;
      expect(updatedGlobalCtx).toMatchObject({
        projectName: "Updated Project",
        value: true,
        newField: "123",
      });
    });
  });

  describe("renderer custom globals", () => {
    it("should have update and add globals", () => {
      const globalCtx = renderer.getGlobal("dkcutter") as Record<
        string,
        unknown
      >;
      expect(typeof globalCtx.update).toBe("function");
      expect(typeof globalCtx.add).toBe("function");
    });

    it("should render strings using the context", () => {
      setRendererContext({ author: "John Doe" });
      const result = renderer.renderString("Hello {{ dkcutter.author }}!", {});
      expect(result).toBe("Hello John Doe!");
    });
  });

  describe("renderer custom filters", () => {
    it("should calculate word count", () => {
      // The wordCount filter uses str.split(count).length - 1 if count is provided,
      // otherwise it returns str.length.
      const result1 = renderer.renderString(
        `{{ "a b c d" | wordCount(" ") }}`,
        {},
      );
      expect(result1).toBe("3"); // "a b c d".split(" ").length - 1 = 3

      const result2 = renderer.renderString(`{{ "hello" | wordCount }}`, {});
      expect(result2).toBe("5"); // length is 5
    });
  });
});
