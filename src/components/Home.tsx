"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { useUI } from "./Providers";
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
  const { openSearch, effects } = useUI();
  const [query, setQuery] = useState(""),
    [greeting, setGreeting] = useState(false);
  const featured = ["balatro", "slay-the-spire", "hades"]
    .map((id) => games.find((g) => g.id === id))
    .filter((g) => g !== undefined);
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">GAME DESIGN RESEARCH / ゲームデザイン研究室</p>
          <h1>
            拆解游戏，
            <br />
            发现<em>新玩法。</em>
          </h1>
          <p className="hero-desc">
            从一条规则到一组机制，从经典案例到新的组合。
            <br />
            为游戏设计师整理定义、边界、关系与研究线索。
          </p>
          <form
            className="search-window"
            onSubmit={(event) => {
              event.preventDefault();
              openSearch(query);
            }}
          >
            <div className="search-title">
              <span>SEARCH ARCHIVE / 检索档案</span>
              <span aria-hidden="true">─　□　×</span>
            </div>
            <div className="search-body">
              <span className="search-icon" aria-hidden="true">
                ⌕
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜机制、游戏，或者一种玩法组合…"
                aria-label="首页搜索"
              />
              <button type="submit" className="keycap" aria-label="搜索知识库">
                Ctrl K
              </button>
            </div>
          </form>
          <div className="hero-tags">
            <span>试着搜索：</span>
            {["卡组", "Balatro", "撤离"].map((tag) => (
              <button key={tag} onClick={() => openSearch(tag)}>
                {tag}
              </button>
            ))}
          </div>
          <div className="hero-actions">
            <Link className="button primary" href="/mechanics">
              进入机制档案 <span aria-hidden="true">→</span>
            </Link>
            <Link className="button" href="/lab">
              试验一种新组合 ↗
            </Link>
          </div>
        </div>
        <div
          className="hero-art"
          onMouseEnter={() => setGreeting(true)}
          onMouseLeave={() => setGreeting(false)}
        >
          <div className="art-disc" />
          <span className="hero-number" aria-hidden="true">
            01
          </span>
          <span className="orbit-label">研究助手 ／ 黒髪メイド</span>
          <motion.img
            className="maid"
            width="1024"
            height="1536"
            src="/art/maid-cel.png"
            alt="黑发女仆研究助手，手持档案夹和铅笔，采用粗黑线赛璐璐画法"
            animate={effects ? { y: [0, -4, 0] } : { y: 0 }}
            whileHover={effects ? { rotate: -0.7 } : undefined}
            transition={{
              duration: 5,
              repeat: effects ? Infinity : 0,
              ease: "easeInOut",
            }}
            fetchPriority="high"
          />
          <div className="dialogue">
            <div className="dialogue-title">
              <strong>研究助手 RIN</strong>
              <span>MESSAGE / 001</span>
            </div>
            <p>
              {greeting ? (
                <>
                  我会帮你保留那些容易被忽略的条件。
                  <br />
                  <strong>未知，不等于不存在。</strong>
                </>
              ) : (
                <>
                  欢迎来到研究室。
                  <br />
                  <strong>今天，想从哪一种“好玩”开始研究？</strong>
                </>
              )}
              <span aria-hidden="true"> ▾</span>
            </p>
          </div>
        </div>
      </section>
      <section className="metrics" aria-label="知识库规模">
        {[
          [mechanics.length, "原子机制", "固定九维分类"],
          [games.length, "真实游戏", "来源与分析分开"],
          [genres.length, "类型配方", "复合类型独立记录"],
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
      <Reveal>
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
                    {mark}
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
              <div className="opportunity-label">▸ 需求与供给，分开观察</div>
              <h3>
                先看搜索关注，
                <br />
                再核对供给。
              </h3>
              <p>
                从搜索关注中寻找线索，再核对竞品覆盖。
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
      <Reveal>
        <SectionHead number="02" title="把熟悉的游戏拆开看">
          <Link href="/games">{games.length} 款真实案例 →</Link>
        </SectionHead>
        <div className="case-grid">
          {featured.map((game) => (
            <GameCard game={game} key={game.id} />
          ))}
        </div>
      </Reveal>
      <Reveal>
        <SectionHead number="03" title="机制之间，发生了什么？">
          <Link href="/graph">打开交互图谱 ↗</Link>
        </SectionHead>
        <Window title="RELATION GRAPH / 分类独立，关系相连">
          <RelationPreview />
          <p className="tiny muted">
            编辑关系示意 · 交互图谱支持缩放、拖动、邻接高亮与案例追踪
          </p>
        </Window>
      </Reveal>
      <Reveal>
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
      <Reveal>
        <SectionHead number="05" title="从玩家的搜索里，找研究线索">
          <Link href="/heat">查看完整热度观察 ↗</Link>
        </SectionHead>
        <HomeHeatHighlights />
      </Reveal>
    </>
  );
}
