"use client";
import Link from "next/link";
export default function ErrorPage({
  reset,
}: {
  error: unknown;
  reset: () => void;
}) {
  return (
    <div className="empty-state">
      <span aria-hidden="true">◇</span>
      <h1>页面暂时无法打开</h1>
      <p>
        可以重新尝试，或返回研究室首页。动效偏好保存在当前浏览器；导入的搜索记录只保留在当前会话，刷新后需要重新导入。
      </p>
      <button className="button primary" onClick={reset}>
        重新尝试 ↻
      </button>{" "}
      <Link className="button" href="/">
        回首页
      </Link>
    </div>
  );
}
