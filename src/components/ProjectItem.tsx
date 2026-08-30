import type { Project, Status } from "../types";

const statusDot: Record<Status, string> = {
  developing: "bg-emerald-500",
  paused: "bg-amber-500",
  done: "bg-sky-500",
};

interface ProjectItemProps {
  project: Project;
  selected: boolean;
  onClick: () => void;
}

export function ProjectItem({ project, selected, onClick }: ProjectItemProps) {
  const displayName = project.alias || project.name;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
        selected
          ? "bg-zinc-200 dark:bg-zinc-800"
          : "hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
      }`}
    >
      <div className="flex items-start gap-2.5">
        {/* Icon */}
        <div className="w-8 h-8 mt-0.5 rounded-md bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-zinc-500 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot[project.status]}`} />
            <span className={`text-sm truncate ${
              selected ? "text-zinc-900 dark:text-zinc-100 font-medium" : "text-zinc-800 dark:text-zinc-200"
            }`}>
              {displayName}
            </span>
            {project.archived && (
              <span className="text-[10px] px-1 rounded bg-zinc-300 dark:bg-zinc-600 text-zinc-500 dark:text-zinc-400 flex-shrink-0">
                归档
              </span>
            )}
          </div>
          {project.alias && (
            <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{project.name}</p>
          )}
          <p className="text-[11px] text-zinc-400 dark:text-zinc-600 truncate mt-0.5">
            {project.path}
          </p>
        </div>
      </div>
    </button>
  );
}
