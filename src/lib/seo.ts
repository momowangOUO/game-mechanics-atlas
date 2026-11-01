import type { Metadata } from "next";
import { dimensions, games, genres, mechanics } from "./knowledge";
import { taxonomyGroups } from "../data/taxonomy-reference";

/** The public deployment is fixed; local preview prefixes never define canonicals. */
export const SITE_URL = "https://momowangouo.github.io/game-mechanics-atlas";
export const SITE_NAME = "机制研究室";
export const SITE_DESCRIPTION =
  "从九个维度查阅游戏机制的定义、分类与真实用法，比较游戏案例，研究机制组合，并查看来源与适用范围。";
export const SOCIAL_IMAGE = `${SITE_URL}/brand/social-preview.png`;
export const AUTHOR_NAME = "魔魔王";
export const SUPPORT_MESSAGE =
  "如果这些资料对你有帮助，欢迎到 GitHub 项目页点个 Star，支持后续整理。";

export function canonicalUrl(path = "/") {
  const clean = path.split(/[?#]/, 1)[0].replace(/^\/+|\/+$/g, "");
  return clean ? `${SITE_URL}/${clean}/` : `${SITE_URL}/`;
}

export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  const url = canonicalUrl(path);
  const fullTitle = `${title} · ${SITE_NAME}`;
  return {
    title: { absolute: fullTitle },
    description,
    alternates: {
      canonical: url,
      types: { "text/markdown": `${url}index.md` },
    },
    openGraph: {
      type: "website",
      locale: "zh_CN",
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      url,
      images: [
        {
          url: SOCIAL_IMAGE,
          width: 1280,
          height: 640,
          alt: "机制研究室 · 游戏机制与案例参考",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [SOCIAL_IMAGE],
    },
  };
}

export const indexPageMetadata: Record<string, Metadata> = {
  "/": pageMetadata("游戏机制分类与案例参考", SITE_DESCRIPTION, "/"),
  "/taxonomy": pageMetadata(
    "玩法分类图鉴：九个维度与机制分组",
    "按核心交互、规则、流程、构筑、成长、资源、信息、参与者和随机变化逐层查找机制，阅读分组作用、边界与游戏实例。",
    "/taxonomy",
  ),
  "/mechanics": pageMetadata(
    "机制档案：定义、边界与设计参考",
    "检索游戏原子机制，查看定义、纳入条件、排除边界、设计价值、风险及注明范围与来源的游戏实例。",
    "/mechanics",
  ),
  "/games": pageMetadata(
    "游戏案例：规则、范围与机制实例",
    "查阅已收录游戏的核心循环、机制用法与设计分析，结合模式、角色和版本范围核对来源。",
    "/games",
  ),
  "/types": pageMetadata(
    "复合类型：玩法特征与机制配方",
    "比较游戏复合类型的核心玩法、必要与常见机制、相近类型边界以及典型游戏参照。",
    "/types",
  ),
  "/graph": pageMetadata(
    "交互机制图谱：依赖、协同与冲突",
    "在交互图谱中查看机制之间的依赖、协同、替代与冲突关系，结合关系的解释与适用条件继续研究。",
    "/graph",
  ),
  "/lab": pageMetadata(
    "研究提示词：机制组合与研究模板",
    "选择机制组合和研究模板，复制组合研究、机制对照或 Demo 验证提示词，交给 AI 继续研究，并保留来源与待验证问题。",
    "/lab",
  ),
  "/compare": pageMetadata(
    "游戏对比：同一范围内比较机制",
    "选择游戏及研究范围，对照机制的存在、条件存在、缺失与未知状态，避免混用不同模式或角色的规则。",
    "/compare",
  ),
  "/heat": pageMetadata(
    "搜索趋势：真实来源与数据边界",
    "查看保留来源、时间和地区的搜索资料，区分历史搜索增长、相对指数与搜索次数，不用本站收录样本代替市场需求。",
    "/heat",
  ),
  "/method": pageMetadata(
    "阅读方法：分类、证据与搜索数据",
    "了解本站的分类层次、机制实例状态、研究范围与来源规则，以及搜索数据和编辑分析的适用边界。",
    "/method",
  ),
  "/sources": pageMetadata(
    "资料来源：引用、图像与使用范围",
    "查阅游戏规则、案例与图像的来源目录，核对发布者、核验日期、支持内容及资产使用范围。",
    "/sources",
  ),
  "/for-agents": pageMetadata(
    "机器阅读入口：Markdown 与结构化数据",
    "获取机制研究室的 Markdown 页面、版本化 JSON 目录与实体数据，保留来源、研究范围和编辑判断边界。",
    "/for-agents",
  ),
  "/copyright": pageMetadata(
    "版权与署名：原创内容与引用资料",
    "查看魔魔王整理的机制研究室原创内容、游戏图像及第三方资料的权利归属、引用署名与更正联系说明。",
    "/copyright",
  ),
};

/** All public content routes; browser filter states are views of these pages. */
export function publicContentPaths() {
  return [
    ...Object.keys(indexPageMetadata),
    ...mechanics.map(({ id }) => `/mechanics/${id}`),
    ...games.map(({ id }) => `/games/${id}`),
    ...genres.map(({ id }) => `/types/${id}`),
    ...dimensions.map(({ id }) => `/taxonomy/${id}`),
    ...taxonomyGroups.map(
      ({ dimensionId, id }) => `/taxonomy/${dimensionId}/${id}`,
    ),
  ];
}

export type Breadcrumb = { name: string; path: string };
export function breadcrumbSchema(items: Breadcrumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}

/** Escape HTML delimiters even when editorial content contains a closing script. */
export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
