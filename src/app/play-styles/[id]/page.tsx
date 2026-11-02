import Link from "next/link";
import { notFound } from "next/navigation";
import { playStyles } from "@/data/play-styles";
import { games, getMechanic } from "@/lib/knowledge";
import { GameCard, PageHead } from "@/components/Primitives";
import { pageMetadata } from "@/lib/seo";
import { BreadcrumbStructuredData } from "@/components/StructuredData";
export const dynamicParams = false;
export function generateStaticParams() {
  return playStyles.map(({ id }) => ({ id }));
}
type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const style = playStyles.find((row) => row.id === id);
  if (!style) notFound();
  return pageMetadata(
    `${style.name}：核心玩法与游戏范例`,
    style.definition,
    `/play-styles/${id}`,
  );
}
export default async function PlayStylePage({ params }: Props) {
  const { id } = await params;
  const style = playStyles.find((row) => row.id === id);
  if (!style) notFound();
  const examples = games.filter((game) =>
    game.playStyleIds?.includes(style.id),
  );
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: "机制研究室", path: "/" },
          { name: "核心玩法方向", path: "/play-styles" },
          { name: style.name, path: `/play-styles/${id}` },
        ]}
      />
      <nav className="breadcrumb">
        <Link href="/play-styles">核心玩法方向</Link> / {style.name}
      </nav>
      <PageHead
        eyebrow="PLAY DIRECTION / 玩家活动"
        title={style.name}
        description={style.definition}
      />
      <section className="paper">
        <h2>相关机制</h2>
        <p>玩法方向用于查找案例，具体规则仍按各游戏的研究范围记录。</p>
        <div className="type-chips">
          {style.mechanicIds.map((mechanicId) => (
            <Link
              className="chip"
              href={`/mechanics/${mechanicId}`}
              key={mechanicId}
            >
              {getMechanic(mechanicId)?.name} →
            </Link>
          ))}
        </div>
      </section>
      <section className="detail-section">
        <h2>游戏范例 · {examples.length} 款</h2>
        <div className="case-grid continuous-cases">
          {examples.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>
      <Link className="button" href={`/games/coverage?play=${style.id}`}>
        按传统类型查看这个玩法 →
      </Link>
    </>
  );
}
