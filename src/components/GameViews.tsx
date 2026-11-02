"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
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
  sources,
} from "@/lib/knowledge";
import {
  EmptyState,
  LoopDiagram,
  StateBadge,
  stateLabels,
  Window,
} from "./Primitives";
import { HeatProfileMini } from "./HeatCharts";
import { listGameScopes } from "@/lib/graph-layout";
import { evidenceLabels } from "@/lib/evidence-labels";
import { gameMechanicOverview } from "@/lib/game-mechanic-overview";
import GameMechanicInventory from "./GameMechanicInventory";
import { MechanicComicLink } from "./MechanicVisuals";
import reading from "./ContinuousReading.module.css";

export default function GameViews({ game }: { game: Game }) {
  const query = useSearchParams();
  const scopeValues = query.getAll("scope");
  const availableScopes = listGameScopes(scopes, game.id, game.defaultScopeId);
  const requestedScope =
    scopeValues.length === 1 &&
    availableScopes.some((scope) => scope.id === scopeValues[0])
      ? scopeValues[0]
      : game.defaultScopeId;
  return (
    <ScopedGameViews
      key={`${game.id}/${requestedScope}`}
      game={game}
      initialScopeId={requestedScope}
    />
  );
}
function ScopedGameViews({
  game,
  initialScopeId,
}: {
  game: Game;
  initialScopeId: string;
}) {
  const [scopeId, setScopeId] = useState(initialScopeId),
    [showUnknown, setShowUnknown] = useState(false);
  const [relationFocus, setRelationFocus] = useState("");
  const overview = gameMechanicOverview(game.id, scopeId);
  const availableScopes = listGameScopes(scopes, game.id, game.defaultScopeId);
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
  const activeFocus =
    positive.find((o) => o.mechanicId === relationFocus)?.mechanicId ??
    positive[0]?.mechanicId;
  const displayed = positive;
  const displayedIds = new Set(displayed.map((o) => o.mechanicId));
  const displayedRelations = localRelations.filter(
    (r) => displayedIds.has(r.from) && displayedIds.has(r.to),
  );
  const positions = displayed.map((observation, index) => ({
    id: observation.mechanicId,
    x: 125 + (index % 3) * 250,
    y: 60 + Math.floor(index / 3) * 100,
    observation,
  }));
  return (
    <>
      <nav className={reading.chapters} aria-label="游戏研究章节">
        {(
          [
            ["mechanics", "机制记录"],
            ["loop", "核心循环"],
            ["relations", "机制关系"],
            ["heat", "搜索资料"],
          ] as const
        ).map(([id, label]) => (
          <a key={id} href={`#game-${game.id}-${id}`}>
            {label} ↓
          </a>
        ))}
      </nav>
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
      <section
        id={`game-${game.id}-mechanics`}
        className={reading.chapter}
        aria-label="机制记录"
      >
        <h2>01 / 机制记录</h2>
        <p className="scope-notice">
          {currentScope.label}
          ：下列记录只介绍这个范围。未列出的机制仍需查证；“条件成立”要连同具体条件查看。
        </p>
        <div className="scope-box" aria-label="核心交互概览">
          <strong>核心交互可以有多种</strong>
          <p>
            移动、跳跃、攻击可以在同一款游戏中并存。这个维度用来区分操作方式，不是给游戏选出唯一的核心玩法。
          </p>
          {overview.interactionIds.length > 0 && (
            <p>
              当前已收录：
              {overview.interactionIds
                .map((id) => getMechanic(id)?.name)
                .join(" / ")}
              。
            </p>
          )}
        </div>
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
                    {dimensions.find((d) => d.id === mechanic.dimension)?.name}
                  </span>
                  <p>{observation.rationale}</p>
                  <MechanicComicLink id={mechanic.id} />
                  <span className="scope-label">
                    记录范围：
                    {observation.scopeNote || currentScope.label}
                  </span>
                  {observation.condition && (
                    <p className="condition-note">
                      成立条件：{observation.condition}
                    </p>
                  )}
                  <p className="evidence-tag">
                    {evidenceLabels[observation.evidenceKind]}
                  </p>
                  <details>
                    <summary>查看来源</summary>
                    <ul className="content-list">
                      {observation.sourceIds
                        .map((id) => sources.find((source) => source.id === id))
                        .filter((source) => source !== undefined)
                        .map((source) => (
                          <li key={source.id}>
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {source.title} ↗
                            </a>
                            <span className="tiny muted">
                              {" "}
                              · 核验 {source.checkedAt}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </details>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="这个范围还没有机制记录"
            description="资料仍待补充。切换游戏模式或范围，可以查看其他已收录的记录。"
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
          {showUnknown ? "收起" : "查看"}尚未确认的机制（{unknown.length}）{" "}
          {showUnknown ? "−" : "＋"}
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
          {game.resourceNotes.length > 0 && (
            <Window title="RESOURCES / 资源与约束">
              <p className="analysis-label">默认研究范围的编辑归纳</p>
              <ul className="content-list">
                {game.resourceNotes.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </Window>
          )}
          <Window title="PROGRESSION / 成长与保留">
            <p className="analysis-label">默认研究范围的编辑归纳</p>
            <ul className="content-list">
              {game.progressionNotes.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          </Window>
        </div>
      </section>
      <section
        id={`game-${game.id}-loop`}
        className={reading.chapter}
        aria-label="核心循环"
      >
        <h2>02 / 核心循环</h2>
        {scopeId === game.defaultScopeId ? (
          <>
            <Window title="CORE LOOP / 编辑归纳">
              <p className="scope-notice">
                以下为 {currentScope.label} 的主要玩法步骤。
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
              {game.caveats.length > 0 && (
                <div className="small-card">
                  <h3 className="gold">阅读时需要注意</h3>
                  <ul className="content-list">
                    {game.caveats.map((text) => (
                      <li key={text}>{text}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        ) : (
          <EmptyState
            title="这个模式的循环还未整理"
            description="目前只整理了默认范围的核心循环，可切换后查看。"
          >
            <button
              className="button primary"
              onClick={() => setScopeId(game.defaultScopeId)}
            >
              查看默认范围的循环 →
            </button>
          </EmptyState>
        )}
      </section>
      <section
        id={`game-${game.id}-relations`}
        className={reading.chapter}
        aria-label="机制关系"
      >
        <h2>03 / 机制关系</h2>
        <Window title="RELATION VIEW / 当前范围的机制关系">
          <p className="scope-notice">
            图中只展示这个范围内已确认出现或有条件出现的机制。连线是设计分析，具体用法请查看说明和来源。
          </p>
          {positive.length ? (
            <>
              <GameMechanicInventory
                entries={overview.entries}
                selected={activeFocus}
                onSelect={setRelationFocus}
              />
              <label
                className="field-label"
                htmlFor={`relation-focus-${game.id}`}
              >
                查看机制
              </label>
              <select
                id={`relation-focus-${game.id}`}
                value={activeFocus}
                onChange={(event) => {
                  setRelationFocus(event.target.value);
                }}
              >
                {positive.map((o) => (
                  <option key={o.mechanicId} value={o.mechanicId}>
                    {getMechanic(o.mechanicId)!.name}
                  </option>
                ))}
              </select>
              <p className="tiny muted">
                图中列出当前范围的全部已收录机制。选择机制只改变高亮，不会隐藏其他方向。
              </p>
              <div
                className="case-relation-scroll"
                role="region"
                aria-label="完整机制关系图，可横向查看"
              >
                <svg
                  className="case-relation-graph"
                  viewBox={`0 0 760 ${Math.max(180, Math.ceil(positions.length / 3) * 100 + 30)}`}
                  role="img"
                  aria-label={`${game.name}当前范围的机制关系`}
                >
                  <g fill="none" stroke="#ac8ac7" strokeWidth="1.5">
                    {displayedRelations.map((relation) => {
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
                          fill={
                            position.id === activeFocus ? "#51405e" : "#31273f"
                          }
                          strokeWidth={position.id === activeFocus ? 3 : 1}
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
                          {dimension.name} /{" "}
                          {stateLabels[position.observation.status]}
                        </text>
                      </Link>
                    );
                  })}
                </svg>
              </div>
              {displayedRelations.length ? (
                <ul className="content-list">
                  {displayedRelations.map((relation) => (
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
                  这些机制的关系还未整理，暂不绘制连线。
                </p>
              )}
              <Link
                className="button"
                href={`/graph?game=${game.id}&scope=${encodeURIComponent(scopeId)}`}
              >
                在完整交互图谱中查看 ↗
              </Link>
            </>
          ) : (
            <EmptyState
              title="当前范围暂无可展示的机制"
              description="可切换模式或范围，或查看上方的全部机制记录。"
            />
          )}
        </Window>
      </section>
      <section
        id={`game-${game.id}-heat`}
        className={reading.chapter}
        aria-label="搜索资料"
      >
        <h2>04 / 搜索资料</h2>
        <Window title="SEARCH CONTEXT / 搜索资料">
          <p className="scope-notice">
            搜索游戏名的人可能在找攻略、新闻或其他资料，不能据此判断他们关注哪项机制。
          </p>
          <div className="type-chips">
            {game.genreIds.map((id) => (
              <Link className="chip" href={`/heat?topic=genre:${id}`} key={id}>
                {genres.find((genre) => genre.id === id)?.name || id} ↗
              </Link>
            ))}
          </div>
          <div className="signal warn">
            搜索资料的来源、时间和指标见下方标签。搜索次数与游戏收录数量分别展示。
          </div>
          <HeatProfileMini topicId={`game:${game.id}`} />
        </Window>
      </section>
    </>
  );
}
