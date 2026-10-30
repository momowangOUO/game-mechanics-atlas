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
        eyebrow="RESEARCH PROTOCOL / 可以追溯，才值得参考"
        title="先分清概念，再讨论机会。"
        description="这里说明分类边界、证据状态与热度公式。每一项结果都应该能回到具体范围、数据和假设。"
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
          <h2>一个机制，只有一个规范身份。</h2>
          <p>
            每条原子机制由唯一ID和固定主维度标识。游戏只是引用它，并补充状态、成立条件与作用范围；不会因为某个游戏特别成功，就把机制挪到另一层。与其他机制的依赖、协同、替代、冲突、资源供给、规则改写和双向反馈单独建模。
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
            题材、叙事、画风、平台、世界观属于独立元数据，不进入机制九维。适用核心玩法标签是检索辅助，传统类型是复合集合；二者都不是机制身份。
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
          <h2>未知、不适用和不存在，分别记录。</h2>
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
            范围可覆盖整个游戏、模式、系统、章节、角色或职业、特定版本。只有明确的父子范围可以继承；更具体的观察覆盖父范围，兄弟模式互不继承。Minecraft创造模式的基础材料约束，不能复制为生存模式结论；Inscryption开篇的卡牌观察，也不能被悄悄扩展到所有章节。
          </p>
          <h3>事实和分析分开阅读</h3>
          <p>
            来源中的描述标为官方事实；机制定义、核心循环与设计价值是本站编辑归纳；未核验事项保留限制说明。当前有{" "}
            {games.length} 款游戏、{mechanics.length} 条原子机制、
            {genres.length} 个复合类型、{recipes.length} 组配方、
            {instances.length} 条稀疏实例与 {relationships.length}{" "}
            条编辑关系。稀疏记录优先保证可追溯性，不把一张未填写的矩阵包装成完整拆解。
          </p>
          <p>
            复杂度与实现难点是定性判断，没有虚构工时或精确难度分数。实验室输出是规则驱动的设计假设，需要通过Demo验证。
          </p>
        </section>
        <section id="heat">
          <h2>热度看搜索，竞争看供给。</h2>
          <SeedBadge />
          <p>
            初版演示数据全部为本地合成。它演示系统的计算能力，不代表真实玩家规模或当前行业趋势。搜索次数是事件数量，不是独立人数；游戏名称的搜索可作代理信号，但不能证明玩家在寻找其中的某一机制。
          </p>
          <h3>先保留原始需求总量</h3>
          <p>
            主题需求 D
            是归因后的搜索次数。直接搜索某种机制，与通过游戏名推断偏好，分别保留为直接／代理归因。同一事件可在游戏、类型、机制、组合各维度内最多贡献一份权重，全站原始总量只计一次。
          </p>
          <div className="paper">
            <h2>1000万，仍然大于10组各1万。</h2>
            <p>
              示例中MOBA方向近30日归因搜索为1000万次，虚构恐怖方向的10组搜索各1万次，合计10万次。前者原始需求是后者100倍。子类更多或收录游戏更多，都不会改变这个结果。
            </p>
          </div>
          <h3>供给是样本下界</h3>
          <p>
            S
            是本站收录且确认符合条件的不同游戏数。组合要求全部机制在同一兼容范围共存，不能把不同模式或角色的观察拼在一起。条件匹配与未知样本单列；S=0
            表示尚无确认样本，不直接给最高蓝海分。
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
            比较组限定相同时间、来源、地区和主题种类。类别、机制、组合分别建立基准，榜单文字筛选不改变基准。热门排行始终按原始搜索次数；两个线索分各有含义，不是成功率，也不是加起来等于100%的互补概率。
          </p>
          <ul>
            <li>Dmax=0 或主题完全未记录：不产生可用分数。</li>
            <li>D=0 且确有记录：属于实测零需求，不进入蓝海推荐。</li>
            <li>S=0：需求仍可见，机会分保留为空，等待补样本。</li>
            <li>少量样本即使得分较高，仍显示样本有限与未知数量。</li>
          </ul>
          <h3>趋势必须同口径可比</h3>
          <p>
            比较当前与前一等长区间，趋势=(当前−上期)/上期。需要相同数据集、来源、地区、语言与稳定的搜索词归因规则，并且两期每日记录完整。缺少上一期或日期时保留“暂无可比数据”；上期为0、本期大于0时标记“新出现”，不显示无穷百分比。折线保留缺失日期断点。
          </p>
        </section>
        <section id="import">
          <h2>从合成示例，换成自己的记录。</h2>
          <p>
            热度页支持JSON整批校验、替换与导出，文件只在当前浏览器分析，不上传服务端。导入错误保留原有数据。当前版本不把导入内容存到磁盘或跨刷新保存；需要继续研究时先导出。
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
            日期必须真实，次数是非负安全整数，主题ID已注册，记录ID唯一，同一种主题的归因权重合计不超过1。合成记录的{" "}
            <code>sourceKind:synthetic</code>{" "}
            标记保留；同一数据集不能混合来源，同一个归一化搜索词不能中途改归因规则。更换口径应使用新的数据集并分别研究。
          </p>
          <p>
            可从<Link href="/heat">热度观察</Link>
            导出完整示例结构。未来接入真实日志、API或第三方分析时，只需提供相同的数据适配层；本版没有自动抓取、自动研究或定时更新系统。
          </p>
        </section>
      </div>
    </>
  );
}
