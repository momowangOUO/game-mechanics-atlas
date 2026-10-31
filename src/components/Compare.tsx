"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  dimensions,
  games,
  getGame,
  getInstances,
  getInstanceStatus,
  mechanics,
  scopes,
  sources,
} from "@/lib/knowledge";
import type { Game, MechanicInstance } from "@/lib/model";
import { HeatProfileMini } from "./HeatCharts";
import {
  EmptyState,
  GameCover,
  PageHead,
  StateBadge,
  Window,
} from "./Primitives";
import styles from "./Compare.module.css";
import { evidenceLabels } from "@/lib/evidence-labels";

type Side = { gameId: string; scopeId: string };
type View = "mechanics" | "structure" | "heat";
const pageSize = 12;

function resolvePair(leftId?: string, rightId?: string): [Game, Game] {
  const left = getGame(leftId ?? "") ?? getGame("balatro") ?? games[0];
  const candidate = getGame(rightId ?? "") ?? getGame("slay-the-spire");
  const right =
    candidate && candidate.id !== left.id
      ? candidate
      : [getGame("slay-the-spire"), getGame("balatro"), ...games].find(
          (game) => game && game.id !== left.id,
        )!;
  return [left, right];
}

function scopeLabel(scopeId: string) {
  return scopes.find((scope) => scope.id === scopeId)?.label ?? "范围待确认";
}

function SourceLinks({ ids }: { ids: string[] }) {
  const selected = sources.filter((source) => ids.includes(source.id));
  if (!selected.length)
    return <p className={styles.small}>当前观察没有可引用来源。</p>;
  return (
    <ul className={styles.sources}>
      {selected.map((source) => (
        <li key={source.id}>
          <a href={source.url} target="_blank" rel="noreferrer">
            {source.title} ↗
          </a>
          <small>
            核验于 {source.checkedAt} · {source.publisher}
          </small>
        </li>
      ))}
    </ul>
  );
}

function Observation({ instance }: { instance?: MechanicInstance }) {
  if (!instance) return <p className={styles.unknown}>此范围尚未收录观察。</p>;
  return (
    <details className={styles.observation}>
      <summary>证据与条件</summary>
      <p className={styles.evidence}>{evidenceLabels[instance.evidenceKind]}</p>
      <p>{instance.rationale}</p>
      {instance.condition && (
        <p className={styles.condition}>{instance.condition}</p>
      )}
      {instance.scopeNote && (
        <p className={styles.small}>原始范围：{instance.scopeNote}</p>
      )}
      <SourceLinks ids={instance.sourceIds} />
    </details>
  );
}

function Selection({
  side,
  label,
  otherGameId,
  onGame,
  onScope,
}: {
  side: Side;
  label: string;
  otherGameId: string;
  onGame: (id: string) => void;
  onScope: (id: string) => void;
}) {
  const game = getGame(side.gameId)!;
  return (
    <section className={styles.selection} aria-label={`${label}选择`}>
      <div className={styles.cover}>
        <GameCover game={game} />
      </div>
      <div className={styles.selectionBody}>
        <p className="eyebrow">
          {label === "左侧游戏" ? "FILE A" : "FILE B"} / CASE STUDY
        </p>
        <label className={styles.field}>
          <span>{label}</span>
          <select
            aria-label={label}
            value={side.gameId}
            onChange={(event) => onGame(event.target.value)}
          >
            {games.map((item) => (
              <option
                key={item.id}
                value={item.id}
                disabled={item.id === otherGameId}
              >
                {item.name}
                {item.id === otherGameId ? "（另一侧已选）" : ""}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>{label === "左侧游戏" ? "左侧研究范围" : "右侧研究范围"}</span>
          <select
            aria-label={label === "左侧游戏" ? "左侧研究范围" : "右侧研究范围"}
            value={side.scopeId}
            onChange={(event) => onScope(event.target.value)}
          >
            {scopes
              .filter((scope) => scope.gameId === game.id)
              .map((scope) => (
                <option key={scope.id} value={scope.id}>
                  {scope.label}
                  {scope.id === game.defaultScopeId ? "（默认）" : ""}
                </option>
              ))}
          </select>
        </label>
        <Link className={styles.caseLink} href={`/games/${game.id}`}>
          打开完整案例 →
        </Link>
      </div>
    </section>
  );
}

function Notes({ title, items }: { title: string; items: string[] }) {
  return (
    <section className={styles.notes}>
      <h3>{title}</h3>
      <ul>
        {items.map((note, index) => (
          <li key={`${index}-${note}`}>{note}</li>
        ))}
      </ul>
    </section>
  );
}

function StructureFile({ side }: { side: Side }) {
  const game = getGame(side.gameId)!;
  const defaultRange = scopeLabel(game.defaultScopeId);
  const isDefault = side.scopeId === game.defaultScopeId;
  const build = getInstances(game.id, side.scopeId).filter(
    (instance) =>
      mechanics.find((mechanic) => mechanic.id === instance.mechanicId)
        ?.dimension === "buildcraft",
  );
  return (
    <article className={styles.structureFile}>
      <header className={styles.fileHeader}>
        <p className="eyebrow">STRUCTURE FILE</p>
        <h2>{game.name}</h2>
        <p>当前机制范围：{scopeLabel(side.scopeId)}</p>
      </header>
      <div className={styles.paper}>
        <p className={styles.paperLabel}>默认范围档案 / {defaultRange}</p>
        {!isDefault && (
          <p className={styles.rangeWarning}>
            你已切换到其他研究范围。以下循环、资源与成长笔记仍属于默认范围，不能据此判断当前模式。
          </p>
        )}
        <p className={styles.small}>
          循环、资源与成长为资料整理及编辑归纳；具体规则以逐项观察和引用来源为准。
        </p>
        <Notes title="核心循环 · 编辑归纳" items={game.coreLoop} />
        <Notes title="资源与经济 · 资料笔记" items={game.resourceNotes} />
        <Notes title="成长与延续 · 资料笔记" items={game.progressionNotes} />
      </div>
      <section className={styles.buildSection}>
        <h3>构筑与配置 · 当前范围的观察</h3>
        <p className={styles.small}>
          {scopeLabel(side.scopeId)}；未收录的构筑机制保持未知。
        </p>
        {build.length ? (
          <ul className={styles.buildList}>
            {build.map((instance) => (
              <li key={instance.id}>
                <div className={styles.buildTitle}>
                  <Link href={`/mechanics/${instance.mechanicId}`}>
                    {
                      mechanics.find(
                        (mechanic) => mechanic.id === instance.mechanicId,
                      )?.name
                    }
                  </Link>
                  <StateBadge status={instance.status} />
                </div>
                <Observation instance={instance} />
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.inlineEmpty}>此范围尚未收录构筑与配置观察。</p>
        )}
      </section>
      <details className={styles.referenceDetails}>
        <summary>官方介绍与来源边界</summary>
        <p className={styles.small}>
          默认档案范围：{defaultRange}
          。官方介绍的资料整理与上方编辑归纳分别展示；本批资料未安装实测。
        </p>
        <Notes title="官方介绍观察 · 默认档案" items={game.factNotes} />
        <p className={styles.small}>{game.scopeNotes}</p>
        <SourceLinks ids={game.sourceIds} />
      </details>
    </article>
  );
}

export default function Compare({
  initialLeft,
  initialRight,
}: {
  initialLeft?: string;
  initialRight?: string;
}) {
  const [initialGames] = useState(() => resolvePair(initialLeft, initialRight));
  const [left, setLeft] = useState<Side>({
    gameId: initialGames[0].id,
    scopeId: initialGames[0].defaultScopeId,
  });
  const [right, setRight] = useState<Side>({
    gameId: initialGames[1].id,
    scopeId: initialGames[1].defaultScopeId,
  });
  const [view, setView] = useState<View>("mechanics");
  const [dimension, setDimension] = useState("all");
  const [differencesOnly, setDifferencesOnly] = useState(true);
  const [page, setPage] = useState(1);
  const leftGame = getGame(left.gameId)!;
  const rightGame = getGame(right.gameId)!;
  const leftInstances = getInstances(left.gameId, left.scopeId);
  const rightInstances = getInstances(right.gameId, right.scopeId);
  const rows = useMemo(
    () =>
      mechanics.map((mechanic) => ({
        mechanic,
        left: getInstanceStatus(left.gameId, mechanic.id, left.scopeId),
        right: getInstanceStatus(right.gameId, mechanic.id, right.scopeId),
      })),
    [left, right],
  );
  const filtered = rows.filter(
    (row) =>
      (dimension === "all" || row.mechanic.dimension === dimension) &&
      (!differencesOnly || row.left !== row.right),
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const differentCount = rows.filter((row) => row.left !== row.right).length;
  const bothUnknown = rows.filter(
    (row) => row.left === "unknown" && row.right === "unknown",
  ).length;

  function changeGame(which: "left" | "right", id: string) {
    const game = getGame(id);
    if (!game || id === (which === "left" ? right.gameId : left.gameId)) return;
    (which === "left" ? setLeft : setRight)({
      gameId: id,
      scopeId: game.defaultScopeId,
    });
    setPage(1);
  }
  function changeScope(which: "left" | "right", id: string) {
    const side = which === "left" ? left : right;
    if (
      !scopes.some((scope) => scope.id === id && scope.gameId === side.gameId)
    )
      return;
    (which === "left" ? setLeft : setRight)({ ...side, scopeId: id });
    setPage(1);
  }

  return (
    <div className={styles.compare}>
      <PageHead
        eyebrow="COMPARISON DESK / 双案例研究"
        title="把两份游戏档案放在一起"
        description="先选清楚研究范围，再比较机制记录、循环结构与搜索线索。相同的标签，需要回到规则里理解。"
      />
      <div className={styles.selectionGrid}>
        <Selection
          side={left}
          label="左侧游戏"
          otherGameId={right.gameId}
          onGame={(id) => changeGame("left", id)}
          onScope={(id) => changeScope("left", id)}
        />
        <div className={styles.swap}>
          <button
            type="button"
            onClick={() => {
              setLeft(right);
              setRight(left);
              setPage(1);
            }}
            aria-label="交换左右游戏与研究范围"
          >
            ⇄<span>交换</span>
          </button>
        </div>
        <Selection
          side={right}
          label="右侧游戏"
          otherGameId={left.gameId}
          onGame={(id) => changeGame("right", id)}
          onScope={(id) => changeScope("right", id)}
        />
      </div>
      <div className={styles.viewSwitch} role="group" aria-label="对比视图">
        {(
          [
            ["mechanics", "01", "机制状态"],
            ["structure", "02", "循环与构筑"],
            ["heat", "03", "搜索热度"],
          ] as const
        ).map(([id, number, name]) => (
          <button
            type="button"
            key={id}
            aria-pressed={view === id}
            onClick={() => setView(id)}
          >
            <small>{number}</small>
            {name}
          </button>
        ))}
      </div>

      {view === "mechanics" && (
        <section aria-label="机制状态对比">
          <div className={styles.readingNote}>
            <div>
              <span className="eyebrow">READ THE RECORDS</span>
              <h2>先看记录状态，再核对规则差异</h2>
              <p>
                “仅看差异”比较两侧当前范围的记录状态。“尚未确认”表示证据不足；“条件成立”要连同条件阅读，“不适用”和“已确认不存在”也分别保留。
              </p>
            </div>
            <div className={styles.recordCounts}>
              <div>
                <strong>{differentCount}</strong>
                <span>项记录不同</span>
              </div>
              <div>
                <strong>{bothUnknown}</strong>
                <span>项双方未知</span>
              </div>
            </div>
          </div>
          <Window
            title="MECHANIC MATRIX / 机制对照表"
            extra={<span>{mechanics.length} 项收录机制</span>}
            className={styles.matrixWindow}
          >
            <div className={styles.filters}>
              <label className={styles.field}>
                <span>主维度</span>
                <select
                  value={dimension}
                  onChange={(event) => {
                    setDimension(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">全部主维度</option>
                  {dimensions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <div
                className={styles.recordSwitch}
                role="group"
                aria-label="记录筛选"
              >
                <button
                  type="button"
                  aria-pressed={differencesOnly}
                  onClick={() => {
                    setDifferencesOnly(true);
                    setPage(1);
                  }}
                >
                  仅看差异
                </button>
                <button
                  type="button"
                  aria-pressed={!differencesOnly}
                  onClick={() => {
                    setDifferencesOnly(false);
                    setPage(1);
                  }}
                >
                  全部记录
                </button>
              </div>
              <p className={styles.resultCount} aria-live="polite">
                {filtered.length} 项符合筛选
              </p>
            </div>
            <p className={styles.tableNote}>
              展开“证据与条件”可核对来源。全部记录包含双方尚未确认的机制。
            </p>
            {visible.length ? (
              <table className={styles.table}>
                <caption className="sr-only">
                  {leftGame.name}与{rightGame.name}的机制记录对比，第
                  {currentPage}页，共{pageCount}页
                </caption>
                <colgroup>
                  <col className={styles.mechanicColumn} />
                  <col />
                  <col />
                </colgroup>
                <thead>
                  <tr>
                    <th scope="col">机制 / 主维度</th>
                    <th scope="col">
                      <span>{leftGame.name}</span>
                      <small>{scopeLabel(left.scopeId)}</small>
                    </th>
                    <th scope="col">
                      <span>{rightGame.name}</span>
                      <small>{scopeLabel(right.scopeId)}</small>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((row) => (
                    <tr
                      key={row.mechanic.id}
                      className={
                        row.left !== row.right ? styles.differentRow : ""
                      }
                    >
                      <th scope="row">
                        <Link href={`/mechanics/${row.mechanic.id}`}>
                          {row.mechanic.name} ↗
                        </Link>
                        <span className={styles.dimension}>
                          {
                            dimensions.find(
                              (item) => item.id === row.mechanic.dimension,
                            )?.name
                          }
                        </span>
                      </th>
                      <td>
                        <StateBadge status={row.left} />
                        <Observation
                          instance={leftInstances.find(
                            (instance) =>
                              instance.mechanicId === row.mechanic.id,
                          )}
                        />
                      </td>
                      <td>
                        <StateBadge status={row.right} />
                        <Observation
                          instance={rightInstances.find(
                            (instance) =>
                              instance.mechanicId === row.mechanic.id,
                          )}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState
                title="这个筛选下没有记录差异"
                description="两侧可能记录相同，也可能都尚未确认。查看全部记录，继续核对证据。"
              >
                <button
                  type="button"
                  className="button primary"
                  onClick={() => {
                    setDimension("all");
                    setDifferencesOnly(false);
                    setPage(1);
                  }}
                >
                  查看全部机制
                </button>
              </EmptyState>
            )}
            <nav className={styles.pagination} aria-label="机制对比翻页">
              <p aria-live="polite">
                第 <strong>{currentPage}</strong> / {pageCount} 页{" "}
                <span>· 每页最多 {pageSize} 项</span>
              </p>
              <div>
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  ← 上一页
                </button>
                <button
                  type="button"
                  disabled={currentPage >= pageCount}
                  onClick={() => setPage(currentPage + 1)}
                >
                  下一页 →
                </button>
              </div>
            </nav>
          </Window>
        </section>
      )}

      {view === "structure" && (
        <section aria-label="循环资源与构筑对比">
          <p className={styles.sectionIntro}>
            默认范围的结构笔记帮助理解整体循环；下方构筑观察独立遵循两侧当前选择的范围。
          </p>
          <div className={styles.twoFiles}>
            <StructureFile side={left} />
            <StructureFile side={right} />
          </div>
        </section>
      )}
      {view === "heat" && (
        <section aria-label="搜索热度对比">
          <div className={styles.readingNote}>
            <div>
              <p className="eyebrow">SEARCH SIGNAL / 数据口径</p>
              <h2>游戏搜索，是继续研究的线索</h2>
              <p>
                这里比较分配到两款游戏主题的搜索次数，数据不随上方研究范围切换。各项读数附有来源标签；搜索次数不能说明玩家偏好哪项机制，也不代表销量。
              </p>
            </div>
          </div>
          <div className={styles.twoFiles}>
            {[leftGame, rightGame].map((game) => (
              <Window title={`SEARCH FILE / ${game.name}`} key={game.id}>
                <HeatProfileMini topicId={`game:${game.id}`} />
              </Window>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
