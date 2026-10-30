"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { dimensions, games, genres, mechanics } from "@/lib/knowledge";
import { Dialog } from "./Providers";
import { EmptyState, GameCard, PageHead, Reveal } from "./Primitives";

function Pagination({
  page,
  total,
  onPage,
}: {
  page: number;
  total: number;
  onPage: (page: number) => void;
}) {
  return (
    <nav className="pagination" aria-label="结果分页">
      <button disabled={page <= 1} onClick={() => onPage(page - 1)}>
        ← 上一页
      </button>
      <span aria-live="polite">
        {page} / {Math.max(1, total)}
      </span>
      <button disabled={page >= total} onClick={() => onPage(page + 1)}>
        下一页 →
      </button>
    </nav>
  );
}

export function MechanicCatalog({
  initialDimension = "",
  initialQuery = "",
  initialGenre = "",
  initialCore = "",
}: {
  initialDimension?: string;
  initialQuery?: string;
  initialGenre?: string;
  initialCore?: string;
}) {
  const [query, setQuery] = useState(initialQuery),
    [dimension, setDimension] = useState(initialDimension),
    [core, setCore] = useState(initialCore),
    [page, setPage] = useState(1),
    [drawer, setDrawer] = useState(false);
  const genre = genres.find((g) => g.id === initialGenre);
  const genreIds = genre
    ? new Set([
        ...genre.requiredMechanics,
        ...genre.commonMechanics,
        ...genre.optionalMechanics,
      ])
    : null;
  const coreTags = [
    ...new Set(mechanics.flatMap((m) => m.corePlayTags)),
  ].sort();
  const filtered = useMemo(
    () =>
      mechanics.filter(
        (m) =>
          (!dimension || m.dimension === dimension) &&
          (!core || m.corePlayTags.includes(core)) &&
          (!genreIds || genreIds.has(m.id)) &&
          `${m.name} ${m.id} ${m.definition}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
      ),
    [query, dimension, core, genreIds],
  );
  const total = Math.ceil(filtered.length / 8),
    safePage = Math.min(page, Math.max(1, total));
  const reset = () => {
    setQuery("");
    setDimension("");
    setCore("");
    setPage(1);
  };
  const filters = (suffix: string) => (
    <>
      <div className="filter-title">
        <h2>分类维度</h2>
        <button className="text-button" onClick={reset}>
          重置
        </button>
      </div>
      <div className="dimension-options">
        <button
          aria-pressed={!dimension}
          className={!dimension ? "selected" : ""}
          onClick={() => {
            setDimension("");
            setPage(1);
          }}
        >
          全部机制 <span>{mechanics.length}</span>
        </button>
        {dimensions.map((d) => (
          <button
            key={d.id}
            aria-pressed={dimension === d.id}
            className={dimension === d.id ? "selected" : ""}
            onClick={() => {
              setDimension(d.id);
              setPage(1);
            }}
          >
            <i style={{ background: d.color }} />
            <span>{d.name}</span>
            <small>
              {mechanics.filter((m) => m.dimension === d.id).length}
            </small>
          </button>
        ))}
      </div>
      <label className="field-label" htmlFor={`core-play-filter-${suffix}`}>
        适用核心玩法
      </label>
      <select
        id={`core-play-filter-${suffix}`}
        value={core}
        onChange={(event) => {
          setCore(event.target.value);
          setPage(1);
        }}
      >
        <option value="">全部核心玩法</option>
        {coreTags.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <p className="filter-note">
        适配标签是设计归纳，不改变机制的主分类。某个游戏没有记录的机制，保持未知。
      </p>
    </>
  );
  return (
    <>
      <div className="breadcrumb">
        <Link href="/">研究室</Link> / 机制档案
      </div>
      <PageHead
        eyebrow="MECHANICS ARCHIVE / 固定九维"
        title="给每条规则一个清楚的位置。"
        description="查定义、看边界、找反例。先分清机制是什么，再研究它在不同游戏中如何起作用。"
      >
        <span className="chip cyan">{mechanics.length} 条原子机制</span>
      </PageHead>
      {genre && (
        <div className="note">
          正在查看复合类型“{genre.name}”关联的原子机制。
          <Link href={`/types/${genre.id}`}>阅读类型边界 ↗</Link>　
          <Link href="/mechanics">清除类型限制 ×</Link>
        </div>
      )}
      <div className="catalog-layout">
        <aside className="catalog-sidebar">{filters("sidebar")}</aside>
        <section>
          <div className="catalog-toolbar">
            <label className="inline-search">
              <span aria-hidden="true">⌕</span>
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                aria-label="搜索机制"
                placeholder="搜索名称、英文 ID 或定义…"
              />
            </label>
            <button
              className="button mobile-only"
              onClick={() => setDrawer(true)}
            >
              筛选{dimension || core ? " ●" : ""}
            </button>
            <span className="result-count" aria-live="polite">
              {filtered.length} 条档案
            </span>
          </div>
          {dimensions.find((d) => d.id === dimension) && (
            <p className="dimension-description">
              {dimensions.find((d) => d.id === dimension)?.description}
            </p>
          )}
          {filtered.length ? (
            <>
              <motion.div layout className="mechanic-grid">
                {filtered
                  .slice((safePage - 1) * 8, safePage * 8)
                  .map((mechanic, i) => {
                    const d = dimensions.find(
                      (d) => d.id === mechanic.dimension,
                    );
                    return (
                      <Reveal key={mechanic.id} index={i}>
                        <Link
                          href={`/mechanics/${mechanic.id}`}
                          className="mechanic-card interactive-card"
                        >
                          <div className="card-top">
                            <span className="tiny" style={{ color: d?.color }}>
                              {d?.short} /{" "}
                              {String(mechanics.indexOf(mechanic) + 1).padStart(
                                3,
                                "0",
                              )}
                            </span>
                            <span aria-hidden="true">↗</span>
                          </div>
                          <h2>{mechanic.name}</h2>
                          <p>{mechanic.definition}</p>
                          <div className="card-bottom">
                            <span
                              className="chip"
                              style={{
                                color: d?.color,
                                borderColor: `${d?.color}60`,
                              }}
                            >
                              {d?.name}
                            </span>
                            <span className="tiny muted">
                              实现：{mechanic.complexity}
                            </span>
                          </div>
                        </Link>
                      </Reveal>
                    );
                  })}
              </motion.div>
              <Pagination
                page={safePage}
                total={total}
                onPage={(p) => {
                  setPage(p);
                  document
                    .querySelector(".catalog-toolbar")
                    ?.scrollIntoView({ block: "start", behavior: "instant" });
                }}
              />
            </>
          ) : (
            <EmptyState>
              <button className="button primary" onClick={reset}>
                清除筛选条件
              </button>
            </EmptyState>
          )}
        </section>
      </div>
      <Dialog
        open={drawer}
        onClose={() => setDrawer(false)}
        title="FILTERS / 筛选机制"
        className="filter-dialog"
      >
        <div className="window-body">
          {filters("drawer")}
          <button className="button primary" onClick={() => setDrawer(false)}>
            查看 {filtered.length} 条结果 →
          </button>
        </div>
      </Dialog>
    </>
  );
}

export function GameCatalog() {
  const [query, setQuery] = useState(""),
    [genre, setGenre] = useState(""),
    [core, setCore] = useState(""),
    [page, setPage] = useState(1);
  const tags = [...new Set(games.flatMap((g) => g.corePlayTags))].sort();
  const filtered = games.filter(
    (g) =>
      (!genre || g.genreIds.includes(genre)) &&
      (!core || g.corePlayTags.includes(core)) &&
      `${g.name} ${g.id} ${g.summary}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const total = Math.ceil(filtered.length / 6),
    safePage = Math.min(page, Math.max(1, total));
  const reset = () => {
    setQuery("");
    setGenre("");
    setCore("");
    setPage(1);
  };
  return (
    <>
      <div className="breadcrumb">
        <Link href="/">研究室</Link> / 游戏案例
      </div>
      <PageHead
        eyebrow="CASE STUDIES / 真实案例"
        title="把熟悉的游戏拆开看。"
        description="从核心循环、机制组合和资源结构理解设计。事实带来源，设计归纳单列，模式与版本差异保留在对应范围。"
      >
        <Link className="button" href="/compare">
          选择游戏对比 ⇄
        </Link>
      </PageHead>
      <div className="game-catalog-controls">
        <label className="inline-search">
          <span aria-hidden="true">⌕</span>
          <input
            aria-label="搜索游戏"
            placeholder="搜索游戏名称或玩法…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <label>
          <span className="sr-only">传统类型</span>
          <select
            aria-label="筛选传统类型"
            value={genre}
            onChange={(e) => {
              setGenre(e.target.value);
              setPage(1);
            }}
          >
            <option value="">全部传统类型</option>
            {genres.map((g) => (
              <option value={g.id} key={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">核心玩法</span>
          <select
            aria-label="筛选游戏核心玩法"
            value={core}
            onChange={(e) => {
              setCore(e.target.value);
              setPage(1);
            }}
          >
            <option value="">全部核心玩法</option>
            {tags.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="catalog-note">
        <span aria-live="polite">{filtered.length} 款案例</span>
        <span>传统类型用于检索；它不会反向补全机制事实。</span>
      </p>
      {filtered.length ? (
        <>
          <div className="case-grid catalog-games">
            {filtered.slice((safePage - 1) * 6, safePage * 6).map((g, i) => (
              <Reveal key={g.id} index={i}>
                <GameCard game={g} />
              </Reveal>
            ))}
          </div>
          <Pagination
            page={safePage}
            total={total}
            onPage={(p) => {
              setPage(p);
              document
                .querySelector(".game-catalog-controls")
                ?.scrollIntoView({ block: "start", behavior: "instant" });
            }}
          />
        </>
      ) : (
        <EmptyState title="暂时没有匹配的游戏">
          <button className="button primary" onClick={reset}>
            清除筛选条件
          </button>
        </EmptyState>
      )}
    </>
  );
}
