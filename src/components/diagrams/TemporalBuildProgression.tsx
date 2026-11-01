import type { ReactNode } from "react";
import {
  rect,
  circle,
  path,
  arrow,
  text,
  person as drawPerson,
  card,
  colors,
} from "./SceneKit";
const { ink, purple, cyan, gold, cream } = colors;
const person = (x: number, y: number, color = purple) => (
  <g transform={`translate(${x} ${y}) scale(.65)`}>{drawPerson(0, 0, color)}</g>
);
const line = (d: string, color = ink, width = 3) =>
  path(d, "none", color, width);
const check = (x: number, y: number) =>
  line(`M${x - 6} ${y}l4 5 9-12`, cyan, 4);
const cross = (x: number, y: number) => (
  <>{line(`M${x - 5} ${y - 5}l10 10M${x + 5} ${y - 5}l-10 10`, purple, 4)}</>
);
const lock = (x: number, y: number, open = false) => (
  <>
    {line(
      open
        ? `M${x - 7} ${y}v-7q0-12 14-9`
        : `M${x - 7} ${y}v-7a7 7 0 0 1 14 0v7`,
    )}
    {rect(x - 11, y, 22, 19, open ? cyan : purple)}
    {circle(x, y + 8, 2, ink)}
  </>
);
const clock = (x: number, y: number, r: number, step: number, color = gold) => (
  <>
    {circle(x, y, r, cream)}
    {[0, 1, 2, 3].map((n) => (
      <g key={n}>
        {line(
          `M${x + Math.sin((n * Math.PI) / 2) * (r - 5)} ${y - Math.cos((n * Math.PI) / 2) * (r - 5)}l${Math.sin((n * Math.PI) / 2) * 3} ${-Math.cos((n * Math.PI) / 2) * 3}`,
          ink,
          2,
        )}
      </g>
    ))}
    {line(
      `M${x} ${y}v${-r * 0.6}M${x} ${y}l${[r * 0.55, 0, -r * 0.55][step]} ${[0, r * 0.55, 0][step]}`,
      color,
      4,
    )}
    {circle(x, y, 3, ink)}
  </>
);
const gem = (x: number, y: number, color = gold) => (
  <>{path(`M${x} ${y - 9}l9 9-9 9-9-9z`, color)}</>
);
const sword = (x: number, y: number, color = cream) => (
  <>
    {path(`M${x} ${y}l20-25 4 1-1 5-20 24z`, color)}
    {line(`M${x - 2} ${y - 5}l12 10M${x + 3} ${y}l-7 8`, gold, 4)}
  </>
);
const star = (x: number, y: number, color = gold) =>
  path(`M${x} ${y - 10}l3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z`, color);
const tile = (x: number, y: number, label: string, active = false) => (
  <>
    {rect(x, y, 36, 31, active ? cyan : cream)}
    {text(x + 18, y + 21, label, 12)}
  </>
);
const boundary = (label: string) => (
  <>
    {line("M130 23v104", purple, 2)}
    {text(130, 15, label, 9)}
  </>
);
const health = (x: number, y: number, n: number) => (
  <>
    {rect(x, y, 54, 10, cream)}
    {rect(x + 2, y + 2, Math.max(0, n) * 10, 6, cyan)}
  </>
);
const book = (x: number, y: number, color = cream) => (
  <>
    {path(
      `M${x - 18} ${y - 13}q9-4 18 1 9-5 18-1v29q-9-4-18 0-9-4-18 0z`,
      color,
    )}
    {line(
      `M${x} ${y - 12}v27M${x - 12} ${y - 5}h6M${x + 6} ${y - 5}h6`,
      ink,
      2,
    )}
  </>
);
const tree = (s: number) => (
  <>
    {line("M65 110V75h65V40h65M130 75v35M130 40V20", ink, 3)}
    {[
      [65, 110],
      [65, 75],
      [130, 75],
      [130, 40],
      [195, 40],
      [130, 110],
      [130, 20],
    ].map(([x, y], i) => (
      <g key={i}>
        {circle(x, y, 9, i <= [1, 3, 6][s] ? cyan : cream)}
        {i <= [1, 3, 6][s] && circle(x, y, 3, ink)}
      </g>
    ))}
  </>
);

export const temporalBuildArtwork: Record<
  string,
  (step: number, uid: string) => ReactNode
> = {
  "run-reset": (s, u) => (
    <>
      {rect(16, 36, 89, 75, cream)}
      {text(60, 28, "RUN 1", 10)}
      {line("M28 94h20V73h24V52h20", purple)}
      {person(s === 0 ? 55 : 85, 70, s === 1 ? purple : cyan)}
      {s === 1 && cross(85, 46)}
      {boundary("RESET")}
      {arrow("M109 86Q135 117 154 85", u)}
      {rect(157, 36, 87, 75, s === 2 ? cream : "#d3c8d6")}
      {text(201, 28, "RUN 2", 10)}
      {line("M169 94h20V73h24V52h20", s === 2 ? ink : purple)}
      {s === 2 && person(174, 72, cyan)}
      {text(199, 128, s === 2 ? "STATE: 0" : "NEW START", 10)}
    </>
  ),
  "sequential-turns": (s, u) => (
    <>
      {line("M36 110h188", ink)}
      {[45, 130, 215].map((x, i) => (
        <g key={x}>
          {person(x, 62, i === s ? cyan : purple)}
          {text(x, 104, String(i + 1), 12)}
          {i === s && (
            <>
              {rect(x - 17, 19, 34, 18, gold)}
              {text(x, 32, "ACT", 9)}
            </>
          )}
        </g>
      ))}
      {arrow(
        s === 0
          ? "M64 74h45"
          : s === 1
            ? "M149 74h45"
            : "M207 117Q130 144 46 117",
        u,
      )}
    </>
  ),
  "real-time-update": (s, u) => (
    <>
      {clock(49, 56, 25, s, cyan)}
      {rect(19, 101, 61, 24, cream)}
      {text(49, 118, "NO INPUT", 8)}
      {arrow("M88 58h37", u)}
      {line("M133 112h108M148 32v80M228 32v80", purple, 2)}
      {circle(157 + s * 29, 65, 10, cyan)}
      {path(`M${147 + s * 29} 112l10-16 10 16z`, gold)}
      {text(186, 135, `t + ${s}`, 12)}
      {line("M137 89h102", ink, 2)}
    </>
  ),
  "action-cooldown": (s, u) => (
    <>
      {rect(22, 33, 60, 60, s === 1 ? purple : cyan)}
      {sword(39, 74)}
      {s === 1 && lock(51, 48)}
      {arrow("M91 63h29", u)}
      {clock(164, 61, 30, s, gold)}
      {rect(114, 108, 111, 16, cream)}
      {rect(116, 110, [107, 36, 107][s], 12, s === 1 ? purple : cyan)}
      {text(168, 98, ["USE", "WAIT 2s", "READY"][s], 11)}
    </>
  ),
  "planning-timer": (s, u) => (
    <>
      {clock(53, 51, 25, s, s === 2 ? purple : gold)}
      {text(53, 94, ["03", "01", "00"][s], 18)}
      {line("M92 24v101", purple, 2)}
      {[113, 159, 205].map((x, i) => (
        <g key={x}>
          {card(x, 52, String(i + 1), s === 2 && i !== 1 ? purple : cream)}
          {s === 1 && i === 1 && check(x + 16, 99)}
          {s === 2 && i === 1 && lock(x + 16, 86)}
        </g>
      ))}
      {text(175, 128, s === 2 ? "DEADLINE: LOCK" : "CHOOSE BEFORE 0", 10)}
      {arrow("M87 111h38", u)}
    </>
  ),
  "pause-planning": (s, u) => (
    <>
      {rect(16, 24, 105, 101, cream)}
      {clock(47, 51, 20, s === 1 ? 0 : s, cyan)}
      {s === 1 ? (
        <>
          {rect(85, 38, 7, 27, purple)}
          {rect(98, 38, 7, 27, purple)}
        </>
      ) : (
        path("M85 37l22 15-22 15z", cyan)
      )}
      {person(46 + (s === 2 ? 45 : 0), 90, cyan)}
      {line("M25 117h85", ink)}
      {arrow("M133 77h26", u)}
      {rect(170, 40, 64, 58, s === 1 ? gold : cream)}
      {line("M180 83l16-20 11 10 15-22", purple)}
      {text(202, 119, s === 1 ? "PLAN" : "WORLD RUNS", 9)}
    </>
  ),
  "route-branching": (s, u) => (
    <>
      {line("M25 80h69M94 80Q112 80 130 45h91M94 80Q112 80 130 116h91", ink, 4)}
      {circle(94, 80, 11, gold)}
      {circle(221, 45, 13, s > 0 ? cyan : cream)}
      {circle(221, 116, 13, purple)}
      {person(s === 0 ? 44 : s === 1 ? 140 : 202, s === 0 ? 58 : 23, cyan)}
      {s > 0 && arrow("M111 63l29-19h44", u)}
      {text(168, 102, "OR", 9)}
    </>
  ),
  "optional-endless-loop": (s, u) => (
    <>
      {line("M20 84h83", ink)}
      {circle(103, 84, 11, gold)}
      {arrow(
        s === 0
          ? "M116 84h91"
          : "M116 73Q171 5 221 50Q253 99 193 107Q150 105 130 86",
        u,
      )}
      {rect(208, 67, 36, 34, s === 0 ? cyan : cream)}
      {text(226, 88, "END", 10)}
      {s > 0 && (
        <>
          {circle(180, 43, 15, cyan)}
          {text(180, 48, String(s + 1), 14)}
          {person(160 + (s === 2 ? 43 : 0), s === 2 ? 77 : 25, cyan)}
        </>
      )}
      {text(109, 133, s === 0 ? "EXIT AVAILABLE" : "CHOOSE TO CONTINUE", 10)}
    </>
  ),
  "checkpoint-respawn": (s, u) => (
    <>
      {line("M18 112h224", ink)}
      {[28, 103, 173, 231].map((x) => (
        <g key={x}>{circle(x, 112, 4, purple)}</g>
      ))}
      {line("M103 108V35", ink)}
      {path("M104 35h37l-10 13 10 13h-37z", cyan)}
      {person(s === 0 ? 161 : s === 1 ? 202 : 103, 90, s === 1 ? purple : cyan)}
      {s === 1 && cross(202, 65)}
      {s === 2 && arrow("M204 64Q156 11 108 76", u)}
      {text(99, 134, "SAVE", 9)}
      {text(206, 134, "FAIL", 9)}
      {s === 2 && check(33, 96)}
    </>
  ),
  "timed-loop": (s, u) => (
    <>
      {clock(130, 72, 42, s, gold)}
      {arrow("M88 29Q131 0 176 30", u)}
      {arrow("M177 112Q127 146 80 111", u)}
      {rect(18, 49, 35, 45, s === 2 ? cream : cyan)}
      {rect(207, 49, 35, 45, s === 1 ? purple : cream)}
      {text(35, 76, s === 1 ? "A'" : "A", 11)}
      {text(225, 76, s === 1 ? "B'" : "B", 11)}
      {text(130, 132, s === 2 ? "FIXED RESET" : "WORLD CLOCK", 9)}
      {s === 2 && line("M121 69l9 7 13-17", cyan, 4)}
    </>
  ),
  "day-night-cycle": (s, u) => (
    <>
      {circle(130, 76, 48, cream)}
      {path("M130 28a48 48 0 0 1 0 96z", purple)}
      {circle(108, 50, 11, gold)}
      {path("M153 83a13 13 0 1 0 14 19 11 11 0 0 1-14-19z", cream)}
      {person(s === 1 ? 155 : 103, s === 1 ? 91 : 101, cyan)}
      {arrow("M72 46Q47 79 73 111", u)}
      {arrow("M188 109Q214 76 188 44", u)}
      {text(40, 28, "DAY", 10)}
      {text(222, 130, "NIGHT", 10)}
      {s === 1 ? lock(42, 82) : check(42, 88)}
      {s === 1 ? check(222, 78) : lock(222, 72)}
    </>
  ),
  "season-weather": (s, u) => (
    <>
      {[20, 100, 180].map((x, i) => (
        <g key={x}>
          {rect(x, 32, 60, 80, i === s ? cream : "#d3c8d6")}
          {i === 0 ? (
            <>
              {circle(x + 30, 50, 11, gold)}
              {path(
                `M${x + 24} 100v-24q-16-15-10-20 16-2 16 17 1-20 16-17 7 9-13 20v24z`,
                cyan,
              )}
            </>
          ) : i === 1 ? (
            <>
              {path(`M${x + 13} 58q-4-13 11-14 9-15 18 0 16 0 13 14z`, purple)}
              {[17, 30, 43].map((n) => (
                <g key={n}>{line(`M${x + n} 71l-4 9`, cyan)}</g>
              ))}
              {rect(x + 15, 92, 30, 7, gold)}
            </>
          ) : (
            <>
              {line(
                `M${x + 30} 40v30M${x + 17} 48l26 15M${x + 17} 63l26-15`,
                cyan,
              )}
              {path(`M${x + 12} 101l18-19 18 19z`, cream)}
            </>
          )}
          {text(x + 30, 127, ["GROW", "RAIN", "FROST"][i], 9)}
        </g>
      ))}
      {arrow("M82 75h13", u)}
      {arrow("M162 75h13", u)}
    </>
  ),
  "round-phases": (s, u) => (
    <>
      {[19, 100, 181].map((x, i) => (
        <g key={x}>
          {rect(x, 37, 60, 66, i === s ? cyan : cream)}
          {text(x + 30, 27, ["PLAN", "ACT", "RESOLVE"][i], 9)}
          {i === 0 ? (
            line(`M${x + 13} 87l11-24 10 12 14-22`, ink)
          ) : i === 1 ? (
            sword(x + 18, 81)
          ) : (
            <>
              {gem(x + 21, 72)}
              {check(x + 43, 73)}
            </>
          )}
          {text(x + 30, 122, `P${i + 1}`, 10)}
        </g>
      ))}
      {arrow("M81 68h13", u)}
      {arrow("M162 68h13", u)}
      {arrow("M211 134Q130 151 49 134", u)}
    </>
  ),
  "in-run-deck-growth": (s, u) => (
    <>
      {rect(18, 34, 222, 90, cream)}
      {text(45, 26, "ONE RUN", 9)}
      {[0, 1, 2].map((i) => (
        <g key={i}>{card(34 + i * 23, 69, String(i + 1), purple)}</g>
      ))}
      {arrow("M117 84h40", u)}
      {card(
        s === 0 ? 185 : s === 1 ? 145 : 104,
        49,
        s === 2 ? "+4" : "NEW",
        cyan,
      )}
      {s === 2 && check(202, 93)}
      {text(76, 113, s === 2 ? "DECK: 4" : "DECK: 3", 10)}
      {text(193, 113, "REWARD", 9)}
    </>
  ),
  "loadout-selection": (s, u) => (
    <>
      {rect(18, 28, 99, 99, cream)}
      {text(67, 18, "OWNED", 9)}
      {sword(36, 73)}
      {circle(86, 55, 12, purple)}
      {gem(53, 101)}
      {arrow("M123 78h29", u)}
      {rect(160, 39, 82, 75, s === 2 ? cyan : cream)}
      {text(201, 28, "EQUIP 2", 9)}
      {rect(170, 54, 26, 40, purple)}
      {rect(206, 54, 26, 40, gold)}
      {s > 0 && sword(170, 83)}
      {s === 2 && gem(218, 74)}
      {s === 2 && lock(201, 111)}
    </>
  ),
  "spatial-loadout": (s, u) => (
    <>
      {rect(21, 27, 140, 100, cream)}
      {[1, 2, 3, 4].map((n) => (
        <g key={n}>{line(`M${21 + n * 28} 27v100`, purple, 1)}</g>
      ))}
      {[1, 2].map((n) => (
        <g key={n}>{line(`M21 ${27 + n * 33}h140`, purple, 1)}</g>
      ))}
      {path("M23 29h54v31H50v32H23z", cyan)}
      {path(
        s === 0
          ? "M184 35h54v31h-27v32h-27z"
          : s === 1
            ? "M50 29h54v31H77v32H50z"
            : "M78 61h54v31h-27v32H78z",
        gold,
      )}
      {s === 1 && cross(64, 44)}
      {s === 2 && check(200, 81)}
      {s === 0 && arrow("M183 109l-18 3", u)}
      {text(203, 127, s === 1 ? "BLOCKED" : s === 2 ? "FITS" : "PLACE", 9)}
    </>
  ),
  respec: (s, u) => (
    <>
      {line("M40 112V75h54V38M94 75h63v37M157 75V38h58", ink)}
      {[
        [40, 112],
        [40, 75],
        [94, 75],
        [94, 38],
        [157, 75],
        [157, 112],
        [215, 38],
      ].map(([x, y], i) => (
        <g key={i}>
          {circle(
            x,
            y,
            10,
            s === 0 && i < 4
              ? cyan
              : s === 2 && [0, 1, 2, 4, 6].includes(i)
                ? cyan
                : cream,
          )}
        </g>
      ))}
      {s === 1 && (
        <>
          {arrow("M101 28Q161 1 207 29", u)}
          {gem(137, 29)}
          {text(137, 55, "+3", 11)}
        </>
      )}
      {text(191, 136, ["SPENT: LEFT", "REFUND", "SPENT: RIGHT"][s], 9)}
    </>
  ),
  "encounter-placement": (s, u) => (
    <>
      {line("M24 106h65V61h80v45h66", ink, 5)}
      {[24, 89, 129, 169, 235].map((x, i) => (
        <g key={i}>{circle(x, i > 0 && i < 4 ? 61 : 106, 8, cream)}</g>
      ))}
      {path(`M${s === 0 ? 209 : 129} ${s === 0 ? 25 : 39}l-12 20h24z`, purple)}
      {s === 0 && arrow("M205 52l-49 9", u)}
      {person(s === 2 ? 157 : 40, s === 2 ? 39 : 84, cyan)}
      {s === 2 && sword(187, 71)}
      {text(75, 135, "PLACE ENCOUNTER", 9)}
    </>
  ),
  "skill-tree": (s, u) => (
    <>
      {tree(s)}
      {text(34, 26, "START", 9)}
      {s === 1 && arrow("M80 64l29-18", u)}
      {s === 2 && (
        <>
          {lock(205, 93)}
          {text(204, 130, "PREREQ", 9)}
        </>
      )}
      {text(38, 136, `PTS ${3 - s}`, 10)}
    </>
  ),
  "modular-ability": (s, u) => (
    <>
      {rect(18, 27, 56, 36, cyan)}
      {text(46, 49, "SHOT", 9)}
      {rect(18, 82, 56, 36, gold)}
      {text(46, 104, "SPLIT", 9)}
      {line("M82 45h26v27h18M82 100h26V72", purple)}
      {rect(131, 48, 43, 47, cream)}
      {text(152, 77, "A+B", 10)}
      {arrow("M180 72h25", u)}
      {s === 0 ? (
        circle(225, 72, 8, cyan)
      ) : (
        <>
          {line("M208 73l28-24M208 73h32M208 73l28 25", ink, 2)}
          {[49, 73, 98].map((y) => (
            <g key={y}>{circle(237, y, s === 2 ? 7 : 4, cyan)}</g>
          ))}
        </>
      )}
    </>
  ),
  "equipment-upgrade": (s, u) => (
    <>
      {rect(20, 42, 68, 72, cream)}
      {sword(36, 88)}
      {text(54, 132, "+0", 12)}
      {[0, 1, 2].map((i) => (
        <g key={i}>{gem(111 + i * 15, 28, s > 0 ? cream : gold)}</g>
      ))}
      {arrow("M96 80h54", u)}
      {rect(169, 42, 68, 72, s === 2 ? cyan : cream)}
      {sword(186, 88, gold)}
      {text(203, 132, s === 2 ? "+1" : "UPGRADE", 11)}
      {s === 1 && (
        <>
          {line("M123 41l0 24", gold, 5)}
          {star(126, 83)}
        </>
      )}
      {s === 2 && star(229, 45)}
    </>
  ),
  "unit-drafting": (s, u) => (
    <>
      {[25, 95, 165].map((x, i) => (
        <g key={x}>
          {card(x, 27, String(i + 1), s > 0 && i === 1 ? cyan : cream)}
          {person(x + 17, 59, i === 1 ? gold : purple)}
          {s === 1 && i === 1 && check(x + 17, 88)}
        </g>
      ))}
      {arrow("M129 92v19", u)}
      {rect(21, 116, 216, 24, cream)}
      {person(s === 2 ? 128 : 40, 119, cyan)}
      {s === 2 && text(180, 132, "+ UNIT", 9)}
      {s === 2 && line("M111 32l33 42M144 32l-33 42", purple, 2)}
    </>
  ),
  "team-composition": (s, u) => (
    <>
      {rect(17, 25, 226, 105, cream)}
      {text(129, 16, "TEAM / 3 SLOTS", 9)}
      {[59, 130, 201].map((x, i) => (
        <g key={i}>
          {circle(
            x,
            74,
            25,
            s === 0 && i === 2 ? cream : [cyan, gold, purple][i],
          )}
          {i === 0 ? (
            sword(x - 8, 84)
          ) : i === 1 ? (
            <>{line(`M${x} 60v27M${x - 13} 74h26`, ink, 5)}</>
          ) : (
            s > 0 && (
              <>
                {circle(x, 73, 10, cream)}
                {circle(x, 73, 4, purple)}
              </>
            )
          )}
          {text(x, 117, ["ATK", "HEAL", "CTRL"][i], 9)}
        </g>
      ))}
      {s === 2 && (
        <>
          {arrow("M85 49q14-15 27 0", u)}
          {arrow("M156 49q14-15 27 0", u)}
        </>
      )}
    </>
  ),
  "blueprint-replication": (s, u) => (
    <>
      {rect(15, 25, 74, 103, purple)}
      {text(52, 16, "SAVED", 9)}
      {[
        [27, 44],
        [48, 44],
        [48, 65],
        [27, 86],
        [48, 86],
      ].map(([x, y], i) => (
        <g key={i}>{rect(x, y, 17, 17, cyan)}</g>
      ))}
      {arrow("M96 75h29", u)}
      {[
        [135, 28],
        [195, 28],
        [135, 87],
        [195, 87],
      ].map(([x, y], i) => (
        <g key={i}>
          {rect(x, y, 45, 43, cream)}
          {(i <= s || s === 2) && (
            <>
              {rect(x + 6, y + 7, 12, 12, cyan)}
              {rect(x + 20, y + 7, 12, 12, cyan)}
              {rect(x + 20, y + 23, 12, 12, gold)}
            </>
          )}
        </g>
      ))}
      {s === 0 && gem(115, 115)}
      {s === 2 && check(116, 115)}
    </>
  ),
  "persistent-stat-upgrade": (s, u) => (
    <>
      {boundary("NEW RUN")}
      {person(53, 64, cyan)}
      {health(27, 94, s === 0 ? 2 : 4)}
      {gem(52, 35, s === 0 ? gold : cream)}
      {s > 0 && text(89, 76, "+2", 12)}
      {arrow("M91 103h68", u)}
      {person(202, 64, cyan)}
      {health(176, 94, s === 2 ? 4 : 2)}
      {s === 2 && star(229, 37)}
      {text(54, 128, "STAT +", 9)}
      {text(202, 128, s === 2 ? "KEPT" : "NEXT", 9)}
    </>
  ),
  "persistent-unlock": (s, u) => (
    <>
      {boundary("NEW RUN")}
      {rect(21, 40, 79, 61, cream)}
      {lock(60, 57, s > 0)}
      {text(60, 124, s === 0 ? "LOCKED" : "UNLOCK", 10)}
      {arrow("M105 78h45", u)}
      {rect(164, 40, 79, 61, cream)}
      {s === 2 ? (
        <>
          {sword(188, 84)}
          {check(221, 53)}
        </>
      ) : (
        lock(203, 57)
      )}
      {text(203, 124, "AVAILABLE", 9)}
    </>
  ),
  "skill-experience": (s, u) => (
    <>
      {sword(29, 79)}
      {text(52, 114, "USE", 10)}
      {arrow("M78 72h32", u)}
      {[0, 1, 2].map((i) => (
        <g key={i}>{circle(92 + i * 14, 31, 4, i <= s ? gold : cream)}</g>
      ))}
      {rect(120, 43, 119, 54, cream)}
      {text(179, 64, `SKILL LV.${s === 2 ? 2 : 1}`, 10)}
      {rect(131, 74, 97, 12, purple)}
      {rect(133, 76, [26, 59, 93][s], 8, cyan)}
      {s === 2 && star(224, 32)}
      {text(177, 119, `${[30, 65, 100][s]} / 100 XP`, 10)}
    </>
  ),
  "relationship-progression": (s, u) => (
    <>
      {person(43, 82, cyan)}
      {person(215, 82, purple)}
      {path("M76 39h37v27H94l-12 11V66h-6z", cream)}
      {path("M145 54h38v27h-6v12l-13-12h-19z", s > 0 ? gold : cream)}
      {line("M64 113h132", purple, 2)}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          {path(
            `M${88 + i * 25} 107c-10-13-17 2 0 13 17-11 10-26 0-13`,
            i <= s ? gold : cream,
          )}
        </g>
      ))}
      {s === 2 && (
        <>
          {arrow("M128 48h29", u)}
          {check(130, 133)}
        </>
      )}
    </>
  ),
  permadeath: (s, u) => (
    <>
      {rect(17, 22, 226, 109, cream)}
      {text(130, 15, "SAME SAVE", 9)}
      {s === 0 ? (
        <>
          {person(55, 77, cyan)}
          {health(28, 109, 1)}
        </>
      ) : (
        <>
          {path("M34 109V67a20 20 0 0 1 40 0v42z", purple)}
          {line("M54 66v26M44 76h20", cream, 3)}
          {text(53, 125, "RIP", 9)}
        </>
      )}
      {arrow("M88 80h35", u)}
      {line("M144 107V50h87v57z", ink)}
      {s === 2 ? person(193, 78, purple) : person(193, 78, cream)}
      {cross(153, 37)}
      {text(190, 122, s === 2 ? "NEW UNIT" : "NO REVIVE", 9)}
    </>
  ),
  "objective-unlock": (s, u) => (
    <>
      {rect(20, 34, 94, 83, cream)}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          {rect(31, 45 + i * 22, 12, 12, i <= s ? cyan : cream)}
          {i <= s && check(37, 51 + i * 22)}
          {line(`M52 ${52 + i * 22}h46`, purple, 2)}
        </g>
      ))}
      {arrow("M121 78h24", u)}
      {rect(157, 36, 80, 80, cream)}
      {lock(197, 65, s === 2)}
      {text(197, 133, s === 2 ? "OPEN" : "REQUIRES 3", 9)}
    </>
  ),
  "technology-research": (s, u) => (
    <>
      {rect(18, 26, 76, 101, cream)}
      {book(55, 60)}
      {text(55, 104, "LAB", 10)}
      {gem(116, 32, s === 0 ? gold : cream)}
      {clock(121, 73, 16, s, cyan)}
      {arrow("M145 74h22", u)}
      {rect(177, 32, 65, 91, s === 2 ? cyan : cream)}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          {rect(188, 43 + i * 24, 13, 14, s === 2 ? gold : purple)}
          {line(`M208 ${50 + i * 24}h22`, ink, 2)}
        </g>
      ))}
      {text(208, 137, s === 2 ? "NEW TECH" : "RESEARCH", 9)}
    </>
  ),
  "knowledge-gating": (s, u) => (
    <>
      {rect(18, 34, 72, 78, cream)}
      {book(54, 61, s === 0 ? cream : gold)}
      {text(54, 102, s === 0 ? "?" : "2 1 3", 11)}
      {arrow("M96 74h30", u)}
      {rect(142, 30, 97, 88, cream)}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          {circle(162 + i * 28, 58, 9, s > 0 ? cyan : purple)}
          {text(162 + i * 28, 62, ["2", "1", "3"][i], 10)}
        </g>
      ))}
      {s === 2 ? path("M180 87h23v31h-23z", cyan) : line("M153 87h74", ink, 6)}
      {text(189, 137, "SAME WORLD", 9)}
    </>
  ),
  "ability-gating": (s, u) => (
    <>
      {line("M17 110h82M162 110h81", ink, 5)}
      {line("M99 110v22M162 110v22", purple)}
      {path("M114 126l8-12 9 12 9-12 8 12z", purple)}
      {person(s === 2 ? 201 : s === 1 ? 84 : 56, s === 1 ? 44 : 88, cyan)}
      {s === 0 ? (
        lock(130, 77)
      ) : (
        <>
          {arrow("M79 78Q126 0 179 78", u)}
          {star(39, 31)}
        </>
      )}
      {text(54, 137, s === 0 ? "NO DASH" : "DASH +", 9)}
      {s === 2 && check(214, 57)}
    </>
  ),
  "quest-progression": (s, u) => (
    <>
      {line("M44 73h172", purple, 4)}
      {[44, 130, 216].map((x, i) => (
        <g key={x}>
          {rect(x - 24, 43, 48, 61, i <= s ? cream : "#d3c8d6")}
          {text(x, 65, `Q${i + 1}`, 11)}
          {i < s
            ? check(x, 86)
            : i === s
              ? circle(x, 85, 6, gold)
              : lock(x, 77)}
        </g>
      ))}
      {s > 0 && arrow(s === 1 ? "M74 119h43" : "M160 119h43", u)}
      {text(130, 138, "COMPLETE > NEXT", 9)}
    </>
  ),
  "collectible-catalog": (s, u) => (
    <>
      {rect(18, 24, 223, 109, cream)}
      {line("M129 25v107", purple)}
      {[
        [38, 44],
        [83, 44],
        [38, 86],
        [83, 86],
        [148, 44],
        [193, 44],
        [148, 86],
        [193, 86],
      ].map(([x, y], i) => (
        <g key={i}>
          {rect(x, y, 29, 28, i <= [1, 3, 5][s] ? cyan : purple)}
          {i <= [1, 3, 5][s]
            ? i % 2
              ? star(x + 15, y + 14, gold)
              : gem(x + 15, y + 14, gold)
            : text(x + 15, y + 20, "?", 14)}
        </g>
      ))}
      {text(73, 16, "DISCOVERED", 9)}
      {text(185, 145, `${[2, 4, 6][s]} / 8`, 10)}
      {s > 0 && arrow("M111 141h35", u)}
    </>
  ),
};
