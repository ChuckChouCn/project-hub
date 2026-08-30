import type { Project } from "../types";
import { ProjectItem } from "./ProjectItem";

type View =
  | { type: "all" }
  | { type: "category"; name: string }
  | { type: "archived"; category?: string };

interface SidebarProps {
  projects: Project[];
  loading: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  view: View;
  onViewChange: (v: View) => void;
  activeCategories: string[];
  archivedCategories: string[];
  archivedCount: number;
  onAddProject: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export function Sidebar({
  projects,
  loading,
  search,
  onSearchChange,
  selectedId,
  onSelect,
  view,
  onViewChange,
  activeCategories,
  archivedCategories,
  archivedCount,
  onAddProject,
  theme,
  onToggleTheme,
}: SidebarProps) {
  const isArchived = view.type === "archived";

  return (
    <aside className="w-64 flex-shrink-0 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-zinc-50 dark:bg-zinc-900/50">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <h1 className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Project Hub
        </h1>
        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-md text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          title={theme === "dark" ? "切换浅色" : "切换深色"}
        >
          {theme === "dark" ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>

      {/* Top actions: Add + Archive */}
      <div className="px-3 pt-2 pb-1 space-y-1">
        <button
          onClick={onAddProject}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          添加项目
        </button>
        <button
          onClick={() =>
            onViewChange(isArchived ? { type: "all" } : { type: "archived" })
          }
          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
            isArchived
              ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800/50"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          归档
          {archivedCount > 0 && (
            <span className="ml-auto text-xs text-zinc-400 dark:text-zinc-500">{archivedCount}</span>
          )}
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-1.5">
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
          />
        </div>
      </div>

      {/* Archive back button */}
      {isArchived && (
        <div className="px-3 pb-1">
          <button
            onClick={() => onViewChange({ type: "all" })}
            className="w-full text-left px-3 py-1.5 rounded-md text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            ← 返回全部项目
          </button>
          {archivedCategories.length > 0 && (
            <div className="flex flex-wrap gap-1 px-1 mt-1">
              <button
                onClick={() => onViewChange({ type: "archived" })}
                className={`px-2 py-0.5 rounded-full text-[11px] transition-colors ${
                  !view.category
                    ? "bg-zinc-800 dark:bg-zinc-200 text-zinc-100 dark:text-zinc-900"
                    : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                全部
              </button>
              {archivedCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => onViewChange({ type: "archived", category: cat })}
                  className={`px-2 py-0.5 rounded-full text-[11px] transition-colors ${
                    view.category === cat
                      ? "bg-zinc-800 dark:bg-zinc-200 text-zinc-100 dark:text-zinc-900"
                      : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main category filters (only in non-archived view) */}
      {!isArchived && activeCategories.length > 0 && (
        <div className="px-3 pb-1">
          <div className="flex flex-wrap gap-1 px-1">
            <button
              onClick={() => onViewChange({ type: "all" })}
              className={`px-2 py-0.5 rounded-full text-[11px] transition-colors ${
                view.type === "all"
                  ? "bg-zinc-800 dark:bg-zinc-200 text-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              全部
            </button>
            {activeCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => onViewChange({ type: "category", name: cat })}
                className={`px-2 py-0.5 rounded-full text-[11px] transition-colors ${
                  view.type === "category" && view.name === cat
                    ? "bg-zinc-800 dark:bg-zinc-200 text-zinc-100 dark:text-zinc-900"
                    : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Project list */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-zinc-300 dark:border-zinc-600 border-t-zinc-600 dark:border-t-zinc-300 rounded-full animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <p className="text-xs text-zinc-400 dark:text-zinc-600 text-center py-8">
            {isArchived ? "暂无归档项目" : "暂无项目"}
          </p>
        ) : (
          projects.map((p) => (
            <ProjectItem
              key={p.id}
              project={p}
              selected={selectedId === p.id}
              onClick={() => onSelect(p.id)}
            />
          ))
        )}
      </div>
    </aside>
  );
}
