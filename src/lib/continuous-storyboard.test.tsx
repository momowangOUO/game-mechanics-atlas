import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  MechanicStoryboard,
  MechanicExamples,
  MechanicIconFrame,
} from "../components/MechanicVisuals";
import { mechanics } from "./knowledge";
import { mechanicScenes } from "../data/mechanic-scenes";
import { mechanicExamples } from "../data/taxonomy-reference";

describe("continuous mechanic storyboard", () => {
  it("supports article heading depth and uses the native square icon asset", () => {
    const html = renderToStaticMarkup(
      <MechanicStoryboard id="jump" headingLevel={4} />,
    );
    expect(html).toMatch(/<h4\b[^>]*>跳跃图解<\/h4>/);
    const icon = renderToStaticMarkup(<MechanicIconFrame id="jump" />);
    expect(icon).toContain("/art/mechanics/jump.webp");
    expect(icon).toContain('width="256" height="256"');
  });

  it("shows all comic panels followed by all rule stages without reader controls", () => {
    const html = renderToStaticMarkup(<MechanicStoryboard id="jump" />);
    expect(html).toContain('id="mechanic-comic-jump"');
    expect(html.match(/data-panel="[012]"/g)).toHaveLength(3);
    expect(html.match(/<svg\b/g)).toHaveLength(3);
    expect(html.lastIndexOf('data-panel="2"')).toBeLessThan(
      html.indexOf("<svg"),
    );
    expect(html).not.toMatch(/<button|<nav|role="tab/);
    for (const caption of mechanicScenes.jump.frames) {
      expect(html).toContain(`<p>${caption}</p>`);
      expect(html.split(`<p>${caption}</p>`)).toHaveLength(2);
    }
  });

  it("keeps artwork, captions, and the anchor for every canonical mechanic", () => {
    for (const mechanic of mechanics) {
      const html = renderToStaticMarkup(
        <MechanicStoryboard id={mechanic.id} />,
      );
      expect(html, mechanic.id).toContain(`id="mechanic-comic-${mechanic.id}"`);
      expect(html.match(/<figure\b/g), mechanic.id).toHaveLength(6);
      expect(html.match(/<svg\b/g), mechanic.id).toHaveLength(3);
      expect(html, mechanic.id).not.toMatch(/NaN|undefined/);
    }
  });

  it("gives every simultaneously mounted rule stage its own SVG IDs", () => {
    const html = renderToStaticMarkup(
      <>
        {mechanics.slice(0, 17).map((mechanic) => (
          <MechanicStoryboard key={mechanic.id} id={mechanic.id} />
        ))}
      </>,
    );
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
    const markers = [...html.matchAll(/<marker id="([^"]+)"/g)].map(
      (match) => match[1],
    );
    expect(markers).toHaveLength(51);
    for (const match of html.matchAll(/url\(#([^)]*)\)/g)) {
      expect(markers).toContain(match[1]);
    }
  });

  it("does not silently omit a third curated game example", () => {
    const entry = Object.entries(mechanicExamples).find(
      ([, examples]) => examples.length === 3,
    );
    expect(entry).toBeDefined();
    const [id, examples] = entry!;
    const html = renderToStaticMarkup(<MechanicExamples id={id} />);
    expect(html.match(/<a\b/g)).toHaveLength(examples.length);
    expect(
      renderToStaticMarkup(<MechanicExamples id={id} limit={1} />).match(
        /<a\b/g,
      ),
    ).toHaveLength(1);
  });
});
