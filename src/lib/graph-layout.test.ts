import { describe, expect, it } from "vitest";
import {
  dimensionGrid,
  neighborhoodGrid,
  listGameScopes,
} from "./graph-layout";

describe("expanded graph geometry", () => {
  it("keeps large dimension bands and node rectangles separate", () => {
    const dimensions = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];
    const ids = dimensions.flatMap((d, i) =>
      Array.from({ length: i === 0 ? 48 : 9 }, (_, n) => `${d}:${n}`),
    );
    const grid = dimensionGrid(ids, dimensions, (id) => id.split(":")[0]);
    expect(grid.size).toBe(ids.length);
    const points = [...grid.values()];
    for (let i = 0; i < points.length; i++)
      for (let j = i + 1; j < points.length; j++) {
        expect(
          Math.abs(points[i].x - points[j].x) >= 190 ||
            Math.abs(points[i].y - points[j].y) >= 100,
        ).toBe(true);
      }
  });
  it("does not crowd a large neighborhood onto a fixed ellipse", () => {
    const ids = Array.from({ length: 40 }, (_, i) => `m${i}`);
    const grid = neighborhoodGrid(ids, "m22");
    expect(grid.get("m22")).toEqual({ x: 0, y: 0 });
    expect(new Set([...grid.values()].map((p) => `${p.x},${p.y}`)).size).toBe(
      40,
    );
  });
  it("includes chapters, systems, roles and versions without another game", () => {
    const scopes = [
      "game",
      "mode",
      "chapter",
      "system",
      "character",
      "version",
    ].map((kind, i) => ({
      id: `s${i}`,
      gameId: "g",
      kind: kind as "game",
      label: kind,
    }));
    expect(
      listGameScopes(
        [...scopes, { id: "other", gameId: "x", kind: "mode", label: "other" }],
        "g",
        "s2",
      ).map((s) => s.id),
    ).toEqual(["s2", "s4", "s0", "s1", "s3", "s5"]);
  });
});
