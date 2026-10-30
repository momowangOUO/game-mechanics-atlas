"use client";

import Link from "next/link";
import HomeStage from "./HomeStage";
import { ArtImage, DimensionIcon } from "./Art";
import { recipeArt } from "@/lib/art";

import {
  CountUp,
  GameCard,
  Reveal,
  SectionHead,
  SeedBadge,
  Window,
} from "./Primitives";
import RelationPreview from "./RelationPreview";
import { HomeHeatHighlights } from "./HeatCharts";
import {
  dimensions,
  games,
  getMechanic,
  genres,
  mechanics,
  recipes,
} from "@/lib/knowledge";

export default function Home() {
  const featured = ["balatro", "slay-the-spire", "hades"]
    .map((id) => games.find((g) => g.id === id))
    .filter((g) => g !== undefined);
  return (
    <div className="illustrated-home">
      <HomeStage />
      <section className="metrics" aria-label="知识库规模">
        {[
          [mechanics.length, "原子机制", "按九个维度分类"],
          [games.length, "真实游戏", "来源与分析分开"],
          [genres.length, "复合类型", "类型与机制分别记录"],
          [recipes.length, "组合研究", "理解协同与冲突"],
        ].map(([n, a, b]) => (
          <div className="metric" key={String(a)}>
            <strong>
              <CountUp value={Number(n)} />
            </strong>
            <span>
              {a}
              <br />
              <small>{b}</small>
            </span>
          </div>
        ))}
      </section>
      <Reveal className="home-research-section">
        <SectionHead number="01" title="从一条机制开始">
          <Link href="/mechanics">查看全部档案 →</Link>
        </SectionHead>
        <div className="dashboard-row">
          <Window title="MECHANICS / 研究入口">
            {[
              ["in-run-deck-growth", "♧", "构筑选择如何改变后续行动？"],
              ["run-reset", "⌁", "一次尝试结束后，哪些状态会重建？"],
              ["spatial-loadout", "◇", "位置、形状与能力组合如何配合？"],
            ].map(([id, mark, desc], index) => {
              const mechanic = getMechanic(id);
              return (
                <Link
                  className="mechanic-row"
                  href={`/mechanics/${id}`}
                  key={id}
                >
                  <span className="mechanic-number">0{index + 1}</span>
                  <span className="mechanic-mark" aria-hidden="true">
                    {mechanic && <DimensionIcon id={mechanic.dimension} />}
                  </span>
                  <div>
                    <h3>{mechanic?.name}</h3>
                    <p>
                      {
                        dimensions.find((d) => d.id === mechanic?.dimension)
                          ?.name
                      }{" "}
                      · {desc}
                    </p>
                  </div>
                  <span className="tail">阅读档案 ↗</span>
                </Link>
              );
            })}
          </Window>
          <Window title="OPPORTUNITY NOTE / 机会观察">
            <div className="opportunity">
              <div className="opportunity-label">▸ 搜索关注与竞品供给</div>
              <h3>
                先看搜索关注，
                <br />
                再核对供给。
              </h3>
              <p>
                搜索次数帮助发现关注方向，竞品样本帮助核对供给。
                <br />
                低供给不等于已经证明的市场空白。
              </p>
              <div className="mini-bars" aria-hidden="true">
                {[24, 28, 25, 33, 31, 38, 42, 47, 52, 61, 70, 84].map(
                  (h, i) => (
                    <i key={i} style={{ height: `${h}%` }} />
                  ),
                )}
              </div>
              <SeedBadge />
              <Link className="tiny cyan opportunity-link" href="/heat">
                打开热度观察 →
              </Link>
            </div>
          </Window>
        </div>
      </Reveal>
      <Reveal className="home-research-section">
        <SectionHead number="02" title="把熟悉的游戏拆开看">
          <Link href="/games">{games.length} 款真实案例 →</Link>
        </SectionHead>
        <div className="case-grid">
          {featured.map((game) => (
            <GameCard game={game} key={game.id} />
          ))}
        </div>
      </Reveal>
      <Reveal className="home-research-section">
        <SectionHead number="03" title="机制之间，发生了什么？">
          <Link href="/graph">打开交互图谱 ↗</Link>
        </SectionHead>
        <Window title="RELATION GRAPH / 分类独立，关系相连">
          <RelationPreview />
          <p className="tiny muted">
            机制关系示意 · 可在交互图谱中缩放、拖动、查看相邻机制与游戏案例
          </p>
        </Window>
      </Reveal>
      <Reveal className="home-research-section">
        <SectionHead number="04" title="下一次实验，先从哪里开始？">
          <Link href="/lab">进入混合实验室 ↗</Link>
        </SectionHead>
        <div className="recipe-grid">
          {recipes.slice(0, 4).map((recipe, i) => (
            <Link
              href={`/lab?recipe=${recipe.id}`}
              className="recipe-card interactive-card"
              key={recipe.id}
            >
              <ArtImage
                className="recipe-illustration"
                src={recipeArt(recipe.id)}
                alt=""
                width={1672}
                height={941}
              />
              <span className="eyebrow">FORMULA / 0{i + 1}</span>
              <h3>{recipe.name}</h3>
              <p>
                {recipe.mechanicIds
                  .map((id) => getMechanic(id)?.name)
                  .filter(Boolean)
                  .join(" ＋ ")}
              </p>
              <span className="tiny gold">查看机制分工与验证问题 →</span>
            </Link>
          ))}
        </div>
      </Reveal>
      <Reveal className="home-research-section">
        <SectionHead number="05" title="从玩家的搜索里，找研究线索">
          <Link href="/heat">查看完整热度观察 ↗</Link>
        </SectionHead>
        <HomeHeatHighlights />
      </Reveal>
    </div>
  );
}
