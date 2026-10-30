import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Assistant,
  GameCard,
  PageHead,
  StateBadge,
} from "@/components/Primitives";
import {
  dimensions,
  getMechanic,
  getRelatedGames,
  mechanics,
  recipes,
  getInstances,
  scopes,
  sources,
} from "@/lib/knowledge";

export const dynamicParams = false;
export function generateStaticParams() {
  return mechanics.map((m) => ({ id: m.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: getMechanic(id)?.name || "未收录机制" };
}
export default async function MechanicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params,
    mechanic = getMechanic(id);
  if (!mechanic) notFound();
  const dimension = dimensions.find((d) => d.id === mechanic.dimension)!;
  const relatedGames = getRelatedGames(id),
    combinations = recipes.filter((r) => r.mechanicIds.includes(id));
  const related = mechanic.relatedMechanics
    .map(getMechanic)
    .filter((m) => m !== undefined);
  const observations = relatedGames.flatMap((game) =>
    getInstances(game.id)
      .filter((o) => o.mechanicId === id)
      .map((observation) => ({ game, observation })),
  );
  const sourceIds = [
    ...new Set(observations.flatMap((o) => o.observation.sourceIds)),
  ];
  return (
    <>
      <div className="breadcrumb">
        <Link href="/">研究室</Link> / <Link href="/mechanics">机制档案</Link> /{" "}
        {dimension.name} / {mechanic.name}
      </div>
      <PageHead
        eyebrow={`MECHANIC FILE / ${dimension.short} / ${mechanic.id}`}
        title={mechanic.name}
        description={mechanic.definition}
      >
        <div className="detail-header-tools">
          <Link className="button" href={`/graph?focus=${id}`}>
            在图谱中查看 ⌘
          </Link>
          <Link className="button primary" href={`/lab?add=${id}`}>
            加入组合实验 ＋
          </Link>
        </div>
      </PageHead>
      <div className="three-col">
        <aside className="sidebar detail-sidebar">
          <h3>档案索引 / CONTENTS</h3>
          {[
            ["definition", "标准定义"],
            ["boundaries", "纳入与排除边界"],
            ["misconceptions", "常见误解"],
            ["design", "设计价值与风险"],
            ["examples", "真实案例"],
            ["combinations", "组合与关系"],
            ["evidence", "来源与范围"],
          ].map(([anchor, label]) => (
            <a key={anchor} href={`#${anchor}`}>
              {label}
            </a>
          ))}
          <div className="info">
            主分类
            <br />
            <Link
              className="purple"
              href={`/mechanics?dimension=${mechanic.dimension}`}
            >
              {dimension.name}
            </Link>
            <br />
            <br />
            本条是本库的操作定义。
            <br />
            与其他机制的关系不改变主分类。
          </div>
        </aside>
        <article>
          <section id="definition" className="paper definition-paper">
            <div className="definition-meta">
              <Link
                className="chip"
                href={`/mechanics?dimension=${mechanic.dimension}`}
              >
                {dimension.name}
              </Link>
              <span className="chip">原子机制</span>
              <span className="chip">编辑定义</span>
            </div>
            <h2>标准定义</h2>
            <p className="definition-quote">{mechanic.definition}</p>
            <div id="boundaries" className="rule-columns">
              <div className="rule-column">
                <h3>＋ 纳入条件</h3>
                <ul>
                  {mechanic.inclusionRules.map((text) => (
                    <li key={text}>{text}</li>
                  ))}
                </ul>
              </div>
              <div className="rule-column">
                <h3>－ 排除边界</h3>
                <ul>
                  {mechanic.exclusionRules.map((text) => (
                    <li key={text}>{text}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
          <section id="misconceptions" className="note">
            <span className="gold">常见误解 /</span>
            {mechanic.misconceptions.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </section>
          <section id="design" className="detail-section">
            <h2>设计价值与代价</h2>
            <div className="generic-grid">
              <div className="small-card">
                <p className="analysis-label">设计归纳 / 可以带来什么</p>
                <ul className="content-list">
                  {mechanic.designValue.map((text) => (
                    <li key={text}>{text}</li>
                  ))}
                </ul>
              </div>
              <div className="small-card">
                <p className="analysis-label gold">需要观察的风险</p>
                <ul className="content-list">
                  {mechanic.risks.map((text) => (
                    <li key={text}>{text}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="note">
              <strong>适配建议</strong>
              <ul className="content-list">
                {mechanic.adaptation.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
              <div className="type-chips">
                {mechanic.corePlayTags.map((tag) => (
                  <Link
                    href={`/mechanics?core=${encodeURIComponent(tag)}`}
                    className="chip"
                    key={tag}
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
            <div className="scope-box">
              <span className="gold">
                实现难点：{mechanic.complexity}（定性判断）
              </span>
              <br />
              {mechanic.implementationNotes}
              <br />
              这里描述最小实现需要处理的难点，不是工期、成本或设计质量评分。
            </div>
          </section>
          <section id="examples" className="detail-section">
            <h2>把定义放回真实游戏</h2>
            {observations.length ? (
              <div className="related-game-list">
                {observations.map(({ game, observation }) => (
                  <div className="related-game-item" key={observation.id}>
                    <StateBadge status={observation.status} />
                    <h3>
                      <Link href={`/games/${game.id}`}>{game.name} ↗</Link>
                    </h3>
                    <p>
                      {scopes.find((s) => s.id === observation.scopeId)?.label}
                      <br />
                      {observation.scopeNote}
                    </p>
                    {observation.condition && (
                      <p className="gold">成立条件：{observation.condition}</p>
                    )}
                    <p>{observation.rationale}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="scope-box">
                本条已有定义与设计说明，但已核验的官方资料尚不足以支持直接实例。目前没有关联游戏案例，不能据此认定机制不存在。
              </div>
            )}
            <div className="state-legend" aria-label="实例状态说明">
              {(
                [
                  "present",
                  "absent",
                  "not_applicable",
                  "unknown",
                  "conditional",
                ] as const
              ).map((status) => (
                <StateBadge key={status} status={status} />
              ))}
            </div>
          </section>
          <section id="combinations" className="detail-section">
            <h2>常见组合与相关机制</h2>
            <p className="article-copy">
              以下是可继续验证的设计配方；参照游戏不代表已验证整组机制。
            </p>
            <div className="recipe-grid detail-recipe-grid">
              {combinations.slice(0, 4).map((recipe) => (
                <Link
                  className="recipe-card interactive-card"
                  href={`/lab?recipe=${recipe.id}`}
                  key={recipe.id}
                >
                  <span className="eyebrow">HYBRID FORMULA</span>
                  <h3>{recipe.name}</h3>
                  <p>{recipe.roles[id] || recipe.synergies[0]}</p>
                  <span className="tiny gold">在实验室中继续 →</span>
                </Link>
              ))}
            </div>
            <div className="type-chips">
              {related.map((m) => (
                <Link className="chip" key={m.id} href={`/mechanics/${m.id}`}>
                  {m.name} ↗
                </Link>
              ))}
            </div>
            {!combinations.length && (
              <p className="scope-box">
                尚未收录包含此机制的完整配方，可以将它加入实验室，研究新的组合。
              </p>
            )}
          </section>
          <section id="evidence" className="detail-section">
            <h2>来源与判定范围</h2>
            <p className="scope-box">
              机制定义、价值、风险、适配建议与关联由本站编辑整理。游戏案例中的每条观察都有对应范围与来源。未知不等于不存在；有条件成立的机制，也不能推广为整个游戏中无条件存在。
            </p>
            <div className="source-list">
              {sources
                .filter((s) => sourceIds.includes(s.id))
                .map((source) => (
                  <a
                    className="source-link"
                    key={source.id}
                    href={source.url}
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
          </section>
        </article>
        <aside>
          <Assistant />
          <section className="content-section">
            <h3 className="tiny purple">RELATED FILES</h3>
            {related.map((m) => (
              <Link
                href={`/mechanics/${m.id}`}
                key={m.id}
                className="side-related-link"
              >
                {m.name} ↗<br />
                <span className="muted">
                  {dimensions.find((d) => d.id === m.dimension)?.name}
                </span>
              </Link>
            ))}
          </section>
        </aside>
      </div>
      {relatedGames.length > 0 && (
        <>
          <div className="section-head">
            <div>
              <p className="eyebrow">CASE STUDIES</p>
              <h2>继续阅读案例</h2>
            </div>
          </div>
          <div className="case-grid">
            {relatedGames.slice(0, 3).map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
