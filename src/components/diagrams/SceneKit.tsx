import type { ReactNode } from "react";
export const colors = {
  ink: "#282439",
  purple: "#b59bdc",
  cyan: "#70b8b2",
  gold: "#ddb969",
  cream: "#fff7df",
};
export const rect = (
  x: number,
  y: number,
  w: number,
  h: number,
  fill = colors.purple,
) => (
  <rect
    x={x}
    y={y}
    width={w}
    height={h}
    rx="3"
    fill={fill}
    stroke={colors.ink}
    strokeWidth="3"
  />
);
export const circle = (
  x: number,
  y: number,
  r: number,
  fill = colors.purple,
) => (
  <circle cx={x} cy={y} r={r} fill={fill} stroke={colors.ink} strokeWidth="3" />
);
export const path = (
  d: string,
  fill = "none",
  stroke = colors.ink,
  width = 3,
) => (
  <path
    d={d}
    fill={fill}
    stroke={stroke}
    strokeWidth={width}
    strokeLinecap="round"
    strokeLinejoin="round"
  />
);
export const arrow = (d: string, uid: string) => (
  <path
    d={d}
    stroke={colors.ink}
    strokeWidth="3"
    fill="none"
    markerEnd={`url(#${uid})`}
  />
);
export const text = (
  x: number,
  y: number,
  label: string | number,
  size = 14,
) => (
  <text
    x={x}
    y={y}
    fontSize={size}
    fill={colors.ink}
    textAnchor="middle"
    fontFamily="monospace"
  >
    {label}
  </text>
);
export const person = (x: number, y: number, color = colors.purple) => (
  <g transform={`translate(${x} ${y})`}>
    {circle(0, -17, 10, color)}
    {path("M-15 28V5Q0-10 15 5V28", color)}
    {path("M-7 28v13m14-13v13")}
  </g>
);
export const card = (
  x: number,
  y: number,
  label: string | number = "?",
  fill = colors.cream,
) => (
  <g>
    {rect(x, y, 36, 50, fill)}
    {text(x + 18, y + 32, label, 17)}
  </g>
);
export type Artwork = (step: number, uid: string) => ReactNode;
