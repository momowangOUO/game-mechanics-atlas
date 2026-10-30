"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode, type KeyboardEvent } from "react";
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
  scopes,
} from "@/lib/knowledge";
import type { DimensionId } from "@/lib/model";
import {
  Assistant,
  EmptyState,
  LoopDiagram,
  PageHead,
  Window,
} from "./Primitives";
import { useUI } from "./Providers";
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
  const current = Math.min(page, Math.max(0, Math.ceil(items.length / 4) - 1));
  return (
    <div>
      {items.length ? (
        <ul className={styles.resultList}>
          {items.slice(current * 4, current * 4 + 4).map((item, i) => (
            <li key={current * 4 + i}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className={styles.note}>
          {empty ?? "当前收录规则不足以提出具体关系，请通过原型补充判断。"}
        </p>
      )}
      <Pager
        page={current}
        pages={Math.ceil(items.length / 4)}
        onPage={setPage}
        label={`${label}分页`}
      />
    </div>
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
  const { announce, effects } = useUI();
  const [input, setInput] = useState<HybridInput>(initialInput);
  const [preset, setPreset] = useState(initialRecipeId);
  const [step, setStep] = useState(0);
  const [group, setGroup] = useState<"mechanics" | "structures">("mechanics");
  const [query, setQuery] = useState("");
  const [dimension, setDimension] = useState<DimensionId | "">("");
  const [page, setPage] = useState(0);
  const [tab, setTab] = useState<ResultTab>("loop");
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
  const pages = Math.ceil(filtered.length / 6);
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
    announce(`已应用「${recipe.name}」，点击分析查看当前组合。`);
  }
  function changeCore(id: string) {
    setPreset("");
    setInput((previous) => ({
      ...previous,
      core: id,
      mechanics: previous.mechanics.filter((item) => item !== id),
      structures: previous.structures.filter((item) => item !== id),
    }));
  }
  function toggleIngredient(id: string) {
    if (id === input.core) return;
    setPreset("");
    const field = structural.has(getMechanic(id)!.dimension)
      ? "structures"
      : "mechanics";
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
    announce("当前组合已完成本地规则分析，结果是待原型验证的设计假设。");
    requestAnimationFrame(() =>
      resultHeading.current?.focus({ preventScroll: true }),
    );
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
    event.currentTarget
      .querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [next]?.focus();
  }
  const result = analyzed?.result;
  return (
    <div className={styles.lab} data-step={step}>
      <PageHead
        eyebrow="HYBRID LAB / 规则驱动的组合研究"
        title="试验一种新组合。"
        description="先选核心机制，再加入配合机制与结构。通过分工、冲突和 Demo 问题，缩小原型验证的范围。"
      >
        <span className="chip cyan">本地确定性规则 · 无需模型 API</span>
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
            <section
              className={styles.coreSection}
              aria-labelledby="core-title"
            >
              <div className={styles.headingRow}>
                <h2 id="core-title">01 / 确定核心</h2>
                <span className="tiny purple">CORE MECHANIC</span>
              </div>
              <label className={styles.field}>
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
              <label className={styles.field}>
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
              <div className={styles.coreCard}>
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
              <p className={styles.note}>
                核心交互优先列出；也可用任一已收录的原子机制组织实验。
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
                <span className={styles.coreChip}>{core.name} · 核心</span>
                {[...input.mechanics, ...input.structures].map((id) => (
                  <button
                    type="button"
                    key={id}
                    onClick={() => toggleIngredient(id)}
                    aria-label={`移除${getMechanic(id)!.name}`}
                  >
                    {getMechanic(id)!.name}
                    <span aria-hidden="true"> ×</span>
                  </button>
                ))}
              </div>
            </div>
            <section
              className={styles.ingredientsSection}
              aria-labelledby="ingredients-title"
            >
              <div className={styles.headingRow}>
                <h2 id="ingredients-title">02 / 添加配料</h2>
                <span className="tiny purple">INGREDIENTS</span>
              </div>
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
                以上仅为选择分组；机制维度沿用档案定义。
              </p>
              <div className={styles.filters}>
                <label className={styles.field}>
                  搜索机制
                  <input
                    type="search"
                    value={query}
                    placeholder="名称、定义或 ID"
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
                    .slice(currentPage * 6, currentPage * 6 + 6)
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
                目标会改变分析中的测试问题与建议，不代表真实市场需求。
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
          <div className={styles.assistant}>
            <Assistant
              compact
              message="先保留一个核心动作，再逐个加入配料。看看每一项是否改变了玩家的选择。"
            />
          </div>
        </div>
        <div className={styles.resultColumn}>
          <Window title="ANALYSIS RESULT / 组合诊断">
            <h2
              tabIndex={-1}
              ref={resultHeading}
              className={styles.resultTitle}
            >
              {result?.title ?? "把想法变成可验证的问题。"}
            </h2>
            <span className={styles.ruleBadge}>确定性规则分析 · 设计假设</span>
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
                "完成选择后点击“分析当前组合”。你可以从十个配方中选一个起点。"
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
                      onClick={() => setTab(value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
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
                      <h3>核心循环</h3>
                      <div className={styles.loop}>
                        <LoopDiagram steps={result.loop} />
                      </div>
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
                    </>
                  )}
                  {tab === "relations" && (
                    <>
                      <h3 className="cyan">
                        协同假设 · {result.synergies.length} 条
                      </h3>
                      <PagedItems label="协同" items={result.synergies} />
                      <h3 className="gold">
                        冲突与张力 · {result.conflicts.length} 条
                      </h3>
                      <PagedItems
                        label="冲突"
                        items={result.conflicts}
                        empty="当前未命中已收录的冲突规则。这表示情境规则证据不足，不能据此判断组合没有风险。"
                      />
                    </>
                  )}
                  {tab === "tests" && (
                    <>
                      <h3>设计风险 · {result.risks.length} 条</h3>
                      <PagedItems label="风险" items={result.risks} />
                      <div className={styles.paper}>
                        <h3>首个 Demo，先验证什么？</h3>
                        <PagedItems label="Demo问题" items={result.demoTests} />
                      </div>
                    </>
                  )}
                  {tab === "references" && (
                    <>
                      <h3>同范围的已确认参照</h3>
                      <p className={styles.note}>
                        仅计入同一有效范围内的 present
                        观察。缺少确认不等于不存在；完整匹配也不证明配方协同效果。
                      </p>
                      <PagedItems
                        label="相似参照"
                        items={result.references.map((reference) => (
                          <>
                            <Link
                              className={styles.textLink}
                              href={`/games/${reference.gameId}`}
                            >
                              {getGame(reference.gameId)?.name} ↗
                            </Link>
                            <p className="tiny purple">
                              范围：
                              {scopes.find(
                                (scope) => scope.id === reference.scopeId,
                              )?.label ?? reference.scopeId}
                            </p>
                            <p>
                              已确认匹配 {reference.matchedMechanicIds.length} /{" "}
                              {reference.matchedMechanicIds.length +
                                reference.missingMechanicIds.length}{" "}
                              · 待确认 {reference.missingMechanicIds.length}
                            </p>
                            <p>
                              匹配：
                              {reference.matchedMechanicIds
                                .map((id) => getMechanic(id)?.name)
                                .join("、")}
                            </p>
                            {reference.missingMechanicIds.length > 0 && (
                              <details>
                                <summary>
                                  查看待确认项（
                                  {reference.missingMechanicIds.length}）
                                </summary>
                                <p>
                                  {reference.missingMechanicIds
                                    .map((id) => getMechanic(id)?.name)
                                    .join("、")}
                                </p>
                              </details>
                            )}
                          </>
                        ))}
                        empty="当前样本没有这些机制的已确认参照，资料不足不代表市场空白。"
                      />
                    </>
                  )}
                  {tab === "adjustments" && (
                    <>
                      <h3>可以如何调整 · {result.adjustments.length} 条</h3>
                      <PagedItems label="调整建议" items={result.adjustments} />
                      <h3>阅读边界</h3>
                      <ul className={styles.warnings}>
                        {result.warnings.map((warning) => (
                          <li key={warning}>{warning}</li>
                        ))}
                      </ul>
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
            LAB NOTE / 无 AI API 调用，不生成虚构分数。所有推断仍需原型测试。
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
          <button type="button" onClick={() => setStep(0)}>
            调整核心 ↗
          </button>
        )}
      </nav>
    </div>
  );
}
