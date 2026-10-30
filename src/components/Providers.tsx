"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
} from "motion/react";
import { usePathname } from "next/navigation";
import { games, genres, mechanics, recipes } from "@/lib/knowledge";

type MotionPreference = "auto" | "full" | "reduced";
type UIState = {
  openSearch: (query?: string) => void;
  announce: (message: string) => void;
  effects: boolean;
  motionPreference: MotionPreference;
  setMotionPreference: (value: MotionPreference) => void;
};
const UIContext = createContext<UIState | null>(null);
export function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error("UI provider missing");
  return context;
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  className = "",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.documentElement.style.overflow;
    if (open) {
      if (!dialog.open) dialog.showModal();
      document.documentElement.style.overflow = "hidden";
      dialog.querySelector<HTMLElement>("input,button,a")?.focus();
    } else if (dialog.open) {
      dialog.close();
    }
    return () => {
      document.documentElement.style.overflow = overflow;
      if (open) {
        dialog.close();
        previous?.focus();
      }
    };
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={`atlas-dialog ${className}`}
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const box = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < box.left ||
            event.clientX > box.right ||
            event.clientY < box.top ||
            event.clientY > box.bottom
          )
            onClose();
        }
      }}
    >
      <div className="window-head">
        <span>{title}</span>
        <button
          type="button"
          className="icon-button"
          aria-label="关闭弹窗"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      {open && children}
    </dialog>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState(false),
    [query, setQuery] = useState(""),
    [toast, setToast] = useState("");
  const [preference, setPreference] = useState<MotionPreference>("auto");
  const [hardwareLimited, setHardwareLimited] = useState(false);
  const reduced = useReducedMotion();
  const effects =
    preference === "full"
      ? !reduced
      : preference === "reduced"
        ? false
        : !reduced && !hardwareLimited;
  useEffect(() => {
    const saved = localStorage.getItem("atlas.motion");
    if (saved === "auto" || saved === "full" || saved === "reduced")
      setPreference(saved);
    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
    };
    setHardwareLimited(
      Boolean(nav.connection?.saveData) ||
        (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) ||
        navigator.hardwareConcurrency <= 4 ||
        window.matchMedia("(max-width:700px)").matches,
    );
  }, []);
  useEffect(() => {
    document.documentElement.dataset.effects = effects ? "full" : "reduced";
  }, [effects]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3400);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearch((value) => !value);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const value = useMemo(
    () => ({
      openSearch: (initial = "") => {
        setQuery(initial);
        setSearch(true);
      },
      announce: setToast,
      effects,
      motionPreference: preference,
      setMotionPreference: (next: MotionPreference) => {
        setPreference(next);
        localStorage.setItem("atlas.motion", next);
      },
    }),
    [effects, preference],
  );
  const normalized = query.trim().toLocaleLowerCase();
  const matches = (name: string, id: string, extra = "") =>
    `${name} ${id} ${extra}`.toLocaleLowerCase().includes(normalized);
  const results = [
    ...mechanics
      .filter((m) => matches(m.name, m.id, m.definition))
      .slice(0, 5)
      .map((m) => ({
        name: m.name,
        kind: "机制档案",
        meta: m.definition,
        href: `/mechanics/${m.id}`,
      })),
    ...games
      .filter((g) => matches(g.name, g.id, g.summary))
      .slice(0, 4)
      .map((g) => ({
        name: g.name,
        kind: "游戏案例",
        meta: g.summary,
        href: `/games/${g.id}`,
      })),
    ...genres
      .filter((g) => matches(g.name, g.id))
      .slice(0, 2)
      .map((g) => ({
        name: g.name,
        kind: "复合类型",
        meta: g.definition,
        href: `/types/${g.id}`,
      })),
    ...recipes
      .filter((r) => matches(r.name, r.id))
      .slice(0, 2)
      .map((r) => ({
        name: r.name,
        kind: "组合配方",
        meta: r.synergies[0] || "打开组合研究",
        href: `/lab?recipe=${r.id}`,
      })),
  ];
  return (
    <UIContext.Provider value={value}>
      <MotionConfig
        reducedMotion={effects ? "user" : "always"}
        transition={{ duration: 0.26, ease: [0.2, 0, 0, 1] }}
      >
        {children}
        <Dialog
          open={search}
          onClose={() => setSearch(false)}
          title="SEARCH ARCHIVE / 检索研究档案"
          className="search-dialog"
        >
          <div className="search-input-row">
            <span aria-hidden="true">⌕</span>
            <input
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="机制、游戏、类型或组合…"
              aria-label="搜索全部档案"
            />
            <span className="keycap">ESC</span>
          </div>
          <p className="search-help">
            {normalized
              ? "匹配当前知识库；未找到的内容不会自动补全。"
              : "试着搜索：卡组、Balatro、重开、撤离。"}
            <span aria-live="polite">{results.length} 项</span>
          </p>
          <motion.div layout className="search-results">
            {results.length ? (
              results.map((result, i) => (
                <motion.div
                  layout
                  key={result.href}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.025, 0.2) }}
                >
                  <Link href={result.href} onClick={() => setSearch(false)}>
                    <span className="chip">{result.kind}</span>
                    <strong>{result.name}</strong>
                    <p>{result.meta}</p>
                    <span className="result-arrow" aria-hidden="true">
                      ↗
                    </span>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="empty-state">
                <span aria-hidden="true">◇</span>
                <h3>还没有这份档案</h3>
                <p>换一个关键词试试，也可从九个分类维度浏览。</p>
                <Link
                  href="/mechanics"
                  className="button primary"
                  onClick={() => setSearch(false)}
                >
                  浏览机制档案 →
                </Link>
              </div>
            )}
          </motion.div>
        </Dialog>
        <AnimatePresence>
          {toast && (
            <motion.div
              className="toast"
              role="status"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </MotionConfig>
    </UIContext.Provider>
  );
}

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { effects } = useUI();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0.85, y: effects ? 12 : 0 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0.8, y: effects ? -7 : 0 }}
        transition={{ duration: effects ? 0.35 : 0 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
