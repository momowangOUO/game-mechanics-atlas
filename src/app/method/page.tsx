import type { Metadata } from "next";
import Link from "next/link";
import {
  dimensions,
  mechanics,
  games,
  genres,
  recipes,
  instances,
  relationships,
} from "@/lib/knowledge";
import { FORMULA_VERSION } from "@/lib/heat";
import {
  PageHead,
  SeedBadge,
  StateBadge,
  Window,
} from "@/components/Primitives";

export const metadata: Metadata = { title: "分类与分析方法" };
export default function MethodPage() {
  return (
    <>
      <div className="breadcrumb">
        <Link href="/">研究室</Link> / 方法说明
      </div>
      <PageHead
        eyebrow="RESEARCH PROTOCOL / 分类与分析依据"
        title="机制分类、证据与热度计算"
        description="查看机制如何分类、实例如何判定，以及搜索需求和样本供给如何计算。阅读结果时，请一并核对适用范围、数据来源和设计假设。"
      />
      <div className="method-page">
        <div className="type-chips">
          <Link href="#taxonomy" className="chip">
            固定九维
          </Link>
          <Link href="#evidence" className="chip">
            状态与范围
          </Link>
          <Link href="#heat" className="chip">
            需求与供给
          </Link>
          <Link href="#import" className="chip">
            导入数据
          </Link>
          <Link href="/sources" className="chip">
            来源目录 ↗
          </Link>
        </div>
        <section id="taxonomy">
          <h2>每个机制使用唯一标识和固定主维度</h2>
          <p>
            每条原子机制都有唯一 ID，归属一个固定主维度。游戏案例引用这条机制，再补充状态、成立条件与作用范围。同一机制不会因案例不同而改变主分类。机制之间的依赖、协同、替代、冲突、资源供给、规则改写和双向反馈，作为关系单独记录。
          </p>
          <table className="dimension-table">
            <thead>
              <tr>
                <th>维度</th>
                <th>判断问题</th>
                <th>收录</th>
              </tr>
            </thead>
            <tbody>
              {dimensions.map((d) => (
                <tr key={d.id}>
                  <td>
                    <Link href={`/mechanics?dimension=${d.id}`}>{d.name}</Link>
                    <br />
                    <code>{d.id}</code>
                  </td>
                  <td>{d.description}</td>
                  <td>
                    {mechanics.filter((m) => m.dimension === d.id).length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3>用边界规则消除歧义</h3>
          <p>
            “局次重置”描述尝试如何组织，属于时间与流程；“永久死亡”描述状态的保留与丢失，属于成长与延续。“规则修饰器”属于规则与结算，“配方制作”属于资源转换。它们常常相互作用，关联紧密也不改变分类身份。
          </p>
          <p>
            题材、叙事、画风、平台和世界观作为独立元数据记录，不纳入机制九维。核心玩法标签辅助检索，传统类型汇集多种机制；两者都不作为原子机制的标识。
          </p>
          <h3>复合类型保留独立入口</h3>
          <p>
            Roguelite、Roguelike、RPG、MOBA、Soulslike、Extraction
            Shooter、Survival Craft、Immersive Sim 等通过
            <Link href="/types">类型配方</Link>
            表达必要、常见、可选特征与争议边界。缺少公认必要条件时可以留空，不会因此自动匹配所有游戏。编辑配方中的案例仅是设计参照，不能代替同范围机制证据。
          </p>
        </section>
        <section id="evidence">
          <h2>五种状态分别记录，结论限定适用范围</h2>
          <Window title="FIVE STATES / 五种实例状态">
            <div className="state-legend">
              {(
                [
                  "present",
                  "absent",
                  "not_applicable",
                  "unknown",
                  "conditional",
                ] as const
              ).map((s) => (
                <StateBadge key={s} status={s} />
              ))}
            </div>
            <ul>
              <li>
                <strong>存在：</strong>已有证据说明机制在所选范围中成立。
              </li>
              <li>
                <strong>不存在：</strong>有明确否定证据，只约束所记录的范围。
              </li>
              <li>
                <strong>不适用：</strong>当前范围没有适用对象，需要说明理由。
              </li>
              <li>
                <strong>未知：</strong>尚未核验。未填写的实例也按未知查询。
              </li>
              <li>
                <strong>条件存在：</strong>
                必须写明角色、条件、阶段或其他成立约束。
              </li>
            </ul>
          </Window>
          <p>
            范围可以是整个游戏、模式、系统、章节、角色或职业，也可以是特定版本。父范围的观察只沿明确的父子关系向下继承；子范围有更具体的观察时，以子范围为准，兄弟模式互不继承。Minecraft 创造模式的基础材料结论不能用于生存模式，Inscryption 开篇的卡牌观察也不能扩展到所有章节。
          </p>
          <h3>事实和分析分开阅读</h3>
          <p>
            官方资料明确支持的描述作为来源事实记录；机制定义、核心循环与设计价值由本站编辑归纳，未核验事项另作说明。当前有{" "}
            {games.length} 款游戏、{mechanics.length} 条原子机制、
            {genres.length} 个复合类型、{recipes.length} 组配方、
            {instances.length} 条稀疏实例与 {relationships.length}{" "}
            条编辑关系。实例按已核验的内容逐条收录，没有记录的游戏与机制组合仍按未知处理。
          </p>
          <p>
            复杂度与实现难点是定性判断，不代表工期或精确难度分数。实验室根据已收录的定义和规则生成设计假设，仍需通过原型验证。
          </p>
        </section>
        <section id="heat">
          <h2>分别观察搜索需求与样本供给</h2>
          <SeedBadge />
          <p>
            默认演示数据全部在本地合成，用于演示计算与排序，不代表真实玩家规模或当前行业趋势。搜索次数统计搜索事件，不是独立人数；游戏名称搜索可作代理信号，但不能证明玩家在寻找其中的某一机制。
          </p>
          <h3>先保留原始需求总量</h3>
          <p>
            主题需求 D
            是归因后的搜索次数。明确指向主题的搜索记为直接归因，借游戏名等信号推断主题需求的搜索记为代理归因，两者分别保留。同一次搜索可分别归入游戏、类型、机制和组合；在每个主题种类内，归因权重合计不超过 1，全站原始搜索总量只计一次。
          </p>
          <div className="paper">
            <h2>1000万次与10组各1万次，按总量比较</h2>
            <p>
              示例中MOBA方向近30日归因搜索为1000万次，虚构恐怖方向的10组搜索各1万次，合计10万次。前者原始需求是后者100倍。子类更多或收录游戏更多，都不会改变这个结果。
            </p>
          </div>
          <h3>供给只统计已收录样本</h3>
          <p>
            S
            是本站收录样本中符合统计条件的不同游戏数。类型按编辑标签统计；机制和组合按已确认存在的实例统计。组合要求全部机制在同一兼容范围共存，不能把不同模式或角色的观察拼在一起。条件匹配与未知样本单列；S=0
            表示尚无确认样本，不能据此认定市场空白，也不会直接给出最高蓝海分。
          </p>
          <h3>平滑后的研究线索</h3>
          <pre>
            <code>{`Dmax = 同一比较组内的最大搜索次数
k = 2
d = √(D / Dmax)
c = S / (S + k)

需求指数 = 100 × d
蓝海线索分 = 100 × d × (1 − c)
红海线索分 = 100 × c × (1 − 0.5d)
公式版本：${FORMULA_VERSION}`}</code>
          </pre>
          <p>
            比较组限定相同时间、来源集合、地区和主题种类。类型、机制、组合和游戏分别建立基准，榜单文字筛选不改变基准。热门排行按归因搜索次数排序；两个线索分供研究参考，不是成功率，也不是合计为100%的互补概率。
          </p>
          <ul>
            <li>Dmax=0 或主题完全未记录：不产生可用分数。</li>
            <li>D=0 且确有记录：已记录日期的归因搜索量为零，不进入蓝海推荐；未记录日期仍视为缺失。</li>
            <li>S=0：搜索需求仍可查看，蓝海与红海线索分保留为空，等待补充样本。</li>
            <li>少量样本即使得分较高，仍显示样本有限与未知数量。</li>
          </ul>
          <h3>趋势必须同口径可比</h3>
          <p>
            比较当前与前一等长区间，趋势=(当前−上期)/上期。需要相同数据集、来源、地区、语言与稳定的搜索词归因规则，并且两期每日记录完整。缺少上一期或日期时保留“暂无可比数据”；上期为0、本期大于0时标记“新出现”，不显示无穷百分比。折线保留缺失日期断点。
          </p>
        </section>
        <section id="import">
          <h2>导入自己的搜索记录</h2>
          <p>
            热度页支持 JSON 整批校验、替换与导出，文件只在当前浏览器中分析，不上传服务端。整批校验通过后才替换现有数据；导入失败时保留原数据。导入内容不会自动保存，刷新后需要重新导入；离开前可先导出，方便后续继续分析。
          </p>
          <pre>
            <code>
              {JSON.stringify(
                {
                  schemaVersion: 1,
                  records: [
                    {
                      id: "demo-2026-10-30",
                      datasetId: "my-research",
                      date: "2026-10-30",
                      query: "MOBA",
                      count: 100,
                      region: "CN",
                      language: "zh-CN",
                      sourceKind: "import",
                      attributions: [
                        { topicId: "genre:moba", weight: 1, mode: "direct" },
                      ],
                    },
                  ],
                },
                null,
                2,
              )}
            </code>
          </pre>
          <p>
            日期必须是有效日历日期，次数必须是非负安全整数，主题 ID 必须已注册，记录 ID 必须唯一。每条记录在同一主题种类内的归因权重合计不超过 1。合成记录的{" "}
            <code>sourceKind:synthetic</code>{" "}
            标记必须保留，同一数据集不能混合来源类别。在同一数据集、来源、地区和语言下，同一个归一化搜索词必须沿用一致的归因规则。更换规则时，应统一重算历史记录，或使用独立数据集保存不同口径，分别分析。
          </p>
          <p>
            可从<Link href="/heat">热度观察</Link>
            导出完整示例结构。真实日志、API 或第三方分析数据须先转换为该结构再导入；本版不包含自动抓取、自动研究或定时更新功能。
          </p>
        </section>
      </div>
    </>
  );
}
