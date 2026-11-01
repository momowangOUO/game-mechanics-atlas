import { indexPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { Suspense } from "react";
import { GraphQuery } from "@/components/QueryEntrypoints";

export const metadata: Metadata = indexPageMetadata["/graph"];

export default function Page() {
  return (
    <Suspense fallback={<p role="status">正在打开研究工具…</p>}>
      <GraphQuery />
    </Suspense>
  );
}
