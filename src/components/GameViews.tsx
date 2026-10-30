"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Game } from "@/lib/model";
import {
  dimensions,
  genres,
  getInstanceStatus,
  getInstances,
  getMechanic,
  mechanics,
  relationships,
  scopes,
} from "@/lib/knowledge";
import { EmptyState, LoopDiagram, StateBadge, stateLabels, Window } from "./Primitives";
import { HeatProfileMini } from "./HeatCharts";

type GameView = "mechanics" | "loop" | "relations" | "heat";
export default function GameViews({ game }: { game: Game }) {
  const [scopeId, setScopeId] = useState(game.defaultScopeId),
    [view, setView] = useState<GameView>("mechanics"),
    [showUnknown, setShowUnknown] = useState(false);
  const availableScopes = scopes.filter(
    (scope) =>
      scope.gameId === game.id &&
      (scope.kind === "mode" || scope.id === game.defaultScopeId),
  );
  const currentScope = scopes.find((s) => s.id === scopeId)!;
  const observations = getInstances(game.id, scopeId),
    unknown = mechanics.filter(
      (m) => getInstanceStatus(game.id, m.id, scopeId) === "unknown",
    );
  const positive = observations.filter(
    (o) => o.status === "present" || o.status === "conditional",
  );
  const ids = new Set(positive.map((o) => o.mechanicId));
  const localRelations = relationships.filter(
    (r) => ids.has(r.from) && ids.has(r.to),
  );
  const positions = positive.map((observation, index) => ({
    id: observation.mechanicId,
    x:
      positive.length === 1
        ? 380
        : 380 +
          250 *
            Math.cos(-Math.PI / 2 + (index * Math.PI * 2) / positive.length),
    y:
      positive.length === 1
        ? 150
        : 160 +
          95 * Math.sin(-Math.PI / 2 + (index * Math.PI * 2) / positive.length),
    observation,
  }));
  return (
    <>
      <div
        className="tabs game-detail-tabs"
        role="tablist"
        aria-label="游戏研究视图"
      >
        {(
          [
            ["mechanics", "机制视图"],
            ["loop", "循环视图"],
            ["relations", "关系视图"],
            ["heat", "热度标签"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={view === id}
            aria-controls={`game-panel-${game.id}`}
            className={view === id ? "active" : ""}
            onClick={() => setView(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="scope-control">
        <label htmlFor={`scope-${game.id}`}>当前研究范围</label>
        <select
          id={`scope-${game.id}`}
          value={scopeId}
          onChange={(event) => {
            setScopeId(event.target.value);
            setShowUnknown(false);
          }}
        >
          {availableScopes.map((scope) => (
            <option key={scope.id} value={scope.id}>
              {scope.label}
            </option>
          ))}
        </select>
        <span className="tiny muted">切换范围可查看对应的机制记录</span>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.section
          id={`game-panel-${game.id}`}
          role="tabpanel"
          key={view}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
          className="game-view-panel"
        >
          {view === "mechanics" && (
            <>
              <p className="scope-notice">
                {currentScope.label}
                ：下列观察仅适用于标注范围。未收录的机制保持未知；“条件成立”需连同条件说明阅读。
              </p>
              {observations.length ? (
                <div className="observation-cards">
                  {observations.map((observation) => {
                    const mechanic = getMechanic(observation.mechanicId)!;
                    return (
                      <div className="observation-card" key={observation.id}>
                        <StateBadge status={observation.status} />
                        <h3>
                          <Link href={`/mechanics/${mechanic.id}`}>
                            {mechanic.name} ↗
                          </Link>
                        </h3>
                        <span className="chip">
                          {
                            dimensions.find((d) => d.id === mechanic.dimension)
                              ?.name
                          }
                        </span>
                        <p>{observation.rationale}</p>
                        <span className="scope-label">
                          原观察：{observation.scopeNote || currentScope.label}
                        </span>
                        {observation.condition && (
                          <p className="condition-note">
                            成立条件：{observation.condition}
                          </p>
                        )}
                        <p className="evidence-tag">开发者或发行商正式说明</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title="这个范围尚无足够观察"
                  description="这个范围尚未收录足够资料，机制状态保留为未知。可切换范围查看已有记录。"
                />
              )}
              <div className="state-legend">
                {(
                  [
                    "present",
                    "absent",
                    "not_applicable",
                    "unknown",
                    "conditional",
                  ] as const
                ).map((status) => (
                  <StateBadge key={status} status={status} />
                ))}
              </div>
              <button
                className="text-button"
                onClick={() => setShowUnknown((value) => !value)}
                aria-expanded={showUnknown}
              >
                {showUnknown ? "收起" : "查看"}尚未确认的机制（{unknown.length}
                ） {showUnknown ? "−" : "＋"}
              </button>
              {showUnknown && (
                <div className="unknown-grid">
                  {unknown.map((mechanic) => (
                    <Link href={`/mechanics/${mechanic.id}`} key={mechanic.id}>
                      <span>{mechanic.name}</span>
                      <StateBadge status="unknown" />
                    </Link>
                  ))}
                </div>
              )}
              <div className="detail-section generic-grid">
                <Window title="RESOURCES / 资源与约束">
                  <p className="analysis-label">默认研究范围的编辑归纳</p>
                  <ul className="content-list">
                    {game.resourceNotes.map((text) => (
                      <li key={text}>{text}</li>
                    ))}
                  </ul>
                </Window>
                <Window title="PROGRESSION / 成长与保留">
                  <p className="analysis-label">默认研究范围的编辑归纳</p>
                  <ul className="content-list">
                    {game.progressionNotes.map((text) => (
                      <li key={text}>{text}</li>
                    ))}
                  </ul>
                </Window>
              </div>
            </>
          )}
          {view === "loop" && (
            <>
              {scopeId === game.defaultScopeId ? (
                <>
                  <Window title="CORE LOOP / 编辑归纳">
                    <p className="scope-notice">
                      以下为 {currentScope.label}{" "}
                      的流程概括，不代替完整规则手册。
                    </p>
                    <LoopDiagram steps={game.coreLoop} />
                  </Window>
                  <div className="detail-section generic-grid">
                    <div className="paper">
                      <h2>可借鉴之处</h2>
                      <ul>
                        {game.learning.map((text) => (
                          <li key={text}>{text}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="small-card">
                      <h3 className="gold">这份归纳的边界</h3>
                      <ul className="content-list">
                        {game.caveats.map((text) => (
                          <li key={text}>{text}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </>
              ) : (
                <EmptyState
                  title="此模式的完整循环尚未整理"
                  description="目前仅整理了默认范围的循环，可返回查看。"
                >
                  <button
                    className="button primary"
                    onClick={() => setScopeId(game.defaultScopeId)}
                  >
                    查看默认范围的循环 →
                  </button>
                </EmptyState>
              )}
            </>
          )}
          {view === "relations" && (
            <Window title="RELATION VIEW / 当前范围的机制与编辑关系">
              <p className="scope-notice">
                仅显示当前范围中“已确认存在”或“条件成立”的机制。连线来自编辑分析，需连同具体情境阅读，相关玩法细则尚未全部核验。
              </p>
              {positive.length ? (
                <>
                  <svg
                    className="case-relation-graph"
                    viewBox="0 0 760 330"
                    role="img"
                    aria-label={`${game.name}当前范围的机制关系`}
                  >
                    <g fill="none" stroke="#ac8ac7" strokeWidth="1.5">
                      {localRelations.map((relation) => {
                        const from = positions.find(
                            (p) => p.id === relation.from,
                          )!,
                          to = positions.find((p) => p.id === relation.to)!;
                        return (
                          <g key={relation.id}>
                            <path
                              className="flow-path"
                              strokeDasharray="5 7"
                              d={`M${from.x} ${from.y} Q380 160 ${to.x} ${to.y}`}
                            />
                            <title>
                              {relation.context}：{relation.rationale}
                            </title>
                          </g>
                        );
                      })}
                    </g>
                    {positions.map((position) => {
                      const mechanic = getMechanic(position.id)!;
                      const dimension = dimensions.find(
                        (d) => d.id === mechanic.dimension,
                      )!;
                      return (
                        <Link
                          href={`/mechanics/${position.id}`}
                          key={position.id}
                        >
                          <rect
                            x={position.x - 85}
                            y={position.y - 28}
                            width="170"
                            height="56"
                            fill="#31273f"
                            stroke={dimension.color}
                          />
                          <text
                            x={position.x}
                            y={position.y - 3}
                            textAnchor="middle"
                            fill="#d9c3e9"
                            fontSize="13"
                          >
                            {mechanic.name}
                          </text>
                          <text
                            x={position.x}
                            y={position.y + 16}
                            textAnchor="middle"
                            fill="#a698b5"
                            fontSize="9"
                          >
                            {dimension.name} / {stateLabels[position.observation.status]}
                          </text>
                        </Link>
                      );
                    })}
                  </svg>
                  {localRelations.length ? (
                    <ul className="content-list">
                      {localRelations.map((relation) => (
                        <li key={relation.id}>
                          <strong>
                            {getMechanic(relation.from)?.name} ↔{" "}
                            {getMechanic(relation.to)?.name}
                          </strong>
                          <br />
                          {relation.context}：{relation.rationale}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="evidence-note">
                      这些机制之间尚未收录关系说明，图中暂不连线。
                    </p>
                  )}
                  <Link className="button" href={`/graph?game=${game.id}`}>
                    在完整交互图谱中查看 ↗
                  </Link>
                </>
              ) : (
                <EmptyState
                  title="当前范围暂无可展示的机制"
                  description="这里展示已确认存在或条件成立的机制。可切换范围，或返回机制视图查看全部记录状态。"
                />
              )}
            </Window>
          )}
          {view === "heat" && (
            <Window title="SEARCH CONTEXT / 搜索关注的研究口径">
              <p className="scope-notice">
                游戏名称的搜索可作为相关类型与机制的间接线索，但无法确认玩家具体关注哪项机制。
              </p>
              <div className="type-chips">
                {game.genreIds.map((id) => (
                  <Link
                    className="chip"
                    href={`/heat?topic=genre:${id}`}
                    key={id}
                  >
                    {genres.find((genre) => genre.id === id)?.name || id} ↗
                  </Link>
                ))}
              </div>
              <div className="signal warn">
                默认搜索数据为合成示例。导入后的来源见下方标签。搜索次数不等于独立人数，游戏收录数量也不代表搜索热度。
              </div>
              <HeatProfileMini topicId={`game:${game.id}`} />
            </Window>
          )}
        </motion.section>
      </AnimatePresence>
    </>
  );
}
