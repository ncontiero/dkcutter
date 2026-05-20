import { describe, expect, it } from "vitest";
import {
  capitalize,
  formatKeyMessage,
  generateRandomString,
} from "@/utils/strings";

const ALPHANUMERIC_REGEX = /^[a-z0-9]+$/;

describe("utils/strings", () => {
  describe("capitalize", () => {
    it("should capitalize the first letter of a string", () => {
      expect(capitalize("hello")).toBe("Hello");
      expect(capitalize("WORLD")).toBe("WORLD");
      expect(capitalize("dkcutter")).toBe("Dkcutter");
      expect(capitalize("a")).toBe("A");
    });
  });

  describe("formatKeyMessage", () => {
    it("should format camelCase keys into a human readable question", () => {
      expect(formatKeyMessage("projectName")).toBe("Project name?");
      expect(formatKeyMessage("useTypeScript")).toBe("Use type script?");
      expect(formatKeyMessage("description")).toBe("Description?");
      expect(formatKeyMessage("myAwesomeKeyName")).toBe("My awesome key name?");
    });
  });

  describe("generateRandomString", () => {
    it("should generate a string of the requested length", () => {
      expect(generateRandomString(0)).toHaveLength(0);
      expect(generateRandomString(5)).toHaveLength(5);
      expect(generateRandomString(10)).toHaveLength(10);
      expect(generateRandomString(50)).toHaveLength(50);
    });

    it("should generate alphanumeric strings", () => {
      const str = generateRandomString(100);
      expect(str).toMatch(ALPHANUMERIC_REGEX);
    });

    it("should generate random strings", () => {
      const str1 = generateRandomString(20);
      const str2 = generateRandomString(20);
      expect(str1).not.toBe(str2);
    });
  });
});
