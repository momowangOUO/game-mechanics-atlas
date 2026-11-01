"use client";

import { useEffect, useRef, useState } from "react";
import { publicAssetPath } from "@/lib/paths";
import styles from "./BrandIntro.module.css";

/** Mount once in the root layout: each document load plays, client navigation does not. */
export default function BrandIntro() {
  const [mounted, setMounted] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [useStill, setUseStill] = useState(false);
  const [phase, setPhase] = useState<"showing" | "leaving" | "done">("showing");
  const image = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && image.current?.complete && image.current.naturalWidth)
      setLoaded(true);
  }, [mounted]);

  useEffect(() => {
    if (!mounted || phase !== "showing") return;
    let frame = 0;
    let elapsed = 0;
    let last = 0;
    const resetClock = () => {
      last = 0;
    };
    document.addEventListener("visibilitychange", resetClock);
    // Start after a paint; hidden-tab time never shortens the visible three seconds.
    const tick = (now: number) => {
      if (document.visibilityState === "visible" && last) elapsed += now - last;
      last = document.visibilityState === "visible" ? now : 0;
      if (elapsed >= 3000) setPhase("leaving");
      else frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(() => {
      frame = window.requestAnimationFrame(tick);
    });
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", resetClock);
    };
  }, [mounted, phase, loaded]);

  useEffect(() => {
    if (phase !== "leaving") return;
    const timer = window.setTimeout(() => setPhase("done"), reduced ? 0 : 320);
    return () => window.clearTimeout(timer);
  }, [phase, reduced]);

  useEffect(() => {
    if (!mounted || phase === "done") return;
    const overflow = document.body.style.overflow;
    const frame = document.querySelector<HTMLElement>(".frame");
    const wasInert = frame?.inert ?? false;
    if (frame) frame.inert = true;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      if (frame) frame.inert = wasInert;
    };
  }, [mounted, phase]);

  // No overlay in server HTML, or when JavaScript is disabled. The page remains SSR.
  if (!mounted || phase === "done") return null;
  return (
    <div
      className={`${styles.intro} ${phase === "leaving" ? styles.leaving : ""}`}
      data-testid="brand-intro"
      data-state={phase}
      data-ready="true"
      role="status"
      aria-label="魔魔王 · 机制研究室"
    >
      <div className={styles.content}>
        {!loaded && <strong className={styles.fallback}>魔魔王</strong>}
        {!failed && (
          <img
            ref={image}
            className={styles.logo}
            src={publicAssetPath(
              `/brand/${reduced || useStill ? "logo-still.webp" : "logo-handwriting.webp"}`,
            )}
            alt="魔魔王"
            width={640}
            height={332}
            loading="eager"
            hidden={!loaded}
            onLoad={() => {
              if (phase === "showing") setLoaded(true);
            }}
            onError={() => {
              if (!reduced && !useStill) {
                setUseStill(true);
                setLoaded(false);
              } else setFailed(true);
            }}
          />
        )}
        <p className={styles.title}>机制研究室</p>
        <span className={styles.subtitle}>GAME MECHANICS ATLAS</span>
      </div>
    </div>
  );
}
