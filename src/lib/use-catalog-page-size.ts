"use client";
import { useSyncExternalStore } from "react";
const subscribe = (callback: () => void) => {
  const media = window.matchMedia("(max-width:700px)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};
export function useCatalogPageSize(desktopSize: number) {
  const mobile = useSyncExternalStore(
    subscribe,
    () => window.innerWidth <= 700,
    () => false,
  );
  return mobile ? 1000 : desktopSize;
}
