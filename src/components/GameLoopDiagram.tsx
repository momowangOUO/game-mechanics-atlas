"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { loopConnections, loopSymbol, type LoopSymbol } from "@/lib/game-loop";
import styles from "./GameLoopDiagram.module.css";

function ActionSymbol({ kind }: { kind: LoopSymbol }) {
  const paths: Record<LoopSymbol, React.ReactNode> = {
    observe: (
      <>
        <path d="M5 24s7-12 19-12 19 12 19 12-7 12-19 12S5 24 5 24Z" />
        <circle cx="24" cy="24" r="6" />
        <path d="M24 4v4M8 8l4 4M40 8l-4 4" />
      </>
    ),
    purchase: (
      <>
        <path d="M5 9h6l5 22h22l5-16H13M18 21h20M22 15v15M32 15v15" />
        <circle cx="20" cy="38" r="3" />
        <circle cx="35" cy="38" r="3" />
      </>
    ),
    combat: (
      <>
        <path d="m9 7 8 3 20 23-4 4L10 17 9 7ZM39 7l-8 3-7 8M18 24 9 34l5 5 10-9M29 35l10-10M9 39l-4 4M35 35l8 8M6 30l12 12" />
      </>
    ),
    cards: (
      <>
        <path d="m8 11 19-5 9 32-19 5-9-32Z" />
        <path d="m29 9 11 4-7 27M13 16l3-1M25 34l3-1" />
        <path d="m22 18 6 6-3 8-7-6 4-8Z" />
      </>
    ),
    configure: (
      <>
        <path d="M8 12h32M8 24h32M8 36h32" />
        <rect x="16" y="8" width="7" height="8" />
        <rect x="29" y="20" width="7" height="8" />
        <rect x="12" y="32" width="7" height="8" />
      </>
    ),
    collect: (
      <>
        <path d="m8 19 16-9 16 9v20H8V19ZM8 19l16 9 16-9M24 28v11M16 14l16 9" />
        <path d="M35 5v9M31 9h8" />
      </>
    ),
    build: (
      <>
        <path d="M8 40V19l16-12 16 12v21H8ZM19 40V27h10v13M7 19h34M14 23h3M31 23h3" />
        <path d="M24 11v9M19 16h10" />
      </>
    ),
    explore: (
      <>
        <path d="m9 9 10 4 10-4 10 4v26l-10-4-10 4-10-4V9ZM19 13v26M29 9v26" />
        <path d="m13 26 4-5 8 7 9-10M30 18h4v4" />
      </>
    ),
    choose: (
      <>
        <path d="M24 41V23M24 28 10 14M24 28l14-14M10 22V14h8M30 14h8v8" />
        <circle cx="24" cy="7" r="3" />
      </>
    ),
    repeat: (
      <>
        <path d="M39 18A16 16 0 0 0 11 13l-5 6M6 9v10h10M9 30a16 16 0 0 0 28 5l5-6M32 29h10v10" />
        <path d="m19 24 4 4 8-9" />
      </>
    ),
    action: (
      <>
        <circle cx="24" cy="24" r="16" />
        <path d="m20 16 12 8-12 8V16ZM7 7l4 4M37 37l4 4" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[kind]}
    </svg>
  );
}

export function GameLoopDiagram({ steps }: { steps: string[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const marker = useId().replace(/:/g, "");
  const [geometry, setGeometry] = useState<{
    width: number;
    height: number;
    edges: ReturnType<typeof loopConnections>;
  }>();
  const columns = Math.ceil(steps.length / 2);

  useEffect(() => {
    const root = rootRef.current,
      board = boardRef.current,
      list = listRef.current;
    if (!root || !board || !list) return;
    const measure = () => {
      const bounds = board.getBoundingClientRect();
      const rects = Array.from(list.children, (element) => {
        const rect = element.getBoundingClientRect();
        return {
          x: rect.left - bounds.left,
          y: rect.top - bounds.top,
          width: rect.width,
          height: rect.height,
        };
      });
      setGeometry({
        width: bounds.width,
        height: bounds.height,
        edges: loopConnections(
          rects,
          root.clientWidth >= 640 && steps.length > 1 ? "circuit" : "sequence",
        ),
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    observer.observe(list);
    Array.from(list.children).forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [steps]);

  if (!steps.length) return <p className={styles.empty}>核心循环尚未整理。</p>;

  return (
    <div
      className={styles.root}
      ref={rootRef}
      data-testid="game-loop"
      style={{ "--loop-columns": columns } as CSSProperties}
    >
      <div className={styles.heading}>
        <span>
          PLAY LOOP <b>/ {String(steps.length).padStart(2, "0")} 个步骤</b>
        </span>
        <span className={styles.order}>按编号与箭头阅读</span>
      </div>
      <div
        className={styles.board}
        ref={boardRef}
        data-single={steps.length === 1 || undefined}
      >
        {geometry && (
          <svg
            className={styles.connections}
            viewBox={`0 0 ${geometry.width} ${geometry.height}`}
            width={geometry.width}
            height={geometry.height}
            aria-hidden="true"
            data-testid="loop-connections"
          >
            <defs>
              <marker
                id={`${marker}-arrow`}
                markerWidth="9"
                markerHeight="9"
                refX="8"
                refY="4.5"
                orient="auto"
                markerUnits="userSpaceOnUse"
              >
                <path
                  d="M1 1 8 4.5 1 8"
                  fill="none"
                  stroke="#c4aff0"
                  strokeWidth="2"
                />
              </marker>
              <marker
                id={`${marker}-return`}
                markerWidth="9"
                markerHeight="9"
                refX="8"
                refY="4.5"
                orient="auto"
                markerUnits="userSpaceOnUse"
              >
                <path
                  d="M1 1 8 4.5 1 8"
                  fill="none"
                  stroke="#dfbd77"
                  strokeWidth="2"
                />
              </marker>
            </defs>
            {geometry.edges.map((edge) => (
              <path
                key={edge.from}
                d={edge.path}
                className={
                  edge.closing ? styles.returnPath : styles.forwardPath
                }
                markerEnd={`url(#${marker}-${edge.closing ? "return" : "arrow"})`}
                data-loop-from={edge.from + 1}
                data-loop-to={edge.to + 1}
                data-closing={edge.closing || undefined}
              />
            ))}
          </svg>
        )}
        <ol className={styles.steps} aria-label="核心循环" ref={listRef}>
          {steps.map((step, index) => (
            <li
              key={`${index}-${step}`}
              className={styles.step}
              style={
                {
                  "--step-column":
                    index < columns ? index + 1 : steps.length - index,
                  "--step-row": index < columns ? 1 : 3,
                  "--step-accent": ["#c4aff0", "#88cdc5", "#dfbd77", "#d5a0c8"][
                    index % 4
                  ],
                } as CSSProperties
              }
              data-loop-step={index + 1}
            >
              <div className={styles.symbol}>
                <ActionSymbol kind={loopSymbol(step)} />
                <span className={styles.number}>
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div className={styles.copy}>
                <small>
                  STEP {String(index + 1).padStart(2, "0")}
                  {index === 0 && <span>从这里开始</span>}
                </small>
                <strong>{step}</strong>
              </div>
            </li>
          ))}
        </ol>
        {steps.length > 1 && (
          <div className={styles.center} aria-hidden="true">
            <span>↻</span>
            <strong>核心循环</strong>
            <small>依次推进，再进入下一轮</small>
          </div>
        )}
      </div>
      <p className={styles.legend}>
        <span aria-hidden="true">↶</span> 第{" "}
        {String(steps.length).padStart(2, "0")} 步后，返回第 01 步
        <span className={styles.legendNote}> · 玩法步骤的编辑归纳</span>
      </p>
    </div>
  );
}
