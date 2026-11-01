import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dimensions, getMechanic, getGame, sources } from "@/lib/knowledge";
import { taxonomyGroups } from "@/data/taxonomy-reference";
import {
  GameCover,
  GameArtCredit,
  PageHead,
  StateBadge,
} from "@/components/Primitives";
import { BreadcrumbStructuredData } from "@/components/StructuredData";
import { MechanicIcon, MechanicExamples } from "@/components/MechanicVisuals";
import { evidenceLabels } from "@/lib/evidence-labels";
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
      <PageHead
        eyebrow={`TAXONOMY / ${dimension.name}`}
        title={group.name}
        description={group.explanation}
      />
      <section className={styles.boundary}>
        <h2>作用与边界</h2>
        <p>{group.function}</p>
        <p>{group.boundary}</p>
      </section>
      <h2 className={styles.sectionTitle}>
        本组的 {group.mechanicIds.length} 个机制
      </h2>
      <div className={styles.grid}>
        {group.mechanicIds.map((mechanicId) => {
          const mechanic = getMechanic(mechanicId);
          return mechanic ? (
            <article className={styles.card} key={mechanic.id}>
              <div className={styles.cardHeader}>
                <MechanicIcon id={mechanic.id} size={48} />
                <h3>
                  <Link href={`/mechanics/${mechanic.id}`}>
                    {mechanic.name} →
                  </Link>
                </h3>
              </div>
              <p>{mechanic.definition}</p>
              <p>
                <strong>纳入条件：</strong>
                {mechanic.inclusionRules.join("；")}
              </p>
              <p>
                <strong>排除边界：</strong>
                {mechanic.exclusionRules.join("；")}
              </p>
              <h4>游戏范例</h4>
              <MechanicExamples id={mechanic.id} limit={2} />
            </article>
          ) : null;
        })}
      </div>
      <h2 className={styles.sectionTitle}>游戏范例</h2>
      <p className={styles.intro}>
        每条范例都保留对应范围、状态和来源；有条件成立的机制还会列出条件。
      </p>
      {group.examples.length ? (
        <div className={styles.examples}>
          {group.examples.map((example) => {
            const game = getGame(example.gameId);
            const mechanic = getMechanic(example.mechanicId);
            return game && mechanic ? (
              <article className={styles.example} key={example.instanceId}>
                <Link
                  href={`/games/${game.id}`}
                  aria-label={`查看${game.name}游戏案例`}
                >
                  <GameCover game={game} />
                </Link>
                <div className={styles.exampleBody}>
                  <GameArtCredit gameId={game.id} />
                  <h3>
                    <Link href={`/games/${game.id}`}>{game.name}</Link> ·{" "}
                    <Link href={`/mechanics/${mechanic.id}`}>
                      {mechanic.name}
                    </Link>
                  </h3>
                  <div>
                    <StateBadge status={example.status} />{" "}
                    <span>{example.scopeLabel}</span>
                  </div>
                  <p>{example.observation}</p>
                  {example.condition && (
                    <p className="gold">成立条件：{example.condition}</p>
                  )}
                  {example.scopeNote && <p>{example.scopeNote}</p>}
                  <div className={styles.sources}>
                    <strong>{evidenceLabels[example.evidenceKind]}</strong>
                    {example.sourceIds.map((sourceId) => {
                      const source = sources.find((row) => row.id === sourceId);
                      return source ? (
                        <a
                          href={source.url}
                          key={source.id}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {source.title} ↗ · {source.publisher} · 核验{" "}
                          {source.checkedAt}
                        </a>
                      ) : null;
                    })}
                  </div>
                </div>
              </article>
            ) : null;
          })}
        </div>
      ) : (
        <p className={styles.boundary}>本组暂未收录游戏范例。</p>
      )}
      <section className={styles.boundary}>
        <h2>继续比较</h2>
        <div className={styles.links}>
          {siblings.map((row) => (
            <Link href={`/taxonomy/${dimensionId}/${row.id}`} key={row.id}>
              {row.name} →
            </Link>
          ))}
        </div>
        <p>
          <Link href={`/taxonomy?group=${id}`}>在交互图鉴中查看本组 →</Link> ·{" "}
          <Link href="/method">分类与证据说明 →</Link>
        </p>
      </section>
    </>
  );
}
