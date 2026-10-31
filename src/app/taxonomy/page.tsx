import type { Metadata } from "next";
import { Suspense } from "react";
import TaxonomyExplorer from "@/components/TaxonomyExplorer";

export const metadata: Metadata = { title: "玩法分类图鉴" };

export default function TaxonomyPage() {
  return (
    <Suspense fallback={<p role="status">正在打开分类图鉴…</p>}>
      <TaxonomyExplorer />
    </Suspense>
  );
}
