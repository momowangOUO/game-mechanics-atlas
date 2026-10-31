import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { createStaticServer } from "./static-preview.mjs";

for (const basePath of ["", "/game-mechanics-atlas"]) {
  test(`pure static preview at ${basePath || "/"}`, async (t) => {
    const root = await mkdtemp(path.join(tmpdir(), "atlas-static-"));
    await mkdir(path.join(root, "mechanics"));
    await writeFile(path.join(root, "index.html"), "home");
    await writeFile(path.join(root, "mechanics/index.html"), "mechanics");
    await writeFile(path.join(root, "404.html"), "missing");
    await writeFile(path.join(root, "icon.svg"), "<svg/>");
    const server = createStaticServer({ root, basePath });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    t.after(async () => {
      await new Promise((resolve) => server.close(resolve));
      await rm(root, { recursive: true, force: true });
    });
    const origin = `http://127.0.0.1:${server.address().port}`;
    const redirect = await fetch(`${origin}${basePath}/mechanics?q=a`, {
      redirect: "manual",
    });
    assert.equal(redirect.status, 308);
    assert.equal(
      redirect.headers.get("location"),
      `${basePath}/mechanics/?q=a`,
    );
    assert.equal(
      await (await fetch(`${origin}${basePath}/mechanics/?q=a`)).text(),
      "mechanics",
    );
    const missing = await fetch(`${origin}${basePath}/mechanics/unknown/`);
    assert.equal(missing.status, 404);
    assert.equal(await missing.text(), "missing");
    assert.equal((await fetch(`${origin}${basePath}/missing.js`)).status, 404);
    assert.equal((await fetch(`${origin}${basePath}/%ZZ`)).status, 400);
    assert.equal(
      (await fetch(`${origin}${basePath}/..%2foutside`)).status,
      404,
    );
    assert.equal(
      (await fetch(`${origin}${basePath}/`, { method: "POST" })).status,
      405,
    );
    assert.match(
      (await fetch(`${origin}${basePath}/icon.svg`)).headers.get(
        "content-type",
      ),
      /image\/svg\+xml/,
    );
    assert.equal(
      (await fetch(`${origin}${basePath}/`, { method: "HEAD" })).status,
      200,
    );
    if (basePath)
      assert.equal((await fetch(`${origin}/mechanics/`)).status, 404);
  });
}
