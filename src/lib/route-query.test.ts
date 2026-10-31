import { describe, expect, it } from "vitest";
import { normalizedQueryKey, singleQueryValue } from "./route-query";

describe("static route query compatibility", () => {
  it("preserves absent, empty and repeated parameter distinctions", () => {
    const query = new URLSearchParams("empty=&id=a&id=b&one=one");
    expect(singleQueryValue(query, "missing")).toBeUndefined();
    expect(singleQueryValue(query, "empty")).toBe("");
    expect(singleQueryValue(query, "id")).toBeUndefined();
    expect(singleQueryValue(query, "one")).toBe("one");
    expect(query.has("id")).toBe(true);
  });

  it("normalizes key order and encoding while retaining all repeated values", () => {
    expect(normalizedQueryKey(new URLSearchParams("q=a%20b&add=x&add=y"))).toBe(
      normalizedQueryKey(new URLSearchParams("add=x&add=y&q=a+b")),
    );
    expect(normalizedQueryKey(new URLSearchParams("add=x&add=y"))).not.toBe(
      normalizedQueryKey(new URLSearchParams("add=y&add=x")),
    );
  });
});
