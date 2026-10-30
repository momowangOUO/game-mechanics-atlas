import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import GameViews from "@/components/GameViews";
import { GameCover, PageHead, SectionHead } from "@/components/Primitives";
import {
  games,
  getGame,
  genres,
  recipes,
  scopes,
  sources,
} from "@/lib/knowledge";

export const dynamicParams = false;
export function generateStaticParams() {
  return games.map((game) => ({ id: game.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: getGame(id)?.name || "未收录游戏" };
}
export default async function GamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params,
    game = getGame(id);
  if (!game) notFound();
  const linkedGenres = genres.filter((g) => game.genreIds.includes(g.id));
  const relatedRecipes = recipes.filter((recipe) =>
    recipe.exampleGameIds.includes(game.id),
  );
  return (
    <>
      <div className="breadcrumb">
        <Link href="/">研究室</Link> / <Link href="/games">游戏案例</Link> /{" "}
        {game.name}
      </div>
      <PageHead
        eyebrow={`CASE STUDY / ${game.id}`}
        title={game.name}
        description={game.summary}
      >
        <div className="detail-header-tools">
          <span className="chip">真实案例</span>
          <Link className="button" href={`/compare?left=${game.id}`}>
            加入游戏对比 ⇄
          </Link>
        </div>
      </PageHead>
      <div className="game-layout">
        <GameCover game={game} large />
        <div className="game-summary">
          <p className="analysis-label">设计判断 / 编辑归纳</p>
          <h2 className="serif">
            熟悉一款游戏，
            <br />
            <span className="purple">从它的选择开始。</span>
          </h2>
          <p>{game.analysis.replace(/^设计判断[：:]\s*/, "")}</p>
          <div className="meta-grid">
            <div>
              <small>开发者 / 原作者</small>
              <strong>{game.studio}</strong>
            </div>
            <div>
              <small>年份 / 口径见来源</small>
              <strong>{game.year}</strong>
            </div>
            <div>
              <small>默认研究范围</small>
              <strong>
                {scopes.find((s) => s.id === game.defaultScopeId)?.label}
              </strong>
            </div>
            <div>
              <small>传统类型 / 编辑检索标签</small>
              <strong>
                {linkedGenres.map((g) => g.name).join(" / ") || "暂未归纳"}
              </strong>
            </div>
          </div>
          <div className="type-chips">
            {linkedGenres.map((genre) => (
              <Link className="chip" href={`/types/${genre.id}`} key={genre.id}>
                {genre.name} ↗
              </Link>
            ))}
          </div>
        </div>
      </div>
      <GameViews game={game} />
      <SectionHead number="EVIDENCE" title="事实、来源与研究边界" />
      <div className="generic-grid">
        <section className="paper">
          <h2>本批已核实的信息</h2>
          <ul>
            {game.factNotes.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
          <p className="tiny" style={{ marginTop: 15 }}>
            年份口径：{game.yearBasis}
          </p>
        </section>
        <section className="small-card">
          <h3 className="gold">适用范围</h3>
          <p className="article-copy">{game.scopeNotes}</p>
          <ul className="content-list">
            {game.caveats.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
          <p className="filter-note">{game.metadataNote}</p>
        </section>
      </div>
      <div className="source-list">
        {sources
          .filter((source) => game.sourceIds.includes(source.id))
          .map((source) => (
            <a
              key={source.id}
              href={source.url}
              className="source-link"
              target="_blank"
              rel="noreferrer"
            >
              <strong>{source.title} ↗</strong>
              <span>
                {source.publisher} · 核验 {source.checkedAt}
              </span>
              <span>{source.claimScope}</span>
            </a>
          ))}
      </div>
      {relatedRecipes.length > 0 && (
        <>
          <SectionHead number="FORMULA" title="以此为参照，继续研究组合" />
          <p className="catalog-note">
            下列配方是设计假设；此游戏仅提供部分机制或流程参照，不代表全部配料已被验证。
          </p>
          <div className="recipe-grid">
            {relatedRecipes.map((recipe) => (
              <Link
                className="recipe-card interactive-card"
                href={`/lab?recipe=${recipe.id}`}
                key={recipe.id}
              >
                <span className="eyebrow">HYBRID RECIPE</span>
                <h3>{recipe.name}</h3>
                <p>{recipe.synergies[0] || recipe.tensions[0]}</p>
                <p className="filter-note">
                  设计假设；本案例只提供部分机制或流程参照。
                </p>
                <span className="tiny gold">查看分工与风险 →</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}
