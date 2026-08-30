export type Status = "developing" | "paused" | "done";

export interface Project {
  id: string;
  name: string;
  alias: string;
  path: string;
  categories: string[];
  description: string;
  archived: boolean;
  status: Status;
  created_at: string;
  updated_at: string;
}

export interface NewProject {
  name: string;
  alias: string;
  path: string;
  categories: string[];
  description: string;
}

export interface UpdateProject {
  name?: string;
  alias?: string;
  path?: string;
  categories?: string[];
  description?: string;
  archived?: boolean;
  status?: Status;
}

export interface ActionDef {
  key: string;
  label: string;
  icon: string;
}
