import type { Metadata } from "next";
import { Suspense } from "react";
import { LabQuery } from "@/components/QueryEntrypoints";

export const metadata: Metadata = { title: "混合实验室" };

export default function Page() {
  return (
    <Suspense fallback={<p role="status">正在打开研究工具…</p>}>
      <LabQuery />
    </Suspense>
  );
}
