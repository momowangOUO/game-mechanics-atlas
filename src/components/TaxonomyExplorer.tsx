"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useSyncExternalStore, type CSSProperties } from "react";
import { dimensions, mechanics, games, scopes } from "@/lib/knowledge";
import { matchesCatalog } from "@/lib/catalog-search";
import { evidenceLabels } from "@/lib/evidence-labels";
import {
  taxonomyDimensions,
  taxonomyGroups,
  classificationLevels,
  mechanicExamples,
  type TaxonomyExample,
} from "@/data/taxonomy-reference";
import { DimensionIcon, MaidPortrait, GameThumbnail } from "./Art";
import {
  MechanicIcon,
  MechanicExamples,
  MechanicStoryboard,
} from "./MechanicVisuals";
import styles from "./TaxonomyExplorer.module.css";
import { Dialog } from "./Providers";

type Stage = 0 | 1 | 2 | 3;
type Reading = "comic" | "purpose" | "examples" | "boundary";

function subscribeViewport(callback: () => void) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}
function viewportPageSize() {
  return window.innerWidth > 700 ? 3 : window.innerHeight <= 740 ? 1 : 2;
}

function Pager({
  page,
  count,
  size,
  onChange,
  label,
}: {
  page: number;
  count: number;
  size: number;
  onChange: (page: number) => void;
  label: string;
}) {
  const pages = Math.max(1, Math.ceil(count / size));
  return (
    <nav className={styles.pager} aria-label={label}>
      <button
        disabled={!page}
        onClick={() => onChange(page - 1)}
        aria-label={`${label}上一页`}
      >
        ←
      </button>
      <span aria-live="polite">
        {page + 1} / {pages}
      </span>
      <button
        disabled={page >= pages - 1}
        onClick={() => onChange(page + 1)}
        aria-label={`${label}下一页`}
      >
        →
      </button>
    </nav>
  );
}

function Example({
  example,
  conditionOnly = false,
}: {
  example: TaxonomyExample;
  conditionOnly?: boolean;
}) {
  const game = games.find((item) => item.id === example.gameId);
  const scope = scopes.find((item) => item.id === example.scopeId);
  return (
    <article className={styles.example}>
      {game && !conditionOnly && <GameThumbnail gameId={game.id} />}
      <div>
        <Link href={`/games/${example.gameId}?scope=${example.scopeId}`}>
          {game?.name} ↗
        </Link>
        <span>{example.status === "conditional" ? "条件成立" : "已记录"}</span>
      </div>
      <small>
        {scope?.label}
        {example.evidenceKind && <> · {evidenceLabels[example.evidenceKind]}</>}
      </small>
      {!conditionOnly && <p>{example.observation}</p>}
      {conditionOnly && example.condition && (
        <p className={styles.condition}>成立条件：{example.condition}</p>
      )}
      {!conditionOnly && example.condition && (
        <p className={styles.conditionHint}>条件实例 · 下一页查看成立条件。</p>
      )}
      <Link
        className={styles.sourceLink}
        href={`/games/${example.gameId}?scope=${example.scopeId}`}
      >
        查看范围与来源（{example.sourceIds.length} 项）→
      </Link>
    </article>
  );
}

export default function TaxonomyExplorer() {
  const params = useSearchParams();
  return <Explorer key={params.toString()} params={params} />;
}

function Explorer({
  params,
}: {
  params: Pick<URLSearchParams, "get" | "has">;
}) {
  const pageSize = useSyncExternalStore(
    subscribeViewport,
    viewportPageSize,
    () => 3,
  );
  const dimensionPageSize = pageSize === 1 ? 2 : 3;
  const resultPageSize = pageSize === 1 ? 2 : 4;
  const linkedMechanic = mechanics.find(
    (item) => item.id === params.get("mechanic"),
  );
  const linkedGroup =
    taxonomyGroups.find((item) =>
      item.mechanicIds.includes(linkedMechanic?.id ?? ""),
    ) ?? taxonomyGroups.find((item) => item.id === params.get("group"));
  const initialDimension =
    dimensions.find(
      (item) =>
        item.id === (linkedGroup?.dimensionId ?? params.get("dimension")),
    ) ?? dimensions[0];
  const [dimensionId, setDimensionId] = useState(initialDimension.id);
  const [groupId, setGroupId] = useState(
    linkedGroup?.id ??
      taxonomyGroups.find((item) => item.dimensionId === initialDimension.id)!
        .id,
  );
  const [mechanicId, setMechanicId] = useState(
    linkedMechanic?.id ??
      linkedGroup?.mechanicIds[0] ??
      taxonomyGroups.find((item) => item.dimensionId === initialDimension.id)!
        .mechanicIds[0],
  );
  const [stage, setStage] = useState<Stage>(
    linkedMechanic ? 3 : linkedGroup ? 2 : params.has("dimension") ? 1 : 0,
  );
  const [reading, setReading] = useState<Reading>("comic");
  const [readingPage, setReadingPage] = useState(0);
  const [comicOpen, setComicOpen] = useState(false);
  const [expandedPanel, setExpandedPanel] = useState(0);
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [dimensionPage, setDimensionPage] = useState(
    dimensions.findIndex((item) => item.id === initialDimension.id),
  );
  const [groupPage, setGroupPage] = useState(
    Math.max(
      0,
      taxonomyGroups
        .filter((item) => item.dimensionId === initialDimension.id)
        .findIndex((item) => item.id === linkedGroup?.id),
    ),
  );
  const [mechanicPage, setMechanicPage] = useState(
    Math.max(
      0,
      linkedGroup?.mechanicIds.indexOf(linkedMechanic?.id ?? "") ?? 0,
    ),
  );
  const [resultPage, setResultPage] = useState(0);
  const [guide, setGuide] = useState(false);
  const [guidePage, setGuidePage] = useState(0);
  const [examplePage, setExamplePage] = useState(0);
  const [groupReading, setGroupReading] = useState<
    "purpose" | "games" | "boundary"
  >("purpose");
  const dimension = dimensions.find((item) => item.id === dimensionId)!;
  const dimensionInfo = taxonomyDimensions.find(
    (item) => item.dimensionId === dimensionId,
  )!;
  const groups = taxonomyGroups.filter(
    (item) => item.dimensionId === dimensionId,
  );
  const group = taxonomyGroups.find((item) => item.id === groupId) ?? groups[0];
  const groupMechanics = group.mechanicIds
    .map((id) => mechanics.find((item) => item.id === id)!)
    .filter(Boolean);
  const safeGroupPage = Math.min(
    Math.floor(groupPage / pageSize),
    Math.max(0, Math.ceil(groups.length / pageSize) - 1),
  );
  const safeMechanicPage = Math.min(
    Math.floor(mechanicPage / pageSize),
    Math.max(0, Math.ceil(groupMechanics.length / pageSize) - 1),
  );
  const safeDimensionPage = Math.min(
    Math.floor(dimensionPage / dimensionPageSize),
    Math.max(0, Math.ceil(dimensions.length / dimensionPageSize) - 1),
  );
  const mechanic =
    mechanics.find((item) => item.id === mechanicId) ?? groupMechanics[0];
  const examples = mechanicExamples[mechanic.id] ?? [];
  const examplePages = examples.flatMap((example) =>
    example.condition
      ? [
          { example, conditionOnly: false },
          { example, conditionOnly: true },
        ]
      : [{ example, conditionOnly: false }],
  );
  const searchResults = [
    ...taxonomyDimensions.map((info) => {
      const d = dimensions.find((item) => item.id === info.dimensionId)!;
      return {
        id: d.id,
        name: d.name,
        kind: "dimension" as const,
        path: "一级 · 分类维度",
        description: info.explanation,
        extra: `${info.question} ${info.use} ${info.boundary}`,
      };
    }),
    ...taxonomyGroups.map((g) => ({
      id: g.id,
      name: g.name,
      kind: "group" as const,
      path: `二级 · ${dimensions.find((d) => d.id === g.dimensionId)!.name}`,
      description: g.explanation,
      extra: `${g.function} ${g.boundary} ${g.examples.map((e) => games.find((game) => game.id === e.gameId)?.name).join(" ")}`,
    })),
    ...mechanics.map((m) => ({
      ...m,
      kind: "mechanic" as const,
      path: `三级 · ${dimensions.find((d) => d.id === m.dimension)!.name} / ${taxonomyGroups.find((g) => g.mechanicIds.includes(m.id))?.name}`,
      description: m.definition,
      extra: [
        ...m.designValue,
        ...m.inclusionRules,
        ...m.exclusionRules,
        ...m.corePlayTags,
        ...(mechanicExamples[m.id] ?? []).map(
          (e) =>
            `${games.find((g) => g.id === e.gameId)?.name} ${e.observation}`,
        ),
      ].join(" "),
    })),
  ].filter((item) =>
    matchesCatalog(item, query, `${item.description} ${item.extra}`),
  );
  const safeResultPage = Math.min(
    resultPage,
    Math.max(0, Math.ceil(searchResults.length / resultPageSize) - 1),
  );

  function selectDimension(id: typeof dimensionId) {
    const next = taxonomyGroups.find((item) => item.dimensionId === id)!;
    setDimensionId(id);
    setDimensionPage(dimensions.findIndex((item) => item.id === id));
    setGroupId(next.id);
    setGroupReading("purpose");
    setMechanicId(next.mechanicIds[0]);
    setGroupPage(0);
    setMechanicPage(0);
    setExamplePage(0);
    setReading("comic");
    setReadingPage(0);
    setStage(1);
  }
  function selectGroup(id: string) {
    const next = taxonomyGroups.find((item) => item.id === id)!;
    setDimensionId(next.dimensionId);
    setDimensionPage(
      dimensions.findIndex((item) => item.id === next.dimensionId),
    );
    setGroupId(id);
    setGroupReading("purpose");
    setGroupPage(
      taxonomyGroups
        .filter((item) => item.dimensionId === next.dimensionId)
        .findIndex((item) => item.id === id),
    );
    setMechanicId(next.mechanicIds[0]);
    setMechanicPage(0);
    setExamplePage(0);
    setReading("comic");
    setReadingPage(0);
    setStage(2);
  }
  function selectMechanic(id: string) {
    const next = taxonomyGroups.find((item) => item.mechanicIds.includes(id))!;
    setDimensionId(next.dimensionId);
    setDimensionPage(
      dimensions.findIndex((item) => item.id === next.dimensionId),
    );
    setGroupId(next.id);
    setGroupReading("purpose");
    setGroupPage(
      taxonomyGroups
        .filter((item) => item.dimensionId === next.dimensionId)
        .findIndex((item) => item.id === next.id),
    );
    setMechanicId(id);
    setMechanicPage(next.mechanicIds.indexOf(id));
    setExamplePage(0);
    setReading("comic");
    setReadingPage(0);
    setStage(3);
  }
  const selectResult = (item: (typeof searchResults)[number]) => {
    if (item.kind === "dimension")
      selectDimension(item.id as typeof dimensionId);
    else if (item.kind === "group") selectGroup(item.id);
    else selectMechanic(item.id);
    setQuery("");
  };

  return (
    <div
      className={styles.atlas}
      style={{ "--dimension-accent": dimension.color } as CSSProperties}
    >
      <header className={styles.heading}>
        <div>
          <p className="eyebrow">TAXONOMY ATLAS / 玩法分类图鉴</p>
          <h1>游戏机制分类</h1>
          <p className={styles.intro}>
            查看九个维度的分类、分组和机制定义，并对照真实游戏的具体用法。
          </p>
        </div>
        <div className={styles.headingAside}>
          <span>
            9 <small>维度</small> / {taxonomyGroups.length} <small>分组</small>{" "}
            / {mechanics.length} <small>机制</small>
          </span>
          <MaidPortrait state="explain" decorative />
        </div>
      </header>
      <div className={styles.toolbar}>
        <label className={styles.search}>
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            aria-label="搜索分类、机制与游戏"
            placeholder="搜索分类、作用、机制或游戏…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setResultPage(0);
              setGuide(false);
            }}
          />
          {query && (
            <button aria-label="清除分类搜索" onClick={() => setQuery("")}>
              ×
            </button>
          )}
        </label>
        <button
          className={guide ? styles.activeTool : ""}
          aria-pressed={guide}
          onClick={() => {
            setGuide(!guide);
            setQuery("");
          }}
        >
          分类怎么读
        </button>
        <Link href="/mechanics">全部档案 ↗</Link>
      </div>

      {guide ? (
        <section className={styles.guide} aria-label="分类层级说明">
          <div className={styles.panelHead}>
            <span>READING GUIDE</span>
            <button onClick={() => setGuide(false)}>返回图鉴 ×</button>
          </div>
          <div className={styles.guideContent}>
            <span className={styles.stamp}>分类与其他标签</span>
            <h2>{classificationLevels[guidePage].name}</h2>
            <h3>{classificationLevels[guidePage].question}</h3>
            <p>{classificationLevels[guidePage].explanation}</p>
            <div className={styles.guideExample}>
              {classificationLevels[guidePage].example}
            </div>
            <p className={styles.guideNote}>
              维度 → 分组 → 原子机制 →
              游戏实例是逐层阅读的路径。复合类型、组合配方与题材等元数据从其他角度描述游戏，不是更细一级的机制。
            </p>
            <div className={styles.guideLinks}>
              <Link href="/types">查看复合类型 →</Link>
              <Link href="/method">完整分类方法 →</Link>
            </div>
          </div>
          <Pager
            page={guidePage}
            count={classificationLevels.length}
            size={1}
            onChange={setGuidePage}
            label="层级说明"
          />
        </section>
      ) : query.trim() ? (
        <section className={styles.results} aria-label="分类搜索结果">
          <div className={styles.panelHead}>
            <span>搜索全库 · {searchResults.length} 项匹配</span>
            <button onClick={() => setQuery("")}>返回分类 ×</button>
          </div>
          <div className={styles.resultList}>
            {searchResults
              .slice(
                safeResultPage * resultPageSize,
                safeResultPage * resultPageSize + resultPageSize,
              )
              .map((item) => (
                <button
                  key={`${item.kind}-${item.id}`}
                  onClick={() => selectResult(item)}
                >
                  <span>{item.path}</span>
                  <h2>
                    {item.name} <small>→</small>
                  </h2>
                  <p>{item.description}</p>
                </button>
              ))}
            {!searchResults.length && (
              <div className={styles.noResults}>
                <h2>没有找到匹配的分类或机制</h2>
                <p>可搜索“构筑”“交易”“Balatro”等关键词。</p>
                <button onClick={() => setQuery("")}>清除关键词</button>
              </div>
            )}
          </div>
          <Pager
            page={safeResultPage}
            count={searchResults.length}
            size={resultPageSize}
            onChange={setResultPage}
            label="分类搜索"
          />
        </section>
      ) : (
        <>
          <nav className={styles.steps} aria-label="分类浏览层级">
            {["维度", "分组", "机制", "阅读"].map((name, index) => (
              <button
                key={name}
                aria-current={stage === index ? "step" : undefined}
                onClick={() => setStage(index as Stage)}
              >
                <span>0{index + 1}</span>
                {name}
                <small>
                  {index === 0
                    ? 9
                    : index === 1
                      ? groups.length
                      : index === 2
                        ? groupMechanics.length
                        : "详情"}
                </small>
              </button>
            ))}
          </nav>
          <div className={styles.path} aria-label="当前分类路径">
            <button onClick={() => setStage(0)}>九个维度</button>
            <span>›</span>
            <button onClick={() => setStage(1)}>{dimension.name}</button>
            <span>›</span>
            <button onClick={() => setStage(2)}>{group.name}</button>
            {stage === 3 && (
              <>
                <span>›</span>
                <span>{mechanic.name}</span>
              </>
            )}
          </div>
          <div className={`${styles.workspace} ${styles[`stage${stage}`]}`}>
            <section
              className={`${styles.panel} ${styles.dimensionPanel}`}
              aria-label="一级分类维度"
            >
              <div className={styles.panelHead}>
                <span>01 / 分类维度</span>
                <small>9 个</small>
              </div>
              <p className={styles.panelHint}>先选择要研究的设计问题。</p>
              <div className={styles.dimensionList}>
                {dimensions.map((d, index) => (
                  <button
                    key={d.id}
                    className={`${dimensionId === d.id ? styles.selected : ""} ${Math.floor(index / dimensionPageSize) !== safeDimensionPage ? styles.mobileHidden : ""}`}
                    aria-pressed={dimensionId === d.id}
                    onClick={() => selectDimension(d.id)}
                  >
                    <DimensionIcon id={d.id} />
                    <span>
                      <strong>{d.name}</strong>
                      <small>{d.description}</small>
                    </span>
                    <b>
                      {mechanics.filter((m) => m.dimension === d.id).length}
                    </b>
                    <i>→</i>
                  </button>
                ))}
              </div>
              <div className={styles.mobilePager}>
                <Pager
                  page={safeDimensionPage}
                  count={9}
                  size={dimensionPageSize}
                  onChange={(page) =>
                    setDimensionPage(page * dimensionPageSize)
                  }
                  label="分类维度"
                />
              </div>
              <div className={styles.panelFoot}>
                同一机制保留一个主维度；跨维关系另行连接。
              </div>
            </section>
            <section
              className={`${styles.panel} ${styles.groupPanel}`}
              aria-label="二级机制分组"
            >
              <div className={styles.panelHead}>
                <span>02 / {dimension.name}</span>
                <small>{groups.length} 组</small>
              </div>
              <div className={styles.dimensionSummary}>
                <DimensionIcon id={dimensionId} />
                <div>
                  <h2>{dimensionInfo.question}</h2>
                  <p>{dimensionInfo.explanation}</p>
                </div>
              </div>
              <div className={styles.groupList}>
                {groups
                  .slice(
                    safeGroupPage * pageSize,
                    safeGroupPage * pageSize + pageSize,
                  )
                  .map((g) => (
                    <button
                      key={g.id}
                      aria-pressed={groupId === g.id}
                      className={groupId === g.id ? styles.selected : ""}
                      onClick={() => selectGroup(g.id)}
                    >
                      <div>
                        <strong>{g.name}</strong>
                        <span>{g.mechanicIds.length} 条 →</span>
                      </div>
                      <p>{g.explanation}</p>
                    </button>
                  ))}
              </div>
              <Pager
                page={safeGroupPage}
                count={groups.length}
                size={pageSize}
                onChange={(page) => setGroupPage(page * pageSize)}
                label="机制分组"
              />
              <details className={styles.dimensionDetails}>
                <summary>这个维度的用途与边界</summary>
                <p>
                  <strong>用途：</strong>
                  {dimensionInfo.use}
                </p>
                <p>
                  <strong>边界：</strong>
                  {dimensionInfo.boundary}
                </p>
              </details>
            </section>
            <section
              className={`${styles.panel} ${styles.mechanicPanel}`}
              aria-label="三级原子机制"
            >
              <div className={styles.panelHead}>
                <span>03 / {group.name}</span>
                <small>{groupMechanics.length} 条</small>
              </div>
              <div className={styles.groupSummary}>
                <h2>{group.name}</h2>
                <p>{group.function}</p>
                <div className={styles.typicalGames}>
                  <span>参考游戏</span>
                  {Array.from(new Set(group.examples.map((e) => e.gameId)))
                    .slice(0, 3)
                    .map((id) => (
                      <Link
                        key={id}
                        href={`/games/${id}?scope=${group.examples.find((example) => example.gameId === id)!.scopeId}`}
                      >
                        {games.find((g) => g.id === id)?.name} ↗
                      </Link>
                    ))}
                </div>
              </div>
              <div className={styles.mobileGroupSummary}>
                <h2>{group.name}</h2>
                <div role="tablist" aria-label="分组说明">
                  {(
                    [
                      ["purpose", "用途"],
                      ["games", "典型游戏"],
                      ["boundary", "分组边界"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      role="tab"
                      aria-selected={groupReading === id}
                      onClick={() => setGroupReading(id)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className={styles.groupReadingBody}>
                  {groupReading === "purpose" && <p>{group.function}</p>}
                  {groupReading === "boundary" && <p>{group.boundary}</p>}
                  {groupReading === "games" && (
                    <div className={styles.groupGameLinks}>
                      {Array.from(
                        new Set(
                          group.examples.map((example) => example.gameId),
                        ),
                      )
                        .slice(0, 3)
                        .map((id) => (
                          <Link
                            key={id}
                            href={`/games/${id}?scope=${group.examples.find((example) => example.gameId === id)!.scopeId}`}
                          >
                            {games.find((game) => game.id === id)?.name} ↗
                          </Link>
                        ))}
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.mechanicList}>
                {groupMechanics
                  .slice(
                    safeMechanicPage * pageSize,
                    safeMechanicPage * pageSize + pageSize,
                  )
                  .map((m) => (
                    <div key={m.id} className={styles.mechanicTile}>
                      <button
                        className={mechanicId === m.id ? styles.selected : ""}
                        aria-pressed={mechanicId === m.id}
                        onClick={() => selectMechanic(m.id)}
                      >
                        <div>
                          <MechanicIcon id={m.id} size={48} />
                          <strong>{m.name}</strong>
                          <span>阅读 →</span>
                        </div>
                        <p>{m.definition}</p>
                      </button>
                      <MechanicExamples id={m.id} limit={1} small />
                    </div>
                  ))}
              </div>
              <Pager
                page={safeMechanicPage}
                count={groupMechanics.length}
                size={pageSize}
                onChange={(page) => setMechanicPage(page * pageSize)}
                label="原子机制"
              />
              <p className={`${styles.panelFoot} ${styles.groupBoundary}`}>
                分组边界：{group.boundary}
              </p>
            </section>
            <section
              className={`${styles.panel} ${styles.readingPanel}`}
              aria-label="机制阅读卡"
            >
              <div className={styles.panelHead}>
                <button onClick={() => setStage(2)}>← {group.name}</button>
                <span>MECHANIC NOTE</span>
              </div>
              <header className={styles.readingHead} data-reading={reading}>
                <span className={styles.stamp}>原子机制 / 编辑定义</span>
                <h2>
                  <MechanicIcon id={mechanic.id} size={40} /> {mechanic.name}
                </h2>
              </header>
              <div
                className={styles.readingTabs}
                role="tablist"
                aria-label="机制说明"
              >
                {(
                  [
                    ["comic", "图解"],
                    ["purpose", "有什么用"],
                    ["examples", "典型游戏"],
                    ["boundary", "怎么区分"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    id={`taxonomy-tab-${id}`}
                    key={id}
                    role="tab"
                    aria-selected={reading === id}
                    aria-controls="taxonomy-reading-content"
                    onClick={() => {
                      setReading(id);
                      setReadingPage(0);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div
                id="taxonomy-reading-content"
                role="tabpanel"
                aria-labelledby={`taxonomy-tab-${reading}`}
                className={`${styles.readingContent} ${reading === "comic" ? styles.comicContent : ""}`}
              >
                {reading === "comic" && (
                  <MechanicStoryboard
                    key={mechanic.id}
                    id={mechanic.id}
                    compact
                    onExpand={(panel) => {
                      setExpandedPanel(panel);
                      setComicOpen(true);
                    }}
                  />
                )}
                {reading === "purpose" && (
                  <>
                    <h3>
                      {["标准定义", "设计作用", "常见设计问题"][readingPage]}
                    </h3>
                    {readingPage === 0 ? (
                      <p>{mechanic.definition}</p>
                    ) : (
                      <ul>
                        {(readingPage === 1
                          ? mechanic.designValue
                          : mechanic.risks
                        ).map((text) => (
                          <li key={text}>{text}</li>
                        ))}
                      </ul>
                    )}
                    <Pager
                      page={readingPage}
                      count={3}
                      size={1}
                      onChange={setReadingPage}
                      label="作用与风险"
                    />
                  </>
                )}
                {reading === "boundary" && (
                  <>
                    <h3>{readingPage === 0 ? "纳入条件" : "排除边界"}</h3>
                    <ul>
                      {(readingPage === 0
                        ? mechanic.inclusionRules
                        : mechanic.exclusionRules
                      ).map((text) => (
                        <li key={text}>{text}</li>
                      ))}
                    </ul>
                    <Pager
                      page={readingPage}
                      count={2}
                      size={1}
                      onChange={setReadingPage}
                      label="机制边界"
                    />
                  </>
                )}
                {reading === "examples" && (
                  <>
                    {examples.length ? (
                      <>
                        <Example
                          example={examplePages[examplePage].example}
                          conditionOnly={
                            examplePages[examplePage].conditionOnly
                          }
                        />
                        <Pager
                          page={examplePage}
                          count={examplePages.length}
                          size={1}
                          onChange={setExamplePage}
                          label="游戏实例"
                        />
                      </>
                    ) : (
                      <p>
                        尚未收录有来源支持的正向实例。可先查阅机制定义与边界。
                      </p>
                    )}
                  </>
                )}
              </div>
              <div className={styles.readingLinks}>
                <Link href={`/mechanics/${mechanic.id}`}>完整机制档案 ↗</Link>
                <Link href={`/lab?add=${mechanic.id}`}>加入组合 ＋</Link>
              </div>
            </section>
          </div>
          <div className={styles.atlasNote}>
            <span>编辑分类 · 基于现有目录整理</span>
            <Link href="/types">查看复合类型 →</Link>
            <Link href="/method">阅读分类方法 ↗</Link>
          </div>
        </>
      )}
      <Dialog
        open={comicOpen}
        onClose={() => setComicOpen(false)}
        title={`${mechanic.name} · 完整漫画`}
        className={styles.comicDialog}
      >
        <MechanicStoryboard id={mechanic.id} initialPanel={expandedPanel} />
      </Dialog>
    </div>
  );
}
