"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { ArtImage, MaidPortrait } from "./Art";
import { useUI } from "./Providers";
import { chapters, chapterArt, type MaidState } from "@/lib/art";

const messages: { state: MaidState; text: string }[] = [
  {
    state: "welcome",
    text: "欢迎来到研究室，我是 RIN。想查玩法，可以先翻分类参考；想找设计思路，就从熟悉的游戏看起。",
  },
  {
    state: "explain",
    text: "先选一款熟悉的游戏，对照它的核心循环和规则。遇到不同模式，记得分开看。",
  },
  {
    state: "think",
    text: "实验室可以把机制组合整理成研究提示词。先选核心机制，再补充想验证的问题。",
  },
  {
    state: "surprise",
    text: "图谱记录了机制之间的配合与冲突。点开节点，就能查看相关规则和游戏案例。",
  },
];
export default function HomeStage() {
  const { openSearch, effects } = useUI();
  const [query, setQuery] = useState("");
  const [line, setLine] = useState(0);
  const pointerX = useMotionValue(0),
    pointerY = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 75, damping: 24 }),
    y = useSpring(pointerY, { stiffness: 75, damping: 24 });
  const fx = useTransform(x, (v) => v * -1.5);
  const current = messages[line];
  return (
    <>
      <section
        className="vn-stage"
        aria-label="夜间研究室"
        onPointerMove={(e) => {
          if (!effects || e.pointerType !== "mouse") return;
          const rect = e.currentTarget.getBoundingClientRect();
          pointerX.set(((e.clientX - rect.left) / rect.width - 0.5) * 10);
          pointerY.set(((e.clientY - rect.top) / rect.height - 0.5) * 6);
        }}
        onPointerLeave={() => {
          pointerX.set(0);
          pointerY.set(0);
        }}
      >
        <motion.div
          className="vn-background"
          style={{ x: effects ? x : 0, y: effects ? y : 0 }}
        >
          <ArtImage
            src="/art/room-dusk.webp"
            alt="暮色中的研究室，书架、旧电脑和摆满卡牌的木桌"
            width={1536}
            height={1024}
            priority
          />
        </motion.div>
        <div className="vn-shade" />
        <div className="vn-copy">
          <p className="vn-kicker">
            夜の研究室 <span>／ OPEN FOR IDEAS</span>
          </p>
          <h1>
            拆解游戏，
            <br />
            发现<em>新玩法。</em>
          </h1>
          <p className="vn-description">
            不同规则怎样影响玩家的选择？
            <br />
            按分类查机制，对照游戏找参考。
          </p>
          <form
            className="search-window vn-search"
            onSubmit={(e) => {
              e.preventDefault();
              openSearch(query);
            }}
          >
            <div className="search-title">
              <span>SEARCH ARCHIVE ／ 検索档案</span>
              <span aria-hidden="true">─　□</span>
            </div>
            <div className="search-body">
              <span className="search-icon" aria-hidden="true">
                ⌕
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜机制、游戏，或者一种玩法组合…"
                aria-label="首页搜索"
              />
              <button type="submit" className="keycap" aria-label="搜索知识库">
                Ctrl K
              </button>
            </div>
          </form>
          <div className="vn-actions">
            <Link className="button primary" href="/taxonomy">
              逐层查分类 →
            </Link>
            <Link className="button" href="/lab">
              编写组合研究提示词 ↗
            </Link>
          </div>
        </div>
        <div className="vn-character">
          <MaidPortrait state={current.state} priority />
        </div>
        <motion.div
          className="vn-foreground"
          style={{ x: effects ? fx : 0 }}
          aria-hidden="true"
        >
          <ArtImage
            src="/art/desk-foreground.webp"
            alt=""
            width={1200}
            height={600}
          />
        </motion.div>
        <span className="vn-side-label" aria-hidden="true">
          GAME MECHANICS LABORATORY
        </span>
        <button
          type="button"
          className="vn-dialogue"
          onClick={() => setLine((v) => (v + 1) % messages.length)}
          aria-label="听听 RIN 的研究建议"
          aria-describedby="rin-line"
        >
          <span className="vn-nameplate">
            研究助手 <b>RIN</b>
          </span>
          <span className="vn-dialogue-meta" aria-hidden="true">
            MESSAGE ／ 00{line + 1}
          </span>
          <span id="rin-line" className="vn-line">
            {current.text}
          </span>
          <span className="vn-continue" aria-hidden="true">
            ▾
          </span>
          <span className="sr-only">点击查看下一条。</span>
        </button>
      </section>
      <nav className="chapter-links" aria-label="研究室章节">
        {chapters.map((chapter) => (
          <Link
            href={chapter.href}
            key={chapter.id}
            className={`chapter-link chapter-link-${chapter.id}`}
          >
            <ArtImage
              src={chapterArt(chapter.id)}
              alt=""
              width={1672}
              height={941}
            />
            <span className="chapter-link-number">
              CHAPTER {chapter.number}
            </span>
            <strong>
              {chapter.name}
              <b aria-hidden="true">↗</b>
            </strong>
            <span className="chapter-link-subtitle">{chapter.subtitle}</span>
          </Link>
        ))}
        <Link className="chapter-link chapter-link-compare" href="/compare">
          <ArtImage
            src={chapterArt("games")}
            alt=""
            width={1672}
            height={941}
          />
          <span className="chapter-link-number">SIDE FILE</span>
          <strong>
            游戏对比<b aria-hidden="true">↗</b>
          </strong>
          <span className="chapter-link-subtitle">并排查看规则与玩法差异</span>
        </Link>
      </nav>
    </>
  );
}
