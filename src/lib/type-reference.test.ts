import { describe, expect, it } from "vitest";
import { genres } from "./knowledge";
import { typeReferences } from "../data/type-reference";

describe("type reading guides", () => {
  it("covers every registered type once and links to a distinct real comparison", () => {
    expect(typeReferences.map((row) => row.id).sort()).toEqual(
      genres.map((row) => row.id).sort(),
    );
    for (const guide of typeReferences) {
      expect(genres.some((genre) => genre.id === guide.compareId)).toBe(true);
      expect(guide.compareId).not.toBe(guide.id);
      expect(guide.loop).toHaveLength(3);
      expect(new Set(guide.loop).size).toBe(3);
    }
  });
});
