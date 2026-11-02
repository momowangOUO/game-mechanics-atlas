import { describe, expect, it } from "vitest";
import { resolveDiscovery, streamDiscovery } from "@/data/stream-discovery";
import { games } from "@/lib/knowledge";

describe("直播与传播索引", () => {
  it("每条记录都有可追溯的来源、观察期和口径，标识不重复", () => {
    expect(streamDiscovery.length).toBeGreaterThanOrEqual(25);
    expect(new Set(streamDiscovery.map((row) => row.id)).size).toBe(streamDiscovery.length);
    for (const row of streamDiscovery) {
      expect(row.name && row.observation && row.source.period && row.source.metric).toBeTruthy();
      expect(new URL(row.source.url).protocol).toBe("https:");
    }
  });

  it("关联案例使用真实注册表，未建档和无效链接不会伪装成已收录", () => {
    const result = resolveDiscovery(streamDiscovery, games);
    expect(result.find(({ entry }) => entry.id === "fortnite")?.game?.id).toBe("fortnite");
    expect(result.find(({ entry }) => entry.id === "grow-a-garden")?.game).toBeUndefined();
    expect(result.filter(({ entry, game }) => entry.gameId && !game)).toEqual([]);
    const pending = resolveDiscovery([{ ...streamDiscovery[0], gameId: "missing-game" }], games);
    expect(pending[0].game).toBeUndefined();
  });

  it("宽泛分类和主播个例保留范围限制", () => {
    for (const id of ["counter-strike", "overwatch", "rust", "grow-a-garden"]) {
      expect(streamDiscovery.find((row) => row.id === id)?.scopeNote).toBeTruthy();
    }
    expect(streamDiscovery.find((row) => row.id === "arc")?.observation).toContain("首 30 天");
    expect(streamDiscovery.find((row) => row.id === "arc")?.source.metric).toContain("观看时长");
  });
});

// Exercise the server-rendered page without requiring a browser or JavaScript hydration.
describe("静态页面", () => {
  it("输出案例链接、待补提示、观察期和外部来源", async () => {
    const React = await import("react");
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { default: Page } = await import("@/app/games/discovery/page");
    const html = renderToStaticMarkup(React.createElement(Page));
    expect(html).toContain('href="/games/fortnite"');
    expect(html).toContain("Grow a Garden");
    expect(html).toContain("案例资料待补");
    expect(html).toContain("2026 年 1 月 1 日至 9 月 1 日");
    expect(html).toContain("https://hatchet.gg/blog/top-games-on-live-streaming-for-2025/");
  });
});
import { vi } from "vitest";
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  usePathname: () => "/games/discovery",
}));
