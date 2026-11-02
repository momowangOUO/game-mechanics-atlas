"use client";
import Link from "next/link";
import { useId, useState } from "react";
import { ArtImage, GameThumbnail } from "./Art";
import { mechanicScenes } from "@/data/mechanic-scenes";
import { mechanicExamples } from "@/data/taxonomy-reference";
import { getGame, getMechanic } from "@/lib/knowledge";
import styles from "./MechanicVisuals.module.css";
import { mechanicArtwork } from "./diagrams/artwork";
export function MechanicIcon({
  id,
  size = 48,
  className = "",
}: {
  id: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`${styles.icon} ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <ArtImage
        src={`/art/mechanics/${id}.webp`}
        alt=""
        width={size}
        height={size}
      />
    </span>
  );
}
export function MechanicComicLink({ id }: { id: string }) {
  const mechanic = getMechanic(id);
  if (!mechanic) return null;
  return (
    <Link
      className={styles.comicLink}
      href={`/mechanics/${id}#mechanic-comic-${id}`}
      aria-label={`看图理解：${mechanic.name}`}
    >
      <span className={styles.comicPreview} aria-hidden="true">
        <ArtImage
          src={`/art/comics/${id}.webp`}
          width={1800}
          height={600}
          alt=""
        />
      </span>
      <span>
        <strong>看图理解</strong>
        <small>用三格演示看清规则</small>
      </span>
      <b aria-hidden="true">↗</b>
    </Link>
  );
}
export function MechanicStoryboard({
  id,
  compact = false,
  initialPanel = 0,
  onExpand,
}: {
  id: string;
  compact?: boolean;
  initialPanel?: number;
  onExpand?: (panel: number) => void;
}) {
  const scene = mechanicScenes[id],
    mechanic = getMechanic(id);
  const [panel, setPanel] = useState(initialPanel),
    [mode, setMode] = useState<"comic" | "diagram">("comic");
  const uid = useId().replace(/:/g, "");
  if (!scene || !mechanic) return null;
  return (
    <section
      id={compact ? undefined : `mechanic-comic-${id}`}
      className={`${styles.story} ${compact ? styles.compact : ""}`}
      aria-label={`${mechanic.name}图解`}
    >
      <header className={styles.storyHead}>
        {!compact && (
          <div>
            <span className={styles.kicker}>
              MECHANIC IN ACTION / 原创教学漫画
            </span>
            <h2>
              <MechanicIcon id={id} size={44} />
              {mechanic.name}图解
            </h2>
          </div>
        )}
        <div className={styles.modeSwitch} role="group" aria-label="图解形式">
          <button
            aria-pressed={mode === "comic"}
            onClick={() => setMode("comic")}
          >
            三格漫画
          </button>
          <button
            aria-pressed={mode === "diagram"}
            onClick={() => setMode("diagram")}
          >
            规则示意
          </button>
        </div>
        {compact && onExpand && (
          <button
            className={styles.expandComic}
            type="button"
            onClick={() => onExpand(panel)}
          >
            放大漫画 ↗
          </button>
        )}
      </header>
      {mode === "comic" ? (
        <>
          <div className={styles.frames}>
            {scene.frames.map((caption, i) => (
              <figure
                key={i}
                className={`${styles.frame} ${panel === i ? styles.activeFrame : ""}`}
              >
                <div className={styles.panelNumber}>
                  0{i + 1}
                  <span>{["情境", "操作", "结果"][i]}</span>
                </div>
                <div className={styles.comicDrawing} data-panel={i}>
                  <ArtImage
                    className={styles.comicStrip}
                    src={`/art/comics/${id}.webp`}
                    width={1800}
                    height={600}
                    alt={`${mechanic.name}漫画第${i + 1}格：${caption}`}
                  />
                </div>
                <figcaption>
                  <strong>{scene.objects[i]}</strong>
                  <p>{caption}</p>
                </figcaption>
              </figure>
            ))}
          </div>
          <nav className={styles.framePager} aria-label="漫画分镜">
            <button disabled={panel === 0} onClick={() => setPanel(panel - 1)}>
              ← 上一格
            </button>
            <span>{panel + 1} / 3</span>
            <button disabled={panel === 2} onClick={() => setPanel(panel + 1)}>
              下一格 →
            </button>
          </nav>
        </>
      ) : (
        <>
          <figure className={styles.ruleDiagram}>
            <svg
              viewBox="0 0 260 150"
              role="img"
              aria-label={`${mechanic.name}规则示意：${scene.frames[panel]}`}
            >
              <defs>
                <marker
                  id={uid}
                  markerWidth="7"
                  markerHeight="7"
                  refX="6"
                  refY="3"
                  orient="auto"
                >
                  <path d="M0 0L6 3L0 6" fill="#282439" />
                </marker>
              </defs>
              {mechanicArtwork[id]?.(panel, uid)}
            </svg>
            <figcaption>
              <strong>{scene.objects[panel]}</strong>
              <p>{scene.frames[panel]}</p>
            </figcaption>
          </figure>
          <nav className={styles.diagramSteps} aria-label="示意步骤">
            {scene.objects.map((label, i) => (
              <button
                key={i}
                aria-pressed={panel === i}
                aria-label={`${i + 1}. ${label}`}
                onClick={() => setPanel(i)}
              >
                {compact ? i + 1 : `${i + 1}. ${label}`}
              </button>
            ))}
          </nav>
        </>
      )}
    </section>
  );
}
export function MechanicExamples({
  id,
  limit = 2,
  small = false,
}: {
  id: string;
  limit?: number;
  small?: boolean;
}) {
  const examples = (mechanicExamples[id] ?? []).slice(0, limit);
  if (!examples.length)
    return <p className={styles.emptyExamples}>游戏范例正在补充。</p>;
  return (
    <div
      className={`${styles.examples} ${small ? styles.smallExamples : ""}`}
      aria-label="游戏范例"
    >
      {examples.map((ex) => {
        const game = getGame(ex.gameId);
        if (!game) return null;
        return (
          <Link
            className={styles.example}
            key={ex.instanceId}
            href={`/games/${game.id}?scope=${encodeURIComponent(ex.scopeId)}`}
          >
            <GameThumbnail gameId={game.id} />
            <div>
              <strong>
                {game.name}{" "}
                <span>
                  ↗{small && ex.status === "conditional" ? " · 条件成立" : ""}
                </span>
              </strong>
              <p>{ex.observation}</p>
              {!small && (
                <small>
                  {ex.scopeLabel}
                  {ex.status === "conditional" ? " · 条件成立" : ""}
                </small>
              )}
              {!small && ex.condition && <p>适用条件：{ex.condition}</p>}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
