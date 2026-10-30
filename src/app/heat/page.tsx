import type { Metadata } from "next";
import HeatObservatory from "@/components/HeatObservatory";
export const metadata: Metadata = { title: "搜索热度与蓝海线索" };
export default async function HeatPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <HeatObservatory
      initialTopic={typeof params.topic === "string" ? params.topic : ""}
      initialView={typeof params.view === "string" ? params.view : ""}
    />
  );
}
