import Link from "next/link";
import { playStyles } from "@/data/play-styles";
import { games } from "@/lib/knowledge";
import { PageHead } from "@/components/Primitives";
import { pageMetadata } from "@/lib/seo";
import { MechanicIcon } from "@/components/MechanicVisuals";
export const metadata = pageMetadata(
  "核心玩法方向与游戏案例",
  "查阅玩家常见的操作、决策与活动，了解同一游戏怎样组合多个核心玩法。",
  "/play-styles",
);
export default function PlayStylesPage() {
  return (
    <>
      <PageHead
        eyebrow="PLAY DIRECTIONS / 核心玩法"
        title="核心玩法方向"
        description="这些方向描述玩家主要在做什么。同一款游戏可以同时具有多个方向。"
      />
      <div className="type-index-grid">
        {playStyles.map((style) => {
          const count = games.filter((game) =>
            game.playStyleIds?.includes(style.id),
          ).length;
          return (
            <Link
              key={style.id}
              className="mechanic-card"
              href={`/play-styles/${style.id}`}
            >
              <MechanicIcon id={style.mechanicIds[0]} size={64} />
              <h2>{style.name}</h2>
              <p>{style.definition}</p>
              <span className="chip">{count} 款游戏案例 →</span>
            </Link>
          );
        })}
      </div>
      <p className="detail-section">
        <Link href="/games/coverage">查看类型与核心玩法组合 →</Link>
      </p>
    </>
  );
}
