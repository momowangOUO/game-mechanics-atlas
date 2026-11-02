"use client";
import Link from "next/link";
import { useState } from "react";
import { sources, genres, games } from "@/lib/knowledge";
import { getTypeReference } from "@/data/type-reference";
import { EmptyState } from "./Primitives";
import { searchCatalog } from "@/lib/catalog-index";
import { matchesCatalog } from "@/lib/catalog-search";

const sourceLabels: Record<string, string> = {
  manual: "规则手册",
  developer: "开发者文章",
  community: "社区资料",
  official_store: "官方商店",
  official_site: "官方网站",
  official_manual: "官方手册",
  developer_post: "开发者文章",
  community_reference: "社区资料",
  community_wiki: "社区百科",
  editorial: "编辑分析",
};
export function SourceCatalog() {
  const [query, setQuery] = useState(""),
    [type, setType] = useState("");
  const rows = sources.filter(
    (s) =>
      (!type || s.type === type) &&
      `${s.title} ${s.publisher} ${s.claimScope} ${s.url}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  return (
    <section aria-label="来源检索">
      <div className="catalog-toolbar">
        <label>
          搜索来源
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            placeholder="标题、出版方或规则关键词"
          />
        </label>
        <label>
          来源类别
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
            }}
          >
            <option value="">全部来源</option>
            {[...new Set(sources.map((s) => s.type))].map((t) => (
              <option key={t} value={t}>
                {sourceLabels[t] ?? t}
              </option>
            ))}
          </select>
        </label>
        <span>{rows.length} 条来源</span>
      </div>
      <div className="source-catalog">
        {rows.map((s) => (
          <article key={s.id} id={s.id}>
            <span className="eyebrow">{sourceLabels[s.type] ?? s.type}</span>
            <h2>{s.title}</h2>
            <p>
              {s.publisher} · 核验 {s.checkedAt}
            </p>
            <p>{s.claimScope}</p>
            <a href={s.url} target="_blank" rel="noreferrer">
              阅读原始来源 ↗
            </a>
          </article>
        ))}
      </div>
      {!rows.length && (
        <EmptyState
          title="没有匹配的来源"
          description="换个关键词，或将来源类别改为“全部来源”。"
        />
      )}
    </section>
  );
}
export function TypeCatalog() {
  const [query, setQuery] = useState("");
  const matched = new Set(
    searchCatalog(query)
      .filter((item) => item.kind === "genre")
      .map((item) => item.id),
  );
  const rows = genres.filter(
    (g) =>
      matched.has(g.id) ||
      matchesCatalog(
        g,
        query,
        `${g.definition} ${getTypeReference(g.id)?.playerTask ?? ""}`,
      ),
  );
  return (
    <section aria-label="类型检索">
      <div className="catalog-toolbar">
        <label>
          搜索复合类型
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            placeholder="类型名或定义关键词"
          />
        </label>
        <span>{rows.length} 个类型</span>
      </div>
      <div className="type-index-grid">
        {rows.map((g) => (
          <Link
            className="mechanic-card interactive-card"
            key={g.id}
            href={`/types/${g.id}`}
          >
            <span className="eyebrow">TYPE / 复合类型</span>
            <h2>{g.name}</h2>
            <p>{g.definition}</p>
            <p style={{ marginTop: 12, color: "#dfbd77" }}>
              玩家主要在做：{getTypeReference(g.id)?.playerTask}
            </p>
            <p style={{ marginTop: 8 }}>
              游戏参照：
              {games
                .filter((game) => game.genreIds.includes(g.id))
                .slice(0, 3)
                .map((game) => game.name)
                .join(" · ") || "本库暂未收录对应案例"}
            </p>
            <div className="card-bottom">
              <span className="chip">复合类型 / 编辑整理</span>
              <span>→</span>
            </div>
          </Link>
        ))}
      </div>
      {!rows.length && (
        <EmptyState
          title="没有匹配的类型"
          description="试试中文名、英文名，或缩短关键词。"
        />
      )}
    </section>
  );
}
