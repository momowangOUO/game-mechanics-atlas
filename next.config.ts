import type { NextConfig } from "next";
import { availableParallelism } from "node:os";
const requestedBasePath = process.env.PAGES_BASE_PATH ?? "";
const basePath =
  requestedBasePath === "/" ? "" : requestedBasePath.replace(/\/$/, "");
if (basePath !== "" && basePath !== "/game-mechanics-atlas") {
  throw new Error("PAGES_BASE_PATH must be empty, /, or /game-mechanics-atlas");
}
const config: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  poweredByHeader: false,
  reactStrictMode: true,
  devIndicators: false,
  images: { unoptimized: true },
  // Large static case pages duplicate the catalog in each worker. Bound
  // concurrency to avoid memory pressure on high-core development machines.
  experimental: { cpus: Math.max(1, Math.min(4, availableParallelism() - 1)) },
};
export default config;
