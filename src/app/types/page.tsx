import Link from "next/link";
import type { Metadata } from "next";
import { PageHead } from "@/components/Primitives";
import { TypeCatalog } from "@/components/ReferenceCatalogs";
export const metadata: Metadata = { title: "复合类型与类型配方" };
export default function TypesPage() {
  return (
    <>
      <div className="breadcrumb">
        <Link href="/">研究室</Link> / 复合类型
      </div>
      <PageHead
        eyebrow="COMPOSITE GENRES / 独立于原子机制"
        title="复合类型与机制组成"
        description="Roguelite、RPG、MOBA 等类型通常涉及多种机制。这里列出本库采用的必要、常见和可选组成，以及分类边界，供研究和检索参考。"
      />
      <TypeCatalog />
    </>
  );
}
