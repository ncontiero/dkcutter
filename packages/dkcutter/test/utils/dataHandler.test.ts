import type { ConfigObjectProps } from "@/helpers/getConfig";
import { describe, expect, it } from "vitest";
import {
  getDefaultValue,
  getInitialValue,
  isArray,
  isMultiselect,
  isObject,
} from "@/utils/dataHandler";

describe("utils/dataHandler", () => {
  describe("isObject", () => {
    it("should return true for objects", () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ a: 1 })).toBe(true);
      expect(isObject([])).toBe(true); // Arrays are objects in JS
    });

    it("should return false for primitives and null", () => {
      expect(isObject(null)).toBe(false);
      expect(isObject(undefined)).toBe(false);
      expect(isObject("string")).toBe(false);
      expect(isObject(123)).toBe(false);
      expect(isObject(true)).toBe(false);
    });
  });

  describe("isArray", () => {
    it("should return true for arrays", () => {
      expect(isArray([])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
    });

    it("should return false for non-arrays", () => {
      expect(isArray({})).toBe(false);
      expect(isArray("string")).toBe(false);
      expect(isArray(123)).toBe(false);
      expect(isArray(null)).toBe(false);
    });
  });

  describe("isMultiselect", () => {
    it("should return true if choicesType is multiselect", () => {
      const config: ConfigObjectProps = {
        value: "test",
        choicesType: "multiselect",
      };
      expect(isMultiselect(config)).toBe(true);
    });

    it("should return false if choicesType is not multiselect or not present", () => {
      expect(isMultiselect({ value: "test" })).toBe(false);
      expect(isMultiselect({ value: "test", choicesType: "select" })).toBe(
        false,
      );
      expect(isMultiselect("string value")).toBe(false);
      expect(isMultiselect(["arr1", "arr2"])).toBe(false);
    });
  });

  describe("getInitialValue", () => {
    it("should return the first element for an array config", () => {
      expect(getInitialValue(["first", "second"])).toBe("first");
    });

    it("should return the value for an object config", () => {
      expect(getInitialValue({ value: "test value" })).toBe("test value");
      expect(getInitialValue({ value: ["test1", "test2"] })).toBe("test1");
    });

    it("should return the value itself if it is a primitive", () => {
      expect(getInitialValue("primitive")).toBe("primitive");
      expect(getInitialValue(true)).toBe(true);
    });
  });

  describe("getDefaultValue", () => {
    it("should return array of values if multiselect and string initial value", () => {
      const config: ConfigObjectProps = {
        value: "one, two, three",
        choicesType: "multiselect",
      };
      expect(getDefaultValue(config)).toEqual(["one", "two", "three"]);
    });

    it("should return initial value otherwise", () => {
      expect(getDefaultValue({ value: "test" })).toBe("test");
      expect(getDefaultValue(["arr1", "arr2"])).toBe("arr1");
      expect(getDefaultValue("primitive string")).toBe("primitive string");
    });
  });
});
