export default function Loading() {
  return (
    <div className="loading-state" role="status">
      <span className="loading-square" aria-hidden="true" />
      <p>正在打开档案…</p>
    </div>
  );
}
