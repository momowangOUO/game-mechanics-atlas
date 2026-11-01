import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { mechanics } from "./knowledge";
import { mechanicScenes } from "../data/mechanic-scenes";
import { mechanicArtwork } from "../components/diagrams/artwork";
describe("mechanic illustration coverage", () => {
  it("covers each canonical ID with a script and individual artwork", () => {
    const ids = mechanics.map((m) => m.id).sort();
    expect(Object.keys(mechanicScenes).sort()).toEqual(ids);
    expect(Object.keys(mechanicArtwork).sort()).toEqual(ids);
  });
  it("renders three meaningful states without missing geometry", () => {
    for (const m of mechanics) {
      const states = [0, 1, 2].map((s) =>
        renderToStaticMarkup(
          <svg viewBox="0 0 260 150">{mechanicArtwork[m.id](s, "marker")}</svg>,
        ),
      );
      expect(new Set(states).size, m.id).toBeGreaterThan(1);
      expect(
        states.every((s) => s.length > 140 && !/NaN|undefined/.test(s)),
        m.id,
      ).toBe(true);
      expect(
        mechanicScenes[m.id].frames.every((s) => s.length > 5),
        m.id,
      ).toBe(true);
    }
  });
  it("distinguishes different rule illustrations, including boundary cases", () => {
    const output = mechanics.map((m) =>
      renderToStaticMarkup(<svg>{mechanicArtwork[m.id](2, "marker")}</svg>),
    );
    expect(new Set(output).size).toBe(mechanics.length);
  });
});
