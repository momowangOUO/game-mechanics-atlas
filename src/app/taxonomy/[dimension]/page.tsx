import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dimensions, getMechanic } from "@/lib/knowledge";
import {
  taxonomyDimensions,
  getTaxonomyGroups,
} from "@/data/taxonomy-reference";
import { PageHead } from "@/components/Primitives";
import { BreadcrumbStructuredData } from "@/components/StructuredData";
import styles from "@/components/TaxonomyStatic.module.css";
import { pageMetadata, SITE_NAME } from "@/lib/seo";
import { TaxonomyGroupIcon } from "@/components/TaxonomyGroupIcon";
import { MechanismArticle } from "@/components/TaxonomyExplorer";
import atlasStyles from "@/components/TaxonomyExplorer.module.css";
import type { CSSProperties } from "react";

export const dynamicParams = false;
export function generateStaticParams() {
  return dimensions.map(({ id }) => ({ dimension: id }));
}
type Props = { params: Promise<{ dimension: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dimension: id } = await params;
  const dimension = dimensions.find((row) => row.id === id);
  if (!dimension) notFound();
  const guide = taxonomyDimensions.find((row) => row.dimensionId === id)!;
  return pageMetadata(
    `${dimension.name}：机制分类与游戏用法`,
    guide.explanation,
    `/taxonomy/${id}`,
  );
}
export default async function DimensionPage({ params }: Props) {
  const { dimension: id } = await params;
  const dimension = dimensions.find((row) => row.id === id);
  if (!dimension) notFound();
  const guide = taxonomyDimensions.find((row) => row.dimensionId === id)!;
  const groups = getTaxonomyGroups(dimension.id);
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: SITE_NAME, path: "/" },
          { name: "玩法分类图鉴", path: "/taxonomy" },
          { name: dimension.name, path: `/taxonomy/${id}` },
        ]}
      />
      <nav className={styles.breadcrumbs} aria-label="面包屑">
        <Link href="/">研究室</Link>
        <span>/</span>
        <Link href="/taxonomy">玩法分类图鉴</Link>
        <span>/</span>
        <span>{dimension.name}</span>
      </nav>
      <PageHead
        eyebrow="TAXONOMY / 机制维度"
        title={dimension.name}
        description={guide.explanation}
      />
      <section className={styles.boundary}>
        <h2>{guide.question}</h2>
        <p>{guide.use}</p>
        <p>分类边界：{guide.boundary}</p>
      </section>
      <h2 className={styles.sectionTitle}>{groups.length} 个分组</h2>
      <p className={styles.intro}>
        分组由本站编辑整理，把同一维度中作用相近的机制放在一起，方便比较。每项机制仍保留自己的主分类。
      </p>
      <div
        className={styles.continuousGroups}
        style={{ "--dimension-accent": dimension.color } as CSSProperties}
      >
        {groups.map((group) => (
          <section
            key={group.id}
            id={`group-${group.id}`}
            className={atlasStyles.group}
            data-taxonomy-group={group.id}
          >
            <header className={atlasStyles.groupHead}>
              <TaxonomyGroupIcon id={group.id} size={96} />
              <div>
                <span className={atlasStyles.kicker}>02 / 机制分组</span>
                <h2>{group.name}</h2>
                <p>{group.function}</p>
              </div>
            </header>
            <p className={atlasStyles.groupIntro}>{group.explanation}</p>
            <div className={styles.links}>
              {group.mechanicIds.map((mechanicId) => {
                const mechanic = getMechanic(mechanicId);
                return mechanic ? (
                  <a href={`#mechanic-${mechanic.id}`} key={mechanic.id}>
                    {mechanic.name}
                  </a>
                ) : null;
              })}
            </div>
            <p className={atlasStyles.groupBoundary}>
              分组边界：{group.boundary}
            </p>
            {group.mechanicIds.map((mechanicId) => (
              <MechanismArticle
                key={mechanicId}
                mechanic={getMechanic(mechanicId)!}
                groupId={group.id}
              />
            ))}
          </section>
        ))}
      </div>
      <div className={styles.links}>
        <Link href={`/taxonomy?dimension=${id}`}>在交互图鉴中筛选 →</Link>
        <Link href="/method">分类与证据说明 →</Link>
      </div>
    </>
  );
}
