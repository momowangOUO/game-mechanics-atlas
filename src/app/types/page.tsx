import { indexPageMetadata } from "@/lib/seo";
import Link from "next/link";
import type { Metadata } from "next";
import { PageHead } from "@/components/Primitives";
import { TypeCatalog } from "@/components/ReferenceCatalogs";
export const metadata: Metadata = indexPageMetadata["/types"];
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
      <p className="catalog-note">
        这些复合类型可以彼此重叠，不是九个机制维度的上下级。想从行动、规则、构筑或资源逐层查找，请打开{" "}
        <Link className="cyan" href="/taxonomy">
          分类参考 →
        </Link>
        。每个类型页说明玩家在做什么、与相近类型的差别，以及可以具体观察的游戏规则。
      </p>
      <TypeCatalog />
    </>
  );
}
