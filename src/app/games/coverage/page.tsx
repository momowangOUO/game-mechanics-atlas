import { Suspense } from "react";
import CatalogCoverage from "@/components/CatalogCoverage";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { genres } from "@/lib/knowledge";
import { playStyles } from "@/data/play-styles";
export const metadata = pageMetadata(
  "类型与核心玩法组合：游戏案例覆盖",
  "按游戏类型、核心玩法、平台和年代查找真实案例，查看组合覆盖与资料核对记录。",
  "/games/coverage",
);
export default function CoveragePage() {
  return (
    <>
      <Suspense fallback={<p>正在展开类型与玩法目录…</p>}>
        <CatalogCoverage />
      </Suspense>
      <noscript>
        <h1>类型与核心玩法参考</h1>
        <p>互动组合查询需要 JavaScript。以下目录可直接阅读。</p>
        <h2>传统类型</h2>
        <ul>
          {genres.map((item) => (
            <li key={item.id}>
              <Link href={`/types/${item.id}`}>{item.name}</Link>：
              {item.definition}
            </li>
          ))}
        </ul>
        <h2>核心玩法</h2>
        <ul>
          {playStyles.map((item) => (
            <li key={item.id}>
              <Link href={`/play-styles/${item.id}`}>{item.name}</Link>：
              {item.definition}
            </li>
          ))}
        </ul>
      </noscript>
    </>
  );
}
