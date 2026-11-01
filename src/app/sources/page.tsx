import { indexPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { SourceCatalog } from "@/components/ReferenceCatalogs";
import { PageHead } from "@/components/Primitives";
export const metadata: Metadata = indexPageMetadata["/sources"];
export default function SourcesPage() {
  return (
    <>
      <div className="breadcrumb">
        <Link href="/">研究室</Link> / 资料来源
      </div>
      <PageHead
        eyebrow="SOURCE REGISTER / 资料来源"
        title="资料来源与使用范围"
        description="查看游戏规则的原始资料、采集时间和适用版本。机制分类与设计分析由本站编辑整理。"
      />
      <div className="scope-box">
        “核验日期”是本站检查资料的时间，游戏后续版本可能有变化。商店介绍只用于核对其中明确提到的规则和功能，细节仍需打开原始资料查看。
      </div>
      <SourceCatalog />
      <div className="method-page">
        <section>
          <h2>角色与插画</h2>
          <p>
            看板娘 RIN
            采用粗描边与赛璐璐画法，负责页面引导和漫画讲解。漫画中的冒险者、棋子和道具分别演示角色操作、规则与资源变化；看板娘负责旁白。
          </p>
          <p>
            122
            项机制各有独立图标和三格漫画，由图像模型生成；文字、箭头与规则示意图由网页绘制。漫画使用原创场景帮助理解机制，具体游戏的规则和适用条件请查看下方范例与来源。
          </p>
          <p>
            游戏封面优先采用官方商店或游戏官网的代表图，图源列在各游戏页面。游戏名称、商标和第三方图片归各自权利人，本站原创内容与生成素材的使用说明见
            <Link href="/copyright">版权与署名</Link>。
          </p>
          <p>
            字体采用系统中文衬线、无衬线与等宽字体，无需外部字体服务。动效支持系统减少动态、手机与低性能设备降级，也可在界面设置中切换。
          </p>
        </section>
        <section>
          <h2>设计样张与实际界面</h2>
          <p>
            网站参考 Galgame
            与旧游戏官网的页面风格。制作前先用样张确定角色、场景和布局，制作记录中分别保存设计样张与实际运行截图。
          </p>
          <Link href="/method">查看分类与热度方法 →</Link>
        </section>
      </div>
    </>
  );
}
