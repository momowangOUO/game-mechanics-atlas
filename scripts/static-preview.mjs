import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};

/** Serves only exported files, including a real HTTP 404; no SPA fallback. */
export function createStaticServer({ root, basePath = "" }) {
  const directory = path.resolve(root);
  return createServer(async (request, response) => {
    const send = async (file, status = 200) => {
      const body = await readFile(file);
      response.writeHead(status, {
        "Content-Type": types[path.extname(file)] ?? "application/octet-stream",
        "Content-Length": body.length,
      });
      response.end(request.method === "HEAD" ? undefined : body);
    };
    const missing = async () => {
      try {
        await send(path.join(directory, "404.html"), 404);
      } catch {
        response.writeHead(404);
        response.end("Not found");
      }
    };
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { Allow: "GET, HEAD" });
      response.end();
      return;
    }
    let url, pathname;
    try {
      url = new URL(request.url, "http://localhost");
      pathname = decodeURIComponent(url.pathname);
      if (pathname.includes("\0") || pathname.includes("\\"))
        throw new Error("Invalid path");
    } catch {
      response.writeHead(400);
      response.end("Invalid path");
      return;
    }
    if (
      basePath &&
      pathname !== basePath &&
      !pathname.startsWith(`${basePath}/`)
    ) {
      await missing();
      return;
    }
    const relative = pathname.slice(basePath.length);
    const target = path.resolve(directory, `.${relative || "/"}`);
    if (target !== directory && !target.startsWith(`${directory}${path.sep}`)) {
      await missing();
      return;
    }
    try {
      const info = await stat(target);
      if (info.isDirectory()) {
        if (!url.pathname.endsWith("/")) {
          response.writeHead(308, {
            Location: `${url.pathname}/${url.search}`,
          });
          response.end();
          return;
        }
        await send(path.join(target, "index.html"));
      } else if (info.isFile()) await send(target);
      else await missing();
    } catch {
      await missing();
    }
  });
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  const args = process.argv.slice(2);
  const option = (name, fallback) =>
    args.find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1) ??
    fallback;
  const requested = option("--base-path", process.env.PAGES_BASE_PATH ?? "");
  const basePath = requested === "/" ? "" : requested.replace(/\/$/, "");
  if (basePath !== "" && basePath !== "/game-mechanics-atlas")
    throw new Error("Unsupported base path");
  const root = path.resolve(option("--directory", "out"));
  await stat(path.join(root, "index.html"));
  const port = Number(option("--port", process.env.PORT ?? "3000"));
  const server = createStaticServer({ root, basePath });
  server.listen(port, "127.0.0.1", () =>
    console.log(`Static preview: http://127.0.0.1:${port}${basePath}/`),
  );
  for (const signal of ["SIGINT", "SIGTERM"])
    process.on(signal, () => server.close(() => process.exit(0)));
}
