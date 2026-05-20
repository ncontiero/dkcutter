import type prompts from "prompts";
import type { ConfigObjectProps } from "@/helpers/getConfig";
import { describe, expect, it } from "vitest";
import { createPromptObject } from "@/helpers/prompts";

const LOWERCASE_REGEX = /^[a-z]+$/;

describe("helpers/prompts", () => {
  describe("createPromptObject", () => {
    it("should handle internal keys starting with _", () => {
      const prompt = createPromptObject(["_internalKey", "value"]);
      expect(prompt.type).toBeNull();
      expect(prompt.name).toBe("_internalKey");
    });

    it("should create a basic text prompt for string value", () => {
      const prompt = createPromptObject(["projectName", "My Project"]);
      expect(
        typeof prompt.type === "function"
          ? prompt.type(undefined, {}, prompt)
          : prompt.type,
      ).toBe("text");
      expect(prompt.name).toBe("projectName");
      expect(
        typeof prompt.initial === "function"
          ? prompt.initial(undefined, {}, prompt)
          : prompt.initial,
      ).toBe("My Project");
    });

    it("should create a toggle prompt for boolean value", () => {
      const prompt = createPromptObject(["useTypeScript", true]);
      expect(
        typeof prompt.type === "function"
          ? prompt.type(undefined, {}, prompt)
          : prompt.type,
      ).toBe("toggle");
      expect(prompt.name).toBe("useTypeScript");
      expect(
        typeof prompt.initial === "function"
          ? prompt.initial(undefined, {}, prompt)
          : prompt.initial,
      ).toBe(true);
    });

    it("should handle select choices properly", () => {
      const config: ConfigObjectProps = {
        value: "react",
        choices: [
          { value: "react", title: "React" },
          { value: "vue", title: "Vue" },
        ],
      };
      const prompt = createPromptObject(["framework", config]);
      expect(
        typeof prompt.type === "function"
          ? prompt.type(undefined, {}, prompt)
          : prompt.type,
      ).toBe("select");

      const choicesFn = prompt.choices as prompts.PrevCaller<
        string,
        prompts.Choice[]
      >;
      const choices = choicesFn(undefined, {}, prompt);
      expect(choices).toHaveLength(2);
      expect(choices[0]?.title).toBe("React");
      expect(choices[1]?.title).toBe("Vue");

      // Index of initial choice ("react") is 0
      expect(
        typeof prompt.initial === "function"
          ? prompt.initial(undefined, {}, prompt)
          : prompt.initial,
      ).toBe(0);
    });

    it("should handle multiselect choices", () => {
      const config: ConfigObjectProps = {
        value: "lint, format",
        choicesType: "multiselect",
        choices: [{ value: "lint" }, { value: "format" }],
      };
      const prompt = createPromptObject(["tools", config]);
      expect(
        typeof prompt.type === "function"
          ? prompt.type(undefined, {}, prompt)
          : prompt.type,
      ).toBe("multiselect");
    });

    it("should validate regex correctly", () => {
      const config: ConfigObjectProps = {
        value: "test",
        validateRegex: {
          regex: LOWERCASE_REGEX,
          message: "Must be lowercase letters",
        },
      };
      const prompt = createPromptObject(["slug", config]);
      const validateFn = prompt.validate as prompts.PrevCaller<
        string,
        boolean | string
      >;
      expect(validateFn("valid", {}, prompt)).toBe(true);
      expect(validateFn("INVALID", {}, prompt)).toBe(
        "Must be lowercase letters",
      );
    });
  });
});
