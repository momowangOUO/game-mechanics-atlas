"use client";
import Link from "next/link";
export default function ErrorPage({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <div className="empty-state">
      <span aria-hidden="true">◇</span>
      <h1>这份档案暂时没有打开</h1>
      <p>
        可以重新加载当前页面，或返回研究室。已保存在本地的设置不会因此删除。
      </p>
      <button className="button primary" onClick={retry}>
        重新尝试 ↻
      </button>{" "}
      <Link className="button" href="/">
        回首页
      </Link>
    </div>
  );
}
