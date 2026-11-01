import Link from "next/link";
import { publicAssetPath } from "@/lib/paths";
import styles from "./Brand.module.css";

export const repositoryUrl =
  "https://github.com/momowangOUO/game-mechanics-atlas";

export function AuthorSection() {
  return (
    <section className={styles.authorSection} aria-labelledby="author-heading">
      <img
        src={publicAssetPath("/brand/logo-still.webp")}
        alt="魔魔王"
        width={640}
        height={332}
        className={styles.authorLogo}
      />
      <div className={styles.authorCopy}>
        <span className="eyebrow">ABOUT THE AUTHOR</span>
        <h2 id="author-heading">由魔魔王架设</h2>
        <p>
          整理游戏机制、具体范例和设计思路，供查资料、做比较和尝试组合时参考。
        </p>
        <div className={styles.authorLinks}>
          <a
            className="button primary"
            href={repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            ☆ GitHub 点星支持 ↗
          </a>
          <Link href="/copyright">版权与署名 →</Link>
          <Link href="/for-agents">AI / Agent 资料入口 →</Link>
        </div>
        <small>© 2026 魔魔王</small>
      </div>
    </section>
  );
}
