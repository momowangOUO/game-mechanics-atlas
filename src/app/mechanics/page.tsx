import type { Metadata } from "next";
import { MechanicCatalog } from "@/components/Catalogs";
export const metadata: Metadata = { title: "机制档案" };
export default async function MechanicsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const one = (value: string | string[] | undefined) =>
    typeof value === "string" ? value : "";
  return (
    <MechanicCatalog
      key={`${one(params.dimension)}-${one(params.genre)}-${one(params.q)}-${one(params.core)}`}
      initialDimension={one(params.dimension)}
      initialGenre={one(params.genre)}
      initialQuery={one(params.q)}
      initialCore={one(params.core)}
    />
  );
}
