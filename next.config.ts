import type { NextConfig } from "next";
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
};
export default config;
