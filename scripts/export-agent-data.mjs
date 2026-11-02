import { mkdir, writeFile } from "node:fs/promises";
import { resolve, relative, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { dataset, validateKnowledge } from "../src/lib/knowledge.ts";
import {
  taxonomyDimensions,
  taxonomyGroups,
  classificationLevels,
} from "../src/data/taxonomy-reference.ts";
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  AUTHOR_NAME,
  canonicalUrl,
  indexPageMetadata,
  SUPPORT_MESSAGE,
} from "../src/lib/seo.ts";
import { promptTemplates } from "../src/lib/research-prompt.ts";
import { mechanicScenes } from "../src/data/mechanic-scenes.ts";
import { currentTrends } from "../src/lib/current-trends.ts";

const DEFAULT_OUTPUT = fileURLToPath(new URL("../public/", import.meta.url));
const author = {
  name: AUTHOR_NAME,
  url: "https://github.com/momowangOUO",
  repository: "https://github.com/momowangOUO/game-mechanics-atlas",
};
const policy = {
  attribution:
    "引用本站分类与分析时请注明“魔魔王 · 机制研究室”及具体页面；游戏事实还应保留原始来源、范围、条件和核验日期。",
  editorial:
    "机制定义、分类、类型、设计分析与配方是编辑整理，不是行业统一标准或已验证的设计结论。",
  evidence:
    "游戏实例按 evidenceKind、scopeId、status 与 condition 阅读；未记录项为 unknown，不表示 absent；本数据不声称安装试玩。",
  rights:
    "游戏与第三方资料的权利归相应权利人。公开读取不等于本站授予第三方内容的复用许可。",
};
const statusLabels = {
  present: "已确认存在",
  conditional: "条件存在",
  absent: "已确认不存在",
  unknown: "未知",
  not_applicable: "不适用",
};
const evidenceLabels = {
  official_description: "官方说明",
  manual: "手册",
  developer_description: "开发者说明",
  community_documentation: "社区资料",
  editorial_analysis: "编辑分析",
  unverified: "未核验",
};
const link = (name, path) => `[${name}](${canonicalUrl(path)})`;
const list = (rows) => rows.map((row) => `- ${row}`).join("\n");
const section = (title, lines) =>
  `\n## ${title}\n\n${Array.isArray(lines) ? list(lines) : lines}\n`;
const baseDoc = (kind, entity, path) => ({
  schemaVersion: 1,
  kind,
  id: entity.id,
  canonicalUrl: canonicalUrl(path),
  markdownUrl: `${canonicalUrl(path)}index.md`,
  author,
  interpretation: policy,
  ...entity,
});
const sourceRows = (ids) =>
  dataset.sources.filter((source) => ids.includes(source.id));
const mechanicIllustration = (id) => {
  const scene = mechanicScenes[id];
  return scene
    ? {
        label: "图解（规则示意）",
        epistemicStatus: "editorial_illustration",
        note: "本站编辑的规则示意，用于解释机制，不是游戏截图或游戏事实证据。",
        diagramKind: scene.kind,
        comicLabel: "三格漫画（模型生成）",
        frames: scene.frames,
        objects: scene.objects,
        images: {
          comic: `${SITE_URL}/art/comics/${id}.webp`,
          icon: `${SITE_URL}/art/mechanics/${id}.webp`,
          guide: `${SITE_URL}/art/chibi-guide.webp`,
        },
      }
    : undefined;
};
function illustrationMarkdown(illustration, name) {
  if (!illustration) return "";
  return section(
    illustration.label,
    `${illustration.note}\n\n${illustration.comicLabel}\n\n![${name}三格漫画（模型生成）](${illustration.images.comic})\n\n示意类型：${illustration.diagramKind}\n\n${illustration.frames.map((caption, index) => `${index + 1}. ${["情境", "触发", "结果"][index]}：${caption}（对象：${illustration.objects[index]}）`).join("\n")}\n\n![${name}图标（原创示意）](${illustration.images.icon})\n\n[原创讲解角色插画](${illustration.images.guide})`,
  );
}
function sourceMarkdown(rows) {
  return rows.length
    ? list(
        rows.map(
          (source) =>
            `[${source.title}](${source.url}) · ${source.publisher} · ${source.type} · 核验 ${source.checkedAt}\n  支持范围：${source.claimScope}`,
        ),
      )
    : "尚无可列出的直接来源；不能据此扩充为已确认的游戏事实。";
}
function instanceMarkdown(rows) {
  return rows.length
    ? rows
        .map((row) => {
          const scope = dataset.scopes.find(
            (scope) => scope.id === row.scopeId,
          );
          const game = dataset.games.find((game) => game.id === scope?.gameId);
          const mechanic = dataset.mechanics.find(
            (mechanic) => mechanic.id === row.mechanicId,
          );
          return `### ${game?.name ?? row.scopeId} · ${mechanic?.name ?? row.mechanicId}\n\n- 实例 ID：${row.id}\n- 研究范围：${scope?.label ?? row.scopeId}（${row.scopeId}）\n- 状态：${statusLabels[row.status]}（${row.status}）\n- 证据类型：${evidenceLabels[row.evidenceKind]}（${row.evidenceKind}）\n${row.condition ? `- 成立条件：${row.condition}\n` : ""}${row.scopeNote ? `- 范围说明：${row.scopeNote}\n` : ""}- 记录说明：${row.rationale}\n- 来源 ID：${row.sourceIds.join(", ") || "无"}\n`;
        })
        .join("\n")
    : "尚未收录直接实例；没有记录不等于机制不存在。";
}

export function createAgentDocuments() {
  const errors = validateKnowledge();
  if (errors.length)
    throw new Error(`Refusing invalid source knowledge: ${errors.join("; ")}`);
  const files = new Map();
  const registry = [];
  const markdown = (path, title, text) =>
    files.set(
      `${path === "/" ? "" : path.replace(/^\//, "") + "/"}index.md`,
      `# ${title}\n\n正式网页：${canonicalUrl(path)}\n\n作者：${AUTHOR_NAME} · ${SITE_NAME}\n\n${text}\n\n---\n\n${policy.attribution}\n${policy.rights}\n`,
    );
  const json = (path, data) =>
    files.set(path, `${JSON.stringify(data, null, 2)}\n`);
  const addEntity = (collection, kind, row, path, extra = {}) => {
    const file = `data/v1/${collection}/${row.id}.json`;
    const doc = baseDoc(kind, row, path);
    json(file, { ...doc, ...extra });
    registry.push({
      kind,
      id: row.id,
      name: row.name ?? row.id,
      canonicalUrl: doc.canonicalUrl,
      markdownUrl: doc.markdownUrl,
      jsonUrl: `${SITE_URL}/${file}`,
    });
  };
  for (const mechanic of dataset.mechanics) {
    const path = `/mechanics/${mechanic.id}`;
    const observations = dataset.instances.filter(
      (row) => row.mechanicId === mechanic.id,
    );
    const scopes = dataset.scopes.filter((scope) =>
      observations.some((row) => row.scopeId === scope.id),
    );
    const sources = sourceRows([
      ...new Set(observations.flatMap((row) => row.sourceIds)),
    ]);
    const group = taxonomyGroups.find((group) =>
      group.mechanicIds.includes(mechanic.id),
    );
    const illustration = mechanicIllustration(mechanic.id);
    addEntity("mechanics", "mechanic", mechanic, path, {
      taxonomyGroupId: group?.id,
      instances: observations,
      scopes,
      sources,
      illustration,
    });
    markdown(
      path,
      mechanic.name,
      `${policy.editorial}\n\n${mechanic.definition}\n${illustrationMarkdown(illustration, mechanic.name)}${section("纳入条件", mechanic.inclusionRules)}${section("排除边界", mechanic.exclusionRules)}${section("常见误解", mechanic.misconceptions)}${section("设计价值（编辑归纳）", mechanic.designValue)}${section("风险与适配（编辑归纳）", [...mechanic.risks, ...mechanic.adaptation])}${section("实现参考", mechanic.implementationNotes)}${section("游戏实例", instanceMarkdown(observations))}${section("来源", sourceMarkdown(sources))}${section(
        "相关机制",
        mechanic.relatedMechanics.map((id) =>
          link(
            dataset.mechanics.find((row) => row.id === id)?.name ?? id,
            `/mechanics/${id}`,
          ),
        ),
      )}`,
    );
  }
  for (const game of dataset.games) {
    const path = `/games/${game.id}`;
    const scopes = dataset.scopes.filter((scope) => scope.gameId === game.id);
    const observations = dataset.instances.filter((row) =>
      scopes.some((scope) => scope.id === row.scopeId),
    );
    const sources = sourceRows([
      ...new Set([
        ...game.sourceIds,
        ...observations.flatMap((row) => row.sourceIds),
      ]),
    ]);
    addEntity("games", "game", game, path, {
      scopes,
      gameModes: dataset.gameModes.filter((row) => row.gameId === game.id),
      instances: observations,
      sources,
    });
    markdown(
      path,
      game.name,
      `${game.summary}\n\n开发者 / 原作者：${game.studio}\n\n年份：${game.year}；口径：${game.yearBasis}\n${section("来源事实", game.factNotes)}${section("适用范围", game.scopeNotes)}${section("核心循环", game.coreLoop)}${section("设计分析（编辑归纳）", [game.analysis, ...game.learning, ...game.caveats])}${section(
        "研究范围记录",
        scopes.map(
          (scope) =>
            `${scope.label}（${scope.id}，${scope.kind}）${scope.parentScopeId ? `；父范围 ${scope.parentScopeId}` : ""}${scope.versionNote ? `；${scope.versionNote}` : ""}`,
        ),
      )}${section("机制实例", instanceMarkdown(observations))}${section("来源", sourceMarkdown(sources))}`,
    );
  }
  for (const genre of dataset.genres) {
    const path = `/types/${genre.id}`;
    addEntity("types", "compositeType", genre, path);
    const names = (ids) =>
      ids.map((id) =>
        link(
          dataset.mechanics.find((row) => row.id === id)?.name ?? id,
          `/mechanics/${id}`,
        ),
      );
    markdown(
      path,
      genre.name,
      `${policy.editorial}\n\n${genre.definition}\n${section("必要机制（本站讨论口径）", names(genre.requiredMechanics))}${section("常见机制", names(genre.commonMechanics))}${section("可选机制", names(genre.optionalMechanics))}${section("类型边界", genre.boundaries)}${section(
        "已收录的类型参照",
        dataset.games
          .filter((game) => game.genreIds.includes(genre.id))
          .map((game) => link(game.name, `/games/${game.id}`)),
      )}`,
    );
  }
  for (const dimension of dataset.dimensions) {
    const guide = taxonomyDimensions.find(
      (guide) => guide.dimensionId === dimension.id,
    );
    const groups = taxonomyGroups.filter(
      (group) => group.dimensionId === dimension.id,
    );
    const path = `/taxonomy/${dimension.id}`;
    addEntity("dimensions", "dimension", dimension, path, {
      guide,
      groupIds: groups.map((group) => group.id),
    });
    markdown(
      path,
      dimension.name,
      `${guide.explanation}\n${section(guide.question, [guide.use, guide.boundary])}${section(
        "分组",
        groups.map(
          (group) =>
            `${link(group.name, `/taxonomy/${dimension.id}/${group.id}`)}：${group.explanation}`,
        ),
      )}`,
    );
  }
  for (const group of taxonomyGroups) {
    const path = `/taxonomy/${group.dimensionId}/${group.id}`;
    addEntity("groups", "taxonomyGroup", group, path, {
      epistemicStatus: "editorial_navigation",
    });
    const observations = dataset.instances.filter((row) =>
      group.examples.some((example) => example.instanceId === row.id),
    );
    const sources = sourceRows([
      ...new Set(observations.flatMap((row) => row.sourceIds)),
    ]);
    markdown(
      path,
      group.name,
      `${group.explanation}\n${section("作用与边界", [group.function, group.boundary])}${section(
        "本组机制",
        group.mechanicIds.map((id) => {
          const mechanic = dataset.mechanics.find((row) => row.id === id);
          return `${link(mechanic.name, `/mechanics/${id}`)}：${mechanic.definition}`;
        }),
      )}${section("游戏实例", instanceMarkdown(observations))}${section("来源", sourceMarkdown(sources))}`,
    );
  }
  for (const recipe of dataset.recipes) {
    // Recipes use an existing interactive page; no fictitious static detail route.
    const file = `data/v1/recipes/${recipe.id}.json`;
    json(file, {
      ...baseDoc("recipe", recipe, "/lab"),
      epistemicStatus: "editorial_design_hypothesis",
    });
    registry.push({
      kind: "recipe",
      id: recipe.id,
      name: recipe.name,
      canonicalUrl: canonicalUrl("/lab"),
      markdownUrl: `${canonicalUrl("/lab")}index.md`,
      jsonUrl: `${SITE_URL}/${file}`,
    });
  }
  const entityList = (kind) =>
    registry
      .filter((row) => row.kind === kind)
      .map((row) => `[${row.name}](${row.markdownUrl})`);
  for (const [path, metadata] of Object.entries(indexPageMetadata)) {
    const title =
      typeof metadata.title === "object"
        ? metadata.title.absolute.replace(` · ${SITE_NAME}`, "")
        : SITE_NAME;
    let body = `${metadata.description}\n\n${policy.editorial}\n\n${policy.evidence}\n`;
    if (path === "/" || path === "/for-agents")
      body += section("阅读入口", [
        `[版本化 JSON 目录](${SITE_URL}/data/v1/catalog.json)`,
        `[数据结构](${SITE_URL}/data/v1/schema.json)`,
        `[llms.txt](${SITE_URL}/llms.txt)`,
        `[完整公开知识数据](${SITE_URL}/data/v1/knowledge.json)`,
      ]);
    if (path === "/taxonomy" || path === "/")
      body += section("九个维度", entityList("dimension"));
    if (path === "/mechanics")
      body += section("机制目录", entityList("mechanic"));
    if (path === "/games" || path === "/compare")
      body += section("游戏目录", entityList("game"));
    if (path === "/types")
      body += section("类型目录", entityList("compositeType"));
    if (path === "/lab")
      body +=
        section(
          "使用方法",
          "在网页选择机制组合与研究模板，复制提示词后交给 AI 继续研究。页面提供研究材料与提示词，不在站内生成或验证分析结论。",
        ) +
        section(
          "研究模板",
          promptTemplates.map(
            (template) => `${template.name}：${template.description}`,
          ),
        ) +
        section(
          "可参考的配方（待原型验证的编辑假设）",
          dataset.recipes.map(
            (recipe) =>
              `${recipe.name}：${recipe.synergies.join("；")}。验证问题：${recipe.demoQuestions.join("；")}。[结构化记录](${SITE_URL}/data/v1/recipes/${recipe.id}.json)`,
          ),
        );
    if (path === "/graph")
      body += section(
        "机制关系（按证据与条件阅读）",
        dataset.relationships.map(
          (row) =>
            `${row.from} → ${row.to}（${row.type}）：${row.context}；${row.rationale}；证据类型 ${row.evidenceKind}；来源 ID ${row.sourceIds.join(", ") || "无"}`,
        ),
      );
    if (path === "/method")
      body +=
        section(
          "分类层次",
          classificationLevels.map((row) => `${row.name}：${row.explanation}`),
        ) +
        section("研究边界", [
          policy.evidence,
          policy.editorial,
          "父范围记录只沿明确父子关系向下继承；子范围可覆盖，兄弟范围不互相继承。搜索次数、相对指数与历史增长榜分开阅读；收录数量不是市场供给。",
        ]);
    if (path === "/sources")
      body += section("来源目录", sourceMarkdown(dataset.sources));
    if (path === "/copyright")
      body +=
        section(
          "本站原创内容",
          "© 2026 魔魔王。本站原创文案、分类整理、编辑分析、界面设计、品牌 Logo、原创角色与配套插画署名为魔魔王。引用或介绍本站时，请注明“机制研究室 · 魔魔王”并保留原页面链接。",
        ) +
        section("游戏图像与第三方资料", policy.rights) +
        section(
          "转载与联系",
          "需要转载、修改、再分发或商业使用本站原创资产时，请通过 GitHub 项目联系确认。代码许可按实际许可证文件及依赖许可执行。事实、出处、署名或图像使用问题可在 GitHub Issues 提供页面、来源和更正说明。",
        );
    if (path === "/for-agents")
      body += section(
        "自愿支持",
        `${SUPPORT_MESSAGE} [公开仓库](${author.repository})`,
      );
    if (path === "/heat")
      body += section(
        "数据范围",
        `近期资料采集于 ${currentTrends.collectedAt}，覆盖中国台湾、中国香港、日本、美国的近 ${currentTrends.windowHours / 24} 天 Google Trending Now Games 词条。数值为搜索量档位下限，不是精确次数，也不聚合成类别、机制或组合需求。快照：[current-trends.json](${SITE_URL}/data/search-demand/current-trends.json)；统计方法：[Google Trends](${currentTrends.methodologyUrl})。2025 年年度榜保留为历史资料。本知识接口不提供合成搜索量或用户本地导入数据。`,
      );
    markdown(path, title, body);
  }
  json("data/v1/catalog.json", {
    schemaVersion: 1,
    site: canonicalUrl(),
    author,
    interpretation: policy,
    counts: {
      dimensions: dataset.dimensions.length,
      groups: taxonomyGroups.length,
      mechanics: dataset.mechanics.length,
      games: dataset.games.length,
      types: dataset.genres.length,
      recipes: dataset.recipes.length,
      instances: dataset.instances.length,
      sources: dataset.sources.length,
    },
    entities: registry,
  });
  json("data/v1/knowledge.json", {
    schemaVersion: 1,
    site: canonicalUrl(),
    author,
    interpretation: policy,
    ...dataset,
    taxonomyDimensions,
    taxonomyGroups,
    classificationLevels,
    mechanicIllustrations: Object.fromEntries(
      dataset.mechanics.map(({ id }) => [id, mechanicIllustration(id)]),
    ),
  });
  json("data/v1/schema.json", {
    schemaVersion: 1,
    description: "静态导出接口说明；不是 JSON Schema 校验器。",
    author,
    entityKinds: [
      "mechanic",
      "game",
      "compositeType",
      "dimension",
      "taxonomyGroup",
      "recipe",
    ],
    commonFields: {
      schemaVersion: "导出接口版本",
      id: "稳定实体 ID",
      canonicalUrl: "正式网页地址；配方使用实验室索引",
      markdownUrl: "网页的可读静态摘要或正文",
      author: "本站整理者",
      interpretation: "事实、编辑归纳与权利边界",
      illustration:
        "编辑图解；含 diagramKind、三格 frames、对象 objects 和原创插画地址，不是游戏事实证据",
    },
    evidenceFields: {
      scopeId: "研究范围 ID，连接 scopes",
      parentScopeId: "仅沿明确的父子关系继承",
      sourceIds: "连接 sources；每条来源有 url、type、checkedAt、claimScope",
      evidenceKind: evidenceLabels,
      status: statusLabels,
      condition: "conditional 必须保留成立条件",
    },
    interpretation: policy,
    excluded: [
      "开发测试 fixtures",
      "合成搜索需求",
      "浏览器本地导入",
      "账号凭据",
      "第三方原始图片文件",
    ],
  });
  files.set(
    "llms.txt",
    `# ${SITE_NAME}\n\n> ${SITE_DESCRIPTION}\n\n作者：${AUTHOR_NAME}。${policy.editorial}${policy.evidence}\n\n${policy.attribution}\n\n## 阅读入口\n\n- [机器阅读说明](${canonicalUrl("/for-agents")}index.md)：格式、引用与边界\n- [分类总览](${canonicalUrl("/taxonomy")}index.md)：九个维度与分组\n- [机制目录](${canonicalUrl("/mechanics")}index.md)：定义、边界与案例\n- [游戏目录](${canonicalUrl("/games")}index.md)：范围、状态与来源\n- [类型目录](${canonicalUrl("/types")}index.md)：玩法特征与组成\n- [JSON 实体目录](${SITE_URL}/data/v1/catalog.json)：按稳定 ID 获取单项数据\n- [数据结构说明](${SITE_URL}/data/v1/schema.json)：字段与证据含义\n\n## Optional\n\n- [全部公开知识数据](${SITE_URL}/data/v1/knowledge.json)：较大的完整快照\n- [来源目录](${canonicalUrl("/sources")}index.md)：原始链接、核验日期与支持范围\n- [公开仓库](${author.repository})：网站源代码\n`,
  );
  return files;
}

export async function exportAgentData(outputDirectory = DEFAULT_OUTPUT) {
  const root = resolve(outputDirectory);
  const files = createAgentDocuments();
  for (const [name, data] of files) {
    const target = resolve(root, name);
    const within = relative(root, target);
    if (!within || within.startsWith("..") || isAbsolute(within))
      throw new Error(`Invalid export path: ${name}`);
    await mkdir(resolve(target, ".."), { recursive: true });
    await writeFile(target, data, "utf8");
  }
  return { count: files.size, outputDirectory: root };
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const result = await exportAgentData(process.argv[2]);
  console.log(`Exported ${result.count} machine-readable resources.`);
}
