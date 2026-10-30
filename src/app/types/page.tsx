import Link from "next/link";
import type { Metadata } from "next";
import { PageHead } from "@/components/Primitives";
import { genres } from "@/lib/knowledge";
export const metadata: Metadata = { title: "复合类型与类型配方" };
export default function TypesPage() {
  return (
    <>
      <div className="breadcrumb">
        <Link href="/">研究室</Link> / 复合类型
      </div>
      <PageHead
        eyebrow="COMPOSITE GENRES / 独立于原子机制"
        title="一个类型，通常是一组规则。"
        description="Roguelite、RPG、MOBA等名称用于指向传统画像与机制集合。它们没有被当成普通原子标签，也不由简单计分自动判定真伪。"
      />
      <div className="type-index-grid">
        {genres.map((genre, i) => (
          <Link
            className="mechanic-card interactive-card"
            key={genre.id}
            href={`/types/${genre.id}`}
          >
            <span className="eyebrow">
              TYPE / {String(i + 1).padStart(2, "0")}
            </span>
            <h2>{genre.name}</h2>
            <p>{genre.definition}</p>
            <div className="card-bottom">
              <span className="chip">复合类型 / 编辑画像</span>
              <span>→</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
