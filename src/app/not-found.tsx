import Link from "next/link";
import { Assistant, PageHead } from "@/components/Primitives";
export default function NotFound() {
  return (
    <>
      <div className="breadcrumb">研究室 / 未收录的档案</div>
      <PageHead
        eyebrow="ARCHIVE / 404"
        title="这份档案还不在书架上。"
        description="地址可能已经变更，或这项内容尚未收录。可以返回索引继续检索。"
      />
      <div className="not-found-layout">
        <Assistant message="先回到索引吧。未知是资料的状态，不是可以随便补上的答案。" />
        <div>
          <Link className="button primary" href="/mechanics">
            浏览机制档案 →
          </Link>{" "}
          <Link className="button" href="/">
            回研究室首页
          </Link>
        </div>
      </div>
    </>
  );
}
