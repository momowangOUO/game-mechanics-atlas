"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import { dimensions, mechanics, games, sources } from "@/lib/knowledge";
import type { Mechanic } from "@/lib/model";
import { searchCatalog, type CatalogResult } from "@/lib/catalog-index";
import { evidenceLabels } from "@/lib/evidence-labels";
import {
  taxonomyDimensions,
  taxonomyGroups,
  classificationLevels,
  mechanicExamples,
  type TaxonomyExample,
} from "@/data/taxonomy-reference";
import { DimensionIcon, GameThumbnail } from "./Art";
import { MechanicIconFrame, MechanicStoryboard } from "./MechanicVisuals";
import { TaxonomyGroupIcon } from "./TaxonomyGroupIcon";
import { StateBadge } from "./Primitives";
import styles from "./TaxonomyExplorer.module.css";

function Examples({ examples }: { examples: TaxonomyExample[] }) {
  if (!examples.length) return <p>尚未收录有来源支持的游戏范例。</p>;
  return (
    <div className={styles.examples}>
      {examples.map((example) => {
        const game = games.find((game) => game.id === example.gameId)!;
        return (
          <article className={styles.example} key={example.instanceId}>
            <Link
              className={styles.gamePicture}
              href={`/games/${game.id}?scope=${encodeURIComponent(example.scopeId)}`}
            >
              <GameThumbnail gameId={game.id} />
              <span>{game.name} ↗</span>
            </Link>
            <div className={styles.exampleBody}>
              <div className={styles.exampleMeta}>
                <StateBadge status={example.status} />
                <span>{example.scopeLabel}</span>
              </div>
              <p>{example.observation}</p>
              {example.condition && (
                <p className={styles.condition}>
                  <strong>适用条件：</strong>
                  {example.condition}
                </p>
              )}
              <p className={styles.evidence}>
                {example.evidenceKind && evidenceLabels[example.evidenceKind]}
                {example.scopeNote && <> · {example.scopeNote}</>}
              </p>
              <div className={styles.sourceLinks}>
                {example.sourceIds.map((id) => {
                  const source = sources.find((source) => source.id === id);
                  return (
                    source && (
                      <a
                        key={id}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {source.title} ↗
                      </a>
                    )
                  );
                })}
              </div>
              <Link
                className={styles.scopeLink}
                href={`/games/${game.id}?scope=${encodeURIComponent(example.scopeId)}`}
              >
                查看范围与来源 →
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
function TextList({ title, items }: { title: string; items: string[] }) {
  return items.length ? (
    <section className={styles.textSection}>
      <h4>{title}</h4>
      <ul>
        {items.map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ul>
    </section>
  ) : null;
}
export function MechanismArticle({
  mechanic,
  groupId,
}: {
  mechanic: Mechanic;
  groupId: string;
}) {
  return (
    <article
      className={styles.mechanism}
      id={`mechanic-${mechanic.id}`}
      data-mechanic-id={mechanic.id}
      aria-label={`${mechanic.name}机制档案`}
    >
      <header className={styles.mechanismHead}>
        <MechanicIconFrame id={mechanic.id} />
        <div>
          <span className={styles.kicker}>03 / 原子机制</span>
          <h3>{mechanic.name}</h3>
          <p className={styles.definition}>{mechanic.definition}</p>
          <a
            className={styles.inlineJump}
            href={`#mechanic-comic-${mechanic.id}`}
          >
            看图理解 ↓
          </a>
        </div>
      </header>
      <MechanicStoryboard id={mechanic.id} headingLevel={4} />
      <section className={styles.exampleSection}>
        <h4>游戏范例</h4>
        <Examples examples={mechanicExamples[mechanic.id] ?? []} />
      </section>
      <div className={styles.analysisGrid}>
        <TextList title="设计作用" items={mechanic.designValue} />
        <TextList title="设计风险" items={mechanic.risks} />
        <TextList title="纳入条件" items={mechanic.inclusionRules} />
        <TextList title="排除边界" items={mechanic.exclusionRules} />
        <TextList title="常见误解" items={mechanic.misconceptions} />
        <TextList title="适配说明" items={mechanic.adaptation} />
      </div>
      <section className={styles.implementation}>
        <h4>实现参考</h4>
        <p>
          <span className="chip">复杂度：{mechanic.complexity}</span>
        </p>
        <p>{mechanic.implementationNotes}</p>
      </section>
      {mechanic.relatedMechanics.length > 0 && (
        <div className={styles.related}>
          <span>相关机制</span>
          {mechanic.relatedMechanics.map((id) => {
            const related = mechanics.find((m) => m.id === id);
            return (
              related && (
                <Link
                  key={id}
                  href={`/taxonomy?mechanic=${id}#mechanic-${id}`}
                  scroll={false}
                >
                  {related.name} ↗
                </Link>
              )
            );
          })}
        </div>
      )}
      <footer className={styles.mechanismLinks}>
        <Link href={`/mechanics/${mechanic.id}`}>完整机制档案 ↗</Link>
        <Link href={`/graph?focus=${mechanic.id}`}>机制关系图 ↗</Link>
        <Link href={`/lab?add=${mechanic.id}`}>加入研究提示词 ＋</Link>
        <a href={`#group-${groupId}`}>回到本组 ↑</a>
      </footer>
    </article>
  );
}
function destination(item: CatalogResult) {
  if (item.kind === "dimension")
    return `/taxonomy?dimension=${item.id}#dimension-${item.id}`;
  if (item.kind === "group")
    return `/taxonomy?group=${item.id}#group-${item.id}`;
  if (item.kind === "mechanic")
    return `/taxonomy?mechanic=${item.id}#mechanic-${item.id}`;
  return item.href;
}
export default function TaxonomyExplorer() {
  const params = useSearchParams();
  return <Explorer key={params.toString()} params={params} />;
}
function Explorer({ params }: { params: Pick<URLSearchParams, "get"> }) {
  const linkedMechanic = mechanics.find((m) => m.id === params.get("mechanic"));
  const linkedGroup =
    taxonomyGroups.find((g) =>
      g.mechanicIds.includes(linkedMechanic?.id ?? ""),
    ) ?? taxonomyGroups.find((g) => g.id === params.get("group"));
  const dimension =
    dimensions.find(
      (d) =>
        d.id ===
        (linkedMechanic?.dimension ??
          linkedGroup?.dimensionId ??
          params.get("dimension")),
    ) ?? dimensions[0];
  const dimensionInfo = taxonomyDimensions.find(
    (d) => d.dimensionId === dimension.id,
  )!;
  const groups = taxonomyGroups.filter((g) => g.dimensionId === dimension.id);
  const [query, setQuery] = useState(params.get("q") ?? "");
  const results = searchCatalog(query).filter((item) => item.kind !== "recipe");
  useEffect(() => {
    const explicit = window.location.hash.slice(1);
    const fallback = linkedMechanic
      ? `mechanic-${linkedMechanic.id}`
      : linkedGroup
        ? `group-${linkedGroup.id}`
        : params.get("dimension")
          ? `dimension-${dimension.id}`
          : "";
    const target = explicit || fallback;
    if (!target) return;
    const frame = requestAnimationFrame(() =>
      document
        .getElementById(target)
        ?.scrollIntoView({ block: "start", behavior: "instant" }),
    );
    return () => cancelAnimationFrame(frame);
  }, [dimension.id, linkedGroup?.id, linkedMechanic?.id, params]);
  return (
    <div
      id="dimension-top"
      className={styles.atlas}
      style={{ "--dimension-accent": dimension.color } as CSSProperties}
    >
      <header className={styles.heading}>
        <span className={styles.kicker}>TAXONOMY ATLAS / 玩法分类图鉴</span>
        <h1>游戏机制分类</h1>
        <p>按维度查分类，对照图解和游戏范例理解每条规则。</p>
        <div className={styles.catalogStats}>
          <span>9 个维度</span>
          <span>50 个分组</span>
          <span>122 项机制</span>
          <a href="#classification-guide">分类怎么读 ↓</a>
        </div>
      </header>
      <div className={styles.toolbar}>
        <label className={styles.search}>
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            aria-label="搜索分类、机制与游戏"
            placeholder="搜索分类、机制、作用或游戏…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && (
            <button
              type="button"
              aria-label="清除分类搜索"
              onClick={() => setQuery("")}
            >
              ×
            </button>
          )}
        </label>
        <Link href="/mechanics">全部机制档案 ↗</Link>
      </div>
      {query.trim() && (
        <section className={styles.results} aria-label="分类搜索结果">
          <header>
            <h2>搜索结果</h2>
            <span>{results.length} 项匹配</span>
            <button onClick={() => setQuery("")}>清除搜索 ×</button>
          </header>
          <div className={styles.resultList}>
            {results.map((item) => (
              <Link
                key={`${item.kind}-${item.id}`}
                href={destination(item)}
                scroll={
                  item.kind === "dimension" ||
                  item.kind === "group" ||
                  item.kind === "mechanic"
                    ? false
                    : true
                }
              >
                <span>{item.path}</span>
                <h3>{item.name} ↗</h3>
                <p>{item.description}</p>
              </Link>
            ))}
          </div>
          {!results.length && (
            <p className={styles.noResults}>
              没有找到匹配的分类或机制。可试试“构筑”“自走棋”或游戏名称。
            </p>
          )}
        </section>
      )}
      <nav className={styles.dimensionNav} aria-label="分类维度">
        {dimensions.map((d) => (
          <Link
            key={d.id}
            href={`/taxonomy?dimension=${d.id}#dimension-${d.id}`}
            aria-current={dimension.id === d.id ? "page" : undefined}
            scroll={false}
          >
            <DimensionIcon id={d.id} />
            <span>
              {d.name}
              <small>
                {mechanics.filter((m) => m.dimension === d.id).length} 项机制
              </small>
            </span>
          </Link>
        ))}
      </nav>
      <div className={styles.layout}>
        <aside className={styles.contents}>
          <nav aria-label="本维度目录">
            <span className={styles.kicker}>本维度目录</span>
            <h2>{dimension.name}</h2>
            {groups.map((g) => (
              <a key={g.id} href={`#group-${g.id}`}>
                <TaxonomyGroupIcon id={g.id} size={40} />
                <span>
                  {g.name}
                  <small>{g.mechanicIds.length} 项机制</small>
                </span>
                <b aria-hidden="true">↓</b>
              </a>
            ))}
            <a className={styles.backToTop} href="#dimension-top">
              回到顶部 ↑
            </a>
          </nav>
        </aside>
        <div
          className={styles.dimensionBody}
          aria-label={`${dimension.name}机制`}
        >
          <header
            className={styles.dimensionHead}
            id={`dimension-${dimension.id}`}
          >
            <span className={styles.kicker}>01 / 分类维度</span>
            <h2>{dimension.name}</h2>
            <p className={styles.question}>{dimensionInfo.question}</p>
            <p>{dimensionInfo.explanation}</p>
            <div className={styles.dimensionFacts}>
              <p>
                <strong>设计用途</strong>
                {dimensionInfo.use}
              </p>
              <p>
                <strong>分类边界</strong>
                {dimensionInfo.boundary}
              </p>
            </div>
          </header>
          {groups.map((group) => (
            <section
              className={styles.group}
              id={`group-${group.id}`}
              data-taxonomy-group={group.id}
              key={group.id}
              aria-label={`机制分组：${group.name}`}
            >
              <header className={styles.groupHead}>
                <TaxonomyGroupIcon id={group.id} size={96} />
                <div>
                  <span className={styles.kicker}>
                    02 / 机制分组 · {group.mechanicIds.length} 项
                  </span>
                  <h2>{group.name}</h2>
                  <p>{group.function}</p>
                </div>
              </header>
              <p className={styles.groupIntro}>{group.explanation}</p>
              <nav
                className={styles.mechanismIndex}
                aria-label={`${group.name}机制目录`}
              >
                {group.mechanicIds.map((id) => (
                  <a key={id} href={`#mechanic-${id}`}>
                    {mechanics.find((m) => m.id === id)?.name}
                    <span aria-hidden="true">↓</span>
                  </a>
                ))}
              </nav>
              <p className={styles.groupBoundary}>
                <strong>分组边界：</strong>
                {group.boundary}
              </p>
              {group.mechanicIds.map((id) => (
                <MechanismArticle
                  key={id}
                  mechanic={mechanics.find((m) => m.id === id)!}
                  groupId={group.id}
                />
              ))}
            </section>
          ))}
        </div>
      </div>
      <section
        className={styles.guide}
        id="classification-guide"
        aria-label="分类层级说明"
      >
        <span className={styles.kicker}>READING GUIDE / 分类怎么读</span>
        <h2>分类与其他标签</h2>
        <div className={styles.guideGrid}>
          {classificationLevels.map((level) => (
            <article key={level.id}>
              <h3>{level.name}</h3>
              <p>{level.question}</p>
              <p>{level.explanation}</p>
              <p className={styles.guideExample}>{level.example}</p>
            </article>
          ))}
        </div>
        <div className={styles.guideLinks}>
          <Link href="/types">复合类型 →</Link>
          <Link href="/method">完整分类方法 ↗</Link>
        </div>
      </section>
    </div>
  );
}
