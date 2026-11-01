"use client";

import Link from "next/link";
import HomeStage from "./HomeStage";
import { ArtImage, DimensionIcon } from "./Art";
import { recipeArt } from "@/lib/art";
import styles from "./Home.module.css";
import { taxonomyGroups } from "@/data/taxonomy-reference";
import { AuthorSection } from "./Author";

import { CountUp, GameCard, Reveal, SectionHead, Window } from "./Primitives";
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
          [recipes.length, "组合研究", "整理研究与验证问题"],
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
        <SectionHead number="01" title="按分类查机制">
          <Link href="/taxonomy">打开完整分类参考 →</Link>
        </SectionHead>
        <div className="dashboard-row">
          <Window title="TAXONOMY / 九个观察维度">
            <div className={styles.dimensions}>
              {dimensions.map((dimension) => (
                <Link
                  className={styles.dimension}
                  href={`/taxonomy?dimension=${dimension.id}`}
                  key={dimension.id}
                >
                  <DimensionIcon id={dimension.id} />
                  <strong>{dimension.name}</strong>
                  <p>{dimension.description}</p>
                  <small>
                    {
                      taxonomyGroups.filter(
                        (group) => group.dimensionId === dimension.id,
                      ).length
                    }{" "}
                    个分组 ·{" "}
                    {
                      mechanics.filter(
                        (mechanic) => mechanic.dimension === dimension.id,
                      ).length
                    }{" "}
                    个机制 →
                  </small>
                </Link>
              ))}
            </div>
          </Window>
          <Window title="READING GUIDE / 沿着分类找参考">
            <div className={styles.guide}>
              <span className="eyebrow">维度 → 分组 → 机制 → 游戏实例</span>
              <h3>从玩法问题出发，找到对应规则。</h3>
              <ol>
                <li>
                  <strong>选观察维度</strong>
                  <p>例如“构筑与配置”，关注玩家如何安排可用能力。</p>
                </li>
                <li>
                  <strong>看分组和边界</strong>
                  <p>分清卡组变化、空间配置和出战配置的区别。</p>
                </li>
                <li>
                  <strong>对照具体游戏</strong>
                  <p>查看规则用在哪个模式、何时生效，再核对来源。</p>
                </li>
              </ol>
              <Link className="button primary" href="/taxonomy">
                逐层查分类 →
              </Link>
              <Link className="button" href="/types">
                另查 {genres.length} 个复合类型 →
              </Link>
            </div>
          </Window>
        </div>
      </Reveal>
      <Reveal className="home-research-section">
        <SectionHead number="02" title="游戏范例">
          <Link href="/games">{games.length} 款真实案例 →</Link>
        </SectionHead>
        <div className="case-grid">
          {featured.map((game) => (
            <GameCard game={game} key={game.id} />
          ))}
        </div>
      </Reveal>
      <Reveal className="home-research-section">
        <SectionHead number="03" title="机制关系图">
          <Link href="/graph">打开交互图谱 ↗</Link>
        </SectionHead>
        <Window title="RELATION GRAPH / 查看机制之间的关系">
          <RelationPreview />
          <p className="tiny muted">
            机制关系示意 · 可在交互图谱中缩放、拖动、查看相邻机制与游戏案例
          </p>
        </Window>
      </Reveal>
      <Reveal className="home-research-section">
        <SectionHead number="04" title="机制组合研究">
          <Link href="/lab">编写研究提示词 ↗</Link>
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
              <span className="tiny gold">编写这组机制的研究提示词 →</span>
            </Link>
          ))}
        </div>
      </Reveal>
      <Reveal className="home-research-section">
        <SectionHead number="05" title="搜索趋势">
          <Link href="/heat">查看完整热度观察 ↗</Link>
        </SectionHead>
        <HomeHeatHighlights />
      </Reveal>
      <AuthorSection />
    </div>
  );
}
