"use client";

import Link from "next/link";
import { MechanicIcon, MechanicExamples } from "./MechanicVisuals";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  MarkerType,
  useNodesState,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import {
  dimensions,
  games,
  getGame,
  getMechanic,
  getMechanicSupply,
  getRelatedGames,
  mechanics,
  recipes,
  relationships,
  scopes,
} from "@/lib/knowledge";
import { EmptyState, PageHead, Window, StateBadge } from "./Primitives";
import { useUI } from "./Providers";
import { gameMechanicOverview } from "@/lib/game-mechanic-overview";
import GameMechanicInventory from "./GameMechanicInventory";
import {
  dimensionGrid,
  neighborhoodGrid,
  listGameScopes,
} from "@/lib/graph-layout";

type GraphNode = Node<
  {
    label: string;
    dimension: string;
    color: string;
    focused: boolean;
    onSelect: (id: string) => void;
  },
  "mechanic"
>;
const relationNames = {
  dependency: "依赖",
  synergy: "协同",
  alternative: "替代",
  conflict: "张力",
  resource_supply: "资源供给",
  rule_rewrite: "规则改写",
  feedback: "双向反馈",
};
const MechanicNode = memo(function MechanicNode({
  id,
  data,
}: NodeProps<GraphNode>) {
  return (
    <div
      className={`atlas-node ${data.focused ? "focused" : ""}`}
      style={{ borderColor: data.color }}
      role="button"
      tabIndex={0}
      aria-label={`选择机制 ${data.label}`}
      onClick={() => data.onSelect(id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          data.onSelect(id);
        }
      }}
    >
      <Handle type="target" position={Position.Left} isConnectable={false} />
      <span className="tiny" style={{ color: data.color }}>
        {data.dimension}
      </span>
      <MechanicIcon id={id} size={38} />
      <strong>{data.label}</strong>
      <span className="node-detail">点选查看详情 →</span>
      <Handle type="source" position={Position.Right} isConnectable={false} />
    </div>
  );
});
const nodeTypes = { mechanic: MechanicNode };

function GraphCanvas({
  ids,
  edges,
  focused,
  mode,
  onSelect,
}: {
  ids: string[];
  edges: Edge[];
  focused: string;
  mode: string;
  onSelect: (id: string) => void;
}) {
  const initialNodes = useMemo<GraphNode[]>(() => {
    const layout =
      mode === "all"
        ? dimensionGrid(
            ids,
            dimensions.map((d) => d.id),
            (id) => getMechanic(id)!.dimension,
          )
        : neighborhoodGrid(ids, mode === "game" ? "" : focused);
    return ids.map((id) => {
      const mechanic = getMechanic(id)!;
      const dimension = dimensions.find((d) => d.id === mechanic.dimension)!;
      const { x, y } = layout.get(id)!;
      return {
        id,
        type: "mechanic",
        position: { x, y },
        data: {
          label: mechanic.name,
          dimension: dimension.name,
          color: dimension.color,
          focused: id === focused,
          onSelect,
        },
        ariaRole: "group",
      };
    });
  }, [ids, focused, mode, onSelect]);
  const [nodes, setNodes, onNodesChange] =
    useNodesState<GraphNode>(initialNodes);
  useEffect(() => {
    setNodes((previous) =>
      previous.map((node) => {
        const next = initialNodes.find((n) => n.id === node.id);
        return next ? { ...node, data: next.data } : node;
      }),
    );
  }, [initialNodes, setNodes]);
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      fitView
      fitViewOptions={{ padding: 0.25 }}
      minZoom={0.18}
      maxZoom={2}
      nodesConnectable={false}
      elementsSelectable
      onNodeClick={(_, node) => onSelect(node.id)}
      onInit={(instance) => {
        requestAnimationFrame(() => instance.fitView({ padding: 0.25 }));
      }}
      proOptions={{ hideAttribution: false }}
    >
      <Background color="#5b4968" gap={22} size={1} />
      <Controls showInteractive={false} />
      <MiniMap
        nodeColor={(node) => String(node.data.color)}
        maskColor="#11121dcc"
        pannable
        zoomable
      />
    </ReactFlow>
  );
}

export default function AtlasGraph({
  initialFocus = "",
  initialGame = "",
  initialScope = "",
}: {
  initialFocus?: string;
  initialGame?: string;
  initialScope?: string;
}) {
  const linkedGame = getGame(initialGame);
  const openingOverview = gameMechanicOverview(
    linkedGame?.id ?? games[0].id,
    initialScope,
  );
  const [focus, setFocus] = useState(
    linkedGame
      ? openingOverview.entries.some(
          (entry) => entry.mechanic.id === initialFocus,
        )
        ? initialFocus
        : (openingOverview.entries[0]?.mechanic.id ?? "score-threshold")
      : getMechanic(initialFocus)
        ? initialFocus
        : "score-threshold",
  );
  const [mode, setMode] = useState<"neighbors" | "all" | "game">(
    getGame(initialGame) ? "game" : "neighbors",
  );
  const [gameId, setGameId] = useState(
    getGame(initialGame) ? initialGame : games[0].id,
  );
  const [scopeId, setScopeId] = useState(openingOverview.scopeId);
  const [selectedDimensions, setSelectedDimensions] = useState(
    dimensions.map((d) => d.id),
  );
  const [panel, setPanel] = useState<"file" | "combinations" | "cases">("file");
  const [pair, setPair] = useState<string | null>(null);
  const { effects } = useUI();
  const current = getMechanic(focus)!;
  const dimension = dimensions.find((d) => d.id === current.dimension)!;
  const selectNode = useCallback((id: string) => {
    setFocus(id);
    setPair(null);
  }, []);
  const neighbors = new Set([
    focus,
    ...current.relatedMechanics,
    ...relationships
      .filter((r) => r.from === focus || r.to === focus)
      .flatMap((r) => [r.from, r.to]),
  ]);
  const overview = useMemo(
    () => gameMechanicOverview(gameId, scopeId),
    [gameId, scopeId],
  );
  const gameMechanics = new Set(
    overview.entries.map((entry) => entry.mechanic.id),
  );
  const visible = mechanics
    .filter(
      (mechanic) =>
        selectedDimensions.includes(mechanic.dimension) &&
        (mode === "all" ||
          (mode === "neighbors" && neighbors.has(mechanic.id)) ||
          (mode === "game" && gameMechanics.has(mechanic.id))),
    )
    .map((m) => m.id);
  const visibleSet = new Set(visible);
  const edges: Edge[] = relationships
    .filter(
      (r) =>
        visibleSet.has(r.from) &&
        visibleSet.has(r.to) &&
        (mode !== "game" || overview.relationshipIds.includes(r.id)),
    )
    .map((relation) => ({
      id: relation.id,
      source: relation.from,
      target: relation.to,
      label: relationNames[relation.type],
      animated: effects && (relation.from === focus || relation.to === focus),
      style: {
        stroke:
          relation.from === focus || relation.to === focus
            ? "#88cdc5"
            : "#78648c",
        strokeWidth: relation.from === focus || relation.to === focus ? 2 : 1.2,
      },
      labelStyle: { fill: "#d1b8e5", fontSize: 10 },
      labelBgStyle: { fill: "#241e32", fillOpacity: 0.95 },
      labelBgPadding: [5, 3],
      markerEnd: { type: MarkerType.ArrowClosed, color: "#9a80b4" },
    }));
  const cooccurrences = mechanics
    .filter((m) => m.id !== focus)
    .map((mechanic) => ({
      mechanic,
      supply: getMechanicSupply([focus, mechanic.id]),
    }))
    .filter((item) => item.supply.count > 0 || item.supply.conditional > 0)
    .sort((a, b) => b.supply.count - a.supply.count);
  const pairedSupply = pair ? getMechanicSupply([focus, pair]) : null;
  const relatedGames = pair
    ? games.filter((g) => pairedSupply?.gameIds.includes(g.id))
    : getRelatedGames(focus);
  const key = [
    mode,
    mode === "neighbors" ? focus : "",
    gameId,
    scopeId,
    ...selectedDimensions,
  ].join("|");
  return (
    <>
      <div className="breadcrumb">
        <Link href="/">研究室</Link> / 机制图谱
      </div>
      <PageHead
        eyebrow="RELATION ATLAS / 机制之间的关系"
        title="机制关系图"
        description="选择一个机制，查看相关规则、游戏案例，以及可能的配合与冲突。连线是本站整理的设计分析。"
      >
        <span className="chip">
          {mechanics.length} 节点 / {relationships.length} 条编辑关系
        </span>
      </PageHead>
      <div className="graph-toolbar">
        <div className="segmented-buttons" aria-label="图谱范围">
          {(
            [
              ["neighbors", "相关机制"],
              ["all", "全部机制"],
              ["game", "游戏范围"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              className={mode === id ? "active" : ""}
              aria-pressed={mode === id}
              onClick={() => {
                setMode(id);
                if (id === "game")
                  setSelectedDimensions(dimensions.map((d) => d.id));
                if (id === "game" && !gameMechanics.has(focus))
                  selectNode([...gameMechanics][0] || focus);
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <label>
          聚焦机制{" "}
          <select
            aria-label="聚焦机制"
            value={focus}
            onChange={(event) => {
              selectNode(event.target.value);
              if (mode !== "game") setMode("neighbors");
            }}
          >
            {mechanics
              .filter((m) => mode !== "game" || gameMechanics.has(m.id))
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
          </select>
        </label>
        {mode === "game" && (
          <>
            <select
              aria-label="图谱游戏范围"
              value={gameId}
              onChange={(event) => {
                const game = getGame(event.target.value)!;
                setGameId(game.id);
                setScopeId("all");
                setSelectedDimensions(dimensions.map((d) => d.id));
                selectNode(
                  gameMechanicOverview(game.id).entries[0]?.mechanic.id ||
                    focus,
                );
              }}
            >
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
            </select>
            <select
              aria-label="图谱模式范围"
              value={scopeId}
              onChange={(event) => {
                setScopeId(event.target.value);
                setSelectedDimensions(dimensions.map((d) => d.id));
                selectNode(
                  gameMechanicOverview(gameId, event.target.value).entries[0]
                    ?.mechanic.id || focus,
                );
              }}
            >
              <option value="all">全部已收录范围 · 分模式标注</option>
              {listGameScopes(
                scopes,
                gameId,
                getGame(gameId)!.defaultScopeId,
              ).map((scope) => (
                <option key={scope.id} value={scope.id}>
                  {scope.label}
                </option>
              ))}
            </select>
          </>
        )}
      </div>
      {mode === "game" && (
        <GameMechanicInventory
          entries={overview.entries}
          selected={focus}
          allScopes={scopeId === "all"}
          onSelect={(id) => {
            selectNode(id);
            setSelectedDimensions((previous) => [
              ...new Set([...previous, getMechanic(id)!.dimension]),
            ]);
          }}
        />
      )}
      <div className="graph-dimensions" aria-label="按维度过滤图谱">
        {dimensions.map((d) => (
          <label key={d.id}>
            <input
              type="checkbox"
              checked={selectedDimensions.includes(d.id)}
              onChange={(event) =>
                setSelectedDimensions((previous) =>
                  event.target.checked
                    ? [...previous, d.id]
                    : previous.filter((id) => id !== d.id),
                )
              }
            />
            <i style={{ background: d.color }} />
            {d.short}
          </label>
        ))}
        <button
          className="text-button"
          onClick={() => setSelectedDimensions(dimensions.map((d) => d.id))}
        >
          全部恢复
        </button>
      </div>
      <div className="graph-layout">
        <section>
          <div className="graph-canvas" data-testid="mechanic-graph">
            {visible.length ? (
              <GraphCanvas
                key={key}
                ids={visible}
                edges={edges}
                focused={focus}
                mode={mode}
                onSelect={selectNode}
              />
            ) : (
              <EmptyState
                title="当前过滤条件没有节点"
                description="可以恢复全部维度，或切换到另一个研究范围。"
              >
                <button
                  className="button"
                  onClick={() =>
                    setSelectedDimensions(dimensions.map((d) => d.id))
                  }
                >
                  恢复全部维度
                </button>
              </EmptyState>
            )}
          </div>
          <p className="graph-hint">
            拖动空白处平移 · 滚轮或双指缩放 · 拖动节点调整位置 · 点选或键盘
            Enter 查看详情。当前 {visible.length} 个节点、{edges.length}{" "}
            条关系。
          </p>
          <div className="scope-box">
            连线的含义与适用情况见机制档案。按游戏查看时，只展示已确认或有条件出现的机制；没有关系记录的机制会单独显示。
          </div>
        </section>
        <aside className="graph-inspector">
          {visibleSet.has(focus) ? (
            <Window title="SELECTED FILE / 当前档案">
              <span className="chip" style={{ color: dimension.color }}>
                {dimension.name}
              </span>
              <h2 className="serif">{current.name}</h2>
              <p className="graph-definition">{current.definition}</p>
              {mode === "game" ? (
                <div className="scope-box" aria-label="当前游戏中的机制用法">
                  <strong>{getGame(gameId)?.name}中的用法</strong>
                  {overview.entries
                    .find((entry) => entry.mechanic.id === focus)
                    ?.records.map((record) => (
                      <div key={record.id}>
                        <StateBadge status={record.status} />
                        <p>
                          {
                            scopes.find((scope) => scope.id === record.scopeId)
                              ?.label
                          }
                          ：{record.rationale}
                        </p>
                        {record.condition && <p>条件：{record.condition}</p>}
                        <Link
                          href={`/games/${gameId}?scope=${encodeURIComponent(record.scopeId)}`}
                        >
                          查看这个范围的记录 ↗
                        </Link>
                      </div>
                    ))}
                </div>
              ) : (
                <MechanicExamples id={focus} limit={1} small />
              )}
              <div className="segmented-buttons inspector-tabs">
                {(
                  [
                    ["file", "档案"],
                    ["combinations", "共现"],
                    ["cases", "案例"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    aria-pressed={panel === id}
                    className={panel === id ? "active" : ""}
                    onClick={() => setPanel(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {panel === "file" && (
                <>
                  <p className="analysis-label">设计风险 / 编辑归纳</p>
                  <ul className="content-list">
                    {current.risks.map((text) => (
                      <li key={text}>{text}</li>
                    ))}
                  </ul>
                  <Link className="button primary" href={`/mechanics/${focus}`}>
                    阅读完整机制档案 →
                  </Link>
                  <Link className="button" href={`/lab?add=${focus}`}>
                    编写研究提示词 ＋
                  </Link>
                </>
              )}
              {panel === "combinations" && (
                <>
                  <p className="filter-note">
                    以下机制在本站收录游戏的同一模式或范围中共同出现。搜索次数请到“热度观察”查看。
                  </p>
                  {cooccurrences.length ? (
                    cooccurrences.map(({ mechanic, supply }) => (
                      <button
                        key={mechanic.id}
                        className={`cooccurrence-item ${pair === mechanic.id ? "active" : ""}`}
                        onClick={() => {
                          setPair(mechanic.id);
                          setPanel("cases");
                        }}
                      >
                        <strong>{mechanic.name}</strong>
                        <span>
                          {supply.count} 已确认 / {supply.conditional} 条件匹配
                          →
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="scope-box">
                      暂未收录这些机制共同出现的游戏。可以选择下方配方，继续整理研究提示词。
                    </p>
                  )}
                  <h3 className="tiny gold" style={{ marginTop: 20 }}>
                    编辑配方 / 设计参照
                  </h3>
                  {recipes
                    .filter((r) => r.mechanicIds.includes(focus))
                    .slice(0, 3)
                    .map((recipe) => (
                      <Link
                        className="side-related-link"
                        href={`/lab?recipe=${recipe.id}`}
                        key={recipe.id}
                      >
                        {recipe.name} ↗
                      </Link>
                    ))}
                </>
              )}
              {panel === "cases" && (
                <>
                  {pair && (
                    <p className="filter-note">
                      {current.name} ＋ {getMechanic(pair)?.name}：
                      {pairedSupply?.count} 款同范围已确认。
                      <button
                        className="text-button"
                        onClick={() => setPair(null)}
                      >
                        清除组合
                      </button>
                    </p>
                  )}
                  {relatedGames.length ? (
                    relatedGames.map((game) => (
                      <Link
                        className="side-related-link"
                        key={game.id}
                        href={`/games/${game.id}`}
                      >
                        {game.name} ↗<br />
                        <span className="muted">范围与原始证据见案例档案</span>
                      </Link>
                    ))
                  ) : (
                    <p className="scope-box">
                      还没有确认这些机制在同一模式中出现的案例，可继续核对有条件或资料待补的游戏。
                    </p>
                  )}
                </>
              )}
            </Window>
          ) : (
            <EmptyState
              title="当前没有聚焦节点"
              description="选择画布中的节点查看档案，或恢复被过滤的维度。"
            />
          )}
        </aside>
      </div>
    </>
  );
}
