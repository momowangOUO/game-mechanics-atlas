"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import { motion } from "motion/react";
import {
  analyzeHybrid,
  type HybridAnalysis,
  type HybridInput,
} from "@/lib/hybrid";
import {
  dimensions,
  getGame,
  getMechanic,
  mechanics,
  recipes,
  relationships,
  scopes,
} from "@/lib/knowledge";
import type { DimensionId } from "@/lib/model";
import { EmptyState, LoopDiagram, PageHead, Window } from "./Primitives";
import { useUI } from "./Providers";
import { ArtImage, DimensionIcon, MaidPortrait } from "./Art";
import styles from "./HybridLab.module.css";

const structural = new Set<DimensionId>([
  "temporal",
  "progression",
  "participants",
]);
const goals: {
  id: HybridInput["goals"][number];
  name: string;
  description: string;
}[] = [
  {
    id: "accessible",
    name: "易上手",
    description: "检查首次体验的信息量与反馈。",
  },
  {
    id: "replayable",
    name: "高复玩",
    description: "检查重复尝试能否产生不同决策。",
  },
  {
    id: "hardcore",
    name: "硬核深度",
    description: "检查熟练判断能否改善结果。",
  },
  {
    id: "broad",
    name: "大众向",
    description: "兼顾默认方案与继续深入的空间。",
  },
];
const steps = ["核心", "配料", "目标", "结果"];
const resultTabs = [
  ["loop", "循环与分工"],
  ["relations", "协同与冲突"],
  ["tests", "风险与 Demo"],
  ["references", "相似参照"],
  ["adjustments", "调整与边界"],
] as const;
type ResultTab = (typeof resultTabs)[number][0];
const subsections: Record<ResultTab, string[]> = {
  loop: ["核心循环", "机制分工"],
  relations: ["协同假设", "冲突与张力"],
  tests: ["设计风险", "Demo 问题"],
  references: ["参照案例", "匹配机制", "未匹配项", "口径说明"],
  adjustments: ["调整建议", "阅读边界"],
};
const signature = (input: HybridInput) =>
  JSON.stringify({
    core: input.core,
    mechanics: [...input.mechanics].sort(),
    structures: [...input.structures].sort(),
    goals: [...input.goals].sort(),
  });

function Pager({
  page,
  pages,
  onPage,
  label,
}: {
  page: number;
  pages: number;
  onPage: (page: number) => void;
  label: string;
}) {
  if (pages <= 1) return null;
  return (
    <nav className={styles.pager} aria-label={label}>
      <button
        type="button"
        onClick={() => onPage(page - 1)}
        disabled={page === 0}
      >
        上一页
      </button>
      <span aria-live="polite">
        {page + 1} / {pages}
      </span>
      <button
        type="button"
        onClick={() => onPage(page + 1)}
        disabled={page >= pages - 1}
      >
        下一页
      </button>
    </nav>
  );
}

function PagedItems({
  items,
  render,
  label,
  empty,
}: {
  items: ReactNode[];
  render?: never;
  label: string;
  empty?: string;
}) {
  const [page, setPage] = useState(0);
  const current = Math.min(page, Math.max(0, items.length - 1));
  return (
    <div>
      {items.length ? (
        <ul className={styles.resultList}>
          {items.slice(current, current + 1).map((item, i) => (
            <li key={current + i}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className={styles.note}>
          {empty ?? "已有规则尚不足以说明具体关系，可用原型进一步验证。"}
        </p>
      )}
      <Pager
        page={current}
        pages={items.length}
        onPage={setPage}
        label={`${label}分页`}
      />
    </div>
  );
}

function ReferenceReport({
  references,
  detail,
}: {
  references: HybridAnalysis["references"];
  detail: number;
}) {
  const [page, setPage] = useState(0);
  const current = Math.min(page, Math.max(0, references.length - 1));
  const reference = references[current];
  const caseLink = reference && (
    <Link className={styles.textLink} href={`/games/${reference.gameId}`}>
      {getGame(reference.gameId)?.name} ↗
    </Link>
  );
  const mechanicLinks = (ids: string[]) =>
    ids.map((id) => (
      <Link key={id} className={styles.textLink} href={`/mechanics/${id}`}>
        {getMechanic(id)?.name} ↗
      </Link>
    ));
  return (
    <>
      <section className={styles.resultSection} data-active={detail === 0}>
        <h3>同范围的已确认参照</h3>
        {reference ? (
          <>
            <ul className={styles.resultList}>
              <li>
                {caseLink}
                <p className="tiny purple">
                  范围：
                  {scopes.find((scope) => scope.id === reference.scopeId)
                    ?.label ?? reference.scopeId}
                </p>
                <p>
                  已确认匹配 {reference.matchedMechanicIds.length} /{" "}
                  {reference.matchedMechanicIds.length +
                    reference.missingMechanicIds.length}{" "}
                  · 未匹配 {reference.missingMechanicIds.length}
                </p>
              </li>
            </ul>
            <Pager
              page={current}
              pages={references.length}
              onPage={setPage}
              label="相似参照分页"
            />
          </>
        ) : (
          <p className={styles.note}>
            当前样本没有这些机制的已确认参照，资料不足不代表市场空白。
          </p>
        )}
      </section>
      <section className={styles.resultSection} data-active={detail === 1}>
        <h3>已确认匹配 · {reference?.matchedMechanicIds.length ?? 0} 项</h3>
        <p>{caseLink}</p>
        <PagedItems
          key={`matched-${reference?.gameId}`}
          label="匹配机制"
          items={mechanicLinks(reference?.matchedMechanicIds ?? [])}
          empty="当前参照没有已确认匹配的机制。"
        />
      </section>
      <section className={styles.resultSection} data-active={detail === 2}>
        <h3>未匹配项 · {reference?.missingMechanicIds.length ?? 0} 项</h3>
        <p>{caseLink}</p>
        <PagedItems
          key={`missing-${reference?.gameId}`}
          label="未匹配机制"
          items={mechanicLinks(reference?.missingMechanicIds ?? [])}
          empty={
            reference
              ? "当前组合的机制已在此参照范围全部匹配；这仍不代表协同效果已经验证。"
              : "尚无可核对的参照案例。"
          }
        />
      </section>
      <section className={styles.resultSection} data-active={detail === 3}>
        <h3>参照口径与边界</h3>
        <PagedItems
          label="参照口径"
          items={[
            "仅计入同一有效范围内“已确认存在”的机制。",
            "未匹配项可能有条件限制、尚未确认、不适用或已确认不存在，需到案例核对。",
            "即使全部匹配，也需另行验证协同效果。",
          ]}
        />
      </section>
    </>
  );
}

export default function HybridLab({
  initialInput,
  initialRecipeId = "",
  initialNote = "",
}: {
  initialInput: HybridInput;
  initialRecipeId?: string;
  initialNote?: string;
}) {
  const { effects } = useUI();
  const [input, setInput] = useState<HybridInput>(initialInput);
  const [preset, setPreset] = useState(initialRecipeId);
  const [step, setStep] = useState(0);
  const [group, setGroup] = useState<"mechanics" | "structures">("mechanics");
  const [query, setQuery] = useState("");
  const [dimension, setDimension] = useState<DimensionId | "">("");
  const [page, setPage] = useState(0);
  const [tab, setTab] = useState<ResultTab>("loop");
  const [detail, setDetail] = useState(0);
  const [coreDetail, setCoreDetail] = useState(0);
  const [reportView, setReportView] = useState(1);
  const [compact, setCompact] = useState(false);
  const [cardPage, setCardPage] = useState(0);
  const [loopPage, setLoopPage] = useState(0);
  const [visual, setVisual] = useState<{
    kind: "add" | "remove" | "analyze";
    id: string;
    serial: number;
  } | null>(null);
  const visualSerial = useRef(0);
  const focusFrame = useRef<number | null>(null);
  const [analyzed, setAnalyzed] = useState<{
    input: HybridInput;
    result: HybridAnalysis;
  } | null>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const allIds = [input.core, ...input.mechanics, ...input.structures];
  const selected = new Set(allIds);
  const core = getMechanic(input.core)!;
  const stale = Boolean(
    analyzed && signature(input) !== signature(analyzed.input),
  );
  const inputKey = signature(input);
  useEffect(() => {
    const query = window.matchMedia("(max-width:700px) and (max-height:800px)");
    const update = () => {
      setCompact(query.matches);
      setPage(0);
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    // A changed selection invalidates presentation work, never the saved report.
    setVisual((previous) => (previous?.kind === "analyze" ? null : previous));
    if (focusFrame.current !== null) cancelAnimationFrame(focusFrame.current);
  }, [inputKey]);
  useEffect(() => {
    if (!visual) return;
    const timer = setTimeout(
      () =>
        setVisual((current) =>
          current?.serial === visual.serial ? null : current,
        ),
      effects ? (visual.kind === "analyze" ? 560 : 360) : 0,
    );
    return () => clearTimeout(timer);
  }, [visual, effects]);
  useEffect(
    () => () => {
      if (focusFrame.current !== null) cancelAnimationFrame(focusFrame.current);
    },
    [],
  );
  useEffect(() => {
    if (step !== 3 && focusFrame.current !== null)
      cancelAnimationFrame(focusFrame.current);
  }, [step]);
  function feedback(kind: "add" | "remove", id: string) {
    setVisual({ kind, id, serial: ++visualSerial.current });
  }
  const availableDimensions = dimensions.filter(
    (item) => structural.has(item.id) === (group === "structures"),
  );
  const normalized = query.trim().toLocaleLowerCase();
  const filtered = mechanics.filter(
    (item) =>
      structural.has(item.dimension) === (group === "structures") &&
      (!dimension || item.dimension === dimension) &&
      `${item.name} ${item.id} ${item.definition}`
        .toLocaleLowerCase()
        .includes(normalized),
  );
  const candidateCount = compact ? 2 : 4;
  const pages = Math.ceil(filtered.length / candidateCount);
  const currentPage = Math.min(page, Math.max(0, pages - 1));

  function applyPreset(id: string) {
    setPreset(id);
    const recipe = recipes.find((item) => item.id === id);
    if (!recipe) return;
    const recipeCore =
      recipe.mechanicIds.find(
        (item) => getMechanic(item)?.dimension === "interaction",
      ) ?? recipe.mechanicIds[0];
    const extra = recipe.mechanicIds.filter((item) => item !== recipeCore);
    setInput((previous) => ({
      ...previous,
      core: recipeCore,
      mechanics: extra.filter(
        (item) => !structural.has(getMechanic(item)!.dimension),
      ),
      structures: extra.filter((item) =>
        structural.has(getMechanic(item)!.dimension),
      ),
    }));
    setCardPage(0);
    setReportView(1);
    feedback("add", recipeCore);
  }
  function changeCore(id: string) {
    setPreset("");
    setInput((previous) => ({
      ...previous,
      core: id,
      mechanics: previous.mechanics.filter((item) => item !== id),
      structures: previous.structures.filter((item) => item !== id),
    }));
    feedback("add", id);
  }
  function toggleIngredient(id: string) {
    if (id === input.core) return;
    setPreset("");
    const field = structural.has(getMechanic(id)!.dimension)
      ? "structures"
      : "mechanics";
    feedback(input[field].includes(id) ? "remove" : "add", id);
    setInput((previous) => ({
      ...previous,
      [field]: previous[field].includes(id)
        ? previous[field].filter((item) => item !== id)
        : [...previous[field], id],
    }));
  }
  function analyze() {
    const snapshot: HybridInput = {
      ...input,
      mechanics: [...input.mechanics],
      structures: [...input.structures],
      goals: [...input.goals],
    };
    const result = analyzeHybrid(snapshot);
    setAnalyzed({ input: snapshot, result });
    setStep(3);
    setTab("loop");
    setDetail(0);
    setLoopPage(0);
    setCardPage(0);
    setReportView(1);
    setVisual({ kind: "analyze", id: "", serial: ++visualSerial.current });
    if (focusFrame.current !== null) cancelAnimationFrame(focusFrame.current);
    focusFrame.current = requestAnimationFrame(() => {
      if (resultHeading.current?.getClientRects().length)
        resultHeading.current.focus({ preventScroll: true });
    });
  }
  function resultKeys(event: KeyboardEvent<HTMLDivElement>) {
    const index = resultTabs.findIndex((item) => item[0] === tab);
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % resultTabs.length
        : event.key === "ArrowLeft"
          ? (index + resultTabs.length - 1) % resultTabs.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? resultTabs.length - 1
              : -1;
    if (next < 0) return;
    event.preventDefault();
    setTab(resultTabs[next][0]);
    setDetail(0);
    event.currentTarget
      .querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [next]?.focus();
  }
  const result = analyzed?.result;
  const conflictPairs =
    !stale && analyzed
      ? relationships.filter(
          (relation) =>
            (relation.type === "conflict" || relation.type === "alternative") &&
            [
              analyzed.input.core,
              ...analyzed.input.mechanics,
              ...analyzed.input.structures,
            ].includes(relation.from) &&
            [
              analyzed.input.core,
              ...analyzed.input.mechanics,
              ...analyzed.input.structures,
            ].includes(relation.to),
        )
      : [];
  const conflictIds = new Set(
    conflictPairs.flatMap((relation) => [relation.from, relation.to]),
  );
  const boardIds = conflictIds.size
    ? [
        ...allIds.filter((id) => conflictIds.has(id)),
        ...allIds.filter((id) => !conflictIds.has(id)),
      ]
    : allIds;
  const assistantState =
    visual?.kind === "analyze"
      ? "think"
      : stale
        ? "explain"
        : result
          ? result.conflicts.length
            ? "conflict"
            : "complete"
          : visual?.kind === "add"
            ? "surprise"
            : "explain";
  const visibleCardPage = Math.min(
    cardPage,
    Math.max(0, Math.ceil(allIds.length / 2) - 1),
  );
  return (
    <div
      className={styles.lab}
      data-step={step}
      data-core-detail={coreDetail}
      data-report-view={reportView}
      data-effects={effects ? "full" : "reduced"}
      data-analysis-state={
        stale
          ? "stale"
          : visual?.kind === "analyze"
            ? "revealing"
            : result
              ? "ready"
              : "idle"
      }
    >
      <PageHead
        eyebrow="HYBRID LAB / 规则驱动的组合研究"
        title="试验一种新组合。"
        description="先选核心机制，再加入配合机制与结构。通过分工、冲突和 Demo 问题，缩小原型验证的范围。"
      >
        <span className="chip cyan">本地规则分析 · 设计假设</span>
      </PageHead>
      {initialNote && (
        <p className={styles.urlNote} role="status">
          {initialNote}
        </p>
      )}
      <nav className={styles.steps} aria-label="实验步骤">
        {steps.map((name, index) => (
          <button
            type="button"
            key={name}
            aria-current={step === index ? "step" : undefined}
            onClick={() => setStep(index)}
          >
            <small>0{index + 1}</small> {name}
          </button>
        ))}
      </nav>
      <div className={styles.layout}>
        <div className={styles.selection}>
          <Window
            title="YOUR EXPERIMENT / 当前实验"
            className={styles.formWindow}
          >
            <div className={styles.tableArt}>
              <ArtImage
                src={
                  preset
                    ? `/art/recipes/${preset}.webp`
                    : "/art/chapters/lab.webp"
                }
                alt="木桌上的机制实验板、卡槽与研究工具，原创示意插画"
                width={1672}
                height={940}
                priority
              />
              <span>EXPERIMENT TABLE / 机制上桌</span>
            </div>
            <section
              className={styles.coreSection}
              aria-labelledby="core-title"
            >
              <div className={styles.headingRow}>
                <h2 id="core-title">01 / 确定核心</h2>
                <span className="tiny purple">CORE MECHANIC</span>
              </div>
              <nav className={styles.coreSubnav} aria-label="核心选择分区">
                {["起点配方", "核心机制", "已选机制"].map((label, index) => (
                  <button
                    type="button"
                    key={label}
                    aria-pressed={coreDetail === index}
                    onClick={() => setCoreDetail(index)}
                  >
                    {label}
                  </button>
                ))}
              </nav>
              <label
                className={`${styles.field} ${styles.corePart}`}
                data-active={coreDetail === 0}
              >
                从配方开始{" "}
                <select
                  aria-label="组合配方"
                  value={preset}
                  onChange={(event) => applyPreset(event.target.value)}
                >
                  <option value="">自定义组合</option>
                  {recipes.map((recipe) => (
                    <option key={recipe.id} value={recipe.id}>
                      {recipe.name}
                    </option>
                  ))}
                </select>
              </label>
              <label
                className={`${styles.field} ${styles.corePart}`}
                data-active={coreDetail === 1}
              >
                核心机制{" "}
                <select
                  value={input.core}
                  onChange={(event) => changeCore(event.target.value)}
                >
                  {dimensions.map((item) => (
                    <optgroup key={item.id} label={item.name}>
                      {mechanics
                        .filter((mechanic) => mechanic.dimension === item.id)
                        .map((mechanic) => (
                          <option key={mechanic.id} value={mechanic.id}>
                            {mechanic.name}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </label>
              <div
                className={`${styles.coreCard} ${styles.corePart}`}
                data-active={coreDetail === 1}
              >
                <DimensionIcon id={core.dimension} />
                <div>
                  <span className="tiny purple">
                    CORE /{" "}
                    {
                      dimensions.find((item) => item.id === core.dimension)
                        ?.name
                    }
                  </span>
                  <h3>{core.name}</h3>
                  <p>{core.definition}</p>
                </div>
                <Link
                  href={`/mechanics/${core.id}`}
                  aria-label={`查看${core.name}机制档案`}
                >
                  档案 ↗
                </Link>
              </div>
              <p className={`${styles.note} ${styles.coreHelp}`}>
                可以从任一维度选择核心机制，再围绕它添加配合机制。
              </p>
            </section>
            <div className={styles.selectionSummary}>
              <div className={styles.headingRow}>
                <span className="tiny purple">已选机制</span>
                <span className="tiny purple">
                  共 {allIds.length} 项 · 含核心
                </span>
              </div>
              <div className={styles.chips} aria-label="已选机制">
                {boardIds
                  .slice(visibleCardPage * 2, visibleCardPage * 2 + 2)
                  .map((id) => (
                    <button
                      type="button"
                      key={visual?.id === id ? `${id}-${visual.serial}` : id}
                      className={
                        id === input.core ? styles.coreChip : undefined
                      }
                      data-mechanic-id={id}
                      data-conflict={conflictIds.has(id) || undefined}
                      data-feedback={
                        visual?.id === id
                          ? `${visual.kind}-${visual.serial}`
                          : undefined
                      }
                      onClick={() =>
                        id === input.core
                          ? setCoreDetail(1)
                          : toggleIngredient(id)
                      }
                      aria-label={
                        id === input.core
                          ? `${core.name}，当前核心`
                          : `移除${getMechanic(id)!.name}`
                      }
                    >
                      <DimensionIcon id={getMechanic(id)!.dimension} />
                      <span>
                        <small>
                          {id === input.core
                            ? "CORE / 核心"
                            : structural.has(getMechanic(id)!.dimension)
                              ? "STRUCTURE / 结构"
                              : "MECHANIC / 配料"}
                        </small>
                        <strong>{getMechanic(id)!.name}</strong>
                      </span>
                      <span aria-hidden="true">
                        {id === input.core ? "◇" : "×"}
                      </span>
                    </button>
                  ))}
              </div>
              <Pager
                page={visibleCardPage}
                pages={Math.ceil(allIds.length / 2)}
                onPage={setCardPage}
                label="已选机制分页"
              />
              {visual && visual.kind !== "analyze" && (
                <p
                  key={visual.serial}
                  className={styles.cardFeedback}
                  role="status"
                >
                  {visual.kind === "add" ? "已放入" : "已移除"}：
                  {getMechanic(visual.id)?.name}
                </p>
              )}
              {conflictPairs.length > 0 && (
                <ul
                  className={styles.conflictLinks}
                  aria-label="需要验证的机制关系"
                >
                  {conflictPairs.map((pair) => (
                    <li key={pair.id}>
                      <span>{getMechanic(pair.from)?.name}</span>
                      <b aria-hidden="true">↔</b>
                      <span>{getMechanic(pair.to)?.name}</span>
                      <small>{pair.context} · 需分阶段验证</small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <section
              className={styles.ingredientsSection}
              aria-labelledby="ingredients-title"
            >
              <div className={styles.headingRow}>
                <h2 id="ingredients-title">02 / 添加配料</h2>
                <span className="tiny purple">INGREDIENTS</span>
              </div>
              <p className={styles.mobileContext}>
                核心：{core.name} · 已选 {allIds.length} 项机制
              </p>
              <div className={styles.group} aria-label="配料选择分组">
                {(["mechanics", "structures"] as const).map((value) => (
                  <button
                    type="button"
                    key={value}
                    aria-pressed={group === value}
                    onClick={() => {
                      setGroup(value);
                      setDimension("");
                      setPage(0);
                    }}
                  >
                    {value === "mechanics" ? "配合机制" : "流程与结构"}
                  </button>
                ))}
              </div>
              <p className={styles.note}>
                两组方便挑选配料，机制的分类维度仍与档案一致。
              </p>
              <div className={styles.filters}>
                <label className={styles.field}>
                  搜索机制
                  <input
                    type="search"
                    value={query}
                    placeholder="名称、定义或 ID"
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === "Escape")
                        event.currentTarget.blur();
                    }}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setPage(0);
                    }}
                  />
                </label>
                <label className={styles.field}>
                  机制维度
                  <select
                    value={dimension}
                    onChange={(event) => {
                      setDimension(event.target.value as DimensionId | "");
                      setPage(0);
                    }}
                  >
                    <option value="">全部维度</option>
                    {availableDimensions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <p className={styles.matchCount} aria-live="polite">
                {filtered.length} 个匹配 · 全部 {mechanics.length}{" "}
                个原子机制均可选择
              </p>
              {filtered.length ? (
                <ul className={styles.choices}>
                  {filtered
                    .slice(
                      currentPage * candidateCount,
                      currentPage * candidateCount + candidateCount,
                    )
                    .map((item) => (
                      <li key={item.id}>
                        <label
                          className={`${styles.choice} ${selected.has(item.id) ? styles.chosen : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={selected.has(item.id)}
                            disabled={item.id === input.core}
                            onChange={() => toggleIngredient(item.id)}
                          />
                          <span>
                            <DimensionIcon id={item.dimension} />
                            <strong>{item.name}</strong>
                            <small>
                              {
                                dimensions.find(
                                  (entry) => entry.id === item.dimension,
                                )?.name
                              }
                              {item.id === input.core ? " · 当前核心" : ""}
                            </small>
                          </span>
                        </label>
                        <Link
                          href={`/mechanics/${item.id}`}
                          aria-label={`查看${item.name}定义`}
                        >
                          ↗
                        </Link>
                      </li>
                    ))}
                </ul>
              ) : (
                <EmptyState
                  title="没有匹配的机制"
                  description="可更换分组、缩短关键词或清除筛选。"
                >
                  <button
                    type="button"
                    className={styles.smallButton}
                    onClick={() => {
                      setQuery("");
                      setDimension("");
                      setPage(0);
                    }}
                  >
                    清除筛选
                  </button>
                </EmptyState>
              )}
              <Pager
                page={currentPage}
                pages={pages}
                onPage={setPage}
                label="机制候选分页"
              />
            </section>
            <section
              className={styles.goalsSection}
              aria-labelledby="goals-title"
            >
              <div className={styles.headingRow}>
                <h2 id="goals-title">03 / 希望优先满足</h2>
                <span className="tiny purple">DESIGN GOALS</span>
              </div>
              <div className={styles.goalGrid}>
                {goals.map((goal) => (
                  <label
                    key={goal.id}
                    className={`${styles.goal} ${input.goals.includes(goal.id) ? styles.chosen : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={input.goals.includes(goal.id)}
                      onChange={() =>
                        setInput((previous) => ({
                          ...previous,
                          goals: previous.goals.includes(goal.id)
                            ? previous.goals.filter((item) => item !== goal.id)
                            : [...previous.goals, goal.id],
                        }))
                      }
                    />
                    <span>
                      <strong>{goal.name}</strong>
                      <small>{goal.description}</small>
                    </span>
                  </label>
                ))}
              </div>
              <p className={styles.note}>
                所选目标会影响测试问题与建议；是否满足玩家需求，仍需另行验证。
              </p>
            </section>
            <div className={styles.analyzeSection}>
              <p className={styles.scopeBox}>
                配方是原创设计假设。规则分析尚未经过原型验证，也不预测市场表现。
              </p>
              <button
                type="button"
                className={`button primary ${styles.analyze}`}
                onClick={analyze}
              >
                {analyzed ? "重新分析当前组合" : "分析当前组合"}{" "}
                <span aria-hidden="true">↻</span>
              </button>
            </div>
          </Window>
        </div>
        <div className={styles.resultColumn}>
          <Window title="ANALYSIS RESULT / 组合诊断">
            {result && (
              <nav className={styles.reportViews} aria-label="报告视图">
                {["概况与边界", "研究内容"].map((label, index) => (
                  <button
                    type="button"
                    key={label}
                    aria-pressed={reportView === index}
                    onClick={() => setReportView(index)}
                  >
                    {label}
                  </button>
                ))}
              </nav>
            )}
            <div className={styles.reportIntro}>
              <MaidPortrait state={assistantState} className={styles.maid} />
              <span className={styles.reportCode}>RIN’S REPORT / 研究手记</span>
              <h2
                tabIndex={-1}
                ref={resultHeading}
                className={styles.resultTitle}
              >
                {result?.title ?? "这组机制会怎样配合？"}
              </h2>
              {!result && (
                <p className={styles.assistantMessage}>
                  先确定核心，再逐个加入配料。选好后点“分析当前组合”，我会帮你整理需要验证的关系与问题。
                </p>
              )}
              {result && (
                <span
                  key={visual?.kind === "analyze" ? visual.serial : "settled"}
                  className={`${styles.stamp} ${result.conflicts.length ? styles.conflictStamp : ""}`}
                  data-stamping={visual?.kind === "analyze" || undefined}
                >
                  {result.conflicts.length ? "需要验证" : "分析完成"}
                </span>
              )}
              <span className={styles.ruleBadge}>内置规则分析 · 设计假设</span>
            </div>
            {analyzed && (
              <div className={styles.snapshot}>
                <p>
                  已分析：{getMechanic(analyzed.input.core)?.name}为核心，共{" "}
                  {1 +
                    analyzed.input.mechanics.length +
                    analyzed.input.structures.length}{" "}
                  项机制。
                </p>
                <p>
                  目标：
                  {analyzed.input.goals
                    .map((id) => goals.find((goal) => goal.id === id)?.name)
                    .join("、") || "尚未指定"}
                </p>
              </div>
            )}
            <div
              role="status"
              className={stale ? styles.stale : styles.analysisStatus}
            >
              {stale ? (
                <>
                  <strong>组合已修改，以下仍是上次分析。</strong>
                  <button type="button" onClick={analyze}>
                    更新分析 ↻
                  </button>
                </>
              ) : result ? (
                "结果对应当前选择。先用最小 Demo 检验这些假设。"
              ) : (
                `完成选择后点击“分析当前组合”。你可以从 ${recipes.length} 个配方中选一个起点。`
              )}
            </div>
            {result ? (
              <>
                <div
                  className={styles.resultTabs}
                  role="tablist"
                  aria-label="分析结果分类"
                  onKeyDown={resultKeys}
                >
                  {resultTabs.map(([value, label]) => (
                    <button
                      type="button"
                      role="tab"
                      id={`lab-tab-${value}`}
                      aria-controls={`lab-panel-${value}`}
                      aria-selected={tab === value}
                      tabIndex={tab === value ? 0 : -1}
                      key={value}
                      onClick={() => {
                        setTab(value);
                        setDetail(0);
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {subsections[tab].length > 1 && (
                  <nav className={styles.detailNav} aria-label="报告分区">
                    {subsections[tab].map((label, index) => (
                      <button
                        key={label}
                        type="button"
                        aria-pressed={detail === index}
                        onClick={() => setDetail(index)}
                      >
                        {label}
                      </button>
                    ))}
                  </nav>
                )}
                <motion.div
                  key={`${tab}-${signature(analyzed!.input)}`}
                  initial={effects ? { opacity: 0, y: 5 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: effects ? 0.18 : 0 }}
                  role="tabpanel"
                  id={`lab-panel-${tab}`}
                  aria-labelledby={`lab-tab-${tab}`}
                  tabIndex={0}
                  className={styles.resultPanel}
                >
                  {tab === "loop" && (
                    <>
                      <section
                        className={styles.resultSection}
                        data-active={detail === 0}
                      >
                        <h3>
                          核心循环 ·{" "}
                          {Math.min(loopPage + 1, result.loop.length)} /{" "}
                          {result.loop.length}
                        </h3>
                        <div className={styles.loop}>
                          <LoopDiagram
                            steps={result.loop.slice(loopPage, loopPage + 1)}
                          />
                        </div>
                        <Pager
                          page={loopPage}
                          pages={result.loop.length}
                          onPage={setLoopPage}
                          label="核心循环分页"
                        />
                      </section>
                      <section
                        className={styles.resultSection}
                        data-active={detail === 1}
                      >
                        <h3>机制分工 · {result.roles.length} 项</h3>
                        <PagedItems
                          label="机制分工"
                          items={result.roles.map((role) => (
                            <>
                              <Link
                                className={styles.textLink}
                                href={`/mechanics/${role.mechanicId}`}
                              >
                                {role.name} ↗
                              </Link>
                              <p>{role.role}</p>
                            </>
                          ))}
                        />
                      </section>
                    </>
                  )}
                  {tab === "relations" && (
                    <>
                      <section
                        className={styles.resultSection}
                        data-active={detail === 0}
                      >
                        <h3 className="cyan">
                          协同假设 · {result.synergies.length} 条
                        </h3>
                        <PagedItems label="协同" items={result.synergies} />
                      </section>
                      <section
                        className={styles.resultSection}
                        data-active={detail === 1}
                      >
                        <h3 className="gold">
                          冲突与张力 · {result.conflicts.length} 条
                        </h3>
                        <PagedItems
                          label="冲突"
                          items={result.conflicts}
                          empty="已有规则尚未指出具体冲突。仍需用原型检查这组机制的风险。"
                        />
                      </section>
                    </>
                  )}
                  {tab === "tests" && (
                    <>
                      <section
                        className={styles.resultSection}
                        data-active={detail === 0}
                      >
                        <h3>设计风险 · {result.risks.length} 条</h3>
                        <PagedItems label="风险" items={result.risks} />
                      </section>
                      <div
                        className={`${styles.paper} ${styles.resultSection}`}
                        data-active={detail === 1}
                      >
                        <h3>首个 Demo，先验证什么？</h3>
                        <PagedItems label="Demo问题" items={result.demoTests} />
                      </div>
                    </>
                  )}
                  {tab === "references" && (
                    <ReferenceReport
                      references={result.references}
                      detail={detail}
                    />
                  )}
                  {tab === "adjustments" && (
                    <>
                      <section
                        className={styles.resultSection}
                        data-active={detail === 0}
                      >
                        <h3>可以如何调整 · {result.adjustments.length} 条</h3>
                        <PagedItems
                          label="调整建议"
                          items={result.adjustments}
                        />
                      </section>
                      <section
                        className={styles.resultSection}
                        data-active={detail === 1}
                      >
                        <h3>阅读边界</h3>
                        <PagedItems label="阅读边界" items={result.warnings} />
                      </section>
                    </>
                  )}
                </motion.div>
              </>
            ) : (
              <div className={styles.initialResult}>
                <span aria-hidden="true">⚗</span>
                <p>核心动作 → 结果反馈 → 下一次决策</p>
                <p className={styles.note}>
                  分析会整理循环、机制分工、情境冲突、设计风险与具体测试问题。相似游戏只提供有证据范围内的参照。
                </p>
              </div>
            )}
          </Window>
          <div className={styles.resultFootnote}>
            LAB NOTE / 本地规则分析，不调用 AI API。所有推断仍需原型测试。
          </div>
        </div>
      </div>
      <nav className={styles.mobileControls} aria-label="移动端实验步骤控制">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((value) => value - 1)}
        >
          ← 上一步
        </button>
        <span>{step + 1} / 4</span>
        {step < 2 ? (
          <button type="button" onClick={() => setStep((value) => value + 1)}>
            下一步 →
          </button>
        ) : step === 2 ? (
          <button type="button" onClick={analyze}>
            分析组合 →
          </button>
        ) : (
          <button
            type="button"
            onClick={() => (stale ? analyze() : setStep(0))}
          >
            {stale ? "更新分析 ↻" : "调整核心 ↗"}
          </button>
        )}
      </nav>
    </div>
  );
}
