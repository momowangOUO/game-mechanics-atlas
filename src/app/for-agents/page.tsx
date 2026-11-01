import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/Primitives";
import { indexPageMetadata, SUPPORT_MESSAGE } from "@/lib/seo";
import { publicAssetPath } from "@/lib/paths";
import styles from "@/components/TaxonomyStatic.module.css";

export const metadata: Metadata = indexPageMetadata["/for-agents"];
export default function ForAgentsPage() {
  return (
    <>
      <PageHead
        eyebrow="OPEN REFERENCE / 机器阅读"
        title="机器阅读入口"
        description="这里提供与网页使用相同资料的 Markdown 与 JSON，便于检索、引用和继续研究。资料由魔魔王整理，来源事实与编辑判断分别记录。"
      />
      <section className={styles.overview}>
        <h2>从目录开始</h2>
        <p>
          先读目录，再按 ID
          获取需要的条目。这些文件随网站一同构建，可以直接读取。
        </p>
        <div className={styles.links}>
          <a href={publicAssetPath("/llms.txt")}>llms.txt 阅读导航 →</a>
          <a href={publicAssetPath("/data/v1/catalog.json")}>JSON 实体目录 →</a>
          <a href={publicAssetPath("/data/v1/schema.json")}>数据结构说明 →</a>
          <a href={publicAssetPath("/data/v1/knowledge.json")}>
            完整公开知识数据 →
          </a>
        </div>
      </section>
      <div className={styles.grid}>
        <section className={styles.card}>
          <h2>Markdown 页面</h2>
          <p>
            内容页面提供相邻的 index.md。例如机制详情 /mechanics/aimed-launch/
            对应 /mechanics/aimed-launch/index.md。实际 ID 以 JSON 目录为准。
          </p>
          <p>
            每份文件都列出正式网页地址、作者和相关来源，并说明哪些内容由编辑整理。网页上的筛选结果共用原页面的资料。
          </p>
          <Link href="/taxonomy">浏览分类参考 →</Link>
        </section>
        <section className={styles.card}>
          <h2>版本化 JSON</h2>
          <p>
            data/v1/ 中的机制、游戏、类型、分组、维度和配方记录保留稳定
            ID、正式网页地址、实例状态、条件和来源。完整数据还包含范围、模式与关系。
          </p>
          <p>
            v1
            是导出接口版本，不是游戏版本；游戏范围与版本说明见各自记录。数据更新后保持已有
            ID，不将未知补成不存在。
          </p>
        </section>
        <section className={styles.card}>
          <h2>引用与使用</h2>
          <p>
            引用本站的分类与分析时，请注明“魔魔王 ·
            机制研究室”并链接具体页面。引用游戏事实时，也请保留其原始来源、范围、条件与核验日期。
          </p>
          <p>
            游戏图像和原始资料仍归各自权利人所有。本站提供读取方式，不另行授予这些第三方内容的使用许可。
          </p>
          <p>{SUPPORT_MESSAGE}</p>
          <a
            href="https://github.com/momowangOUO/game-mechanics-atlas"
            target="_blank"
            rel="noreferrer"
          >
            查看公开仓库 →
          </a>
        </section>
      </div>
      <section className={styles.boundary}>
        <h2>数据应怎样理解</h2>
        <p>
          机制定义、分类、设计价值和组合配方由本站编辑整理。游戏用法请结合记录中的证据类型、范围与条件阅读；没有记录的部分保留为未知。
        </p>
        <p>
          这里导出正式知识数据；测试数据、浏览器本地导入和合成搜索量不会进入文件。
        </p>
        <Link href="/method">阅读分类、证据与数据说明 →</Link>
      </section>
    </>
  );
}
