import type { ConfigProps } from "@/helpers/getConfig";
import { describe, expect, it } from "vitest";
import { ValidationError } from "@/helpers/errors";
import { getContext, renderContext } from "@/helpers/getContext";
import { renderer } from "@/utils/renderer";

const LOWERCASE_REGEX = /^[a-z]+$/;
const SLUG_REGEX = /^[a-z0-9-]+$/;

describe("helpers/getContext", () => {
  describe("renderContext", () => {
    it("should process strings using nunjucks renderer", () => {
      // Mock the renderer global context so we can test template replacement
      renderer.addGlobal("dkcutter", { projectName: "Test Project" });
      const context = {
        projectName: "Test Project",
        description: "A description for {{ dkcutter.projectName }}",
        isReady: true,
      };

      const result = renderContext(context);

      expect(result.description).toBe("A description for Test Project");
      expect(result.isReady).toBe(true); // Should not modify booleans
    });
  });

  describe("getContext (pure mode with skip=true)", () => {
    it("should separate internal and external variables", async () => {
      const config: ConfigProps = {
        _internalVar: "internal",
        externalVar: "external",
      };

      // By passing skip: true, we avoid terminal prompts and just test the pure logic
      // (createContext, handleContext, contextSchema)
      const context = await getContext({ config, skip: true });

      expect(context).toMatchObject({
        _internalVar: "internal",
        externalVar: "external",
      });
    });

    it("should validate and format multiselect choices", async () => {
      const config: ConfigProps = {
        tools: {
          value: "lint, format",
          choicesType: "multiselect",
          choices: [{ value: "lint" }, { value: "format" }, { value: "test" }],
        },
      };

      const context = await getContext({ config, skip: true });
      // The internal schema transformation should split the string into an array
      expect(context.tools).toEqual(["lint", "format"]);
    });

    it("should fallback to default if a choice is disabled dynamically", async () => {
      const config: ConfigProps = {
        useTypescript: true,
        framework: {
          value: "vue",
          choices: [
            { value: "react" },
            { value: "vue", disabled: "{{ dkcutter.useTypescript == false }}" },
          ],
        },
      };

      // If useTypescript is true, vue shouldn't be disabled
      const ctx1 = await getContext({
        config: JSON.parse(JSON.stringify(config)) as ConfigProps,
        skip: true,
        extraContext: { useTypescript: true },
      });
      expect(ctx1.framework).toBe("vue");

      // If useTypescript is false, vue should be disabled, falling back to the default config value
      const ctx2 = await getContext({
        config: JSON.parse(JSON.stringify(config)) as ConfigProps,
        skip: true,
        extraContext: { useTypescript: false, framework: "vue" },
      });
      // Should remain vue because value is the default in the config object
      expect(ctx2.framework).toBe("vue");
    });

    it("should throw error if validation fails (e.g., regex)", async () => {
      const config: ConfigProps = {
        slug: {
          value: "INVALID",
          validateRegex: {
            regex: LOWERCASE_REGEX,
            message: "Must be lowercase letters",
          },
        },
      };

      await expect(getContext({ config, skip: true })).rejects.toThrow();
    });

    it("should apply CLI options to override defaults", async () => {
      // Mock process.argv and env
      const originalArgv = process.argv;
      process.argv = ["node", "script", "--slug=my-slug"];
      process.env.DKCUTTER_IS_CLI = "true";

      const config: ConfigProps = {
        slug: "default-slug",
      };

      const context = await getContext({ config, skip: true });
      expect(context.slug).toBe("my-slug");

      process.argv = originalArgv;
      delete process.env.DKCUTTER_IS_CLI;
    });

    it("should throw a ValidationError for an invalid choice", async () => {
      const config: ConfigProps = {
        database: { value: "mysql", choices: [{ value: "postgres" }] },
      };

      await expect(getContext({ config, skip: true })).rejects.toBeInstanceOf(
        ValidationError,
      );
    });

    it("should not HTML-escape values derived from other variables", async () => {
      const config: ConfigProps = {
        projectName: "Bob's App & Co",
        title: "{{ projectName }} <beta>",
      };

      const context = await getContext({ config, skip: true });

      expect(context.title).toBe("Bob's App & Co <beta>");
    });

    it("should validate derived values after rendering them", async () => {
      const config: ConfigProps = {
        projectName: "Bob's App!",
        projectSlug: {
          value:
            "{{ projectName|lower|replace(r/[^a-z0-9]+/g, '-')|replace(r/^-+|-+$/g, '') }}",
          validateRegex: { regex: SLUG_REGEX },
        },
      };

      const context = await getContext({ config, skip: true });

      expect(context.projectSlug).toBe("bob-s-app");
    });

    it("should reject derived values that fail validation", async () => {
      const config: ConfigProps = {
        projectName: "Bob's App",
        projectSlug: {
          value: "{{ projectName|lower }}",
          validateRegex: { regex: SLUG_REGEX, message: "Invalid slug" },
        },
      };

      await expect(getContext({ config, skip: true })).rejects.toBeInstanceOf(
        ValidationError,
      );
    });
  });
});
