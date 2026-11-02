"use client";
import Link from "next/link";
import { useId } from "react";
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
export function MechanicIconFrame({ id }: { id: string }) {
  return (
    <span className={styles.iconFrame} aria-hidden="true">
      <ArtImage
        src={`/art/mechanics/${id}.webp`}
        alt=""
        width={256}
        height={256}
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
        <strong>{mechanic.name} · 三格漫画</strong>
        <small>用三格演示看清规则</small>
      </span>
      <b aria-hidden="true">↗</b>
    </Link>
  );
}
export function MechanicStoryboard({
  id,
  headingLevel = 2,
}: {
  id: string;
  headingLevel?: 2 | 3 | 4;
}) {
  const scene = mechanicScenes[id];
  const mechanic = getMechanic(id);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  if (!scene || !mechanic) return null;
  const stages = ["情境", "操作", "结果"];
  return (
    <section
      id={`mechanic-comic-${id}`}
      className={styles.story}
      aria-label={`${mechanic.name}图解`}
    >
      <header className={styles.storyHead}>
        <span className={styles.kicker}>MECHANIC IN ACTION / 原创教学漫画</span>
        <Heading className={styles.storyTitle}>{mechanic.name}图解</Heading>
      </header>
      <div className={styles.frames}>
        {scene.frames.map((caption, i) => (
          <figure key={i} className={styles.frame}>
            <div className={styles.panelNumber}>
              0{i + 1}
              <span>{stages[i]}</span>
            </div>
            <div className={styles.comicDrawing} data-panel={i}>
              <ArtImage
                className={styles.comicStrip}
                src={`/art/comics/${id}.webp`}
                width={1800}
                height={600}
                alt={`${mechanic.name}漫画第${i + 1}格：${stages[i]}`}
              />
            </div>
            <figcaption>
              <strong>{scene.objects[i]}</strong>
              <p>{caption}</p>
            </figcaption>
          </figure>
        ))}
      </div>
      <div
        className={styles.rules}
        role="group"
        aria-label={`${mechanic.name}规则示意`}
      >
        <p className={styles.ruleHeading}>规则示意</p>
        {scene.objects.map((label, i) => {
          const markerId = `rule-${uid}-${i}`;
          return (
            <figure key={i} className={styles.ruleDiagram} data-rule-stage={i}>
              <svg
                viewBox="0 0 260 150"
                role="img"
                aria-label={`${mechanic.name}规则示意第${i + 1}步：${scene.frames[i]}`}
              >
                <defs>
                  <marker
                    id={markerId}
                    markerWidth="7"
                    markerHeight="7"
                    refX="6"
                    refY="3"
                    orient="auto"
                  >
                    <path d="M0 0L6 3L0 6" fill="#282439" />
                  </marker>
                </defs>
                {mechanicArtwork[id]?.(i, markerId)}
              </svg>
              <figcaption>
                <strong>
                  0{i + 1} · {label}
                </strong>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
export function MechanicExamples({
  id,
  limit,
  small = false,
}: {
  id: string;
  limit?: number;
  small?: boolean;
}) {
  const curated = mechanicExamples[id] ?? [];
  const examples = limit === undefined ? curated : curated.slice(0, limit);
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
