import Link from "next/link";
import { GameCard, PageHead } from "@/components/Primitives";
import { resolveDiscovery, streamDiscovery } from "@/data/stream-discovery";
import { games } from "@/lib/knowledge";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "直播与传播案例",
  "从直播报告查找游戏案例，并查看观察期、指标口径与资料来源。",
  "/games/discovery",
);

export default function DiscoveryPage() {
  const items = resolveDiscovery(streamDiscovery, games);
  return (
    <>
      <nav className="breadcrumb"><Link href="/games">游戏案例</Link> / 直播与传播案例</nav>
      <PageHead
        eyebrow="DISCOVERY / 直播与传播"
        title="直播与传播案例"
        description="从直播报告中寻找值得研究的游戏，并查看观察期和来源。"
      />
      <section className="paper">
        <h2>如何阅读</h2>
        <p>报告的全球榜、地区榜、主播个例和主题举例各有范围。观看时长不是玩家人数或搜索需求，过去的传播也不代表当前热度。</p>
        <p>已经收录的作品可进入案例；尚未建立案例的作品保留来源，玩法资料待补。分类名称和游戏版本不完全一致时会单独说明。</p>
      </section>
      <section className="detail-section">
        <h2>观察记录 · {items.length} 项</h2>
        <div className="case-grid continuous-cases discovery-cases">
          {items.map(({ entry, game }) => (
            <article className="paper" key={entry.id}>
              {game ? <GameCard game={game} /> : <h3>{entry.name}</h3>}
              <p>{entry.observation}</p>
              {entry.scopeNote && <p>{entry.scopeNote}</p>}
              {!game && <p>案例资料待补</p>}
              <p>观察期：{entry.source.period}</p>
              <p>指标口径：{entry.source.metric}</p>
              <p><a href={entry.source.url} target="_blank" rel="noreferrer">来源：{entry.source.publisher} ↗</a></p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
