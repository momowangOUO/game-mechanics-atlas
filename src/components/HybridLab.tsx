"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { HybridInput } from "@/lib/hybrid";
import { dimensions, getMechanic, mechanics, recipes } from "@/lib/knowledge";
import {
  buildResearchPrompt,
  collectPromptReferences,
  defaultPromptSections,
  goalOptions,
  promptSections,
  promptTemplates,
  type PromptSection,
  type PromptTemplate,
} from "@/lib/research-prompt";
import type { DimensionId } from "@/lib/model";
import { PageHead, Window } from "./Primitives";
import { MechanicIcon } from "@/components/MechanicVisuals";
import styles from "./HybridLab.module.css";
const structural = new Set<DimensionId>([
  "temporal",
  "progression",
  "participants",
]);
const steps = ["核心机制", "配合与结构", "研究要求", "提示词"];
const signature = (
  input: HybridInput,
  template: PromptTemplate,
  sections: PromptSection[],
  context: string,
) =>
  JSON.stringify({
    core: input.core,
    mechanics: [...input.mechanics].sort(),
    structures: [...input.structures].sort(),
    goals: [...input.goals].sort(),
    template,
    sections: [...sections].sort(),
    context,
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
        ← 上一页
      </button>
      <span aria-live="polite">
        {page + 1} / {pages}
      </span>
      <button
        type="button"
        onClick={() => onPage(page + 1)}
        disabled={page >= pages - 1}
      >
        下一页 →
      </button>
    </nav>
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
  const [input, setInput] = useState(initialInput);
  const [preset, setPreset] = useState(initialRecipeId);
  const [step, setStep] = useState(0);
  const [group, setGroup] = useState<"mechanics" | "structures">("mechanics");
  const [query, setQuery] = useState("");
  const [dimension, setDimension] = useState<DimensionId | "">("");
  const [page, setPage] = useState(0);
  const [selectionPage, setSelectionPage] = useState(0);
  const [referencePage, setReferencePage] = useState(0);
  const [template, setTemplate] = useState<PromptTemplate>("combination");
  const [sections, setSections] = useState<PromptSection[]>(() =>
    defaultPromptSections("combination"),
  );
  const [context, setContext] = useState("");
  const [prompt, setPrompt] = useState("");
  const [baseline, setBaseline] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [status, setStatus] = useState("");
  const [smallScreen, setSmallScreen] = useState(false);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const dialogInvoker = useRef<HTMLElement | null>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const editorHeading = useRef<HTMLHeadingElement>(null);
  const dirty = prompt !== baseline;
  const currentKey = signature(input, template, sections, context);
  const stale = Boolean(generatedKey && currentKey !== generatedKey);
  const ids = useMemo(
    () => [...new Set([input.core, ...input.mechanics, ...input.structures])],
    [input.core, input.mechanics, input.structures],
  );
  const selected = new Set(ids);
  const core = getMechanic(input.core)!;
  const references = useMemo(() => collectPromptReferences(ids), [ids]);
  const activeReference =
    references[Math.min(referencePage, Math.max(0, references.length - 1))];
  useEffect(() => {
    const media = window.matchMedia("(max-width: 700px)");
    const update = () => {
      setSmallScreen(media.matches);
      setPage(0);
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    setStatus("");
  }, [currentKey]);
  const availableDimensions = dimensions.filter(
    (item) =>
      step === 0 || structural.has(item.id) === (group === "structures"),
  );
  const normalized = query.trim().toLocaleLowerCase();
  const filtered = mechanics.filter(
    (item) =>
      (step === 0 ||
        structural.has(item.dimension) === (group === "structures")) &&
      (!dimension || dimension === item.dimension) &&
      `${item.name} ${item.id} ${item.definition}`
        .toLocaleLowerCase()
        .includes(normalized),
  );
  const pageSize = smallScreen ? 2 : 4;
  const pages = Math.ceil(filtered.length / pageSize);
  const currentPage = Math.min(page, Math.max(0, pages - 1));
  const selectedPages = Math.ceil(ids.length / 6);
  const selectedPage = Math.min(selectionPage, selectedPages - 1);
  function navigate(next: number) {
    setStep(next);
    setQuery("");
    setDimension("");
    setPage(0);
  }
  function applyPreset(id: string) {
    setPreset(id);
    const recipe = recipes.find((item) => item.id === id);
    if (!recipe) return;
    const recipeCore =
      recipe.mechanicIds.find(
        (id) => getMechanic(id)?.dimension === "interaction",
      ) ?? recipe.mechanicIds[0];
    const extra = recipe.mechanicIds.filter((id) => id !== recipeCore);
    setInput((previous) => ({
      ...previous,
      core: recipeCore,
      mechanics: extra.filter(
        (id) => !structural.has(getMechanic(id)!.dimension),
      ),
      structures: extra.filter((id) =>
        structural.has(getMechanic(id)!.dimension),
      ),
    }));
    setSelectionPage(0);
  }
  function selectMechanic(id: string) {
    setPreset("");
    if (step === 0)
      setInput((previous) => ({
        ...previous,
        core: id,
        mechanics: previous.mechanics.filter((item) => item !== id),
        structures: previous.structures.filter((item) => item !== id),
      }));
    else if (id !== input.core) {
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
  }
  function removeMechanic(id: string) {
    setPreset("");
    setInput((previous) => ({
      ...previous,
      mechanics: previous.mechanics.filter((item) => item !== id),
      structures: previous.structures.filter((item) => item !== id),
    }));
  }
  function generate() {
    const next = buildResearchPrompt({ input, template, sections, context });
    setPrompt(next);
    setBaseline(next);
    setGeneratedKey(currentKey);
    setStatus("提示词已生成，可继续编辑。");
    setStep(3);
    requestAnimationFrame(() => editorHeading.current?.focus());
  }
  function requestGenerate() {
    if (dirty) {
      dialogInvoker.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      if (dialog.current) dialog.current.returnValue = "";
      dialog.current?.showModal();
      cancelButton.current?.focus();
    } else generate();
  }
  async function copyPrompt() {
    if (!prompt.trim()) return;
    try {
      if (!navigator.clipboard?.writeText)
        throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(prompt);
      setStatus("提示词已复制。");
    } catch {
      textarea.current?.focus();
      textarea.current?.select();
      setStatus(
        "浏览器未允许复制，已选中全文。请按 Ctrl+C，或使用系统的复制菜单。",
      );
    }
  }
  function downloadPrompt() {
    if (!prompt.trim()) return;
    const url = URL.createObjectURL(
      new Blob([prompt], { type: "text/markdown;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `机制研究-${template}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus("已导出 Markdown 文件。");
  }
  return (
    <div className={styles.lab} data-step={step}>
      <PageHead
        eyebrow="HYBRID LAB / 机制研究"
        title="研究提示词"
        description="选择机制和设计目标，补充制作要求，生成可编辑的提示词，再复制到 AI 工具中继续研究。"
      >
        <span className="chip cyan">本地整理 · 无需账号</span>
      </PageHead>
      {initialNote && (
        <p className={styles.urlNote} role="status">
          {initialNote}
        </p>
      )}
      <nav className={styles.steps} aria-label="提示词编写步骤">
        {steps.map((name, index) => (
          <button
            key={name}
            type="button"
            aria-current={step === index ? "step" : undefined}
            onClick={() => navigate(index)}
          >
            <small>0{index + 1}</small>
            {name}
          </button>
        ))}
      </nav>
      <div className={styles.layout}>
        <Window title="RESEARCH SETUP / 研究设置" className={styles.formWindow}>
          <div className={styles.selection}>
            <section
              className={styles.setupPanel}
              data-active={step === 0 || step === 1}
              aria-labelledby="mechanic-heading"
            >
              <div className={styles.headingRow}>
                <h2 id="mechanic-heading">
                  {step === 1 ? "02 / 配合机制与结构" : "01 / 选择核心机制"}
                </h2>
                <span>{selected.size} 项已选</span>
              </div>
              <p className={styles.note}>
                {step === 1
                  ? "配合机制影响决策与结算；结构决定回合推进、成长保留，以及玩家怎样协作或竞争。"
                  : "选择本次研究的起点，也可以先套用配方。其他交互机制仍能加入组合。"}
              </p>
              {step !== 1 && (
                <label className={styles.field}>
                  起点配方
                  <select
                    value={preset}
                    onChange={(event) => applyPreset(event.target.value)}
                  >
                    <option value="">自定义组合</option>
                    {recipes.map((recipe) => (
                      <option value={recipe.id} key={recipe.id}>
                        {recipe.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <div className={styles.coreCard}>
                <MechanicIcon id={core.id} size={48} />
                <div>
                  <small>当前核心</small>
                  <strong>{core.name}</strong>
                  <p>{core.definition}</p>
                </div>
                <Link
                  href={`/mechanics/${core.id}`}
                  aria-label={`查看${core.name}定义`}
                >
                  ↗
                </Link>
              </div>
              {step === 1 && (
                <div className={styles.segment} aria-label="机制类别">
                  {(
                    [
                      ["mechanics", "配合机制"],
                      ["structures", "结构约束"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={group === value}
                      onClick={() => {
                        setGroup(value);
                        setDimension("");
                        setPage(0);
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
              <div className={styles.filters}>
                <label className={styles.field}>
                  查找机制
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setPage(0);
                    }}
                    placeholder="名称或规则关键词"
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
              <div className={styles.matchCount} aria-live="polite">
                共 {filtered.length} 项 · 每页 {pageSize} 项
              </div>
              <div className={styles.candidates}>
                {filtered
                  .slice(currentPage * pageSize, (currentPage + 1) * pageSize)
                  .map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      className={styles.candidate}
                      aria-pressed={
                        step === 0
                          ? input.core === item.id
                          : selected.has(item.id)
                      }
                      disabled={step === 1 && input.core === item.id}
                      onClick={() => selectMechanic(item.id)}
                    >
                      <span className={styles.candidateTitle}>
                        <MechanicIcon id={item.id} size={30} />
                        <strong>{item.name}</strong>
                        <span aria-hidden="true">
                          {(
                            step === 0
                              ? input.core === item.id
                              : selected.has(item.id)
                          )
                            ? "✓"
                            : "+"}
                        </span>
                      </span>
                      <span className={styles.definition}>
                        {item.definition}
                      </span>
                      <small>
                        {
                          dimensions.find(
                            (dimension) => dimension.id === item.dimension,
                          )?.name
                        }
                      </small>
                    </button>
                  ))}
              </div>
              {!filtered.length && (
                <p className={styles.empty}>
                  没有匹配的机制，试试其他关键词或维度。
                </p>
              )}
              <Pager
                page={currentPage}
                pages={pages}
                onPage={setPage}
                label="机制候选分页"
              />
            </section>
            <section
              className={styles.setupPanel}
              data-active={step === 2}
              aria-labelledby="requirements-heading"
            >
              <div className={styles.headingRow}>
                <h2 id="requirements-heading">03 / 设定研究要求</h2>
                <span>PROMPT BRIEF</span>
              </div>
              <fieldset className={styles.fieldset}>
                <legend>研究模板</legend>
                <div className={styles.templateOptions}>
                  {promptTemplates.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      aria-pressed={template === item.id}
                      onClick={() => {
                        setTemplate(item.id);
                        setSections(defaultPromptSections(item.id));
                      }}
                    >
                      <strong>{item.name}</strong>
                      <span>{item.description}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset className={styles.fieldset}>
                <legend>设计目标</legend>
                <div className={styles.checkGrid}>
                  {goalOptions.map((goal) => (
                    <label key={goal.id}>
                      <input
                        type="checkbox"
                        checked={input.goals.includes(goal.id)}
                        onChange={() =>
                          setInput((previous) => ({
                            ...previous,
                            goals: previous.goals.includes(goal.id)
                              ? previous.goals.filter((id) => id !== goal.id)
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
              </fieldset>
              <fieldset className={styles.fieldset}>
                <legend>输出内容</legend>
                <div className={styles.outputOptions}>
                  {promptSections.map((item) => (
                    <label key={item.id}>
                      <input
                        type="checkbox"
                        checked={sections.includes(item.id)}
                        onChange={() =>
                          setSections((previous) =>
                            previous.includes(item.id)
                              ? previous.filter((id) => id !== item.id)
                              : [...previous, item.id],
                          )
                        }
                      />
                      {item.name}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className={styles.field}>
                补充背景与约束
                <textarea
                  value={context}
                  onChange={(event) => setContext(event.target.value)}
                  rows={4}
                  placeholder="例如：单人 2D 原型，希望验证一次行动后的强化选择；先不制作局外成长。"
                />
                <small>
                  补充平台、目标玩家、制作范围，以及最想弄清的问题。
                </small>
              </label>
            </section>
            <section
              className={styles.summary}
              aria-labelledby="selection-heading"
            >
              <div className={styles.headingRow}>
                <h2 id="selection-heading">当前组合</h2>
                <span>{ids.length} 项</span>
              </div>
              <ul className={styles.selectedList}>
                {ids
                  .slice(selectedPage * 6, (selectedPage + 1) * 6)
                  .map((id) => (
                    <li key={id}>
                      <MechanicIcon id={id} size={23} />
                      <span>{getMechanic(id)?.name}</span>
                      {id === input.core ? (
                        <small>核心</small>
                      ) : (
                        <button
                          type="button"
                          onClick={() => removeMechanic(id)}
                          aria-label={`移除${getMechanic(id)?.name}`}
                        >
                          ×
                        </button>
                      )}
                    </li>
                  ))}
              </ul>
              <Pager
                page={selectedPage}
                pages={selectedPages}
                onPage={setSelectionPage}
                label="已选机制分页"
              />
            </section>
            <div className={styles.setupActions}>
              <span>
                {promptTemplates.find((item) => item.id === template)?.name} ·{" "}
                {sections.length} 个输出部分
              </span>
              <button
                className={styles.primary}
                type="button"
                onClick={requestGenerate}
              >
                {generatedKey ? "重新生成提示词" : "生成提示词"} ↗
              </button>
            </div>
          </div>
        </Window>
        <Window
          title="PROMPT FILE / 研究提示词"
          className={styles.promptWindow}
        >
          <div className={styles.editorHead}>
            <div>
              <span className={styles.fileLabel}>MECHANICS_RESEARCH.md</span>
              <h2 ref={editorHeading} tabIndex={-1}>
                交给 AI 的研究请求
              </h2>
            </div>
            <span className={styles.draftBadge}>
              {dirty ? "已手动编辑" : generatedKey ? "本地生成" : "等待生成"}
            </span>
          </div>
          <p className={styles.editorNote}>
            这里整理研究问题、机制定义与参照线索。复制到你使用的 AI
            工具后，再核对它给出的分析和来源。
          </p>
          {stale && (
            <p className={styles.stale}>
              研究设置已更改，正文仍是上一稿。重新生成后会采用新设置。
            </p>
          )}
          <label className={styles.editorLabel} htmlFor="research-prompt">
            提示词正文 <span>{prompt.length.toLocaleString()} 字符</span>
          </label>
          <textarea
            id="research-prompt"
            ref={textarea}
            className={styles.promptEditor}
            value={prompt}
            onChange={(event) => {
              setPrompt(event.target.value);
              setStatus("");
            }}
            spellCheck={false}
            placeholder="选择机制与研究要求后，点击“生成提示词”。也可以直接在这里编写。"
          />
          <div className={styles.editorActions}>
            <button
              type="button"
              className={styles.primary}
              disabled={!prompt.trim()}
              onClick={copyPrompt}
            >
              复制提示词
            </button>
            <button
              type="button"
              disabled={!prompt.trim()}
              onClick={downloadPrompt}
            >
              下载 .md
            </button>
            <button type="button" onClick={requestGenerate}>
              {dirty ? "重新生成…" : "重新生成"}
            </button>
          </div>
          <p className={styles.status} role="status" aria-live="polite">
            {status ||
              (dirty
                ? "手动修改会保留；重新生成前会提示确认。"
                : "提示词在本页内整理，不会发送到模型。")}
          </p>
          <details className={styles.referenceDetails}>
            <summary>参照线索 · {references.length} 个案例</summary>
            {activeReference ? (
              <div className={styles.referenceCard}>
                <Link href={`/games/${activeReference.gameId}`}>
                  {activeReference.name} ↗
                </Link>
                <span>范围：{activeReference.scopeLabel}</span>
                <p>
                  已确认匹配：
                  {activeReference.matchedMechanicIds
                    .map((id) => getMechanic(id)?.name)
                    .join("、")}
                </p>
                <small>
                  没有匹配的机制仍需分别核对。提示词内附来源与核对日期。
                </small>
                <Pager
                  page={Math.min(referencePage, references.length - 1)}
                  pages={references.length}
                  onPage={setReferencePage}
                  label="提示词参照分页"
                />
              </div>
            ) : (
              <p className={styles.note}>
                本站还没有匹配的游戏参照，需要继续查找资料。
              </p>
            )}
          </details>
        </Window>
      </div>
      <nav className={styles.mobileControls} aria-label="切换编写步骤">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => navigate(step - 1)}
        >
          ← 上一步
        </button>
        <span>{step + 1} / 4</span>
        {step < 2 ? (
          <button type="button" onClick={() => navigate(step + 1)}>
            下一步 →
          </button>
        ) : step === 2 ? (
          <button type="button" onClick={requestGenerate}>
            生成提示词 ↗
          </button>
        ) : (
          <button type="button" onClick={() => navigate(2)}>
            调整要求
          </button>
        )}
      </nav>
      <dialog
        ref={dialog}
        className={styles.confirmDialog}
        aria-labelledby="replace-title"
        aria-describedby="replace-description"
        onClose={() => {
          if (dialog.current?.returnValue !== "regenerate")
            dialogInvoker.current?.focus();
        }}
      >
        <span className={styles.fileLabel}>REPLACE DRAFT?</span>
        <h2 id="replace-title">替换手动修改的提示词？</h2>
        <p id="replace-description">
          重新生成会根据当前设置替换整篇正文。需要保留修改时，请先复制或下载。
        </p>
        <div>
          <button
            ref={cancelButton}
            type="button"
            onClick={() => dialog.current?.close()}
          >
            保留当前内容
          </button>
          <button
            type="button"
            className={styles.primary}
            onClick={() => {
              dialog.current?.close("regenerate");
              generate();
            }}
          >
            替换并重新生成
          </button>
        </div>
      </dialog>
    </div>
  );
}
