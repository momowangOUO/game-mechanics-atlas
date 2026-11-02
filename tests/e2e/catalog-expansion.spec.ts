import { expect, test } from "@playwright/test";
import { playStyles } from "../../src/data/play-styles";
import { appHref, gotoApp } from "./navigation";
await import("../../scripts/register-typescript.mjs");
const { games, sources: registeredSources } = await import(
  "../../src/lib/knowledge.ts"
);
const { getCoverageMatches } = await import(
  "../../src/lib/catalog-coverage.ts"
);

async function noPageOverflow(page: import("@playwright/test").Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBeLessThanOrEqual(1);
  const heading = page.locator("h1").first();
  await expect(heading).toBeVisible();
  expect(
    await heading.evaluate((el) => el.scrollWidth - el.clientWidth),
  ).toBeLessThanOrEqual(1);
}

for (const width of [320, 390, 1440]) {
  test(`catalog filters, reload, history and full list at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await gotoApp(page, "/games");
    const cards = page.locator(".catalog-games .case-card");
    await expect(cards).toHaveCount(games.length);
    await expect(page.getByRole("navigation", { name: /分页/ })).toHaveCount(0);
    await noPageOverflow(page);

    await page.getByLabel("筛选传统类型").selectOption("match-three");
    await page.getByLabel("筛选游戏核心玩法").selectOption("matching-clearing");
    await page.getByLabel("筛选发行平台").selectOption("ios");
    await page.getByLabel("筛选原作年代").selectOption("recent");
    const expected = games.filter(
      (g) =>
        g.genreIds.includes("match-three") &&
        g.playStyleIds?.includes("matching-clearing") &&
        g.platforms?.includes("ios") &&
        (g.originalReleaseYear ?? g.year) >= 2020,
    );
    expect(expected.length).toBeGreaterThan(0);
    await expect(cards).toHaveCount(expected.length);
    await expect
      .poll(() => new URL(page.url()).searchParams.get("genre"))
      .toBe("match-three");
    expect(new URL(page.url()).searchParams.get("play")).toBe(
      "matching-clearing",
    );
    expect(new URL(page.url()).searchParams.get("platform")).toBe("ios");
    expect(new URL(page.url()).searchParams.get("era")).toBe("recent");

    await page.reload();
    await expect(page.getByLabel("筛选传统类型")).toHaveValue("match-three");
    await expect(page.getByLabel("筛选游戏核心玩法")).toHaveValue(
      "matching-clearing",
    );
    await expect(cards).toHaveCount(expected.length);
    await cards.first().click();
    await expect(page).toHaveURL(/\/games\/[^/?]+\/?\?scope=/);
    await page.goBack();
    await expect(page.getByLabel("筛选发行平台")).toHaveValue("ios");
    await expect(page.getByLabel("筛选原作年代")).toHaveValue("recent");
    await expect(cards).toHaveCount(expected.length);
    await noPageOverflow(page);
  });

  test(`coverage selection, full results and filtered empty state at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await gotoApp(page, "/games/coverage?genre=match-three");
    if (width <= 700) {
      await page
        .getByRole("region", { name: "三消的玩法方向" })
        .getByRole("button", { name: /消除与拼接/ })
        .click();
    } else {
      await page
        .getByRole("region", { name: "类型与玩法覆盖矩阵" })
        .getByRole("button", { name: /三消 × 消除与拼接/ })
        .click();
    }
    const results = page.locator("#coverage-results");
    await expect(
      results.getByRole("heading", { name: /三消 × 消除与拼接/ }),
    ).toBeVisible();
    const matching = getCoverageMatches("match-three", "matching-clearing");
    expect(matching.length).toBeGreaterThan(0);
    await expect(results.locator(".case-card")).toHaveCount(matching.length);
    if (width <= 700) {
      const [first, second] = await Promise.all([
        results.locator(".case-card").nth(0).boundingBox(),
        results.locator(".case-card").nth(1).boundingBox(),
      ]);
      expect(first!.width).toBeGreaterThan(width * 0.65);
      expect(second!.y).toBeGreaterThanOrEqual(first!.y + first!.height);
    }
    for (const id of ["candy-crush-saga", "puzzle-and-dragons"]) {
      const match = matching.find((row) => row.game.id === id)!;
      await expect(
        results.locator(
          `a.case-card[href="${appHref(`/games/${id}`)}?scope=${encodeURIComponent(match.scopeId)}"]`,
        ),
      ).toHaveCount(1);
    }
    await expect(results.getByRole("navigation", { name: /分页/ })).toHaveCount(
      0,
    );
    await noPageOverflow(page);

    // This combination has examples overall but cannot match the verified
    // arcade + classic slice. Empty filters are not a research or market claim.
    await page.goto(
      appHref("/games/coverage?genre=auto-battler&play=buildcrafting"),
    );
    expect(
      getCoverageMatches("auto-battler", "buildcrafting").length,
    ).toBeGreaterThan(0);
    expect(
      getCoverageMatches("auto-battler", "buildcrafting", {
        platform: "arcade",
        era: "classic",
      }),
    ).toHaveLength(0);
    await page.getByLabel("发行平台").selectOption("arcade");
    await page.getByLabel("原作年代").selectOption("classic");
    await expect(results).toContainText("筛选后没有案例");
    await expect(results).not.toContainText("蓝海");
    await expect(results.locator(".case-card")).toHaveCount(0);
  });
}

test("play-direction directory and detail use the registered directions and show all examples", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoApp(page, "/play-styles");
  await expect(page.locator(".type-index-grid > a")).toHaveCount(
    playStyles.length,
  );
  await page.getByRole("link", { name: /消除与拼接/ }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "消除与拼接" }),
  ).toBeVisible();
  const expected = games.filter((g) =>
    g.playStyleIds?.includes("matching-clearing"),
  );
  await expect(page.locator(".case-grid .case-card")).toHaveCount(
    expected.length,
  );
  const [first, second] = await Promise.all([
    page.locator(".case-grid .case-card").nth(0).boundingBox(),
    page.locator(".case-grid .case-card").nth(1).boundingBox(),
  ]);
  expect(first!.width).toBeGreaterThan(300);
  expect(second!.y).toBeGreaterThanOrEqual(first!.y + first!.height);
  await expect(page.getByRole("heading", { name: "相关机制" })).toBeVisible();
  await noPageOverflow(page);
});

test("representative expanded games retain readable sources and loaded official artwork", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const id of [
    "clash-royale",
    "pokemon-tcg-pocket",
    "mechabellum",
    "it-takes-two",
  ]) {
    const game = games.find((row) => row.id === id);
    expect(game, `${id} must exist in the registered catalog`).toBeTruthy();
    await gotoApp(page, `/games/${id}`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      game!.name,
    );
    await expect(
      page.getByRole("heading", { name: "资料来源与适用范围" }),
    ).toBeVisible();
    const sources = page.locator(".source-list a.source-link");
    expect(await sources.count(), id).toBeGreaterThan(0);
    await expect(sources.first()).toHaveAttribute("href", /^https?:\/\//);
    const expectedUrls = registeredSources
      .filter((row) => game!.sourceIds.includes(row.id))
      .map((row) => row.url)
      .sort();
    expect(
      (
        await sources.evaluateAll((rows) =>
          rows.map((row) => row.getAttribute("href") ?? ""),
        )
      ).sort(),
    ).toEqual(expectedUrls);
    await expect(
      page.getByRole("link", { name: "查看图源 ↗" }),
    ).toHaveAttribute("href", /^https?:\/\//);
    await expect(page.locator(".game-feature-cover")).toHaveAttribute(
      "aria-label",
      /官方代表图|游戏资料图/,
    );
    const image = page.locator(".game-feature-cover img");
    await expect(image).toBeVisible();
    await expect
      .poll(() =>
        image.evaluate(
          (el: HTMLImageElement) => el.complete && el.naturalWidth > 0,
        ),
      )
      .toBe(true);
    await noPageOverflow(page);
  }
});
