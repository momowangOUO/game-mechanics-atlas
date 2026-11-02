import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { GameLoopDiagram } from "../components/GameLoopDiagram";
import { loopConnections, loopSymbol } from "./game-loop";

describe("core loop diagram", () => {
  it("preserves step wording and order, including a visible return explanation", () => {
    const steps = [
      "观察盲注条件",
      "出牌弃牌形成牌型",
      "购买和组合强化",
      "达到要求进入下一轮",
    ];
    const html = renderToStaticMarkup(<GameLoopDiagram steps={steps} />);
    expect(html).toContain('aria-label="核心循环"');
    expect(html).toContain("返回第 01 步");
    let previous = -1;
    for (const step of steps) {
      expect(html.indexOf(step)).toBeGreaterThan(previous);
      previous = html.indexOf(step);
    }
  });

  it("connects every step and closes the desktop circuit without crossing cards", () => {
    const rects = [
      { x: 40, y: 20, width: 240, height: 160 },
      { x: 340, y: 20, width: 240, height: 160 },
      { x: 340, y: 260, width: 240, height: 160 },
      { x: 40, y: 260, width: 240, height: 160 },
    ];
    const edges = loopConnections(rects, "circuit");
    expect(edges.map(({ from, to }) => [from, to])).toEqual([
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
    ]);
    expect(edges.filter((edge) => edge.closing)).toHaveLength(1);
    expect(edges[1].path).toContain("604");
    expect(edges[3].path).toContain("16");
    expect(edges.every((edge) => !/NaN|undefined/.test(edge.path))).toBe(true);
  });

  it("keeps the mobile return connection outside the vertical reading sequence", () => {
    const rects = [0, 1, 2, 3].map((i) => ({
      x: 44,
      y: i * 140 + 12,
      width: 230,
      height: 100,
    }));
    const edges = loopConnections(rects, "sequence");
    expect(edges[0].path).toBe("M 159 112 L 159 152");
    expect(edges[3]).toMatchObject({ from: 3, to: 0, closing: true });
    expect(edges[3].path).toBe("M 44 482 L 20 482 L 20 62 L 44 62");
  });

  it("handles empty and one-step loops without invalid geometry", () => {
    expect(loopConnections([], "circuit")).toEqual([]);
    expect(
      loopConnections(
        [{ x: 44, y: 12, width: 230, height: 100 }],
        "sequence",
      )[0],
    ).toMatchObject({ from: 0, to: 0, closing: true });
    expect(renderToStaticMarkup(<GameLoopDiagram steps={[]} />)).toContain(
      "核心循环尚未整理",
    );
  });

  it("uses action symbols without assigning unverified mechanism IDs", () => {
    expect(loopSymbol("观察战场与手牌")).toBe("observe");
    expect(loopSymbol("购买和组合强化")).toBe("purchase");
    expect(loopSymbol("战斗并选择祝福")).toBe("combat");
    expect(loopSymbol("达到要求进入下一轮")).toBe("repeat");
    expect(loopSymbol("进入某个阶段")).toBe("action");
    expect(loopSymbol("尚待归纳的过程")).toBe("action");
    const html = renderToStaticMarkup(
      <GameLoopDiagram steps={["尚待归纳的过程"]} />,
    );
    expect(html).not.toContain("data-mechanic-id");
  });
});
