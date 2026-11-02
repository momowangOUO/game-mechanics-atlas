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
  return (
    scopes.find((scope) => scope.id === scopeId)?.label ?? "适用范围待补充"
  );
}

function SourceLinks({ ids }: { ids: string[] }) {
  const selected = sources.filter((source) => ids.includes(source.id));
  if (!selected.length)
    return <p className={styles.small}>这条记录暂未附来源。</p>;
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
  if (!instance)
    return <p className={styles.unknown}>这个范围还没有相关记录。</p>;
  return (
    <div className={styles.observation}>
      <h4>证据与条件</h4>
      <p className={styles.evidence}>{evidenceLabels[instance.evidenceKind]}</p>
      <p>{instance.rationale}</p>
      {instance.condition && (
        <p className={styles.condition}>{instance.condition}</p>
      )}
      {instance.scopeNote && (
        <p className={styles.small}>原始范围：{instance.scopeNote}</p>
      )}
      <SourceLinks ids={instance.sourceIds} />
    </div>
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
  if (!items.length) return null;
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
        <p className={styles.paperLabel}>
          玩法笔记 / {scopeLabel(side.scopeId)}
        </p>
        {isDefault ? (
          <>
            <p className={styles.small}>
              以下是根据资料整理的玩法笔记，具体规则请核对机制记录与原始来源。
            </p>
            <Notes title="核心循环 · 编辑归纳" items={game.coreLoop} />
            <Notes title="资源与经济 · 资料笔记" items={game.resourceNotes} />
            <Notes
              title="成长与延续 · 资料笔记"
              items={game.progressionNotes}
            />
          </>
        ) : (
          <p className={styles.rangeWarning}>
            这个范围的循环、资源与成长笔记还未整理。可切换到默认范围查看已有笔记。
          </p>
        )}
      </div>
      <section className={styles.buildSection}>
        <h3>构筑与配置 · 当前范围</h3>
        <p className={styles.small}>
          {scopeLabel(side.scopeId)}；未列出的构筑机制仍需查证。
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
          <p className={styles.inlineEmpty}>这个范围还没有构筑与配置记录。</p>
        )}
      </section>
      <details className={styles.referenceDetails}>
        <summary>官方介绍与资料来源</summary>
        <p className={styles.small}>
          默认档案范围：{defaultRange}
          。以下内容根据官方资料整理，未经过游戏内实测。
        </p>
        <Notes title="官方介绍 · 默认范围" items={game.factNotes} />
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
  const [dimension, setDimension] = useState("all");
  const [differencesOnly, setDifferencesOnly] = useState(true);
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
  const visible = filtered;
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
  }
  function changeScope(which: "left" | "right", id: string) {
    const side = which === "left" ? left : right;
    if (
      !scopes.some((scope) => scope.id === id && scope.gameId === side.gameId)
    )
      return;
    (which === "left" ? setLeft : setRight)({ ...side, scopeId: id });
  }

  return (
    <div className={styles.compare}>
      <PageHead
        eyebrow="COMPARISON DESK / 双案例研究"
        title="游戏对比"
        description="选择两款游戏及其模式，比较机制、循环、资源与构筑方式。"
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
      <nav className={styles.viewSwitch} aria-label="对比章节">
        {(
          [
            ["mechanics", "01", "机制记录"],
            ["structure", "02", "循环与构筑"],
            ["heat", "03", "搜索热度"],
          ] as const
        ).map(([id, number, name]) => (
          <a key={id} href={`#compare-${id}`}>
            <small>{number}</small>
            {name} ↓
          </a>
        ))}
      </nav>

      <section
        id="compare-mechanics"
        className={styles.chapter}
        aria-label="机制记录对比"
      >
        <div className={styles.readingNote}>
          <div>
            <span className="eyebrow">READ THE RECORDS</span>
            <h2>对照机制记录，查看规则差异</h2>
            <p>
              “仅看差异”比较两侧所选范围的记录。遇到“条件成立”，请连同适用条件查看；“尚未确认”表示资料不足，不等于没有这项机制。
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
                }}
              >
                仅看差异
              </button>
              <button
                type="button"
                aria-pressed={!differencesOnly}
                onClick={() => {
                  setDifferencesOnly(false);
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
            每项记录下方列出证据、条件和来源。全部记录包含双方尚未确认的机制。
          </p>
          {visible.length ? (
            <table className={styles.table}>
              <caption className="sr-only">
                {leftGame.name}与{rightGame.name}的全部筛选机制记录对比
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
                    <td
                      data-label={`${leftGame.name} · ${scopeLabel(left.scopeId)}`}
                    >
                      <StateBadge status={row.left} />
                      <Observation
                        instance={leftInstances.find(
                          (instance) => instance.mechanicId === row.mechanic.id,
                        )}
                      />
                    </td>
                    <td
                      data-label={`${rightGame.name} · ${scopeLabel(right.scopeId)}`}
                    >
                      <StateBadge status={row.right} />
                      <Observation
                        instance={rightInstances.find(
                          (instance) => instance.mechanicId === row.mechanic.id,
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
              description="两侧可能记录相同，也可能都还未确认。切换“全部记录”可继续查看。"
            >
              <button
                type="button"
                className="button primary"
                onClick={() => {
                  setDimension("all");
                  setDifferencesOnly(false);
                }}
              >
                查看全部机制
              </button>
            </EmptyState>
          )}
        </Window>
      </section>
      <section
        id="compare-structure"
        className={styles.chapter}
        aria-label="循环资源与构筑对比"
      >
        <h2>02 / 循环与构筑</h2>
        <p className={styles.sectionIntro}>
          各项内容对应两侧当前选择；尚未整理的范围会标明缺少记录。
        </p>
        <div className={styles.twoFiles}>
          <StructureFile side={left} />
          <StructureFile side={right} />
        </div>
      </section>
      <section
        id="compare-heat"
        className={styles.chapter}
        aria-label="搜索热度对比"
      >
        <div className={styles.readingNote}>
          <div>
            <p className="eyebrow">SEARCH SIGNAL / 搜索记录</p>
            <h2>搜索关注不等于玩法偏好</h2>
            <p>
              这里比较导入记录中与两款游戏相关的搜索次数，不随上方模式切换。来源见标签；这些次数不能说明玩家偏好哪项机制，也不代表销量。
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
    </div>
  );
}
