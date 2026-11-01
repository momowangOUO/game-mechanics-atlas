import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { publicAssetPath } from "@/lib/paths";
import {
  AUTHOR_NAME,
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  SOCIAL_IMAGE,
} from "@/lib/seo";
import "./globals.css";
import "@xyflow/react/dist/style.css";
import "./ui.css";
import "./galgame.css";
import { AppProviders, PageTransition } from "@/components/Providers";
import { Footer, Header, MobileNavigation } from "@/components/Shell";
import BrandIntro from "@/components/BrandIntro";
import { WebsiteStructuredData } from "@/components/StructuredData";

export const metadata: Metadata = {
  metadataBase: new URL(`${SITE_URL}/`),
  icons: { icon: publicAssetPath("/icon.svg") },
  title: {
    default: "机制研究室 · Game Mechanics Atlas",
    template: "%s · 机制研究室",
  },
  description: SITE_DESCRIPTION,
  authors: [{ name: AUTHOR_NAME, url: "https://github.com/momowangOUO" }],
  creator: AUTHOR_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "zh_CN",
    images: [
      {
        url: SOCIAL_IMAGE,
        width: 1280,
        height: 640,
        alt: "机制研究室 · 游戏机制与案例参考",
      },
    ],
  },
  twitter: { card: "summary_large_image", images: [SOCIAL_IMAGE] },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-CN"
      style={
        {
          "--room-dusk-image": `url("${publicAssetPath("/art/room-dusk.webp")}")`,
        } as CSSProperties
      }
    >
      <head>
        <link rel="describedby" href={publicAssetPath("/llms.txt")} />
        <link
          rel="preload"
          as="image"
          href={publicAssetPath("/brand/logo-handwriting.webp")}
          media="(prefers-reduced-motion: no-preference)"
        />
        <link
          rel="preload"
          as="image"
          href={publicAssetPath("/brand/logo-still.webp")}
          media="(prefers-reduced-motion: reduce)"
        />
      </head>
      <body>
        <WebsiteStructuredData />
        <AppProviders>
          <BrandIntro />
          <div className="frame">
            <Header />
            <main id="main">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
          </div>
          <MobileNavigation />
        </AppProviders>
      </body>
    </html>
  );
}
