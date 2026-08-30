import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import type { NewProject } from "../types";

interface AddProjectDialogProps {
  onAdd: (p: NewProject) => Promise<unknown>;
  onClose: () => void;
}

export function AddProjectDialog({ onAdd, onClose }: AddProjectDialogProps) {
  const [name, setName] = useState("");
  const [alias, setAlias] = useState("");
  const [path, setPath] = useState("");
  const [categories, setCategories] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handlePickFolder = async () => {
    const selected = await open({ directory: true, multiple: false });
    if (selected) {
      setPath(selected as string);
      if (!name) {
        const parts = (selected as string).split(/[\\/]/);
        setName(parts[parts.length - 1] || "");
      }
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !path.trim()) return;
    setSaving(true);
    await onAdd({
      name: name.trim(),
      alias: alias.trim(),
      path: path.trim(),
      categories: categories
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      description: description.trim(),
    });
    setSaving(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl w-[440px] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-5">添加项目</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
              文件夹路径 *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="D:\code\my-project"
                className="flex-1 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
              />
              <button
                onClick={handlePickFolder}
                className="px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
                浏览
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                项目名 *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="my-project"
                className="w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                别名
              </label>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="我的后台"
                className="w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
              分类 <span className="text-zinc-400 dark:text-zinc-600">(逗号分隔)</span>
            </label>
            <input
              type="text"
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
              placeholder="工作, 前端"
              className="w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
              描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="项目说明..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !path.trim() || saving}
            className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "保存中..." : "添加"}
          </button>
        </div>
      </div>
    </div>
  );
}
