import type { Metadata } from "next";
import { GameCatalog } from "@/components/Catalogs";
export const metadata: Metadata = { title: "游戏案例" };
export default function GamesPage() {
  return <GameCatalog />;
}
