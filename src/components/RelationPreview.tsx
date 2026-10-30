import { getMechanic } from "@/lib/knowledge";

export default function RelationPreview() {
  const nodes = [
    { id: "score-threshold", x: 10, y: 72, w: 130, color: "#88cdc5" },
    { id: "rule-modifier", x: 244, y: 12, w: 118, color: "#c4aff0" },
    { id: "stacking-effects", x: 244, y: 132, w: 118, color: "#c4aff0" },
    { id: "in-run-deck-growth", x: 465, y: 72, w: 150, color: "#dfbd77" },
  ];
  return (
    <svg
      className="relation-preview"
      viewBox="0 0 650 190"
      role="img"
      aria-label="分数达标、规则修饰、效果叠加与卡组配置的编辑关系示意，节点可打开档案"
    >
      <g fill="none" stroke="#84729f" strokeWidth="1.5">
        <path d="M140 96C170 96 180 36 244 36" />
        <path d="M140 96C170 96 180 157 244 157" />
        <path d="M362 36C405 36 405 96 465 96" />
        <path d="M362 157C405 157 405 96 465 96" />
        <path
          className="flow-path"
          d="M140 96H465"
          stroke="#88cdc5"
          strokeDasharray="5 7"
        />
      </g>
      <g fontSize="12" fontFamily="Microsoft YaHei">
        {nodes.map((node) => (
          <a
            key={node.id}
            href={`/mechanics/${node.id}`}
            aria-label={`查看${getMechanic(node.id)?.name || node.id}`}
          >
            <rect
              x={node.x}
              y={node.y}
              width={node.w}
              height={46}
              fill={`${node.color}20`}
              stroke={node.color}
            />
            <text
              x={node.x + node.w / 2}
              y={node.y + 28}
              textAnchor="middle"
              fill={node.color}
            >
              {getMechanic(node.id)?.name || node.id}
            </text>
          </a>
        ))}
      </g>
      <g className="chart-label">
        <text x="180" y="31">
          改写计算
        </text>
        <text x="171" y="161">
          协同放大
        </text>
        <text x="409" y="87">
          配置
        </text>
      </g>
    </svg>
  );
}
