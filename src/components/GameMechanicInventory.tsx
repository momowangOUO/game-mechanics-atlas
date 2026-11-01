import { dimensions, scopes } from "@/lib/knowledge";
import type { GameMechanicEntry } from "@/lib/game-mechanic-overview";
import { MechanicIcon } from "./MechanicVisuals";
import { StateBadge } from "./Primitives";
import styles from "./GameMechanicInventory.module.css";

export default function GameMechanicInventory({
  entries,
  onSelect,
  selected,
  allScopes = false,
}: {
  entries: GameMechanicEntry[];
  onSelect: (id: string) => void;
  selected?: string;
  allScopes?: boolean;
}) {
  const groups = dimensions.filter((d) =>
    entries.some((entry) => entry.mechanic.dimension === d.id),
  );
  const interactions = entries.filter(
    (entry) => entry.mechanic.dimension === "interaction",
  );
  return (
    <section className={styles.inventory} aria-label="游戏机制总览">
      <header>
        <h2>游戏机制总览</h2>
        <span>
          {entries.length} 项机制 · {groups.length} 个维度
        </span>
      </header>
      <p className={styles.note}>
        同一款游戏可以同时包含移动、跳跃、攻击等多种核心交互。
        {allScopes
          ? "这里汇总各范围的记录，模式与条件分别标注。"
          : "下列机制属于当前所选范围。"}
      </p>
      {interactions.length > 0 && (
        <p className={styles.interactions}>
          <strong>核心交互 · {interactions.length} 项</strong>
          {interactions.map((entry) => entry.mechanic.name).join(" / ")}
          <small>这些操作可以并存，“核心交互”不是只能选一个的类型标签。</small>
        </p>
      )}
      <div className={styles.groups}>
        {groups.map((dimension) => (
          <section
            className={styles.group}
            key={dimension.id}
            style={{ borderColor: dimension.color }}
            aria-label={`${dimension.name}机制`}
          >
            <h3>{dimension.name}</h3>
            <ul>
              {entries
                .filter((entry) => entry.mechanic.dimension === dimension.id)
                .map((entry) => (
                  <li key={entry.mechanic.id}>
                    <button
                      type="button"
                      data-mechanic-id={entry.mechanic.id}
                      aria-label={`聚焦${entry.mechanic.name}`}
                      aria-pressed={selected === entry.mechanic.id}
                      onClick={() => onSelect(entry.mechanic.id)}
                    >
                      <MechanicIcon id={entry.mechanic.id} size={30} />
                      <strong>{entry.mechanic.name}</strong>
                      <span aria-hidden="true">⌖</span>
                    </button>
                    <details>
                      <summary>
                        {allScopes
                          ? `${entry.records.length} 条范围记录`
                          : "用法与成立条件"}
                      </summary>
                      {entry.records.map((record) => (
                        <div className={styles.record} key={record.id}>
                          <StateBadge status={record.status} />
                          <small>
                            {
                              scopes.find(
                                (scope) => scope.id === record.scopeId,
                              )?.label
                            }
                          </small>
                          <p>{record.rationale}</p>
                          {record.condition && (
                            <p className={styles.condition}>
                              条件：{record.condition}
                            </p>
                          )}
                        </div>
                      ))}
                    </details>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}
