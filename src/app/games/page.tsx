import { indexPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { GameCatalog } from "@/components/Catalogs";
export const metadata: Metadata = indexPageMetadata["/games"];
export default function GamesPage() {
  return <GameCatalog />;
}
