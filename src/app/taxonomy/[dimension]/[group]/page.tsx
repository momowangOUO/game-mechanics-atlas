import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dimensions, getMechanic } from "@/lib/knowledge";
import { taxonomyGroups } from "@/data/taxonomy-reference";
import { PageHead } from "@/components/Primitives";
import { BreadcrumbStructuredData } from "@/components/StructuredData";
import { MechanismArticle } from "@/components/TaxonomyExplorer";
import { TaxonomyGroupIcon } from "@/components/TaxonomyGroupIcon";
import { pageMetadata, SITE_NAME } from "@/lib/seo";
import styles from "@/components/TaxonomyStatic.module.css";

export const dynamicParams = false;
export function generateStaticParams() {
  return taxonomyGroups.map((row) => ({
    dimension: row.dimensionId,
    group: row.id,
  }));
}
type Props = { params: Promise<{ dimension: string; group: string }> };
function findGroup(dimension: string, group: string) {
  return taxonomyGroups.find(
    (row) => row.id === group && row.dimensionId === dimension,
  );
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dimension, group: id } = await params;
  const group = findGroup(dimension, id);
  if (!group) notFound();
  return pageMetadata(
    `${group.name}：机制定义与游戏实例`,
    group.explanation,
    `/taxonomy/${dimension}/${id}`,
  );
}
export default async function GroupPage({ params }: Props) {
  const { dimension: dimensionId, group: id } = await params;
  const group = findGroup(dimensionId, id);
  if (!group) notFound();
  const dimension = dimensions.find((row) => row.id === group.dimensionId)!;
  const siblings = taxonomyGroups.filter(
    (row) => row.dimensionId === dimensionId && row.id !== id,
  );
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: SITE_NAME, path: "/" },
          { name: "玩法分类图鉴", path: "/taxonomy" },
          { name: dimension.name, path: `/taxonomy/${dimensionId}` },
          { name: group.name, path: `/taxonomy/${dimensionId}/${id}` },
        ]}
      />
      <nav className={styles.breadcrumbs} aria-label="面包屑">
        <Link href="/">研究室</Link>
        <span>/</span>
        <Link href="/taxonomy">玩法分类图鉴</Link>
        <span>/</span>
        <Link href={`/taxonomy/${dimensionId}`}>{dimension.name}</Link>
        <span>/</span>
        <span>{group.name}</span>
      </nav>
      <div id={`group-${id}`}>
        <PageHead
          eyebrow={`TAXONOMY / ${dimension.name}`}
          title={group.name}
          description={group.explanation}
        >
          <TaxonomyGroupIcon id={group.id} size={96} />
        </PageHead>
      </div>
      <section className={styles.boundary}>
        <h2>作用与边界</h2>
        <p>{group.function}</p>
        <p>{group.boundary}</p>
      </section>
      <nav className={styles.links} aria-label="本组机制目录">
        {group.mechanicIds.map((mechanicId) => (
          <a key={mechanicId} href={`#mechanic-${mechanicId}`}>
            {getMechanic(mechanicId)?.name} ↓
          </a>
        ))}
      </nav>
      <h2 className={styles.sectionTitle}>
        本组的 {group.mechanicIds.length} 个机制
      </h2>
      {group.mechanicIds.map((mechanicId) => (
        <MechanismArticle
          key={mechanicId}
          mechanic={getMechanic(mechanicId)!}
          groupId={group.id}
        />
      ))}
      <section className={styles.boundary}>
        <h2>其他分组</h2>
        <div className={styles.links}>
          {siblings.map((row) => (
            <Link key={row.id} href={`/taxonomy/${dimensionId}/${row.id}`}>
              <TaxonomyGroupIcon id={row.id} size={40} />
              {row.name} →
            </Link>
          ))}
        </div>
        <p>
          <Link href={`/taxonomy?group=${id}#group-${id}`}>
            在分类图鉴中定位本组 →
          </Link>{" "}
          · <Link href="/method">分类与证据说明 →</Link>
        </p>
      </section>
    </>
  );
}
