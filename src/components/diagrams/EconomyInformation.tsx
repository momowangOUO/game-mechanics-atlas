import {
  rect,
  circle,
  path,
  arrow,
  text,
  person,
  card,
  colors as c,
  type Artwork,
} from "./SceneKit";
const coin = (x: number, y: number) => (
  <g>
    {circle(x, y, 11, c.gold)}
    {path(`M${x} ${y - 6}v12`)}
  </g>
);
const chest = (x: number, y: number, open = false) => (
  <g>
    {rect(x, y, 43, 30, c.cream)}
    {rect(x + 18, y + 8, 8, 12, c.gold)}
    {path(open ? `M${x} ${y}l5-22h36l2 22` : `M${x} ${y + 8}h43`)}
  </g>
);
const eye = (x: number, y: number) => (
  <g>
    {path(`M${x - 23} ${y}q23-30 46 0q-23 30-46 0`, c.cream)}
    {circle(x, y, 8, c.cyan)}
  </g>
);
const lock = (x: number, y: number, open = false) => (
  <g>
    {rect(x, y, 22, 20, c.gold)}
    {path(
      open ? `M${x + 5} ${y}v-8q9-15 20-3` : `M${x + 5} ${y}v-9q6-12 13 0v9`,
    )}
  </g>
);
const tile = (x: number, y: number, fill = c.cream) => (
  <g>
    {rect(x, y, 35, 28, fill)}
    {path(`M${x + 5} ${y + 9}h25m-25 9h16`)}
  </g>
);
const valve = (x: number, y: number) => (
  <g>
    {circle(x, y, 12, c.purple)}
    {path(`M${x - 8} ${y - 8}l16 16m0-16l-16 16`)}
  </g>
);
const check = (x: number, y: number) => (
  <path d={`M${x} ${y}l9 9 20-24`} stroke={c.ink} strokeWidth="5" fill="none" />
);
export const economyInformationArtwork: Record<string, Artwork> = {
  "toll-payment": (s, u) => (
    <>
      {person(s === 0 ? 22 : 110, 80)}
      {rect(94, 104, 56, 20, c.purple)}
      {person(225, 80, c.cyan)}
      {s < 2 && coin(105, 43)}
      {s > 0 && arrow("M146 55H192", u)}
      {s === 2 && coin(222, 34)}
    </>
  ),
  "recipe-crafting": (s, u) => (
    <>
      {tile(15, 35, c.purple)}
      {tile(15, 83, c.cyan)}
      {rect(92, 46, 65, 60, c.cream)}
      {text(124, 80, "1:1")}
      {s > 0 && arrow("M56 72H82", u)}
      {s === 2 && (
        <>
          {arrow("M168 72H191", u)}
          {chest(202, 64)}
        </>
      )}
    </>
  ),
  "resource-gathering": (s, u) => (
    <>
      {path("M28 112V43m-18 32l18-45 20 45z", c.cyan)}
      {person(105, 75)}
      {s > 0 && arrow("M83 58L47 69", u)}
      {s === 2 && (
        <>
          {tile(180, 70, c.gold)}
          {arrow("M128 90H168", u)}
        </>
      )}
    </>
  ),
  "resource-scarcity": (s, u) => (
    <>
      {coin(37, 70)}
      {path("M59 70H105M105 70l50-35m-50 35l50 35")}
      {rect(170, 15, 65, 38, s === 2 ? c.purple : c.cream)}
      {text(203, 40, "UP")}
      {rect(170, 90, 65, 38, s === 2 ? c.cream : c.cyan)}
      {text(203, 115, "HP")}
      {s === 2 ? (
        <>
          {check(160, 30)}
          {path("M187 96l28 25m0-25l-28 25")}
        </>
      ) : (
        text(110, 127, "1 / 2")
      )}
    </>
  ),
  "production-investment": (s, u) => (
    <>
      {s < 2 && coin(28, 70)}
      {rect(96, 45, 64, 65, c.purple)}
      {path("M106 45V23h14v22m12 0V15h14v30")}
      {s > 0 && arrow("M48 70H84", u)}
      {s === 2 && (
        <>
          {arrow("M169 70H192", u)}
          {coin(210, 47)}
          {coin(210, 75)}
          {coin(210, 103)}
        </>
      )}
    </>
  ),
  "extraction-bank": (s, u) => (
    <>
      {rect(10, 55, 42, 48, c.purple)}
      {path("M18 55V39h26v16")}
      {coin(31, 79)}
      {rect(105, 24, 48, 91, c.cyan)}
      {path("M112 110V34h32v76")}
      {s === 1 && arrow("M59 79H127", u)}
      {chest(196, 77, s === 2)}
      {s === 2 && (
        <>
          {arrow("M158 79H185", u)}
          {check(199, 49)}
          {lock(209, 83)}
        </>
      )}
    </>
  ),
  "base-construction": (s, u) => (
    <>
      {path("M13 120H246")}
      {s === 0 ? (
        <>
          {rect(95, 55, 80, 65, c.cream)}
          {path("M80 55l55-35 55 35")}
        </>
      ) : (
        <>
          {rect(95, 55, 80, 65, c.purple)}
          {path("M80 55l55-35 55 35", c.cream)}
          {rect(122, 85, 23, 35, c.cyan)}
        </>
      )}
      {s < 2 && coin(30, 89)}
      {s === 1 && arrow("M48 89H82", u)}
      {s === 2 && (
        <>
          {rect(197, 59, 43, 29, c.gold)}
          {text(219, 79, "+")}
          {path("M196 95h44")}
        </>
      )}
    </>
  ),
  "shared-resource-pool": (s, u) => (
    <>
      {chest(108, 55)}
      {person(31, 67, c.purple)}
      {person(224, 67, c.cyan)}
      {text(129, 44, s === 0 ? "10" : s === 1 ? "7" : "7")}
      {s > 0 && arrow("M106 77H60", u)}
      {path("M154 77h34")}
      {s === 2 && (
        <>
          {coin(76, 107)}
          {text(76, 137, "+3")}
          {text(224, 132, "7")}
        </>
      )}
    </>
  ),
  "public-market": (s, u) => (
    <>
      {person(24, 93)}
      {person(234, 93, c.cyan)}
      {rect(70, 27, 120, 83, c.cream)}
      {path("M60 27l13-16h113l14 16", c.purple)}
      {s < 2 ? (
        card(77, 45, "A", c.gold)
      ) : (
        <>
          {rect(77, 45, 36, 50, c.cream)}
          {card(5, 11, "A", c.gold)}
        </>
      )}
      {card(139, 45, "B", c.cyan)}
      {s > 0 && arrow("M81 118H36", u)}
      {s === 2 && path("M84 69h22")}
    </>
  ),
  "loot-drop": (s, u) => (
    <>
      {s < 2 ? (
        <>
          {circle(65, 59, 25, c.purple)}
          {path("M39 105l26-18 26 18")}
        </>
      ) : (
        <>
          {path("M42 62l40 38m0-38l-40 38")}
          {coin(65, 50)}
        </>
      )}
      {s === 1 && path("M39 28l54 72", c.cream, c.gold, 7)}
      {s === 2 && (
        <>
          {arrow("M99 77H158", u)}
          {chest(183, 70, true)}
        </>
      )}
    </>
  ),
  "barter-trade": (s, u) => (
    <>
      {person(28, 73)}
      {person(230, 73, c.cyan)}
      {tile(s === 2 ? 175 : 61, 35, c.purple)}
      {coin(s === 2 ? 75 : 185, 104)}
      {s > 0 && (
        <>
          {arrow("M98 48H157", u)}
          {arrow("M156 106H100", u)}
        </>
      )}
    </>
  ),
  "upkeep-needs": (s, u) => (
    <>
      {person(54, 73)}
      {circle(153, 66, 30, c.cream)}
      {path("M153 41v26l20 12")}
      {rect(16, 127, 80, 12, c.cream)}
      {rect(18, 129, s === 2 ? 70 : 30, 8, c.cyan)}
      {s > 0 && (
        <>
          {tile(207, 59, c.gold)}
          {arrow("M199 80H91", u)}
        </>
      )}
    </>
  ),
  "inventory-capacity": (s, u) => (
    <>
      {rect(65, 20, 120, 100, c.cream)}
      {[0, 1, 2, 3, 4, 5].map((n) => (
        <g key={n}>
          {rect(
            72 + (n % 3) * 36,
            28 + Math.floor(n / 3) * 42,
            29,
            34,
            c.purple,
          )}
        </g>
      ))}
      {s < 2 && tile(9, 68, c.gold)}
      {s === 1 && (
        <>
          {arrow("M45 82H66", u)}
          {path("M46 106l12 12m0-12-12 12")}
        </>
      )}
      {s === 2 && (
        <>
          {rect(144, 70, 29, 34, c.gold)}
          {tile(208, 68, c.purple)}
        </>
      )}
      {text(127, 141, "6 / 6")}
    </>
  ),
  "transport-network": (s, u) => (
    <>
      {rect(10, 40, 40, 40, c.purple)}
      {rect(207, 40, 40, 40, c.cyan)}
      {path("M20 112H241M20 119H241")}
      {s > 0 && path("M50 60h157", c.cream, c.ink, 5)}
      {s > 0 && rect(s === 1 ? 75 : 160, 88, 43, 22, c.gold)}
      {s > 0 && (
        <>
          {circle(s === 1 ? 83 : 168, 112, 5, c.cream)}
          {circle(s === 1 ? 110 : 195, 112, 5, c.cream)}
        </>
      )}
    </>
  ),
  "production-chain": (s, u) => (
    <>
      {tile(12, 55, c.purple)}
      {rect(82, 40, 45, 61, c.cream)}
      {rect(158, 40, 45, 61, c.cyan)}
      {s > 0 && arrow("M51 70H74", u)}
      {s > 0 && (
        <>
          {tile(89, 56, c.gold)}
          {arrow("M133 70H151", u)}
        </>
      )}
      {s === 2 && (
        <>
          {arrow("M209 70H233", u)}
          {circle(240, 70, 10, c.gold)}
        </>
      )}
    </>
  ),
  "energy-network": (s, u) => (
    <>
      {rect(15, 45, 45, 65, c.cream)}
      {path("M45 49L28 78h18l-16 28", c.gold)}
      {path(
        "M60 75h50m0 0v-35h74m-74 35v35h74",
        "none",
        s > 0 ? c.cyan : c.ink,
        5,
      )}
      {rect(184, 22, 47, 35, s === 2 ? c.gold : c.purple)}
      {rect(184, 93, 47, 35, s === 2 ? c.gold : c.purple)}
      {s === 2 && (
        <>
          {text(208, 46, "ON")}
          {text(208, 117, "ON")}
        </>
      )}
    </>
  ),
  "thermal-regulation": (s, u) => (
    <>
      {path("M42 106V29q0-14 13-14t13 14v77", c.cream)}
      {circle(55, 114, 17, c.cream)}
      {path(
        `M55 112V${s === 0 ? 32 : s === 1 ? 55 : 78}`,
        "none",
        s === 0 ? c.purple : c.cyan,
        8,
      )}
      {rect(118, 34, 106, 82, c.cream)}
      {path("M130 51h82m-82 18h82m-82 18h82")}
      {s > 0 && arrow("M111 90H86", u)}
      {text(173, 136, s === 2 ? "18°" : "35°")}
    </>
  ),
  "fluid-network": (s, u) => (
    <>
      {rect(12, 15, 53, 106, c.cream)}
      {rect(16, 62, 45, 55, c.cyan)}
      {path("M65 96h65V51h72", "none", c.ink, 10)}
      {path("M66 96h64V51h71", "none", s > 0 ? c.cyan : c.cream, 5)}
      {valve(129, 81)}
      {rect(205, 18, 42, 105, c.cream)}
      {s === 2 && rect(209, 68, 34, 51, c.cyan)}
    </>
  ),
  "agriculture-husbandry": (s, u) => (
    <>
      {path("M12 115H247")}
      {rect(23, 111, 65, 13, c.purple)}
      {s === 0 ? (
        circle(54, 106, 5, c.gold)
      ) : (
        <>
          {path(`M54 111V${s === 1 ? 67 : 44}`, "none", c.ink, 4)}
          {path(
            "M54 83q-37 0-23-22 23-3 23 22m0-10q35 0 22-21-22 0-22 21",
            c.cyan,
          )}
          {s === 2 && circle(54, 44, 12, c.gold)}
        </>
      )}
      {s === 1 && (
        <>
          {path("M135 28l-15 27q15 22 30 0z", c.cyan)}
          {arrow("M132 67L89 88", u)}
        </>
      )}
      {s === 2 && (
        <>
          {arrow("M91 82H165", u)}
          {chest(188, 81, true)}
        </>
      )}
    </>
  ),
  "workforce-assignment": (s, u) => (
    <>
      {person(27, 67)}
      {person(75, 67, c.cyan)}
      {rect(142, 25, 95, 40, c.cream)}
      {text(188, 51, "A")}
      {rect(142, 91, 95, 40, c.cream)}
      {text(188, 118, "B")}
      {s > 0 && (
        <>
          {arrow("M36 43Q82 3 130 38", u)}
          {arrow("M92 100H130", u)}
        </>
      )}
      {s === 2 && (
        <>
          {coin(245, 45)}
          {coin(245, 111)}
        </>
      )}
    </>
  ),
  "combat-resource-conversion": (s, u) => (
    <>
      {person(26, 77)}
      {circle(123, 70, 25, c.purple)}
      {s === 1 && path("M67 39l74 65", c.cream, c.gold, 7)}
      {s === 2 && (
        <>
          {path("M104 51l38 38m0-38l-38 38")}
          {arrow("M154 70H184", u)}
          {rect(200, 35, 36, 40, c.cyan)}
          {text(218, 62, "+")}
          {rect(200, 90, 36, 30, c.gold)}
          {text(218, 112, "|")}
        </>
      )}
    </>
  ),
  "intent-preview": (s, u) => (
    <>
      {person(44, 84, c.cyan)}
      {person(211, 84)}
      {s < 2 && (
        <>
          {rect(170, 10, 73, 30, c.cream)}
          {text(207, 31, "6 ATK")}
          {path("M199 40l9 13 9-13", c.cream)}
        </>
      )}
      {s > 0 && path("M70 66l16 6v23l-16 11-11-11V72Z", c.cyan)}
      {s === 2 && arrow("M182 77H83", u)}
    </>
  ),
  "next-piece-preview": (s, u) => (
    <>
      {rect(18, 20, 113, 110, c.cream)}
      {rect(30, 91, 23, 23, c.purple)}
      {rect(53, 91, 23, 23, c.purple)}
      {rect(s === 2 ? 76 : 54, s === 2 ? 91 : 38, 23, 23, c.cyan)}
      {rect(166, 17, 77, 69, c.cream)}
      {text(205, 37, "NEXT")}
      {rect(183, 49, 16, 16, c.gold)}
      {rect(199, 49, 16, 16, c.gold)}
      {s === 1 && arrow("M167 100L134 91", u)}
    </>
  ),
  "hidden-hand": (s, u) => (
    <>
      {eye(45, 34)}
      {[0, 1, 2].map((n) => (
        <g key={n}>
          {card(83 + n * 49, 13, String(n + 1), c.cream)}
          {card(83 + n * 49, 86, "?", c.purple)}
        </g>
      ))}
      {path("M18 74H243", "none", c.ink, 2)}
      {s === 1 && arrow("M45 48L83 40", u)}
      {s === 2 && text(42, 124, "?")}
    </>
  ),
  "fog-of-war": (s, u) => (
    <>
      {rect(15, 20, 230, 108, c.purple)}
      {rect(22, 27, 70 + s * 38, 94, c.cream)}
      {path(
        "M75 29v90m45-90v90m45-90v90m-143-60h218m-218 35h218",
        "none",
        "#9d8caf",
        1,
      )}
      {person(55 + s * 35, 70, c.cyan)}
      {s === 2 && circle(151, 51, 10, c.gold)}
    </>
  ),
  "environmental-clues": (s, u) => (
    <>
      {rect(15, 25, 71, 85, c.cream)}
      {path("M34 68l15-22 17 22-17 22z", c.purple)}
      {rect(174, 25, 71, 85, c.cream)}
      {path("M191 68l16-22 17 22-17 22z", s === 2 ? c.cyan : c.cream)}
      {s === 1 && eye(130, 66)}
      {s === 2 && arrow("M95 67H162", u)}
    </>
  ),
  "stealth-detection": (s, u) => (
    <>
      {person(38 + s * 48, 85, c.purple)}
      {person(220, 85, c.cyan)}
      <path
        d="M207 69L111 23V119Z"
        fill={s === 2 ? "#ddb96988" : "#70b8b233"}
        stroke={c.ink}
        strokeWidth="2"
      />
      {s === 2 ? text(219, 28, "!", 27) : text(219, 28, "?", 22)}
      {rect(66, 49, 22, 62, c.cream)}
    </>
  ),
  "recipe-discovery": (s, u) => (
    <>
      {tile(20, 35, c.purple)}
      {tile(20, 80, c.cyan)}
      {rect(96, 42, 49, 63, c.cream)}
      {text(120, 83, s === 0 ? "?" : "+")}
      {s > 0 && arrow("M62 73H85", u)}
      {s === 2 && (
        <>
          {arrow("M155 73H181", u)}
          {rect(195, 30, 53, 78, c.gold)}
          {text(221, 53, "A+B", 17)}
          {text(221, 76, "=")}
          {text(221, 98, "C", 19)}
        </>
      )}
    </>
  ),
  "deduction-validation": (s, u) => (
    <>
      {card(16, 20, "A")}
      {card(16, 84, "B")}
      {circle(126, 70, 26, c.cream)}
      {text(126, 76, s === 0 ? "?" : "=")}
      {s > 0 && (
        <>
          {path("M57 44l41 17M57 109l41-28")}
          {arrow("M160 70H185", u)}
        </>
      )}
      {s === 2 && check(203, 68)}
    </>
  ),
  "language-decoding": (s, u) => (
    <>
      {rect(15, 19, 112, 108, c.cream)}
      {text(71, 48, "△ • △", 18)}
      {text(71, 80, "• □ △", 18)}
      {text(71, 111, "△ □ •", 18)}
      {s > 0 && arrow("M135 74H164", u)}
      {s === 2 ? (
        <>
          {text(209, 45, "△ = A")}
          {text(209, 78, "• = B")}
          {text(209, 111, "□ = C")}
        </>
      ) : (
        text(209, 80, "?", 32)
      )}
    </>
  ),
  "clue-journal": (s, u) => (
    <>
      {tile(15, 50, c.gold)}
      {rect(109, 19, 121, 108, c.cream)}
      {path("M167 22v102")}
      {s > 0 && (
        <>
          {arrow("M56 63H96", u)}
          {path("M120 40h37m-37 13h30m-30 13h36")}
        </>
      )}
      {s === 2 && (
        <>
          {path("M178 44h41m-41 15h35m-35 15h39")}
          {check(182, 104)}
        </>
      )}
    </>
  ),
  "document-check": (s, u) => (
    <>
      {rect(14, 19, 83, 111, c.cream)}
      {rect(164, 19, 83, 111, c.cream)}
      {text(55, 48, "01 / 08")}
      {text(205, 48, "02 / 08")}
      {path("M27 64h57m-57 16h48m94-16h57m-57 16h48")}
      {s === 1 && eye(129, 69)}
      {s === 2 && (
        <>
          {path("M188 98l22 22m0-22l-22 22")}
          {path("M176 54h59", "none", c.gold, 4)}
          {arrow("M106 112H152", u)}
        </>
      )}
    </>
  ),
  "scouting-tracking": (s, u) => (
    <>
      {path("M19 112Q81 24 149 91T240 36", "none", "#9d8caf", 2)}
      {[0, 1, 2, 3].map((n) => (
        <ellipse
          key={n}
          cx={48 + n * 47}
          cy={[79, 65, 87, 60][n]}
          rx="5"
          ry="10"
          transform={`rotate(40 ${48 + n * 47} ${[79, 65, 87, 60][n]})`}
          fill={n <= s ? c.ink : c.purple}
        />
      ))}
      {s < 2 ? circle(228, 43, 18, c.purple) : person(228, 43, c.cyan)}
      {eye(32, 28)}
    </>
  ),
  "sound-information": (s, u) => (
    <>
      {person(39, 81)}
      {rect(94, 19, 17, 112, c.cream)}
      {circle(219, 72, 12, c.gold)}
      {path(
        "M197 55q-22 17 0 34m-15-45q-35 28 0 56m-15-67q-48 39 0 78",
        "none",
        c.cyan,
        3,
      )}
      {s > 0 && arrow("M66 73H91", u)}
      {s === 2 && text(41, 27, "!", 24)}
    </>
  ),
  "map-navigation": (s, u) => (
    <>
      {rect(18, 17, 224, 116, c.cream)}
      {path(
        "M89 20v110m78-110v110m-146-72h219m-219 43h219",
        "none",
        "#c1afbf",
        2,
      )}
      {circle(s === 2 ? 199 : 48, s === 2 ? 41 : 110, 8, c.purple)}
      {path("M197 23v28m0-27l23 10-23 5", c.gold)}
      {s > 0 && path("M48 110h72V75h79V45", "none", c.cyan, 5)}
    </>
  ),
  "hidden-role": (s, u) => (
    <>
      <g transform="translate(36 82) scale(.8)">{person(0, 0)}</g>
      <g transform="translate(130 82) scale(.8)">{person(0, 0, c.cyan)}</g>
      <g transform="translate(224 82) scale(.8)">{person(0, 0, c.gold)}</g>
      {s === 0 ? (
        <>
          {card(18, 5, "A", c.cream)}
          {card(112, 5, "B", c.cream)}
          {card(206, 5, "A", c.cream)}
        </>
      ) : (
        <>
          {card(18, 5, "?", c.purple)}
          {card(112, 5, "B", c.cream)}
          {card(206, 5, "?", c.purple)}
        </>
      )}
      {s === 2 && (
        <>
          {eye(130, 132)}
          {path("M114 118L56 102m90 16l58-16")}
        </>
      )}
    </>
  ),
  "cooperative-play": (s, u) => (
    <>
      {person(35, 85)}
      {person(222, 85, c.cyan)}
      {rect(104, 64, 50, 46, c.cream)}
      {path("M100 64l29-20 29 20", c.gold)}
      {s > 0 && (
        <>
          {arrow("M65 86H93", u)}
          {arrow("M192 86H165", u)}
        </>
      )}
      {s === 2 && check(116, 30)}
    </>
  ),
  "pvp-opposition": (s, u) => (
    <>
      {person(38, 77)}
      {person(222, 77, c.cyan)}
      {circle(130, 65, 18, c.gold)}
      {s > 0 && (
        <>
          {arrow("M65 65H105", u)}
          {arrow("M194 65H156", u)}
        </>
      )}
      {s === 2 && (
        <>
          {path("M116 44l28 43m0-43l-28 43")}
          {text(130, 128, "1 : 0")}
        </>
      )}
    </>
  ),
  "asynchronous-opponent": (s, u) => (
    <>
      {person(28, 84)}
      {rect(111, 24, 49, 76, c.cream)}
      {text(135, 55, "SAVE")}
      {path("M120 69h31m-31 13h31")}
      {person(229, 84, c.cyan)}
      {s > 0 && arrow("M58 70H101", u)}
      {s === 2 && (
        <>
          {arrow("M170 70H202", u)}
          {text(29, 144, "OFF", 12)}
          {text(227, 144, "NOW", 12)}
        </>
      )}
    </>
  ),
  "synchronous-session": (s, u) => (
    <>
      {rect(78, 20, 104, 112, c.cream)}
      {person(23, 76)}
      {person(238, 76, c.cyan)}
      {path("M47 68h26m114 0h26")}
      {circle(130, 75, 26, c.gold)}
      {path("M130 55v21l14 7")}
      {s > 0 && text(130, 121, "LIVE")}
      {s === 2 && (
        <>
          {circle(65, 68, 5, c.cyan)}
          {circle(199, 68, 5, c.purple)}
        </>
      )}
    </>
  ),
  "role-asymmetry": (s, u) => (
    <>
      {person(47, 75, c.purple)}
      {person(212, 75, c.cyan)}
      {path("M30 20l15-13 17 13-17 16z", c.gold)}
      {path("M197 8v29m-14-14h28", c.cream, c.ink, 6)}
      {s > 0 && (
        <>
          {arrow("M76 75H105", u)}
          {arrow("M184 75H156", u)}
        </>
      )}
      {s === 2 && circle(130, 75, 17, c.gold)}
    </>
  ),
  "social-diplomacy": (s, u) => (
    <>
      {person(37, 83)}
      {person(223, 83, c.cyan)}
      {path("M66 39q27-25 51 0v23H75l-9 10z", c.cream)}
      {s > 0 && path("M148 39q24-25 48 0v33l-10-10h-38z", c.cream)}
      {s === 2 ? (
        <>
          {path("M91 102l38-25 39 25-39 24z", c.gold)}
          {text(129, 108, "+")}
        </>
      ) : (
        path("M91 115h77", "none", c.purple, 4)
      )}
    </>
  ),
  "shared-objective": (s, u) => (
    <>
      {person(39, 62)}
      {person(223, 62, c.cyan)}
      {rect(80, 42, 100, 22, c.cream)}
      {rect(84, 46, [18, 48, 92][s], 14, c.gold)}
      {s > 0 && (
        <>
          {arrow("M64 53H75", u)}
          {arrow("M197 53H185", u)}
        </>
      )}
      {text(130, 104, ["1 / 5", "3 / 5", "5 / 5"][s])}
      {s === 2 && check(114, 123)}
    </>
  ),
  "random-upgrade-offer": (s, u) => (
    <>
      {rect(10, 42, 43, 58, c.purple)}
      {text(31, 78, "?")}
      {s > 0 && (
        <>
          {arrow("M62 72H85", u)}
          {card(99, 45, "A")}
          {card(148, 45, "B", s === 2 ? c.gold : c.cream)}
          {card(197, 45, "C")}
        </>
      )}
      {s === 2 && check(153, 119)}
    </>
  ),
  "random-draw": (s, u) => (
    <>
      {card(23, 26, "A")}
      {card(34, 34, "B")}
      {card(45, 42, "C", c.purple)}
      {s > 0 && arrow("M96 66H159", u)}
      {s === 2 ? card(184, 42, "B", c.gold) : card(184, 42, "?")}
    </>
  ),
  "dice-roll": (s, u) => (
    <>
      {rect(85, 30, 86, 86, c.cream)}
      {s === 1 &&
        path("M66 26q-33 50 0 86m125-86q32 50 0 86", "none", c.purple, 3)}
      {(s === 0
        ? [[128, 73]]
        : s === 1
          ? [
              [109, 52],
              [147, 91],
            ]
          : [
              [109, 52],
              [147, 52],
              [128, 73],
              [109, 93],
              [147, 93],
            ]
      ).map(([x, y], i) => (
        <g key={i}>{circle(x, y, 5, c.ink)}</g>
      ))}
      {s === 2 && (
        <>
          {arrow("M184 73H213", u)}
          {text(235, 79, "5", 25)}
        </>
      )}
    </>
  ),
  "generated-layout": (s, u) => (
    <>
      {s === 0 ? (
        <>
          {rect(15, 30, 35, 32, c.purple)}
          {rect(15, 85, 35, 32, c.cyan)}
          {arrow("M65 74H100", u)}
        </>
      ) : null}
      {[
        [122, 20],
        [122, 69],
        [182, 69],
        [62, 69],
        [182, 113],
      ]
        .filter((_, i) => (s === 0 ? i < 1 : s === 1 ? i < 3 : true))
        .map(([x, y], i) => (
          <g key={i}>{rect(x, y, 35, 30, i === 0 ? c.gold : c.cream)}</g>
        ))}
      {s > 0 && path("M140 52v17m-18 15H98m59 0h25m17 15v14")}
    </>
  ),
  "seeded-replay": (s, u) => (
    <>
      {rect(14, 45, 70, 46, c.cream)}
      {text(49, 75, "S:42")}
      {s > 0 && (
        <>
          {arrow("M92 68H120", u)}
          {path("M127 69v-35h26m-26 35v35h26")}
        </>
      )}
      {s === 2 && (
        <>
          {text(205, 40, "3 1 4")}
          {text(205, 110, "3 1 4")}
          {text(205, 78, "=", 24)}
        </>
      )}
    </>
  ),
  "randomized-encounters": (s, u) => (
    <>
      {circle(33, 72, 23, c.cream)}
      {text(33, 79, "?")}
      {s > 0 && arrow("M66 72H93", u)}
      {[0, 1, 2].map((n) => (
        <g key={n}>
          {circle(
            120 + n * 51,
            72,
            17,
            s === 2 ? [c.gold, c.purple, c.cyan][n] : c.cream,
          )}
          {text(120 + n * 51, 78, s === 2 ? ["B", "C", "A"][n] : "?")}
        </g>
      ))}
    </>
  ),
  "world-simulation": (s, u) => (
    <>
      {circle(35, 30, 14, c.gold)}
      {path(
        "M35 6V1m0 53v6M11 30H5m54 0h6m-47-17-4-4m39 39 5 5m-5-40 5-4M18 48l-4 5",
      )}
      {circle(199, 30, 12, c.purple)}
      {circle(214, 25, 16, c.purple)}
      {circle(230, 31, 12, c.purple)}
      {rect(81, 119, 98, 11, c.cream)}
      {path(
        s === 0
          ? "M130 119V96m0 10q-20-19-21-4 9 11 21 4"
          : "M130 119V69m0 28q-37-21-31-34 27 2 31 34m0-13q32-26 34-10-11 15-34 10",
        c.cyan,
      )}
      {rect(81, 136, 98, 9, c.cream)}
      {rect(84, 139, [20, 80, 41][s], 3, c.cyan)}
      {s > 0 && (
        <>
          {arrow("M57 45L101 74", u)}
          {arrow("M198 54L167 88", u)}
          {path("M212 53v12m15-12v12", "none", c.cyan, 4)}
        </>
      )}
      {s === 2 && (
        <>
          {circle(118, 76, 8, c.gold)}
          {circle(145, 77, 8, c.gold)}
        </>
      )}
    </>
  ),
  "event-director": (s, u) => (
    <>
      {rect(14, 22, 79, 103, c.cream)}
      {path("M24 104l11-35 14 17 15-49 18 19", "none", c.cyan, 4)}
      {s > 0 && arrow("M101 75H133", u)}
      {rect(147, 24, 91, 40, c.cream)}
      {rect(147, 85, 91, 40, s === 2 ? c.gold : c.cream)}
      {text(192, 50, "EVENT A")}
      {text(192, 111, "EVENT B")}
      {s === 2 && check(124, 102)}
    </>
  ),
  "mutable-environment": (s, u) => (
    <>
      {person(24, 84)}
      {rect(78, 81, 34, 25, s === 0 ? c.purple : c.gold)}
      {path("M91 81V57l13-12")}
      {rect(172, 19, 53, 110, c.cream)}
      {s < 2
        ? path("M178 29v91m12-91v91m12-91v91m12-91v91")
        : arrow("M156 78H241", u)}
      {s === 1 && arrow("M51 83H68", u)}
    </>
  ),
  "randomized-market": (s, u) => (
    <>
      {rect(22, 31, 215, 96, c.cream)}
      {path("M11 31l21-21h192l23 21", c.purple)}
      {[0, 1, 2].map((n) => (
        <g key={n}>
          {card(
            39 + n * 69,
            52,
            s === 2 ? ["C", "A", "D"][n] : ["A", "B", "C"][n],
            s === 2 ? c.gold : c.cream,
          )}
        </g>
      ))}
      {s === 1 && (
        <>
          {path("M104 15q28-16 50 0")}
          {arrow("M154 15l-1 13", u)}
        </>
      )}
    </>
  ),
};
