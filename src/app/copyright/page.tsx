import { indexPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/Primitives";
import { AuthorSection } from "@/components/Author";
import styles from "@/components/Brand.module.css";

export const metadata: Metadata = indexPageMetadata["/copyright"];

export default function CopyrightPage() {
  return (
    <>
      <div className="breadcrumb">
        <Link href="/">研究室</Link> / 版权与署名
      </div>
      <PageHead
        eyebrow="COPYRIGHT / 版权与署名"
        title="版权与署名"
        description="由魔魔王架设。本站原创内容与引用的游戏资料分别说明归属。"
      />
      <div className={styles.copyright}>
        <section>
          <h2>本站原创内容</h2>
          <p>
            © 2026 魔魔王。本站原创文案、分类整理、编辑分析、界面设计、品牌
            Logo、原创角色与配套插画的署名为魔魔王。引用或介绍本站时，请注明“机制研究室
            · 魔魔王”并保留原页面链接。
          </p>
          <p>
            转载本站原创内容，或使用 Logo、角色和插画，请先通过 GitHub Issues
            联系魔魔王，确认用途与署名方式。本站未另行授予源码开源许可，各依赖保留原有许可。
          </p>
        </section>
        <section>
          <h2>生成插画</h2>
          <p>
            看板娘、机制图标和教学漫画使用图像模型制作，由本站选用、整理并配文。分镜用于讲解游戏规则，具体游戏的代表图及图源另列。
          </p>
        </section>
        <section>
          <h2>游戏图像与第三方资料</h2>
          <p>
            游戏名称、商标、官方代表图、截图及引用资料的权利属于各自权利人。本站为介绍和分析游戏机制而引用，来源见游戏详情与
            <Link href="/sources">来源与素材页</Link>
            。这些内容不属于本站原创资产，也不因收录而获得新的授权。
          </p>
        </section>
        <section>
          <h2>来源、更正与联系</h2>
          <p>
            发现事实、出处、署名或图像使用方面的问题，可在{" "}
            <a
              href="https://github.com/momowangOUO/game-mechanics-atlas/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub Issues
            </a>{" "}
            提供页面地址、相关来源和更正说明。本站会依据具体情况核对并处理。
          </p>
        </section>
      </div>
      <AuthorSection />
    </>
  );
}
