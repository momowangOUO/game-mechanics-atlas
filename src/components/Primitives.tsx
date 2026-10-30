"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { animate, motion } from "motion/react";
import { useUI } from "./Providers";
import type { Game, MechanicStatus } from "@/lib/model";

export const stateLabels: Record<MechanicStatus, string> = {
  present: "已确认存在",
  absent: "已确认不存在",
  not_applicable: "不适用",
  unknown: "尚未确认",
  conditional: "条件成立",
};
export function StateBadge({ status }: { status: MechanicStatus }) {
  return (
    <span className={`state state-${status}`} title={status}>
      {stateLabels[status]}
    </span>
  );
}
export function Window({
  title,
  children,
  extra,
  className = "",
}: {
  title: string;
  children: ReactNode;
  extra?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`window corner ${className}`}>
      <div className="window-head">
        <span>{title}</span>
        <span>{extra || <span aria-hidden="true">─　□　×</span>}</span>
      </div>
      <div className="window-body">{children}</div>
    </section>
  );
}
export function SectionHead({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-head">
      <div>
        <p className="eyebrow">RESEARCH FILE / {number}</p>
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}
export function PageHead({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-head">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
export function SeedBadge({ imported = false }: { imported?: boolean }) {
  return (
    <span className="seed">
      {imported ? "本地导入 · 来源见数据说明" : "合成示例 · 非真实市场数据"}
    </span>
  );
}
export function Reveal({
  children,
  index = 0,
  className = "",
}: {
  children: ReactNode;
  index?: number;
  className?: string;
}) {
  const { effects } = useUI();
  return (
    <motion.div
      className={className}
      initial={{ opacity: effects ? 0.92 : 1, y: effects ? 14 : 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{
        duration: effects ? 0.35 : 0,
        delay: Math.min(index * 0.045, 0.3),
      }}
    >
      {children}
    </motion.div>
  );
}
export function CountUp({
  value,
  format = (n: number) => Math.round(n).toLocaleString("zh-CN"),
}: {
  value: number;
  format?: (n: number) => string;
}) {
  const { effects } = useUI();
  const [current, setCurrent] = useState(value);
  useEffect(() => {
    if (!effects) {
      setCurrent(value);
      return;
    }
    const animation = animate(0, value, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate: setCurrent,
    });
    return () => animation.stop();
  }, [value, effects]);
  return (
    <>
      <span aria-hidden="true">{format(current)}</span>
      <span className="sr-only">{format(value)}</span>
    </>
  );
}

export function Assistant({
  message = "机制的身份不会因为作用不同而变化。关联可以增加，分类不能随意挪动。",
  compact = false,
}: {
  message?: string;
  compact?: boolean;
}) {
  const { effects } = useUI();
  return (
    <section
      className={`window assistant ${compact ? "assistant-compact" : ""}`}
    >
      <div className="assistant-small">
        <motion.img
          src="/art/maid-cel.png"
          alt="粗黑轮廓的原创赛璐璐女仆研究助手"
          animate={effects ? { y: [0, -3, 0] } : { y: 0 }}
          transition={{
            duration: 5,
            repeat: effects ? Infinity : 0,
            ease: "easeInOut",
          }}
        />
      </div>
      <p className="assistant-caption">
        <span className="gold tiny">ASSISTANT / RIN</span>
        <br />
        {message}
      </p>
    </section>
  );
}

const art: Record<string, { color: string; symbol: string; label: string }> = {
  balatro: { color: "#20463f", symbol: "♠", label: "BALATRO" },
  peglin: { color: "#3a5440", symbol: "◉", label: "PEGLIN" },
  "slay-the-spire": { color: "#343c56", symbol: "♧", label: "SLAY THE SPIRE" },
  hades: { color: "#5b2936", symbol: "♜", label: "HADES" },
  "cult-of-the-lamb": {
    color: "#563e4b",
    symbol: "✦",
    label: "CULT OF THE LAMB",
  },
  "backpack-battles": {
    color: "#554a36",
    symbol: "▦",
    label: "BACKPACK BATTLES",
  },
  "loop-hero": { color: "#333f4d", symbol: "∞", label: "LOOP HERO" },
  "vampire-survivors": {
    color: "#48324b",
    symbol: "✝",
    label: "VAMPIRE SURVIVORS",
  },
  "risk-of-rain-2": { color: "#3b4b59", symbol: "◈", label: "RISK OF RAIN 2" },
  inscryption: { color: "#433e31", symbol: "♤", label: "INSCRYPTION" },
  "stardew-valley": { color: "#4a5b43", symbol: "❧", label: "STARDEW VALLEY" },
  minecraft: { color: "#48523a", symbol: "▣", label: "MINECRAFT" },
  tetris: { color: "#4d4665", symbol: "▥", label: "TETRIS" },
  "cookie-clicker": { color: "#59462f", symbol: "◌", label: "COOKIE CLICKER" },
  "dead-cells": { color: "#314e56", symbol: "⚔", label: "DEAD CELLS" },
  "escape-from-tarkov": {
    color: "#49483c",
    symbol: "⌖",
    label: "ESCAPE FROM TARKOV",
  },
  "game-of-dice": { color: "#554769", symbol: "⚄", label: "GAME OF DICE" },
  "shape-of-dreams": {
    color: "#3e456d",
    symbol: "✧",
    label: "SHAPE OF DREAMS",
  },
};
export function GameCover({
  game,
  large = false,
}: {
  game: Game;
  large?: boolean;
}) {
  const item = art[game.id] || {
    color: "#37344b",
    symbol: "◇",
    label: game.name,
  };
  return (
    <div
      className={`cover ${large ? "game-feature-cover" : ""}`}
      style={{ background: item.color }}
      role="img"
      aria-label={`${game.name} 原创机制图形，非官方封面`}
    >
      <small>MECHANICS STUDY / 原创图形示意</small>
      <span className="cover-symbol" aria-hidden="true">
        {item.symbol}
      </span>
      <span className="cover-title">{item.label}</span>
    </div>
  );
}
export function GameCard({ game }: { game: Game }) {
  return (
    <Link className="case-card interactive-card" href={`/games/${game.id}`}>
      <GameCover game={game} />
      <div className="case-body">
        <h3>{game.name}</h3>
        <p>{game.summary}</p>
        <div className="row">
          {game.corePlayTags.slice(0, 2).map((tag) => (
            <span className="chip" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
export function EmptyState({
  title = "没有找到匹配档案",
  description = "试试更短的关键词，或清除筛选条件。",
  children,
}: {
  title?: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span aria-hidden="true">◇</span>
      <h2>{title}</h2>
      <p>{description}</p>
      {children}
    </div>
  );
}
export function LoopDiagram({ steps }: { steps: string[] }) {
  return (
    <ol className="loop" aria-label="核心循环">
      {steps.map((step, i) => (
        <li className="loop-step" key={`${i}-${step}`}>
          <small>STEP {String(i + 1).padStart(2, "0")}</small>
          <strong>{step}</strong>
        </li>
      ))}
    </ol>
  );
}
