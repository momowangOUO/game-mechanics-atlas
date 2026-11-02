import type { ReactNode } from "react";
import {
  rect as r,
  circle as c,
  text as t,
  arrow as a,
  person,
  colors,
} from "./SceneKit";
const { cream, purple, cyan, gold } = colors;
export const expandedRulesArtwork: Record<
  string,
  (stage: number, id: string) => ReactNode
> = {
  "match-charging": (stage, id) => (
    <>
      {[0, 1, 2].map((i) => (
        <g key={i}>{c(32 + i * 30, 43, 11, stage === 0 ? purple : cream)}</g>
      ))}
      {r(146, 40, 90, 25, cream)}
      {r(149, 43, stage === 0 ? 12 : stage === 1 ? 52 : 83, 19, purple)}
      {stage > 0 && a("M60 66Q108 109 161 66", id)}
      {t(64, 120, stage === 0 ? "紫色宝石" : "消除后充能", 14)}
      {t(189, 108, stage === 2 ? "可用技能" : "技能能量", 14)}
    </>
  ),
  "dialogue-choice": (stage, id) => (
    <>
      {person(38, 100, purple)}
      {person(210, 100, cyan)}
      {r(76, 20, 110, 32, cream)}
      {t(
        131,
        41,
        stage === 0 ? "?" : stage === 1 ? "选择回应" : "店主指路",
      )}{" "}
      {stage === 1 ? (
        <>
          {r(72, 71, 48, 34, cyan)}
          {r(133, 71, 48, 34, cream)}
          {a("M48 90L70 88", id)}
        </>
      ) : stage === 2 ? (
        <>
          {r(83, 75, 90, 40, gold)}
          {t(128, 102, "地图")} {a("M207 72L175 89", id)}
        </>
      ) : (
        a("M63 80L190 80", id)
      )}
    </>
  ),
  "match-removal": (stage, id) => (
    <>
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => {
          const middle = row === 1;
          const matched =
            (middle && (stage > 0 || col !== 1)) ||
            (row === 2 && col === 1 && stage === 0);
          return (
            <g key={`${row}-${col}`}>
              {r(78 + col * 37, 19 + row * 37, 32, 32, cream)}
              {stage === 2 && middle
                ? null
                : c(94 + col * 37, 35 + row * 37, 10, matched ? purple : cyan)}
            </g>
          );
        }),
      )}
      {stage === 1 && a("M210 111Q240 68 210 68", id)}
      {t(37, 80, stage === 0 ? "?" : stage === 1 ? "匹配" : "移除", 13)}
    </>
  ),
  "keyword-search": (stage, id) => (
    <>
      {r(14, 17, 72, 110, purple)}
      {[0, 1, 2].map((i) => (
        <g key={i}>{r(23, 27 + i * 29, 53, 20, cream)}</g>
      ))}
      {r(107, 23, 133, 30, cream)}
      {t(173, 43, stage === 0 ? "查什么？" : "钟楼")}
      {stage > 0 && a("M105 41L85 41", id)}
      {stage === 2 && (
        <>
          {r(112, 76, 55, 50, gold)}
          {r(181, 76, 55, 50, cyan)}
          {t(174, 144, "相关记录", 13)}
        </>
      )}
    </>
  ),
  "character-experience": (stage, id) => (
    <>
      {person(49, 101, purple)}
      {t(53, 29, stage === 2 ? "Lv.2" : "Lv.1", 18)}
      {r(95, 55, 140, 24, cream)}
      {r(98, 58, stage === 0 ? 92 : 134, 18, stage === 2 ? gold : cyan)}
      {t(
        166,
        106,
        stage === 0 ? "还差一点" : stage === 1 ? "＋经验" : "达到门槛",
        15,
      )}
      {stage === 2 && a("M54 48L54 35", id)}
    </>
  ),
};
