import type { ReactNode } from "react";
import {
  rect as r,
  circle as c,
  path as p,
  arrow as a,
  text as t,
  person,
  card,
  colors,
} from "./SceneKit";

const { ink, purple, cyan, gold, cream } = colors;
const check = (x: number, y: number) =>
  p(`M${x} ${y}l9 10 20-24`, "none", ink, 4);
const cross = (x: number, y: number) =>
  p(`M${x} ${y}l16 16m0-16-16 16`, "none", ink, 4);
const floor = () => p("M12 124H248", "none", ink, 4);
const bar = (
  x: number,
  y: number,
  width: number,
  amount: number,
  fill = cyan,
) => (
  <>
    {r(x, y, width, 15, cream)}
    {r(x + 3, y + 3, Math.max(0, amount), 9, fill)}
  </>
);
const coin = (x: number, y: number) => (
  <>
    {c(x, y, 9, gold)}
    {t(x, y + 4, "$", 11)}
  </>
);
const shield = (x: number, y: number, fill = cyan) =>
  p(`M${x} ${y}l18 6v22l-18 14-18-14V${y + 6}Z`, fill, ink, 4);
const pointer = (x: number, y: number) =>
  p(`M${x} ${y}v26l7-7 7 14 7-4-7-13h10Z`, cream, ink, 3);
const flame = (x: number, y: number) =>
  p(`M${x} ${y}q-22 26 0 35 23-7 4-31l-4 13Z`, gold, ink, 3);

export const interactionRulesArtwork: Record<
  string,
  (step: number, uid: string) => ReactNode
> = {
  "direct-movement": (s, id) => (
    <>
      {floor()}
      {person([35, 113, 207][s], 77, purple)}
      {r(25, 14, 44, 28, s === 1 ? gold : cream)}
      {t(47, 35, s === 2 ? "-" : ">", 22)}
      {s === 1 && a("M139 93H198", id)}
      {s === 2 && p("M188 128v8m37-8v8", "none", cyan, 3)}
    </>
  ),
  "aimed-launch": (s, id) => (
    <>
      {c(211, 36, 22, cream)}
      {c(211, 36, 11, purple)}
      {c(211, 36, 3, ink)}
      {r(19, 107, 48, 15, cyan)}
      <g transform={`rotate(${s === 0 ? 0 : -30} 43 104)`}>
        {r(36, 88, 51, 17, purple)}
      </g>
      {s === 0
        ? p("M88 97H180", "none", purple, 3)
        : p("M75 85L190 46", "none", cyan, 3)}
      {s === 1 && a("M84 117Q130 115 141 83", id)}
      {s === 2 && (
        <>
          {c(151, 60, 8, gold)}
          {p("M105 79l30-12", "none", ink, 3)}
        </>
      )}
    </>
  ),
  "dodge-move": (s, id) => (
    <>
      {floor()}
      {r(65, 109, 82, 14, gold)}
      {p("M106 17v46", "none", ink, 4)}
      {p("M93 52l13 18 13-18", "none", ink, 4)}
      {s === 0 ? (
        person(105, 77, purple)
      ) : (
        <>
          {p("M93 84v30m24-30v30", "none", purple, 2)}
          {person(s === 1 ? 181 : 215, 77, cyan)}
        </>
      )}
      {s === 1 && a("M125 91H158", id)}
      {s === 2 && p("M79 111l12-13 14 9 15-16 17 19", "none", ink, 4)}
    </>
  ),
  "piece-rotation": (s, id) => (
    <>
      {p("M134 61h99v35h-99Z", cream, purple, 3)}
      {s < 2 ? (
        <g transform={s === 0 ? "translate(50 27)" : "translate(28 68)"}>
          {[0, 1, 2].map((n) => (
            <g key={n}>
              {r(s === 0 ? 0 : n * 31, s === 0 ? n * 31 : 0, 30, 30, cyan)}
            </g>
          ))}
        </g>
      ) : (
        [0, 1, 2].map((n) => <g key={n}>{r(136 + n * 31, 63, 30, 30, cyan)}</g>)
      )}
      {s === 1 && a("M73 36Q114 30 113 61", id)}
      {s === 2 && check(177, 115)}
    </>
  ),
  "drag-placement": (s, id) => (
    <>
      {r(14, 16, 68, 61, cream)}
      {r(170, 83, 68, 51, cream)}
      {p("M177 90h54v37h-54Z", "none", cyan, 2)}
      {r([30, 104, 183][s], [31, 52, 94][s], 40, 30, purple)}
      {s !== 2 && pointer([61, 134][s], [57, 76][s])}
      {s === 1 && a("M73 46Q126 10 185 64", id)}
      {s === 2 && check(199, 64)}
    </>
  ),
  "score-threshold": (s) => (
    <>
      {bar(25, 74, 210, [24, 116, 204][s], s === 2 ? cyan : purple)}
      {p("M226 47v60", "none", ink, 4)}
      {t(225, 33, "100", 18)}
      {t(120, 58, ["20", "60", "100"][s], 28)}
      {s === 2 && (
        <>
          {p("M105 111l12-10 12 10-5 20h-14Z", gold, ink, 3)}
          {check(155, 120)}
        </>
      )}
    </>
  ),
  "line-completion-clear": (s, id) => (
    <>
      {[0, 1, 2, 3, 4, 5].map((n) => (
        <g key={n}>{p(`M${21 + n * 36} 21v108`, "none", purple, 1.5)}</g>
      ))}
      {[0, 1, 2, 3].map((n) => (
        <g key={n}>{p(`M21 ${21 + n * 36}h216`, "none", purple, 1.5)}</g>
      ))}
      {s < 2 &&
        [0, 1, 2, 3, 4, 5]
          .filter((n) => n !== 3 || s === 1)
          .map((n) => <g key={n}>{r(23 + n * 36, 95, 32, 31, cyan)}</g>)}
      {s === 0 && (
        <>
          {r(131, 31, 32, 31, gold)}
          {a("M147 64v22", id)}
        </>
      )}
      {s === 1 && p("M22 109H237", "none", gold, 6)}
      {s === 2 && (
        <>
          {p("M23 95h212v31H23Z", "none", cyan, 3)}
          {[45, 90, 135, 180, 225].map((x) => (
            <g key={x}>{p(`M${x} 105l-5-10m5 20 5 10`, "none", gold, 3)}</g>
          ))}
        </>
      )}
    </>
  ),
  "automatic-resolution": (s, id) => (
    <>
      {r(12, 103, 235, 24, cream)}
      {[0, 1].map((n) => (
        <g key={n}>
          {person(40 + n * 42, 55, cyan)}
          {s !== 2 ? person(176 + n * 39, 55, purple) : cross(168 + n * 39, 79)}
        </g>
      ))}
      {s === 0 && (
        <>
          {card(29, 10, "A", cyan)}
          {card(177, 10, "B", purple)}
        </>
      )}
      {s === 1 && (
        <>
          {a("M91 70H151", id)}
          {a("M166 91H103", id)}
          {c(126, 25, 15, cream)}
          {p("M126 14v11l9 5", "none", ink, 3)}
        </>
      )}
      {s === 2 && (
        <>
          {coin(127, 36)}
          {check(105, 78)}
        </>
      )}
    </>
  ),
  "stacking-effects": (s, id) => (
    <>
      {r(15, 53, 46, 41, cream)}
      {t(38, 81, "10", 23)}
      {s > 0 && (
        <>
          {card(85, 24, "+5", purple)}
          {card(149, 24, "x2", cyan)}
          {a("M64 74H98", id)}
          {t(123, 111, "(10+5)x2", 20)}
        </>
      )}
      {s === 2 && (
        <>
          {r(197, 55, 45, 40, gold)}
          {t(219, 82, "30", 22)}
          {a("M163 74H189", id)}
        </>
      )}
    </>
  ),
  "rule-modifier": (s, id) => (
    <>
      {[0, 1, 2].map((n) => (
        <g key={n}>{r(28 + n * 32, 78, 26, 26, n === 2 ? cyan : purple)}</g>
      ))}
      {r(17, 20, 108, 34, cream)}
      {t(71, 43, s === 0 ? "AAA" : "ANY", 20)}
      {s === 0 ? (
        cross(187, 80)
      ) : (
        <>
          {card(157, 15, "*", gold)}
          {a("M156 54L119 69", id)}
          {s === 2 && (
            <>
              {check(181, 91)}
              {coin(225, 113)}
            </>
          )}
        </>
      )}
    </>
  ),
  jump: (s, id) => (
    <>
      {p("M10 125H90V139H10M170 125H249V139H170", cream, ink, 4)}
      {p("M65 105Q127-29 195 105", "none", cyan, 3)}
      {person([61, 127, 204][s], [78, 35, 78][s], purple)}
      {s === 0 && a("M38 63V25", id)}
      {s === 2 && p("M184 128h39", "none", gold, 5)}
    </>
  ),
  "wall-climb": (s, id) => (
    <>
      {r(145, 13, 82, 122, cream)}
      {[28, 57, 86, 115].map((y) => (
        <g key={y}>{r(140, y, 12, 7, gold)}</g>
      ))}
      {person(119, [85, 61, 36][s], purple)}
      {p(`M124 ${[104, 80, 55][s]}l20-12`, "none", ink, 4)}
      {s === 1 && a("M79 103V36", id)}
      {p("M155 135h82", "none", ink, 4)}
    </>
  ),
  parry: (s, id) => (
    <>
      {person(61, 75, cyan)}
      {person(209, 75, purple)}
      {shield(96, 67)}
      {p(
        s === 0
          ? "M202 74L153 88"
          : s === 1
            ? "M171 73L111 86"
            : "M116 78L174 37",
        "none",
        ink,
        6,
      )}
      {r(57, 19, 151, 15, cream)}
      {r(127, 22, 28, 9, gold)}
      {p(`M${[92, 141, 184][s]} 12v30`, "none", ink, 4)}
      {s === 1 && p("M103 73l-7-17m13 15 14-13m-18 29 20 5", "none", gold, 4)}
      {s === 2 && a("M132 63L178 34", id)}
    </>
  ),
  "melee-attack": (s, id) => (
    <>
      {floor()}
      {person(s === 0 ? 60 : 90, 77, cyan)}
      {person(174, 77, purple)}
      {p("M102 111Q167 107 171 57", "none", purple, 2)}
      {s > 0 && p("M107 84l44-18", "none", ink, 6)}
      {s === 0 && p("M65 89l24 13", "none", ink, 5)}
      {s === 1 && (
        <>
          {p("M132 42Q188 51 179 107", "none", gold, 7)}
          {a("M116 52L139 48", id)}
        </>
      )}
      {bar(153, 26, 70, s === 2 ? 24 : 64)}
      {s === 2 && cross(185, 67)}
    </>
  ),
  grappling: (s, id) => (
    <>
      {p("M12 128H65M194 28H248", "none", ink, 6)}
      {c(211, 30, 7, gold)}
      {person([45, 92, 177][s], [80, 72, 32][s], purple)}
      {s > 0 &&
        p(
          `M${s === 1 ? 99 : 184} ${s === 1 ? 91 : 51}L210 33`,
          "none",
          cyan,
          4,
        )}
      {s === 0 && a("M64 93L128 62", id)}
      {s === 1 && p("M204 20l14 1-3 18", "none", ink, 4)}
      {s === 2 && a("M104 105Q139 100 157 69", id)}
    </>
  ),
  "traversal-portal": (s, id) => (
    <>
      {floor()}
      {r(112, 22, 36, 101, cream)}
      <ellipse
        cx="73"
        cy="86"
        rx="15"
        ry="38"
        fill="none"
        stroke={purple}
        strokeWidth="6"
      />
      <ellipse
        cx="194"
        cy="86"
        rx="15"
        ry="38"
        fill="none"
        stroke={cyan}
        strokeWidth="6"
      />
      {person([31, 70, 222][s], 77, gold)}
      {s === 1 && p("M91 74Q130-1 179 74", "none", ink, 3)}
      {s === 2 && a("M202 112H237", id)}
    </>
  ),
  "block-pushing": (s, id) => (
    <>
      {floor()}
      {[0, 1, 2, 3, 4].map((n) => (
        <g key={n}>{p(`M${24 + n * 44} 128v7`, "none", purple, 2)}</g>
      ))}
      {r([91, 113, 179][s], 83, 36, 37, gold)}
      {person([52, 79, 141][s], 77, purple)}
      {s === 1 && (
        <>
          {p("M85 95h29", "none", ink, 4)}
          {a("M128 62H173", id)}
        </>
      )}
      {s === 2 && p("M87 83h37v37H87Z", "none", purple, 2)}
    </>
  ),
  "rhythmic-input": (s) => (
    <>
      {p("M20 83H240", "none", ink, 4)}
      {r(170, 35, 18, 85, cream)}
      {c([51, 178, 220][s], 82, 12, purple)}
      {r(35, 13, 54, 30, s === 1 ? gold : cream)}
      {t(62, 35, "K", 21)}
      {s === 1 && (
        <>
          {p("M153 53l-11-12m58 12 12-12", "none", gold, 4)}
          {t(179, 141, "0 ms", 17)}
        </>
      )}
      {s === 2 && (
        <>
          {p("M179 111v21m42-21v21m-42-3h42", "none", cyan, 3)}
          {t(115, 53, "+42 ms", 18)}
        </>
      )}
    </>
  ),
  "vehicle-steering": (s, id) => (
    <>
      {p("M15 129Q101 134 142 96T242 37", "none", purple, 3)}
      <g
        transform={`translate(${[66, 132, 207][s]} ${[100, 89, 48][s]}) rotate(${[0, -28, -50][s]})`}
      >
        {r(-27, -13, 54, 26, cyan)}
        {r(-16, -21, 12, 8, ink)}
        {r(11, -21, 12, 8, ink)}
        {r(-16, 13, 12, 8, ink)}
        {r(11, 13, 12, 8, ink)}
        {p("M0-7h18v14H0Z", cream, ink, 2)}
      </g>
      {c(41, 31, 20, cream)}
      {p(
        s === 0 ? "M23 31h36M41 31v18" : "M30 16l19 30M41 31l-16 10",
        "none",
        ink,
        3,
      )}
      {s === 1 && a("M67 29Q88 16 95 43", id)}
    </>
  ),
  "destructible-terrain": (s, id) => (
    <>
      {floor()}
      {person(s === 2 ? 158 : 45, 77, purple)}
      {s < 2 ? (
        <>
          {[0, 1, 2].map((n) => (
            <g key={n}>{r(109, 29 + n * 31, 40, 30, cream)}</g>
          ))}
          {s === 1 && (
            <>
              {p("M115 34l18 21-11 16 17 18-14 26", "none", ink, 4)}
              {p("M63 85l46-10", "none", gold, 7)}
            </>
          )}
        </>
      ) : (
        <>
          {p("M109 29h40v27h-40Z", cream, ink, 3)}
          {[99, 121, 145].map((x) => (
            <g key={x}>{r(x, 114, 12, 9, cream)}</g>
          ))}
          {a("M185 96H234", id)}
        </>
      )}
    </>
  ),
  "physics-manipulation": (s, id) => (
    <>
      {floor()}
      {p("M74 81h141", "none", ink, 5)}
      {p("M145 86l-17 34h34Z", cyan, ink, 3)}
      {c([95, 111, 213][s], [65, 65, 107][s], 15, gold)}
      {s === 0 && (
        <>
          {person(29, 77, purple)}
          {p("M42 94l35-27", "none", ink, 3)}
        </>
      )}
      {s === 1 && (
        <>
          {a("M69 46H110", id)}
          {p("M143 81l-14 35", "none", purple, 3)}
        </>
      )}
      {s === 2 && (
        <>
          {p("M156 73Q192 68 211 90", "none", purple, 3)}
          {p("M219 125l8 8m-20-5-8 8", "none", ink, 3)}
        </>
      )}
    </>
  ),
  "damage-health": (s, id) => (
    <>
      {person(124, 95, purple)}
      {bar(44, 22, 170, [164, 79, 0][s], s === 2 ? gold : cyan)}
      {t(131, 63, ["100", "50", "0"][s], 24)}
      {s === 1 && (
        <>
          {a("M24 91H87", id)}
          {t(47, 76, "-50", 19)}
        </>
      )}
      {s === 2 && (
        <>
          {p("M104 133h45", "none", ink, 5)}
          {cross(171, 96)}
        </>
      )}
    </>
  ),
  "posture-break": (s) => (
    <>
      {person(119, 77, purple)}
      {shield(151, s === 2 ? 89 : 66, cream)}
      {bar(35, 17, 190, [38, 117, 184][s], gold)}
      {p("M212 8v34", "none", ink, 3)}
      {s === 1 && p("M179 74l17-15m-13 29 21 5", "none", gold, 4)}
      {s === 2 && (
        <>
          {p("M146 89l13 10-12 12 13 14", "none", ink, 4)}
          {p("M103 69l-4-18m27 17 10-17", "none", gold, 4)}
          {t(55, 100, "!", 34)}
        </>
      )}
    </>
  ),
  "elemental-reaction": (s, id) => (
    <>
      {person(133, 79, cream)}
      {p("M132 28q-17 22 0 28 17-7 0-28Z", cyan, ink, 3)}
      {s > 0 && (
        <>
          {flame(s === 1 ? 40 : 122, s === 1 ? 66 : 47)}
          {s === 1 && a("M58 84H100", id)}
        </>
      )}
      {s === 2 && (
        <>
          {p(
            "M107 73q-16-20 0-26m20 27q-14-22 4-29m20 28q14-20-3-29",
            "none",
            purple,
            5,
          )}
          {p("M95 106l-15 12m80-9 17 12", "none", gold, 4)}
        </>
      )}
    </>
  ),
  "status-effect": (s) => (
    <>
      {person(121, 79, s === 1 ? cyan : cream)}
      {s === 0 ? (
        <>
          {card(39, 32, "+", cyan)}
          {p("M73 65l29 17", "none", ink, 3)}
        </>
      ) : s === 1 ? (
        <>
          {c(174, 42, 18, cream)}
          {p("M174 28v14l10 6", "none", ink, 3)}
          {p("M100 74q-22 28 0 46m44-46q22 28 0 46", "none", cyan, 5)}
          {t(58, 68, "+2", 24)}
        </>
      ) : (
        <>
          {c(174, 42, 18, cream)}
          {p("M174 28v14h12", "none", ink, 3)}
          {cross(43, 52)}
          {p("M99 127h44", "none", ink, 3)}
        </>
      )}
    </>
  ),
  "area-control": (s, id) => (
    <>
      {r(77, 36, 111, 96, s === 2 ? cyan : cream)}
      {p("M132 99V26l32 10-32 13", s === 2 ? cyan : purple, ink, 3)}
      {person([35, 101, 105][s], 82, cyan)}
      {person(s === 0 ? 225 : 206, 82, purple)}
      {s === 1 && a("M53 99H77", id)}
      {s === 2 && (
        <>
          {coin(44, 30)}
          {a("M98 60L53 43", id)}
          {t(44, 67, "+1", 18)}
        </>
      )}
    </>
  ),
  "victory-points": (s) => (
    <>
      {person(48, 79, cyan)}
      {person(204, 79, purple)}
      {[0, 1].map((n) => (
        <g key={n}>
          {r(19 + n * 155, 16, 60, 36, cream)}
          {t(49 + n * 155, 42, s === 0 ? ["4", "3"][n] : ["8", "6"][n], 25)}
        </g>
      ))}
      {s === 1 && (
        <>
          {p("M110 115V36h33", "none", ink, 4)}
          {r(113, 38, 15, 15, ink)}
          {r(128, 53, 15, 15, ink)}
        </>
      )}
      {s === 2 && (
        <>
          {t(128, 77, ">", 36)}
          {p("M31 65l17-13 17 13-5 11H36Z", gold, ink, 3)}
        </>
      )}
    </>
  ),
  "risk-staking": (s, id) => (
    <>
      {r(55, 60, 150, 71, cream)}
      {[0, 1, 2].slice(0, s === 0 ? 1 : 3).map((n) => (
        <g key={n}>{coin(97 + n * 23, 91)}</g>
      ))}
      {s === 0 ? (
        t(129, 35, "1", 26)
      ) : (
        <>
          {t(129, 35, "3", 26)}
          {s === 1 ? (
            a("M36 21L79 64", id)
          ) : (
            <>
              {p("M39 48v74m-12-60 12-14 12 14", "none", cyan, 3)}
              {p("M227 48v74m-12-14 12 14 12-14", "none", purple, 3)}
              {t(36, 35, "+3", 19)}
              {t(226, 35, "-3", 19)}
            </>
          )}
        </>
      )}
    </>
  ),
  "identity-voting": (s, id) => (
    <>
      {[45, 126, 209].map((x, n) => (
        <g key={x}>
          {t(x, 14, ["A", "B", "C"][n], 14)}
          {person(x, 46, n === 2 ? purple : cyan)}
          {s > 0 && (
            <>
              {card(x - 15, 60, n === 2 ? "A" : "C", cream)}
              {p(
                `M${x} 89l${n === 2 ? -53 : n === 0 ? 56 : 0} 13`,
                "none",
                ink,
                2,
              )}
            </>
          )}
        </g>
      ))}
      {r(91, 104, 69, 30, gold)}
      {t(126, 127, s === 2 ? "C:2" : "?", 21)}
      {s === 2 && (
        <>
          {p("M187 18h46v71h-46Z", "none", ink, 4)}
          {a("M235 99v29", id)}
        </>
      )}
    </>
  ),
  "ability-check": (s) => (
    <>
      {card(24, 52, "5", purple)}
      {t(85, 86, "+", 25)}
      {r(106, 57, 34, 34, cream)}
      {[0, 1, 2].map((n) => (
        <g key={n}>{c(115 + n * 8, 73, 2, ink)}</g>
      ))}
      {t(177, 40, "8", 25)}
      {p("M154 47h76", "none", ink, 3)}
      {s === 0 ? (
        t(184, 96, "?", 31)
      ) : (
        <>
          {t(166, 91, "=", 25)}
          {t(213, 91, "8", 29)}
          {s === 2 && check(186, 118)}
        </>
      )}
    </>
  ),
  "adjacency-bonus": (s, id) => (
    <>
      {[0, 1, 2].map((n) => (
        <g key={n}>{r(51 + n * 53, 55, 51, 51, cream)}</g>
      ))}
      {p("M127 68l-15 13 7 17h17l7-17Z", purple, ink, 3)}
      {s === 0 ? r(30, 14, 30, 30, cyan) : r(167, 65, 31, 31, cyan)}
      {s === 1 && a("M67 27Q153 2 180 45", id)}
      {s === 2 && (
        <>
          {p("M150 58v46", "none", gold, 7)}
          {t(126, 40, "+2", 24)}
          {p("M109 113h36", "none", cyan, 4)}
        </>
      )}
    </>
  ),
  "territory-policy": (s, id) => (
    <>
      {r(17, 54, 153, 77, cream)}
      {r(188, 54, 55, 77, cream)}
      {[41, 93, 142, 215].map((x) => (
        <g key={x}>
          {p(
            `M${x - 12} 99V83l12-12 12 12v16Z`,
            x < 180 && s === 2 ? cyan : purple,
            ink,
            3,
          )}
        </g>
      ))}
      {s > 0 && (
        <>
          {card(71, 4, "+1", gold)}
          {p("M18 54h152v77H18Z", "none", cyan, 4)}
        </>
      )}
      {s === 1 && a("M99 38v13", id)}
      {s === 2 && [40, 93, 143].map((x) => <g key={x}>{coin(x, 116)}</g>)}
    </>
  ),
  "hold-input": (s) => (
    <>
      {r(24, 46, 67, 53, s === 2 ? cyan : gold)}
      {t(57, 81, "K", 27)}
      {s < 2 && pointer(66, 76)}
      {c(174, 71, 37, cream)}
      {p(
        `M174 71V41${s === 0 ? "" : s === 1 ? "m0 30 24 14" : "m0 30-23 16"}`,
        "none",
        ink,
        3,
      )}
      {t(173, 125, ["0 / 3", "2 / 3", "3 / 3"][s], 19)}
      {s === 1 && (
        <>
          {p("M106 110l13 13m0-13-13 13", "none", purple, 3)}
          {p("M122 114h10", "none", purple, 2)}
        </>
      )}
      {s === 2 && check(160, 76)}
    </>
  ),
  "combo-chain": (s) => (
    <>
      {[0, 1, 2, 3].map((n) => (
        <g key={n}>
          {c(
            38 + n * 61,
            62,
            16,
            s === 2 && n === 3 ? cream : n <= (s === 0 ? 0 : 2) ? cyan : cream,
          )}
          {s === 2 && n === 3 ? cross(213, 54) : t(38 + n * 61, 68, "+", 19)}
        </g>
      ))}
      {p("M54 62h29m32 0h29m32 0h29", "none", ink, 3)}
      {t(128, 119, s === 0 ? "x1" : s === 1 ? "x3" : "x0", 32)}
      {s === 1 && coin(189, 111)}
      {s === 2 && p("M210 92l-38 24", "none", purple, 4)}
    </>
  ),
};
