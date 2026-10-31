import type { MechanicInstance } from "./model";
export const evidenceLabels: Record<MechanicInstance["evidenceKind"], string> =
  {
    official_description: "官方介绍观察",
    manual: "规则手册",
    developer_description: "开发者说明",
    community_documentation: "社区资料",
    editorial_analysis: "编辑分析",
    unverified: "尚待核验",
  };
