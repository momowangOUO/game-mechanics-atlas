import type { Metadata } from "next";
import "./globals.css";
import "@xyflow/react/dist/style.css";
import "./ui.css";
import "./galgame.css";
import { AppProviders, PageTransition } from "@/components/Providers";
import { Footer, Header, MobileNavigation } from "@/components/Shell";

export const metadata: Metadata = {
  icons: { icon: "/icon.svg" },
  title: {
    default: "机制研究室 · Game Mechanics Atlas",
    template: "%s · 机制研究室",
  },
  description:
    "供游戏设计师查阅的机制知识库，包含游戏案例、组合实验与搜索需求分析。按九个维度整理机制，区分来源事实、设计分析和合成示例数据。",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
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
