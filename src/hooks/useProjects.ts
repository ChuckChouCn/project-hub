import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { Project, NewProject, UpdateProject } from "../types";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await invoke<Project[]>("list_projects");
      setProjects(data);
    } catch (e) {
      console.error("Failed to load projects:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const add = useCallback(async (p: NewProject) => {
    const created = await invoke<Project>("add_project", { project: p });
    setProjects((prev) => [...prev, created]);
    return created;
  }, []);

  const update = useCallback(async (id: string, p: UpdateProject) => {
    const updated = await invoke<Project>("update_project", { id, update: p });
    setProjects((prev) => prev.map((x) => (x.id === id ? updated : x)));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await invoke<boolean>("delete_project", { id });
    setProjects((prev) => prev.filter((x) => x.id !== id));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { projects, loading, load, add, update, remove };
}
