import { describe, expect, it } from "vitest";
import { matchesReleaseEra, releaseEras } from "./release-era";

describe("original-release era filters", () => {
  it("covers the missing decade without overlaps at the boundaries", () => {
    const expected = [[2010, "classic"], [2011, "2011-2019"], [2019, "2011-2019"], [2020, "recent"]] as const;
    for (const [year, selected] of expected) {
      expect(releaseEras.filter(era => matchesReleaseEra({ year }, era.id)).map(era => era.id)).toEqual([selected]);
    }
  });
  it("filters by the original release rather than a later port", () => {
    const game = { year: 2023, originalReleaseYear: 2017 };
    expect(matchesReleaseEra(game, "2011-2019")).toBe(true);
    expect(matchesReleaseEra(game, "recent")).toBe(false);
    expect(matchesReleaseEra(game, "")).toBe(true);
  });
});
