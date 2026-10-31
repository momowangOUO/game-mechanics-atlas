import type { Metadata } from "next";
import { Suspense } from "react";
import { HeatQuery } from "@/components/QueryEntrypoints";

export const metadata: Metadata = { title: "搜索趋势与真实来源" };

export default function Page() {
  return (
    <Suspense fallback={<p role="status">正在打开研究工具…</p>}>
      <HeatQuery />
    </Suspense>
  );
}
