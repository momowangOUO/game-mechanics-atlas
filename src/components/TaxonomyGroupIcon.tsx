import { ArtImage } from "./Art";
import { taxonomyGroupVisuals } from "@/data/taxonomy-group-visuals";
import styles from "./TaxonomyGroupIcon.module.css";

export function TaxonomyGroupIcon({
  id,
  size = 96,
}: {
  id: string;
  size?: number;
}) {
  const visual = taxonomyGroupVisuals[id];
  if (!visual) return null;
  return (
    <span className={styles.frame} style={{ width: size, height: size }}>
      <ArtImage
        src={visual.iconSrc}
        alt={visual.description}
        width={512}
        height={512}
        className={styles.image}
      />
    </span>
  );
}
