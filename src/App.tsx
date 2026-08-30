import { useState, useMemo, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useProjects } from "./hooks/useProjects";
import { Sidebar } from "./components/Sidebar";
import { Workspace } from "./components/Workspace";
import { AddProjectDialog } from "./components/AddProjectDialog";
import { EditProjectDialog } from "./components/EditProjectDialog";
import type { Project, Status } from "./types";

type View =
  | { type: "all" }
  | { type: "category"; name: string }
  | { type: "archived"; category?: string };

export default function App() {
  const { projects, loading, add, update, remove } = useProjects();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<View>({ type: "all" });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">(() =>
    localStorage.getItem("theme") === "light" ? "light" : "dark"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const filtered = useMemo(() => {
    let list = projects;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.alias.toLowerCase().includes(q) ||
          p.path.toLowerCase().includes(q)
      );
    }
    if (view.type === "archived") {
      list = list.filter((p) => p.archived);
      if (view.category) {
        const cat = view.category;
        list = list.filter((p) => p.categories.includes(cat));
      }
    } else {
      list = list.filter((p) => !p.archived);
      if (view.type === "category") {
        list = list.filter((p) => p.categories.includes(view.name));
      }
    }
    return list;
  }, [projects, search, view]);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedId) || null,
    [projects, selectedId]
  );

  const activeCategories = useMemo(() => {
    const set = new Set<string>();
    projects.filter((p) => !p.archived).forEach((p) => p.categories.forEach((c) => set.add(c)));
    return [...set].sort();
  }, [projects]);

  const archivedCategories = useMemo(() => {
    const set = new Set<string>();
    projects.filter((p) => p.archived).forEach((p) => p.categories.forEach((c) => set.add(c)));
    return [...set].sort();
  }, [projects]);

  const toggleArchive = async (p: Project) => {
    await update(p.id, { archived: !p.archived });
    if (selectedId === p.id) setSelectedId(null);
  };

  const handleRunAction = async (action: string) => {
    if (selectedProject) {
      await invoke("run_action", { id: selectedProject.id, action });
    }
  };

  const handleStatusChange = (status: Status) => {
    if (selectedProject) update(selectedProject.id, { status });
  };

  return (
    <div className="flex h-screen w-screen bg-white dark:bg-zinc-950">
      <Sidebar
        projects={filtered}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        selectedId={selectedId}
        onSelect={setSelectedId}
        view={view}
        onViewChange={setView}
        activeCategories={activeCategories}
        archivedCategories={archivedCategories}
        archivedCount={projects.filter((p) => p.archived).length}
        onAddProject={() => setShowAddDialog(true)}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      />
      <Workspace
        project={selectedProject}
        onEdit={setEditingProject}
        onArchive={toggleArchive}
        onDelete={(id) => {
          remove(id);
          if (selectedId === id) setSelectedId(null);
        }}
        onAction={handleRunAction}
        onStatusChange={handleStatusChange}
      />
      {showAddDialog && (
        <AddProjectDialog onAdd={add} onClose={() => setShowAddDialog(false)} />
      )}
      {editingProject && (
        <EditProjectDialog
          project={editingProject}
          onUpdate={(id, p) => update(id, p)}
          onClose={() => setEditingProject(null)}
        />
      )}
    </div>
  );
}
