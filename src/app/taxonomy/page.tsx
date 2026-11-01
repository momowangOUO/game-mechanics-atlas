import type { Metadata } from "next";
import { Suspense } from "react";
import TaxonomyExplorer from "@/components/TaxonomyExplorer";
import { TaxonomyOverview } from "@/components/TaxonomyOverview";
import { indexPageMetadata } from "@/lib/seo";

export const metadata: Metadata = indexPageMetadata["/taxonomy"];

export default function TaxonomyPage() {
  return (
    <>
      <Suspense fallback={<p role="status">正在打开分类图鉴…</p>}>
        <TaxonomyExplorer />
      </Suspense>
      <noscript>
        <TaxonomyOverview />
      </noscript>
    </>
  );
}
