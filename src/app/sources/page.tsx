import type { Metadata } from "next";
import Link from "next/link";
import { SourceCatalog } from "@/components/ReferenceCatalogs";
import { PageHead } from "@/components/Primitives";
export const metadata: Metadata = { title: "资料来源与资产" };
export default function SourcesPage() {
  return (
    <>
      <div className="breadcrumb">
        <Link href="/">研究室</Link> / 资料来源
      </div>
      <PageHead
        eyebrow="SOURCE REGISTER / 来源与使用边界"
        title="资料来源与使用范围"
        description="这里列出资料来源及其支持的内容。本站的机制解释和设计分析由编辑整理，阅读时请与来源事实区分。"
      />
      <div className="scope-box">
        核验日期记录本站检查资料的时间，后续版本可能变化。商店介绍的内容有限，只能支持其中明确提到的规则和功能。可打开原始来源进一步核对。
      </div>
      <SourceCatalog />
      <div className="method-page">
        <section>
          <h2>原创看板娘与界面资产</h2>
          <p>
            黑发女仆 RIN
            是为本站生成的原创成年角色，采用赛璐璐画法和粗黑轮廓。她有欢迎、讲解、思考、发现线索、提醒冲突和报告完成六种状态，服装与人物身份保持一致。角色状态随页面操作切换，只辅助呈现，不作为分析依据。
          </p>
          <p>
            视觉参考来自官方公开网页，只用于建立画法和年代感；没有把参考作品人物、剧照或官方图像打包进产品。研究室、栏目横幅与配方小场景由内置图像工具为本站生成。游戏条目优先使用官方商店或游戏官网的代表图，每个案例标明图源；保留的原创玩法示意另作标注。图片不作为机制事实的证据，公开可访问也不代表已取得开放使用许可。作品名称与商标属于相应权利人。
          </p>
          <p>
            字体采用系统中文衬线、无衬线与等宽字体，无需外部字体服务。动效支持系统减少动态、手机与低性能设备降级，也可在界面设置中切换。
          </p>
        </section>
        <section>
          <h2>设计样张与实际界面</h2>
          <p>
            网站采用
            Galgame／旧游戏官网的视觉方向，先通过参考板确定画法，再制作角色、场景和六类页面样张，最后实现界面。样张用于表达设计目标，不能作为网站实际运行的截图。提示词、素材清单与运行记录分别保存，便于核对制作过程。
          </p>
          <Link href="/method">查看分类与热度方法 →</Link>
        </section>
      </div>
    </>
  );
}
