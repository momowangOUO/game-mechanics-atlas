// Inlined by Next at build time; Next Link/router already apply this prefix.
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix only raw public asset paths, never Next Link destinations. */
export function publicAssetPath(src: string) {
  if (!src.startsWith("/") || src.startsWith("//") || !basePath) return src;
  if (src === basePath || src.startsWith(`${basePath}/`)) return src;
  return `${basePath}${src}`;
}
