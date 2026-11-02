import { indexPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { GameCatalog } from "@/components/Catalogs";
import { games } from "@/lib/knowledge";
import Link from "next/link";
export const metadata: Metadata = indexPageMetadata["/games"];
export default function GamesPage() {
  return <><GameCatalog /><noscript><section><h1>游戏案例</h1>{games.map(game=><article key={game.id}><h2><Link href={`/games/${game.id}`}>{game.name}</Link></h2><p>{game.summary}</p></article>)}</section></noscript></>;
}
