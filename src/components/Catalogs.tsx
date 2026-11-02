"use client";

import Link from "next/link";
import { DimensionIcon } from "./Art";
import {
  MechanicIcon,
  MechanicExamples,
  MechanicComicLink,
} from "./MechanicVisuals";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { dimensions, games, genres, mechanics } from "@/lib/knowledge";
import { Dialog } from "./Providers";
import { EmptyState, GameCard, PageHead, Reveal } from "./Primitives";
import { matchesCatalog } from "@/lib/catalog-search";
import { taxonomyGroups } from "@/data/taxonomy-reference";
import taxonomyStyles from "./TaxonomyExplorer.module.css";

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
          matchesCatalog(
            m,
            query,
            `${m.definition} ${dimensions.find((d) => d.id === m.dimension)?.name} ${taxonomyGroups.find((g) => g.mechanicIds.includes(m.id))?.name}`,
          ),
      ),
    [query, dimension, core, genreIds],
  );
  const reset = () => {
    setQuery("");
    setDimension("");
    setCore("");
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
            }}
          >
            <DimensionIcon id={d.id} />
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
        玩法标签方便筛选，机制仍按九个维度分类。游戏是否包含某项机制，要到案例中核对。
      </p>
    </>
  );
  return (
    <>
      <div className="breadcrumb">
        <Link href="/">研究室</Link> / 机制档案
      </div>
      <PageHead
        eyebrow="MECHANICS ARCHIVE / 机制索引"
        title="查机制，找设计参考。"
        description="查看规则定义、适用情况和容易混淆的用法，再对照具体游戏研究。"
      >
        <span className="chip cyan">{mechanics.length} 条原子机制</span>
      </PageHead>
      <Link
        className={taxonomyStyles.catalogDoor}
        href={dimension ? `/taxonomy?dimension=${dimension}` : "/taxonomy"}
      >
        <div>
          <strong>按玩法问题查分类</strong>
          <p>
            9 个维度 → {taxonomyGroups.length} 个分组 → {mechanics.length}{" "}
            条机制；逐层看用途、边界与典型游戏。
          </p>
        </div>
        <span>打开分类图鉴 →</span>
      </Link>
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
                {filtered.map((mechanic, i) => {
                  const d = dimensions.find((d) => d.id === mechanic.dimension);
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
                          <MechanicIcon id={mechanic.id} size={64} />
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
                            实现难度：{mechanic.complexity}
                          </span>
                        </div>
                      </Link>
                      <MechanicExamples id={mechanic.id} small />
                      <MechanicComicLink id={mechanic.id} />
                    </Reveal>
                  );
                })}
              </motion.div>
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

export { default as GameCatalog } from "./GameCatalogExplorer";
