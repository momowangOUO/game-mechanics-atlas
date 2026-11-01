"use client";
import Link from "next/link";
import { useState } from "react";
import { sources, genres, games } from "@/lib/knowledge";
import { getTypeReference } from "@/data/type-reference";
import { EmptyState } from "./Primitives";

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
function Pager({
  page,
  total,
  onPage,
}: {
  page: number;
  total: number;
  onPage: (page: number) => void;
}) {
  return (
    <nav className="pagination" aria-label="目录分页">
      <button disabled={page === 1} onClick={() => onPage(page - 1)}>
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
export function SourceCatalog() {
  const [query, setQuery] = useState(""),
    [type, setType] = useState(""),
    [page, setPage] = useState(1);
  const rows = sources.filter(
    (s) =>
      (!type || s.type === type) &&
      `${s.title} ${s.publisher} ${s.claimScope} ${s.url}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const total = Math.ceil(rows.length / 10),
    current = Math.min(page, Math.max(1, total));
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
              setPage(1);
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
              setPage(1);
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
        {rows.slice((current - 1) * 10, current * 10).map((s) => (
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
      <Pager page={current} total={total} onPage={setPage} />
    </section>
  );
}
export function TypeCatalog() {
  const [query, setQuery] = useState(""),
    [page, setPage] = useState(1);
  const rows = genres.filter((g) =>
    `${g.id} ${g.name} ${g.definition} ${getTypeReference(g.id)?.playerTask ?? ""}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  const total = Math.ceil(rows.length / 8),
    current = Math.min(page, Math.max(1, total));
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
              setPage(1);
            }}
            placeholder="类型名或定义关键词"
          />
        </label>
        <span>{rows.length} 个类型</span>
      </div>
      <div className="type-index-grid">
        {rows.slice((current - 1) * 8, current * 8).map((g) => (
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
      <Pager page={current} total={total} onPage={setPage} />
    </section>
  );
}
