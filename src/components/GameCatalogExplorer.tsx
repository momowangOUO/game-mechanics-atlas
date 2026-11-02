"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { games, genres, getInstances, mechanics } from "@/lib/knowledge";
import {
  playStyles,
  platformLabels,
  legacyPlayAliases,
} from "@/data/play-styles";
import { matchesCatalog } from "@/lib/catalog-search";
import { getCoverageMatches } from "@/lib/catalog-coverage";
import { GameCard, PageHead, EmptyState } from "./Primitives";

function Catalog() {
  const params = useSearchParams();
  const signature = params.toString();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [genre, setGenre] = useState(params.get("genre") ?? "");
  const [play, setPlay] = useState(
    params.get("play") ??
      legacyPlayAliases[params.get("core") ?? ""]?.[0] ??
      "",
  );
  const [platform, setPlatform] = useState(params.get("platform") ?? "");
  const [era, setEra] = useState(params.get("era") ?? "");
  const [legacyCore, setLegacyCore] = useState(params.get("core") ?? "");
  useEffect(() => {
    setQuery(params.get("q") ?? "");
    setGenre(params.get("genre") ?? "");
    setPlay(
      params.get("play") ??
        legacyPlayAliases[params.get("core") ?? ""]?.[0] ??
        "",
    );
    setPlatform(params.get("platform") ?? "");
    setEra(params.get("era") ?? "");
    setLegacyCore(params.get("core") ?? "");
  }, [signature, params]);
  function update(key: string, value: string) {
    const url = new URL(window.location.href);
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
    if (key === "play") url.searchParams.delete("core");
    window.history.replaceState(null, "", url);
  }
  function reset() {
    const url = new URL(window.location.href);
    url.search = "";
    window.history.replaceState(null, "", url);
    setQuery("");
    setGenre("");
    setPlay("");
    setPlatform("");
    setEra("");
    setLegacyCore("");
  }
  const combination =
    genre && play
      ? new Map(
          getCoverageMatches(genre, play).map((match) => [
            match.game.id,
            match,
          ]),
        )
      : undefined;
  const filtered = games.filter((game) => {
    if (combination && !combination.has(game.id)) return false;
    if (genre && !game.genreIds.includes(genre)) return false;
    if (play && !game.playStyleIds?.includes(play)) return false;
    if (platform && !game.platforms?.includes(platform)) return false;
    const year = game.originalReleaseYear ?? game.year;
    if ((era === "classic" && year > 2010) || (era === "recent" && year < 2020))
      return false;
    if (legacyCore && !legacyPlayAliases[legacyCore]) {
      const positive = getInstances(game.id).filter(
        (row) => row.status === "present" || row.status === "conditional",
      );
      if (
        legacyCore === "合作" &&
        !positive.some((row) => row.mechanicId === "cooperative-play")
      )
        return false;
      if (
        legacyCore === "竞技" &&
        !positive.some((row) => row.mechanicId === "pvp-opposition")
      )
        return false;
      if (
        legacyCore === "多人" &&
        !positive.some((row) =>
          [
            "cooperative-play",
            "pvp-opposition",
            "synchronous-session",
          ].includes(row.mechanicId),
        )
      )
        return false;
      if (
        legacyCore === "资源" &&
        !positive.some(
          (row) =>
            mechanics.find((mechanic) => mechanic.id === row.mechanicId)
              ?.dimension === "economy",
        )
      )
        return false;
      if (
        legacyCore === "武器" &&
        !positive.some((row) =>
          ["aimed-launch", "melee-attack", "equipment-upgrade"].includes(
            row.mechanicId,
          ),
        )
      )
        return false;
      if (
        legacyCore === "棋盘" &&
        !/棋盘|棋格|棋子|board/i.test(
          [
            game.summary,
            ...game.resourceNotes,
            ...positive.map((row) => row.rationale),
          ].join(" "),
        )
      )
        return false;
    }
    return matchesCatalog(
      game,
      query,
      `${game.summary} ${game.analysis} ${game.corePlayTags.join(" ")} ${genres
        .filter((type) => game.genreIds.includes(type.id))
        .map((type) => type.name)
        .join(" ")}`,
    );
  });
  return (
    <>
      <div className="breadcrumb">
        <Link href="/">研究室</Link> / 游戏案例
      </div>
      <PageHead
        eyebrow="CASE STUDIES / 游戏范例"
        title="游戏案例"
        description="按类型、核心玩法、发行平台和原作年代查找游戏，查看同一范围下的规则与设计。"
      >
        <Link className="button primary" href="/games/coverage">
          类型 × 核心玩法 →
        </Link>
        <Link className="button" href="/compare">
          选择游戏对比 ⇄
        </Link>
      </PageHead>
      <div className="game-catalog-controls">
        <label className="inline-search">
          <span aria-hidden="true">⌕</span>
          <input
            aria-label="搜索游戏"
            placeholder="搜索名称、规则或玩法…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              update("q", event.target.value);
            }}
          />
        </label>
        <label>
          <span className="sr-only">传统类型</span>
          <select
            aria-label="筛选传统类型"
            value={genre}
            onChange={(event) => {
              setGenre(event.target.value);
              update("genre", event.target.value);
            }}
          >
            <option value="">全部传统类型</option>
            {genres.map((type) => (
              <option key={type.id} value={type.id}>
                {type.parentGenreIds?.length ? "↳ " : ""}
                {type.name}（
                {games.filter((game) => game.genreIds.includes(type.id)).length}
                ）
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">核心玩法</span>
          <select
            aria-label="筛选游戏核心玩法"
            value={play}
            onChange={(event) => {
              setPlay(event.target.value);
              setLegacyCore("");
              update("play", event.target.value);
            }}
          >
            <option value="">全部核心玩法</option>
            {playStyles.map((style) => (
              <option key={style.id} value={style.id}>
                {style.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">发行平台</span>
          <select
            aria-label="筛选发行平台"
            value={platform}
            onChange={(event) => {
              setPlatform(event.target.value);
              update("platform", event.target.value);
            }}
          >
            <option value="">全部发行平台</option>
            {Object.entries(platformLabels).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">原作年代</span>
          <select
            aria-label="筛选原作年代"
            value={era}
            onChange={(event) => {
              setEra(event.target.value);
              update("era", event.target.value);
            }}
          >
            <option value="">全部年代</option>
            <option value="classic">2010 年及以前</option>
            <option value="recent">2020 年及以后</option>
          </select>
        </label>
      </div>
      <p className="catalog-note">
        <span aria-live="polite">{filtered.length} 款案例</span>
        <Link href="/play-styles">核心玩法方向说明 →</Link>
        <button className="text-button" onClick={reset}>
          清除筛选
        </button>
      </p>
      {legacyCore && (
        <p className="scope-box">
          旧筛选“{legacyCore}
          ”已按对应玩法或机制解析。选择新的核心玩法或清除筛选可重新浏览。
        </p>
      )}
      {filtered.length ? (
        <div className="case-grid catalog-games">
          {filtered.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              scopeId={combination?.get(game.id)?.scopeId}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="暂时没有匹配的游戏"
          description="可以调整类型、平台或年代，或查看组合覆盖记录。"
        >
          <button className="button primary" onClick={reset}>
            清除筛选条件
          </button>
          <Link href={`/games/coverage${genre ? `?genre=${genre}` : ""}`}>
            查看类型与玩法覆盖 →
          </Link>
        </EmptyState>
      )}
    </>
  );
}
export default function GameCatalogExplorer() {
  return (
    <Suspense fallback={<p>正在展开游戏目录…</p>}>
      <Catalog />
    </Suspense>
  );
}
