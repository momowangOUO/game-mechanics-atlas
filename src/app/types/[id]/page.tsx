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
          <Assistant message="类型名可以帮助检索，却不能替代机制证据。先看看它到底由哪些规则组成。" />
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
                  本批词表尚未提供可靠的必要组成门槛；空列表不表示所有游戏都自动符合。
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
            <h2>本批研究中的类型参照</h2>
          </div>
          <p className="catalog-note">
            类型标签为编辑检索归纳；真实机制请回读对应案例和范围。
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
