"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useUI } from "./Providers";
import { dimensionArt, maidStates, type MaidState } from "@/lib/art";
import type { DimensionId } from "@/lib/model";

type ArtProps = {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
};
function ArtContent({
  src,
  alt,
  className = "",
  width,
  height,
  priority = false,
}: ArtProps) {
  const [failed, setFailed] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  // An eager SSR image may fail before hydration attaches onError.
  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth === 0) setFailed(true);
  }, []);
  if (failed)
    return (
      <span
        className={`art-fallback ${className}`}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
      >
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <path
            d="M8 12q12-5 24 3 12-8 24-3v38q-12-5-24 3-12-8-24-3zM32 15v38M15 22l10 2M15 30l10 2M40 22l9-2M40 30l9-2"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
        <small>{alt ? "研究档案 · 插画暂不可用" : ""}</small>
      </span>
    );
  return (
    <img
      ref={imageRef}
      className={className}
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
export function ArtImage(props: ArtProps) {
  return <ArtContent key={props.src} {...props} />;
}
export function MaidPortrait({
  state = "explain",
  className = "",
  priority = false,
  decorative = false,
}: {
  state?: MaidState;
  className?: string;
  priority?: boolean;
  decorative?: boolean;
}) {
  const { effects } = useUI();
  const asset = maidStates[state];
  return (
    <motion.div
      className={`maid-portrait ${className}`}
      data-maid-state={state}
      aria-hidden={decorative || undefined}
      key={state}
      initial={effects ? { opacity: 0.5, x: 8 } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: effects ? 0.2 : 0 }}
    >
      <ArtImage
        src={asset.src}
        alt={decorative ? "" : asset.label}
        width={880}
        height={1320}
        priority={priority}
      />
    </motion.div>
  );
}
export function DimensionIcon({
  id,
  className = "",
}: {
  id: DimensionId;
  className?: string;
}) {
  return (
    <ArtImage
      src={dimensionArt(id)}
      alt=""
      className={`dimension-icon ${className}`}
      width={64}
      height={64}
    />
  );
}
