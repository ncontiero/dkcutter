import type { ConfigProps } from "@/helpers/getConfig";
import { describe, expect, it } from "vitest";
import { createPromptObjects } from "@/helpers/prompts";

describe("helpers/prompts", () => {
  describe("createPromptObjects", () => {
    it("should handle internal keys starting with _ and normal properties via extraContext", async () => {
      const config: ConfigProps = {
        _internalKey: "value",
        projectName: "My Project",
        useTypeScript: true,
      };

      const answers = await createPromptObjects(config, {
        projectName: "Override",
        useTypeScript: false,
      });

      expect(answers._internalKey).toBe("value");
      expect(answers.projectName).toBe("Override");
      expect(answers.useTypeScript).toBe(false);
    });

    it("should resolve nested object properties correctly via extraContext", async () => {
      const config: ConfigProps = {
        framework: {
          value: "react",
          choices: [
            { value: "react", title: "React" },
            { value: "vue", title: "Vue" },
          ],
        },
        tools: {
          value: "lint,format",
          choicesType: "multiselect",
          choices: [{ value: "lint" }, { value: "format" }],
        },
      };

      const answers = await createPromptObjects(config, {
        framework: "vue",
        tools: ["lint"],
      });

      expect(answers.framework).toBe("vue");
      expect(answers.tools).toEqual(["lint"]);
    });
  });
});
