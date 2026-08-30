import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { Project, ActionDef, Status } from "../types";

interface WorkspaceProps {
  project: Project | null;
  onEdit: (p: Project) => void;
  onArchive: (p: Project) => void;
  onDelete: (id: string) => void;
  onAction: (action: string) => void;
  onStatusChange: (s: Status) => void;
}

const iconMap: Record<string, string> = {
  "folder-open":
    "M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z",
  terminal:
    "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  code: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
};

const actionLabels: Record<string, string> = {
  "open-folder": "打开文件夹",
  "open-terminal": "终端打开",
  "open-vscode": "VS Code 打开",
};

const statusLabels: Record<Status, string> = {
  developing: "开发中",
  paused: "暂停",
  done: "完成",
};

const statusActiveClass: Record<Status, string> = {
  developing: "bg-emerald-600 border-emerald-600 text-white",
  paused: "bg-amber-500 border-amber-500 text-white",
  done: "bg-zinc-800 dark:bg-zinc-100 border-zinc-800 dark:border-zinc-100 text-white dark:text-zinc-900",
};

export function Workspace({ project, onEdit, onArchive, onDelete, onAction, onStatusChange }: WorkspaceProps) {
  const [actions, setActions] = useState<ActionDef[]>([]);

  useEffect(() => {
    invoke<ActionDef[]>("get_available_actions")
      .then(setActions)
      .catch(() => setActions([
        { key: "open-folder", label: "打开文件夹", icon: "folder-open" },
        { key: "open-terminal", label: "终端打开", icon: "terminal" },
        { key: "open-vscode", label: "VS Code 打开", icon: "code" },
      ]));
  }, []);

  if (!project) {
    return (
      <main className="flex-1 flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
            <svg className="w-10 h-10 text-zinc-300 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <p className="text-zinc-400 dark:text-zinc-500 text-sm">选择左侧项目查看详情</p>
        </div>
      </main>
    );
  }

  const displayName = project.alias || project.name;

  return (
    <main className="flex-1 flex flex-col bg-white dark:bg-zinc-950 overflow-y-auto">
      {/* Tabs — v2 will add "开发进度" */}
      <div className="px-6 pt-6 pb-0 flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800">
        <button className="px-3 py-2 text-sm font-medium text-zinc-900 dark:text-zinc-100 border-b-2 border-zinc-900 dark:border-zinc-100 -mb-[1px]">
          概览
        </button>
      </div>

      <div className="flex-1 px-6 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
            <svg className="w-7 h-7 text-zinc-500 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{displayName}</h2>
            {project.alias && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{project.name}</p>
            )}
            <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1 font-mono">{project.path}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {actions.map((a) => (
            <button
              key={a.key}
              onClick={() => onAction(a.key)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={iconMap[a.icon] || ""} />
              </svg>
              {actionLabels[a.key] || a.label}
            </button>
          ))}
        </div>

        {/* Status */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
            状态
          </h3>
          <div className="flex gap-2">
            {(["developing", "paused", "done"] as Status[]).map((s) => (
              <button
                key={s}
                onClick={() => onStatusChange(s)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  project.status === s
                    ? statusActiveClass[s]
                    : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {statusLabels[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">描述</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{project.description}</p>
          </div>
        )}

        {/* Categories */}
        {project.categories.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">分类</h3>
            <div className="flex flex-wrap gap-1.5">
              {project.categories.map((cat) => (
                <span key={cat} className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Manage buttons */}
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => onEdit(project)}
            className="px-3 py-1.5 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            编辑
          </button>
          <button
            onClick={() => {
              const label = project.archived ? "取消归档" : "归档";
              if (confirm(`确定${label}项目 "${project.name}"？`)) {
                onArchive(project);
              }
            }}
            className="px-3 py-1.5 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {project.archived ? "取消归档" : "归档"}
          </button>
          <button
            onClick={() => {
              if (confirm(`确定删除项目 "${project.name}"？`)) {
                onDelete(project.id);
              }
            }}
            className="px-3 py-1.5 rounded-lg text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            删除
          </button>
        </div>

        {/* Metadata */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
          <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400 dark:text-zinc-600">
            <div>创建时间</div>
            <div className="text-zinc-500 dark:text-zinc-500 font-mono">
              {new Date(project.created_at).toLocaleString("zh-CN")}
            </div>
            <div>更新时间</div>
            <div className="text-zinc-500 dark:text-zinc-500 font-mono">
              {new Date(project.updated_at).toLocaleString("zh-CN")}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
