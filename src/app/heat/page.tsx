import type { Metadata } from "next";
import { Suspense } from "react";
import { HeatQuery } from "@/components/QueryEntrypoints";

export const metadata: Metadata = { title: "搜索热度与蓝海线索" };

export default function Page() {
  return (
    <Suspense fallback={<p role="status">正在打开研究工具…</p>}>
      <HeatQuery />
    </Suspense>
  );
}
