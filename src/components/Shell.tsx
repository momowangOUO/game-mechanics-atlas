"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Dialog, useUI } from "./Providers";
import { mechanics, games } from "@/lib/knowledge";
import { publicAssetPath } from "@/lib/paths";
import { repositoryUrl } from "./Author";
import brandStyles from "./Brand.module.css";

const routes = [
  ["/taxonomy", "分类参考", "▤"],
  ["/games", "游戏案例", "♧"],
  ["/graph", "机制图谱", "⌘"],
  ["/heat", "热度观察", "⌁"],
  ["/compare", "游戏对比", "⇄"],
  ["/lab", "研究提示词", "⚗"],
] as const;
export function Header() {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false),
    [settings, setSettings] = useState(false);
  const { openSearch, motionPreference, setMotionPreference } = useUI();
  return (
    <>
      <a className="skip-link" href="#main">
        跳到正文
      </a>
      <header className="masthead">
        <Link className="brand" href="/" aria-label="机制研究室首页">
          <span className="brand-symbol">
            <span>✦</span>
          </span>
          <span>
            <strong>机制研究室</strong>
            <small>GAME MECHANICS ATLAS</small>
          </span>
        </Link>
        <nav className="nav" aria-label="主导航">
          {routes.map(([href, name]) => (
            <Link
              className={`${(href === "/taxonomy" ? ["/taxonomy", "/mechanics", "/types"].some((path) => pathname.startsWith(path)) : pathname.startsWith(href)) ? "active" : ""} ${href === "/lab" ? "nav-lab" : ""}`}
              href={href}
              key={href}
            >
              {name}
              {href === "/lab" ? " ↗" : ""}
            </Link>
          ))}
        </nav>
        <div className="header-tools">
          <a
            className={`${brandStyles.githubLink} desktop-only`}
            href={repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="在 GitHub 查看项目并点星支持"
          >
            ☆ GitHub ↗
          </a>
          <button
            className="icon-button desktop-only"
            onClick={() => openSearch()}
            aria-label="搜索档案（Ctrl K）"
          >
            ⌕
          </button>
          <button
            className="icon-button"
            onClick={() => setSettings(true)}
            aria-label="动效设置"
          >
            ◐
          </button>
          <button
            className="icon-button mobile-only"
            onClick={() => setMenu(true)}
            aria-label="打开导航菜单"
          >
            ☰
          </button>
        </div>
      </header>
      <div className="statusline">
        <span>
          <i className="led" />
          資料室 OPEN　/　欢迎查阅研究档案
        </span>
        <span>
          {mechanics.length} MECHANICS　·　{games.length} CASE STUDIES　·　9
          DIMENSIONS
        </span>
      </div>
      <Dialog
        open={menu}
        onClose={() => setMenu(false)}
        title="DIRECTORY / 研究室导航"
        className="menu-dialog"
      >
        <nav className="drawer-nav">
          <Link href="/" onClick={() => setMenu(false)}>
            ⌂　研究室首页
          </Link>
          {routes.map(([href, name, symbol]) => (
            <Link key={href} href={href} onClick={() => setMenu(false)}>
              {symbol}　{name} →
            </Link>
          ))}
          <Link href="/mechanics" onClick={() => setMenu(false)}>
            ▤　全部机制档案 →
          </Link>
          <Link href="/types" onClick={() => setMenu(false)}>
            ▧　复合类型与配方 →
          </Link>
          <Link href="/method" onClick={() => setMenu(false)}>
            ？　分类与热度方法
          </Link>
          <Link href="/for-agents" onClick={() => setMenu(false)}>
            ▧　AI / Agent 资料入口
          </Link>
          <a
            href={repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenu(false)}
          >
            ☆　GitHub 点星支持 ↗
          </a>
          <button
            className="button primary"
            onClick={() => {
              setMenu(false);
              openSearch();
            }}
          >
            ⌕　搜索全部档案
          </button>
        </nav>
      </Dialog>
      <Dialog
        open={settings}
        onClose={() => setSettings(false)}
        title="DISPLAY / 动效与性能"
      >
        <div className="window-body">
          <h2 className="dialog-heading">选择动效模式</h2>
          <p className="muted">
            系统的“减弱动态”偏好始终优先。自动模式会为手机和低性能设备减少环境动画。
          </p>
          <div className="motion-options">
            {(
              [
                ["auto", "自动", "根据设备与系统偏好调整"],
                ["full", "完整", "页面、关系路径与角色轻动效"],
                ["reduced", "简化", "保留操作反馈，关闭环境循环"],
              ] as const
            ).map(([id, name, desc]) => (
              <button
                key={id}
                className={`choice ${motionPreference === id ? "active" : ""}`}
                aria-pressed={motionPreference === id}
                onClick={() => setMotionPreference(id)}
              >
                <span className="radio">
                  {motionPreference === id ? "●" : ""}
                </span>
                <span>
                  <strong>{name}</strong>
                  <span className="choice-description">{desc}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </Dialog>
    </>
  );
}
export function Footer() {
  return (
    <footer className={`footer ${brandStyles.footer}`}>
      <div className={brandStyles.footerAuthor}>
        <img
          src={publicAssetPath("/brand/logo-still.webp")}
          alt="魔魔王"
          width={100}
          height={52}
        />
        <p>
          由魔魔王架设
          <br />© 2026 魔魔王 · 机制研究室
        </p>
      </div>
      <div className={brandStyles.footerLinks}>
        <Link href="/method">分类与热度方法</Link>
        <Link href="/sources">来源与素材</Link>
        <Link href="/copyright">版权与署名</Link>
        <Link href="/for-agents">AI / Agent 资料入口</Link>
        <a href={repositoryUrl} target="_blank" rel="noopener noreferrer">
          ☆ GitHub 点星支持 ↗
        </a>
      </div>
    </footer>
  );
}
export function MobileNavigation() {
  const pathname = usePathname();
  const bottom = [
    ["/", "研究室", "⌂"],
    ["/taxonomy", "分类", "▤"],
    ["/games", "案例", "♧"],
    ["/heat", "热度", "⌁"],
    ["/lab", "提示词", "⚗"],
  ];
  return (
    <nav className="mobile-nav" aria-label="底部导航">
      {bottom.map(([href, name, symbol]) => (
        <Link
          href={href}
          key={href}
          className={
            (
              href === "/"
                ? pathname === "/"
                : href === "/taxonomy"
                  ? ["/taxonomy", "/mechanics", "/types"].some((path) =>
                      pathname.startsWith(path),
                    )
                  : pathname.startsWith(href)
            )
              ? "active"
              : ""
          }
        >
          <b aria-hidden="true">{symbol}</b>
          {name}
        </Link>
      ))}
    </nav>
  );
}
