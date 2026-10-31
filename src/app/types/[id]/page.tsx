import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Assistant, GameCard, PageHead } from "@/components/Primitives";
import {
  genres,
  games,
  getMechanic,
  getInstances,
  scopes,
} from "@/lib/knowledge";
import { getTypeReference } from "@/data/type-reference";
import { StateBadge } from "@/components/Primitives";
import { evidenceLabels } from "@/lib/evidence-labels";
import styles from "@/components/TypeReference.module.css";
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
  const guide = getTypeReference(id);
  const comparison = genres.find((item) => item.id === guide?.compareId);
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
          {guide && (
            <>
              <section className="detail-section">
                <h2>玩家主要在做什么？</h2>
                <p>{guide.playerTask}</p>
                <ol className="content-list">
                  {guide.loop.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <h3>设计时要解决的问题</h3>
                <p>{guide.designQuestion}</p>
                <p className="tiny muted">
                  玩法过程与设计问题为本站编辑归纳，具体作品的规则以游戏实例为准。
                </p>
              </section>
              <section className="detail-section">
                <h2>与{comparison?.name}有什么不同？</h2>
                <p>{guide.difference}</p>
                <Link className="button" href={`/types/${guide.compareId}`}>
                  对照{comparison?.name} →
                </Link>
              </section>
            </>
          )}
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
            <h2>典型参照：具体看哪些规则？</h2>
          </div>
          <p className="catalog-note">
            类型标签由本站编辑整理，用于检索；具体机制以案例中的证据和适用范围为准。
          </p>
          <div className={`case-grid ${styles.references}`}>
            {relatedGames.slice(0, 6).map((game) => {
              const ids = [
                ...genre.requiredMechanics,
                ...genre.commonMechanics,
                ...genre.optionalMechanics,
              ];
              const matching = (scopeId: string) =>
                getInstances(game.id, scopeId).filter(
                  (instance) =>
                    ["present", "conditional"].includes(instance.status) &&
                    ids.includes(instance.mechanicId),
                );
              const defaultScope = scopes.find(
                (scope) => scope.id === game.defaultScopeId,
              )!;
              const scope = matching(defaultScope.id).length
                ? defaultScope
                : (scopes
                    .filter((scope) => scope.gameId === game.id)
                    .sort(
                      (a, b) => matching(b.id).length - matching(a.id).length,
                    )[0] ?? defaultScope);
              const observed = matching(scope.id).slice(0, 2);
              return (
                <article key={game.id}>
                  <GameCard game={game} />
                  <div className="scope-box">
                    <strong>观察范围：{scope?.label}</strong>
                    {observed.length ? (
                      observed.map((instance) => (
                        <div key={instance.id} style={{ marginTop: 14 }}>
                          <Link
                            className="cyan"
                            href={`/mechanics/${instance.mechanicId}`}
                          >
                            {getMechanic(instance.mechanicId)?.name} ↗
                          </Link>{" "}
                          <StateBadge status={instance.status} />
                          <small className="muted">
                            {" "}
                            · {evidenceLabels[instance.evidenceKind]}
                          </small>
                          <p>{instance.rationale}</p>
                          {instance.condition && (
                            <p>成立条件：{instance.condition}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p>
                        当前尚无本画像所列机制的可展示记录；类型标签不用于补齐未知项。
                      </p>
                    )}
                    <Link
                      className="button"
                      href={`/games/${game.id}?scope=${encodeURIComponent(scope.id)}`}
                    >
                      打开该范围的完整证据 →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
          {relatedGames.length > 6 && (
            <p className="catalog-note">
              此处先展示 6 款参照。全部 {relatedGames.length} 款：
              {relatedGames.slice(6).map((game, index) => (
                <span key={game.id}>
                  {index > 0 && "、"}
                  <Link className="cyan" href={`/games/${game.id}`}>
                    {game.name}
                  </Link>
                </span>
              ))}
            </p>
          )}
        </>
      )}
    </>
  );
}
