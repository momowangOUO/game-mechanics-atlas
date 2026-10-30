import type { Metadata } from "next";
import Link from "next/link";
import { sources } from "@/lib/knowledge";
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
        title="让每份观察有出处。"
        description="官方资料支持事实，编辑分析解释设计。页面没有把分析判断写成官方结论，也没有为未核验的内容补造引用。"
      />
      <div className="scope-box">
        资料核验日期是本次检查时间，不代表后续版本永久不变。商店介绍的覆盖有限，实例只引用其实际支持的主张。打开外部链接可进一步核对。
      </div>
      <div className="source-catalog">
        {sources.map((source) => (
          <article key={source.id} id={source.id}>
            <span className="eyebrow">
              {source.type === "official_store"
                ? "OFFICIAL STORE"
                : source.type === "official_site"
                  ? "OFFICIAL SITE"
                  : "EDITORIAL"}
            </span>
            <h2>{source.title}</h2>
            <p>
              {source.publisher} · 核验 {source.checkedAt}
            </p>
            <p>{source.claimScope}</p>
            <a href={source.url} target="_blank" rel="noreferrer">
              阅读原始来源 ↗
            </a>
          </article>
        ))}
      </div>
      <div className="method-page">
        <section>
          <h2>原创看板娘与界面资产</h2>
          <p>
            黑发女仆是为本站生成的原创成年角色，采用用户选定的清晰赛璐璐方向与后续加粗轮廓修订。角色持纸质档案夹和铅笔，以暖白、深墨与淡紫构成视觉识别。首页、提示、空状态和实验室使用同一正式资产。
          </p>
          <p>
            视觉参考来自官方公开网页，只用于建立画法和年代感；没有把参考作品人物、剧照或官方图像打包进产品。游戏卡片使用本站原创抽象图形与排字，并标注“非官方封面”。作品名称与商标属于相应权利人。
          </p>
          <p>
            字体采用系统中文衬线、无衬线与等宽字体，无需外部字体服务。动效支持系统减少动态、手机与低性能设备降级，也可在界面设置中切换。
          </p>
        </section>
        <section>
          <h2>可核对的设计过程</h2>
          <p>
            制作顺序为真实参考板、用户选定人物画法、粗线角色修订、六类高保真网页样张、正式界面实现。样张、角色提示词和视觉规范与代码一起保存在项目中，便于持续对照。
          </p>
          <Link href="/method">查看分类与热度方法 →</Link>
        </section>
      </div>
    </>
  );
}
