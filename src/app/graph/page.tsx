import type { Metadata } from "next";
import { Suspense } from "react";
import { GraphQuery } from "@/components/QueryEntrypoints";

export const metadata: Metadata = { title: "交互机制图谱" };

export default function Page() {
  return (
    <Suspense fallback={<p role="status">正在打开研究工具…</p>}>
      <GraphQuery />
    </Suspense>
  );
}
