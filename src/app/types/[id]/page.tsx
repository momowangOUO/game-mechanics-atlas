import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Assistant, GameCard, PageHead } from "@/components/Primitives";
import { genres, games, getMechanic } from "@/lib/knowledge";
export const dynamicParams = false;
export function generateStaticParams() {
  return genres.map((g) => ({ id: g.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: genres.find((g) => g.id === id)?.name || "未收录类型" };
}
export default async function TypePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const genre = genres.find((g) => g.id === id);
  if (!genre) notFound();
  const relatedGames = games.filter((g) => g.genreIds.includes(id));
  return (
    <>
      <div className="breadcrumb">
        <Link href="/">研究室</Link> / <Link href="/types">复合类型</Link> /{" "}
        {genre.name}
      </div>
      <PageHead
        eyebrow="COMPOSITE TYPE / 传统分类与编辑画像"
        title={genre.name}
        description={genre.definition}
      >
        <span className="chip gold">复合类型，不是原子机制</span>
      </PageHead>
      <div className="two-col">
        <aside>
          <Assistant message="先查看这个类型的机制组成，再到游戏案例中核对具体规则和适用范围。类型标签本身不能作为机制证据。" />
        </aside>
        <article>
          <div className="paper">
            <h2>本库采用的画像</h2>
            <p>{genre.definition}</p>
            <p style={{ marginTop: 13 }}>
              这是本平台用于研究和检索的编辑归纳，不是对全部历史作品的统一判类标准。
            </p>
          </div>
          {[
            ["本画像的核心组成", genre.requiredMechanics],
            ["常见组成", genre.commonMechanics],
            ["可选的扩展组成", genre.optionalMechanics],
          ].map(([title, ids]) => (
            <section className="detail-section" key={String(title)}>
              <h2>{String(title)}</h2>
              {(ids as string[]).length ? (
                <div className="type-chips">
                  {(ids as string[]).map((mechanicId) => {
                    const mechanic = getMechanic(mechanicId);
                    return (
                      <Link
                        key={mechanicId}
                        href={`/mechanics/${mechanicId}`}
                        className="chip"
                      >
                        {mechanic?.name} ↗
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="scope-box">
                  此列表暂无条目。核心组成未列出时，不能据此认定所有游戏都符合该类型。
                </p>
              )}
            </section>
          ))}
          <section className="detail-section">
            <h2>边界与容易混淆的地方</h2>
            <ul className="content-list">
              {genre.boundaries.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          </section>
          <Link
            className="button primary"
            href={`/mechanics?genre=${genre.id}`}
          >
            查看关联原子机制 →
          </Link>
        </article>
      </div>
      {relatedGames.length > 0 && (
        <>
          <div className="section-head">
            <h2>收录案例中的类型参照</h2>
          </div>
          <p className="catalog-note">
            类型标签由本站编辑整理，用于检索；具体机制以案例中的证据和适用范围为准。
          </p>
          <div className="case-grid">
            {relatedGames.slice(0, 6).map((game) => (
              <GameCard game={game} key={game.id} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
