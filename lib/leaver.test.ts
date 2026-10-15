import { describe, expect, it } from "vitest";

import { formatGuildNames, MAX_CONFIRM_NAMES } from "./leaver.js";

describe("formatGuildNames", () => {
  it("joins a short list verbatim", () => {
    expect(formatGuildNames(["a", "b", "c"])).toBe("a, b, c");
  });

  it("returns an empty string for no names", () => {
    expect(formatGuildNames([])).toBe("");
  });

  it("passes through a list exactly at the max", () => {
    const names = Array.from({ length: 8 }, (_, i) => `s${i}`);
    expect(formatGuildNames(names)).toBe(names.join(", "));
  });

  it("truncates past the max and counts the remainder", () => {
    const names = Array.from({ length: 12 }, (_, i) => `s${i}`);
    expect(formatGuildNames(names)).toBe(
      "s0, s1, s2, s3, s4, s5, s6, s7 and 4 more",
    );
  });

  it("honours a custom max", () => {
    expect(formatGuildNames(["a", "b", "c", "d"], 2)).toBe("a, b and 2 more");
  });

  it("defaults to MAX_CONFIRM_NAMES", () => {
    const names = Array.from(
      { length: MAX_CONFIRM_NAMES + 1 },
      (_, i) => `s${i}`,
    );
    expect(formatGuildNames(names)).toContain(`and 1 more`);
  });
});
