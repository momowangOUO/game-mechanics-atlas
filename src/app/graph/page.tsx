import type { Metadata } from "next";
import AtlasGraph from "@/components/AtlasGraph";
export const metadata: Metadata = { title: "交互机制图谱" };
export default async function GraphPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <AtlasGraph
      initialFocus={typeof params.focus === "string" ? params.focus : ""}
      initialGame={typeof params.game === "string" ? params.game : ""}
    />
  );
}
