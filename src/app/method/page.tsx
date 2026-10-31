import type { Metadata } from "next";
import Link from "next/link";
import {
  dimensions,
  mechanics,
  games,
  genres,
  recipes,
  instances,
} from "@/lib/knowledge";
import {
  classificationLevels,
  taxonomyGroups,
} from "@/data/taxonomy-reference";
import { annualSearchSnapshot } from "@/lib/search-demand";
import { PageHead, StateBadge, Window } from "@/components/Primitives";

export const metadata: Metadata = { title: "分类、证据与搜索数据" };
export default function MethodPage() {
  return (
    <>
      <div className="breadcrumb">
        <Link href="/">研究室</Link> / 方法说明
      </div>
      <PageHead
        eyebrow="RESEARCH PROTOCOL / 查阅依据"
        title="分类怎样读，数据怎样用？"
        description="先分清分类的不同层次，再查看游戏中的范围和证据。搜索资料分别保留原始的时间、地区与指标，不用游戏收录数量代替玩家需求。"
      />
      <div className="method-page">
        <div className="type-chips">
          <Link className="chip" href="#taxonomy">
            分类层次
          </Link>
          <Link className="chip" href="#evidence">
            状态与范围
          </Link>
          <Link className="chip" href="#heat">
            真实搜索资料
          </Link>
          <Link className="chip" href="#import">
            本地导入
          </Link>
          <Link className="chip" href="/sources">
            来源目录 ↗
          </Link>
        </div>
        <section id="taxonomy">
          <h2>从维度逐层查到具体游戏</h2>
          <p>
            分类参考按“维度 → 分组 → 原子机制 →
            游戏实例”组织浏览。九个维度回答不同问题，并不是由低到高的价值排序。分组用于把同一维度里的相关机制放在一起查阅；它不会替换原子机制的定义，也不会因某款游戏的用法而改变机制身份。
          </p>
          <p>
            当前整理 {dimensions.length} 个维度、{taxonomyGroups.length}{" "}
            个分组和 {mechanics.length}{" "}
            个原子机制。分组完整覆盖已收录机制；每一层都能查看作用、边界及游戏用法。
            <Link className="cyan" href="/taxonomy">
              打开分类参考 →
            </Link>
          </p>
          <table className="dimension-table">
            <thead>
              <tr>
                <th>层次或实体</th>
                <th>回答的问题</th>
                <th>如何理解</th>
              </tr>
            </thead>
            <tbody>
              {classificationLevels.map((level) => (
                <tr key={level.id}>
                  <td>{level.name}</td>
                  <td>{level.question}</td>
                  <td>
                    {level.explanation}
                    <br />
                    例：{level.example}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3>九个维度分别负责什么？</h3>
          <table className="dimension-table">
            <thead>
              <tr>
                <th>维度</th>
                <th>观察问题</th>
                <th>类别与机制</th>
              </tr>
            </thead>
            <tbody>
              {dimensions.map((dimension) => (
                <tr key={dimension.id}>
                  <td>
                    <Link href={`/taxonomy?dimension=${dimension.id}`}>
                      {dimension.name} →
                    </Link>
                  </td>
                  <td>{dimension.description}</td>
                  <td>
                    {
                      taxonomyGroups.filter(
                        (group) => group.dimensionId === dimension.id,
                      ).length
                    }{" "}
                    个分组 /{" "}
                    {
                      mechanics.filter(
                        (mechanic) => mechanic.dimension === dimension.id,
                      ).length
                    }{" "}
                    个机制
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3>分类身份不随案例漂移</h3>
          <p>
            “局次重置”描述尝试如何组织，归时间与流程；“永久死亡”描述状态怎样丢失，归成长与延续。“拖放”是输入动作，“空间装备配置”是能力配置，“邻接加成”是结算规则。它们可以共同出现在一款游戏里，关联紧密也不需要合并或改变分类。
          </p>
          <h3>复合类型、配方与元数据各有用途</h3>
          <p>
            <Link className="cyan" href="/types">
              {genres.length} 个复合类型
            </Link>
            汇集多种机制，例如
            Roguelite、RPG、MOBA、撤离射击。类型页解释玩家主要在做什么、与相近类型的差别及典型参照。它们可以重叠，不能当作原子机制树的上一级，也不能从类型标签反向补全游戏实例。
          </p>
          <p>
            <Link className="cyan" href="/lab">
              {recipes.length} 组组合配方
            </Link>
            用于提出设计假设，说明机制分工、潜在协同与风险。题材、画风、叙事、平台和世界观作为元数据辅助检索，不混入机制九维。所有目录均可扩展，当前收录并不代表游戏设计只有这些可能。
          </p>
        </section>
        <section id="evidence">
          <h2>看典型游戏时，一并看范围与状态</h2>
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
              ).map((status) => (
                <StateBadge key={status} status={status} />
              ))}
            </div>
            <ul>
              <li>
                <strong>存在：</strong>已有记录说明机制在所选范围成立。
              </li>
              <li>
                <strong>不存在：</strong>有明确否定依据，只约束当前范围。
              </li>
              <li>
                <strong>不适用：</strong>当前范围没有适用对象，需要说明理由。
              </li>
              <li>
                <strong>未知：</strong>尚未核验；未填写的实例也按未知查询。
              </li>
              <li>
                <strong>条件存在：</strong>
                需要满足记录中的角色、阶段或其他条件。
              </li>
            </ul>
          </Window>
          <p>
            范围包括整个游戏、模式、系统、章节、角色和版本。父范围记录只沿明确的父子关系向下继承；更具体的子范围可以覆盖，兄弟模式互不继承。Minecraft
            创造模式的资源结论不能用于生存模式，某个角色的能力也不能扩展为所有角色共同拥有。
          </p>
          <h3>事实、规则归纳与设计判断分开</h3>
          <p>
            当前 {games.length} 款游戏有 {instances.length}{" "}
            条机制实例。分类参考中的游戏说明引用这些实例，保留原范围、状态和来源；游戏名不是自动判类的证据。官方介绍、手册、社区资料与编辑分析分别标识，本轮没有安装全部游戏实测。机制定义、分组、设计价值和类型阅读指引是本站编辑归纳。
          </p>
          <p>
            部分机制尚未收录可核验的游戏实例，页面会明确说明。复杂度、实现难点和实验室输出是定性分析，不是精确工期、成功率或已验证的协同效果。
          </p>
        </section>
        <section id="heat">
          <h2>热门结果必须有真实来源</h2>
          <p>
            网站已撤下默认合成热门榜。没有真实搜索记录的类别、机制与组合保留“未取得”或“未采集”，不补造次数、趋势或市场机会。
          </p>
          <h3>已取得：Google 官方年度搜索趋势</h3>
          <p>
            当前公开展示的是 Google Year in Search {annualSearchSnapshot.year}{" "}
            全球 Games 榜，共 {annualSearchSnapshot.entries.length} 条。统计区间{" "}
            {annualSearchSnapshot.dateStart} 至 {annualSearchSnapshot.dateEnd}
            ，与上一年同期比较。榜单反映当年的搜索增长趋势，原文没有公布各词的次数和增长百分比；不能把它改写成“搜索最多的游戏”，也不能当作当前类别的需求排名。
          </p>
          <p>
            <a
              className="cyan"
              href={annualSearchSnapshot.sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              官方榜单 ↗
            </a>{" "}
            ·{" "}
            <a
              className="cyan"
              href={annualSearchSnapshot.methodologyUrl}
              target="_blank"
              rel="noreferrer"
            >
              官方统计方法 ↗
            </a>{" "}
            ·{" "}
            <Link className="cyan" href="/heat">
              查看本站保留的来源与采集时间 →
            </Link>
          </p>
          <h3>相对指数与搜索次数分别计算</h3>
          <p>
            Google Trends 的相对搜索兴趣按请求范围归一到 0–100。不同请求中的 100
            不代表同样的搜索总量；0
            也可能表示数据过少。本站仅接受同组搜索词、时间、地区和搜索类型一致的指数结构，在日期完整时比较组内均值，不把指数相加成搜索次数。
          </p>
          <p>
            搜索次数只统计有来源的搜索事件，不代表独立玩家人数、购买意愿或销量。游戏名称搜索可能涉及攻略、新闻或故障，不能直接证明用户想玩其中某个机制。本站当前没有可展示的真实类别总搜索量。
          </p>
          <h3>收录样本不等于市场供给</h3>
          <p>
            已收录游戏数只说明本站能展示多少参照，不能当作全市场竞品数。机制组合还需要在同一兼容范围内共同成立，不能拼接不同模式和角色。样本为零表示本库暂未确认，不表示市场空白。
          </p>
          <p>
            年度名次与相对指数缺少可用的绝对需求，当前游戏样本也不覆盖市场，因此网站暂停给出蓝海、红海分与机会排名。导入真实站内搜索次数仍然不足以补齐市场供给；站内结果仅反映该站用户。取得可比的需求与供给范围后，才能另外建立并验证市场分析模型。
          </p>
        </section>
        <section id="import">
          <h2>本地分析保留来源边界</h2>
          <p>
            搜索观察页提供两种独立入口：同组 Google Trends
            相对指数，以及自行取得的搜索次数。整批格式校验通过后才替换当前记录，失败时保留原数据。格式通过不代表来源真实性已经核验。
          </p>
          <p>
            次数记录保留数据集、日期、搜索词、次数、地区、语言与主题归因。次数须为非负安全整数；同一搜索在每个主题种类中的归因权重合计不超过
            1；同一词的历史归因规则须一致。缺失日期不视为零，趋势需要前后等长区间及稳定的采样口径。
          </p>
          <p>
            正式工具拒绝合成搜索记录。开发测试中的数值只用于验证计算，不进入热门结果。导入文件仅在浏览器会话中使用，不上传服务端；刷新后清除，离开前可导出。当前没有自动研究、定时更新或后台抓取服务。
          </p>
        </section>
      </div>
    </>
  );
}
