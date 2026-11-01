import { indexPageMetadata } from "@/lib/seo";
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

export const metadata: Metadata = indexPageMetadata["/method"];
export default function MethodPage() {
  return (
    <>
      <div className="breadcrumb">
        <Link href="/">研究室</Link> / 方法说明
      </div>
      <PageHead
        eyebrow="RESEARCH PROTOCOL / 查阅依据"
        title="分类怎样读，数据怎样用？"
        description="了解分类如何组织、游戏记录怎样核对，以及搜索资料能说明什么。"
      />
      <div className="method-page">
        <div className="type-chips">
          <Link className="chip" href="#taxonomy">
            分类层次
          </Link>
          <Link className="chip" href="#evidence">
            机制记录与适用范围
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
                <th>分类层次</th>
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
          <h3>同一机制在不同游戏里仍用同一定义</h3>
          <p>
            “单局重开”说明一次尝试如何结束并重新开始，归入时间与流程；“角色永久死亡”说明死亡后能否恢复原角色，归入成长与延续。“拖放”是输入动作，“空间装备配置”是配置方式，“邻接加成”是结算规则。它们可以同时出现在一款游戏里，仍分别记录。
          </p>
          <h3>类型、配方和检索标签怎样使用</h3>
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
            用于组织研究问题。在实验室选择配方后，可以生成包含机制定义、游戏参照和验证要求的提示词。题材、画风、平台等标签用于检索，不放进九个机制维度；目录也会继续补充。
          </p>
        </section>
        <section id="evidence">
          <h2>核对机制时，先选游戏模式与范围</h2>
          <Window title="FIVE STATES / 五种记录结果">
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
                <strong>存在：</strong>已有资料说明游戏在这个范围内包含该机制。
              </li>
              <li>
                <strong>不存在：</strong>已有明确依据说明这个范围内没有该机制。
              </li>
              <li>
                <strong>不适用：</strong>
                这个范围没有对应的适用对象，记录中会说明原因。
              </li>
              <li>
                <strong>未知：</strong>
                还没有足够资料；没有填写的机制也按未知处理。
              </li>
              <li>
                <strong>条件存在：</strong>
                只在记录所列的角色、阶段或其他情况下出现。
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
            条机制记录。分类参考引用这些记录，保留对应模式、适用条件和来源，不能只凭游戏名认定它包含某项机制。官方介绍、手册、社区资料与设计分析分别标明，并非所有条目都经过游戏内实测。机制定义、分组和类型说明由本站整理。
          </p>
          <p>
            机制页列出已收录的游戏参照。复杂度与实现难点是设计参考，不能直接换算成工期或成功率；实验室只生成研究提示词，不在站内得出分析结论。
          </p>
        </section>
        <section id="heat">
          <h2>搜索资料只展示有来源的数据</h2>
          <p>
            默认展示有来源的真实搜索资料。没有直接搜索数据的类别、机制与组合标为“未取得”或“未采集”，不补造次数、趋势或市场机会。
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
          <h2>导入记录只在当前浏览器中分析</h2>
          <p>
            搜索观察页提供两种独立入口：同组 Google Trends
            相对指数，以及自行取得的搜索次数。整批格式校验通过后才替换当前记录，失败时保留原数据。格式通过不代表来源真实性已经核验。
          </p>
          <p>
            次数记录保留数据集、日期、搜索词、次数、地区、语言与主题归因。次数须为非负安全整数；同一搜索在每个主题种类中的归因权重合计不超过
            1；同一词的历史归因规则须一致。缺失日期不视为零，趋势需要前后等长区间及稳定的采样口径。
          </p>
          <p>
            导入工具只接收实际取得的搜索记录。文件不上传，刷新页面后清除；离开前可导出保存。本站不会自动抓取或定时更新这些记录。
          </p>
        </section>
      </div>
    </>
  );
}
