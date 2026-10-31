import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { publicAssetPath } from "@/lib/paths";
import "./globals.css";
import "@xyflow/react/dist/style.css";
import "./ui.css";
import "./galgame.css";
import { AppProviders, PageTransition } from "@/components/Providers";
import { Footer, Header, MobileNavigation } from "@/components/Shell";

export const metadata: Metadata = {
  icons: { icon: publicAssetPath("/icon.svg") },
  title: {
    default: "机制研究室 · Game Mechanics Atlas",
    template: "%s · 机制研究室",
  },
  description:
    "供游戏设计师逐层查阅的分类参考库：九个维度、类别分组、具体机制与游戏用法，并列出复合类型、组合实验和注明来源及时间的搜索趋势。",
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
      <body>
        <AppProviders>
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
