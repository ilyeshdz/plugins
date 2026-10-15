import { describe, expect, it } from "vitest";

import {
  extractRetryAfterMs,
  isRateLimit,
  RateLimitError,
} from "./rate-limit.js";

describe("extractRetryAfterMs", () => {
  it("reads retry_after from a Discord body and converts seconds to ms", () => {
    expect(extractRetryAfterMs({ body: { retry_after: 1.5 } })).toBe(1500);
  });

  it("reads a flat retry_after off the rejection itself", () => {
    expect(extractRetryAfterMs({ retry_after: 3 })).toBe(3000);
  });

  it("treats retry_after: 0 as a valid (immediate) wait", () => {
    expect(extractRetryAfterMs({ body: { retry_after: 0 } })).toBe(0);
  });

  it("ignores malformed values", () => {
    expect(
      extractRetryAfterMs({ body: { retry_after: "soon" } }),
    ).toBeUndefined();
    expect(extractRetryAfterMs({ body: { retry_after: -1 } })).toBeUndefined();
    expect(
      extractRetryAfterMs({ body: { retry_after: Infinity } }),
    ).toBeUndefined();
  });

  it("returns undefined for non-objects and absent fields", () => {
    expect(extractRetryAfterMs(undefined)).toBeUndefined();
    expect(extractRetryAfterMs(null)).toBeUndefined();
    expect(extractRetryAfterMs("429")).toBeUndefined();
    expect(extractRetryAfterMs({ body: {} })).toBeUndefined();
  });
});

describe("isRateLimit", () => {
  it("is true for status 429", () => {
    expect(isRateLimit({ status: 429 })).toBe(true);
  });

  it("is true for a RateLimitError", () => {
    expect(isRateLimit(new RateLimitError(1000))).toBe(true);
  });

  it("is false for other statuses and non-objects", () => {
    expect(isRateLimit({ status: 500 })).toBe(false);
    expect(isRateLimit(new Error("nope"))).toBe(false);
    expect(isRateLimit(undefined)).toBe(false);
  });
});

describe("RateLimitError", () => {
  it("carries retryAfterMs and is named for identification", () => {
    const err = new RateLimitError(2500);
    expect(err.retryAfterMs).toBe(2500);
    expect(err.name).toBe("RateLimitError");
    expect(err).toBeInstanceOf(Error);
  });
});
