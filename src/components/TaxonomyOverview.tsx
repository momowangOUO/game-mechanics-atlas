import Link from "next/link";
import { dimensions, getMechanic } from "@/lib/knowledge";
import { getTaxonomyGroups } from "@/data/taxonomy-reference";
import { publicAssetPath } from "@/lib/paths";
import styles from "./TaxonomyStatic.module.css";
import { taxonomyGroupVisuals } from "@/data/taxonomy-group-visuals";

/** Ordinary links and summaries remain available before client-side filtering. */
export function TaxonomyOverview() {
  return (
    <section
      className={styles.overview}
      aria-labelledby="taxonomy-overview-title"
    >
      <h2 id="taxonomy-overview-title">按维度与分组查阅</h2>
      <p>
        九个维度从不同角度拆解玩法；每个维度下按规则用途分组。打开分组，可查看机制说明和游戏用法。
      </p>
      <div className={styles.grid}>
        {dimensions.map((dimension) => {
          const groups = getTaxonomyGroups(dimension.id);
          return (
            <article className={styles.card} key={dimension.id}>
              <div className={styles.cardHeader}>
                <img
                  src={publicAssetPath(`/art/ui/${dimension.id}.svg`)}
                  width={40}
                  height={40}
                  alt=""
                />
                <h3>
                  <Link href={`/taxonomy/${dimension.id}`}>
                    {dimension.name}
                  </Link>
                </h3>
              </div>
              <p>{dimension.description}</p>
              <div className={styles.links}>
                {groups.map((group) => (
                  <Link
                    key={group.id}
                    href={`/taxonomy/${dimension.id}/${group.id}`}
                  >
                    <img
                      src={publicAssetPath(
                        taxonomyGroupVisuals[group.id].iconSrc,
                      )}
                      width={32}
                      height={32}
                      alt=""
                      loading="lazy"
                    />
                    {group.name}（
                    {group.mechanicIds.filter((id) => getMechanic(id)).length}）
                  </Link>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
