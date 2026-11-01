import type { CompositeGenre, Game, Mechanic } from "@/lib/model";
import { dimensions, sources, instances } from "@/lib/knowledge";
import { getMechanicTaxonomy } from "@/data/taxonomy-reference";
import {
  AUTHOR_NAME,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  SOCIAL_IMAGE,
  breadcrumbSchema,
  canonicalUrl,
  serializeJsonLd,
  type Breadcrumb,
} from "@/lib/seo";

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}

export function WebsiteStructuredData() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Person",
            "@id": `${SITE_URL}/#author`,
            name: AUTHOR_NAME,
            url: "https://github.com/momowangOUO",
          },
          {
            "@type": "WebSite",
            "@id": `${SITE_URL}/#website`,
            name: SITE_NAME,
            alternateName: "Game Mechanics Atlas",
            description: SITE_DESCRIPTION,
            url: canonicalUrl(),
            inLanguage: "zh-CN",
            author: { "@id": `${SITE_URL}/#author` },
          },
        ],
      }}
    />
  );
}

export function BreadcrumbStructuredData({ items }: { items: Breadcrumb[] }) {
  return <JsonLd data={breadcrumbSchema(items)} />;
}

export function ArticleStructuredData({
  title,
  description,
  path,
  breadcrumbs,
  citations = [],
}: {
  title: string;
  description: string;
  path: string;
  breadcrumbs: Breadcrumb[];
  citations?: string[];
}) {
  const url = canonicalUrl(path);
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Article",
            "@id": `${url}#article`,
            headline: title,
            description,
            url,
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            inLanguage: "zh-CN",
            author: {
              "@type": "Person",
              "@id": `${SITE_URL}/#author`,
              name: AUTHOR_NAME,
              url: "https://github.com/momowangOUO",
            },
            isPartOf: { "@id": `${SITE_URL}/#website` },
            image: SOCIAL_IMAGE,
            ...(citations.length ? { citation: citations } : {}),
          },
          breadcrumbSchema(breadcrumbs),
        ],
      }}
    />
  );
}

export function MechanicStructuredData({ mechanic }: { mechanic: Mechanic }) {
  const dimension = dimensions.find(({ id }) => id === mechanic.dimension)!;
  const taxonomy = getMechanicTaxonomy(mechanic.id);
  const sourceIds = new Set(
    instances
      .filter((row) => row.mechanicId === mechanic.id)
      .flatMap((row) => row.sourceIds),
  );
  return (
    <ArticleStructuredData
      title={`${mechanic.name}：定义与游戏用法`}
      description={mechanic.definition}
      path={`/mechanics/${mechanic.id}`}
      breadcrumbs={[
        { name: SITE_NAME, path: "/" },
        { name: "玩法分类图鉴", path: "/taxonomy" },
        { name: dimension.name, path: `/taxonomy/${dimension.id}` },
        ...(taxonomy
          ? [
              {
                name: taxonomy.group.name,
                path: `/taxonomy/${dimension.id}/${taxonomy.group.id}`,
              },
            ]
          : []),
        { name: mechanic.name, path: `/mechanics/${mechanic.id}` },
      ]}
      citations={sources
        .filter(({ id }) => sourceIds.has(id))
        .map(({ url }) => url)}
    />
  );
}

export function GameStructuredData({ game }: { game: Game }) {
  return (
    <ArticleStructuredData
      title={`${game.name}：游戏机制案例`}
      description={game.summary}
      path={`/games/${game.id}`}
      breadcrumbs={[
        { name: SITE_NAME, path: "/" },
        { name: "游戏案例", path: "/games" },
        { name: game.name, path: `/games/${game.id}` },
      ]}
      citations={sources
        .filter(({ id }) => game.sourceIds.includes(id))
        .map(({ url }) => url)}
    />
  );
}

export function GenreStructuredData({ genre }: { genre: CompositeGenre }) {
  return (
    <ArticleStructuredData
      title={`${genre.name}：类型与机制组成`}
      description={genre.definition}
      path={`/types/${genre.id}`}
      breadcrumbs={[
        { name: SITE_NAME, path: "/" },
        { name: "复合类型", path: "/types" },
        { name: genre.name, path: `/types/${genre.id}` },
      ]}
    />
  );
}
