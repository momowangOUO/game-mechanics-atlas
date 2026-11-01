// Used only by the static data exporter, never by the Next.js build runtime.
import { registerHooks } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const sourceRoot = new URL("../src/", import.meta.url).href;
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      specifier.startsWith(".") &&
      context.parentURL?.startsWith(sourceRoot)
    ) {
      const url = new URL(specifier, context.parentURL);
      if (
        !/\.[a-z]+$/i.test(url.pathname) &&
        existsSync(fileURLToPath(`${url.href}.ts`))
      ) {
        return nextResolve(`${url.href}.ts`, context);
      }
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.startsWith(sourceRoot) && url.endsWith(".ts")) {
      const source = ts
        .transpileModule(readFileSync(new URL(url), "utf8"), {
          compilerOptions: {
            target: ts.ScriptTarget.ES2022,
            module: ts.ModuleKind.ESNext,
            verbatimModuleSyntax: false,
          },
        })
        .outputText.replace(
          /(from\s+["'][^"']+\.json["'])(\s*;)/g,
          '$1 with { type: "json" }$2',
        );
      return { format: "module", source, shortCircuit: true };
    }
    return nextLoad(url, context);
  },
});
