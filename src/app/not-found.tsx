import Link from "next/link";
import { Assistant, PageHead } from "@/components/Primitives";
import { rinDialogue } from "@/data/rin-dialogue";
export default function NotFound() {
  return (
    <>
      <div className="breadcrumb">研究室 / 未收录的档案</div>
      <PageHead
        eyebrow="ARCHIVE / 404"
        title="没有找到这份档案"
        description="地址可能已经变更，或这项内容尚未收录。可以返回索引继续检索。"
      />
      <div className="not-found-layout">
        <Assistant message={rinDialogue.missing} state="think" />
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
