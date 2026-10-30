import type { Metadata } from "next";
import "./globals.css";
import "@xyflow/react/dist/style.css";
import "./ui.css";
import { AppProviders, PageTransition } from "@/components/Providers";
import { Footer, Header, MobileNavigation } from "@/components/Shell";

export const metadata: Metadata = {
  icons: { icon: "/icon.svg" },
  title: {
    default: "机制研究室 · Game Mechanics Atlas",
    template: "%s · 机制研究室",
  },
  description:
    "面向游戏设计师的游戏机制知识库、真实案例、组合实验室与搜索需求观察。固定九维分类，区分事实、设计分析和示例数据。",
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
