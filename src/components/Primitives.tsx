"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { animate, motion } from "motion/react";
import { useUI } from "./Providers";
import type { Game, MechanicStatus } from "@/lib/model";
import { ArtImage, MaidPortrait } from "./Art";
import { chapterArt, gameArt, type ChapterId, type MaidState } from "@/lib/art";
import gameArtSourceData from "@/data/game-art-sources.json";
import { rinDialogue } from "@/data/rin-dialogue";
import { GameLoopDiagram } from "./GameLoopDiagram";
const gameArtSources: Record<
  string,
  { kind: string; sourceUrl: string; publisher: string }
> = gameArtSourceData;

export const stateLabels: Record<MechanicStatus, string> = {
  present: "已确认存在",
  absent: "已确认不存在",
  not_applicable: "不适用",
  unknown: "尚未确认",
  conditional: "条件成立",
};
export function StateBadge({ status }: { status: MechanicStatus }) {
  return (
    <span className={`state state-${status}`} title={stateLabels[status]}>
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
  const pathname = usePathname();
  const chapter: ChapterId = pathname.startsWith("/lab")
    ? "lab"
    : pathname.startsWith("/heat")
      ? "heat"
      : pathname.startsWith("/graph")
        ? "graph"
        : pathname.startsWith("/games") || pathname.startsWith("/compare")
          ? "games"
          : "mechanics";
  return (
    <div className={`page-head chapter-head chapter-${chapter}`}>
      <ArtImage
        src={chapterArt(chapter)}
        alt=""
        className="chapter-backdrop"
        width={1672}
        height={941}
        priority
      />
      <div className="chapter-heading-copy">
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
  message = rinDialogue.mechanic,
  compact = false,
  state = "explain",
}: {
  message?: string;
  compact?: boolean;
  state?: MaidState;
}) {
  return (
    <section
      className={`window assistant ${compact ? "assistant-compact" : ""}`}
    >
      <div className="assistant-small">
        <MaidPortrait state={state} />
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
  const official = gameArtSources[game.id]?.kind === "official";
  return (
    <div
      className={`cover ${large ? "game-feature-cover" : ""}`}
      style={{ background: item.color }}
      role="img"
      aria-label={`${game.name} ${official ? "官方代表图" : "原创玩法示意，非官方封面"}`}
    >
      <ArtImage
        src={gameArt(game.id)}
        alt=""
        className={`game-cover-art${official ? " official-game-art" : ""}`}
        width={1672}
        height={941}
      />
      <small>
        {official
          ? "GAME ARCHIVE / 官方代表图"
          : "MECHANICS STUDY / 原创玩法示意"}
      </small>
      {!official && <span className="cover-title">{item.label}</span>}
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
export function GameArtCredit({ gameId }: { gameId: string }) {
  const source = gameArtSources[gameId];
  const publisher =
    source?.publisher === "Publisher via official Steam store"
      ? "官方 Steam 商店"
      : source?.publisher;
  return source?.kind === "official" ? (
    <p className="tiny evidence-note game-art-credit">
      官方代表图 · {publisher} ·{" "}
      <a href={source.sourceUrl} target="_blank" rel="noreferrer">
        查看图源 ↗
      </a>
      。图像权利归相应权利人；本站的机制分析另列依据。
    </p>
  ) : (
    <p className="tiny evidence-note">
      本站原创玩法示意，不是游戏截图或官方封面。
    </p>
  );
}
export function EmptyState({
  title = "没有找到匹配的档案",
  description = "试试更短的关键词，或清除筛选条件。",
  children,
}: {
  title?: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <MaidPortrait state="think" className="empty-maid" decorative />
      <h2>{title}</h2>
      <p>{description}</p>
      {children}
    </div>
  );
}
export function LoopDiagram({ steps }: { steps: string[] }) {
  return <GameLoopDiagram steps={steps} />;
}
