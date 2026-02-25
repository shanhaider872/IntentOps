import React from 'react';
import { Project } from '../types';
import { CLOUD_PROVIDER_ICONS } from '../constants';

interface ProjectListProps {
  projects: Project[];
  selectedProjectId?: string;
  onSelectProject: (project: Project) => void;
  onConnectNew: () => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  onConnectNew,
}) => {
  return (
    <div className="px-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Projects</h3>
        <button
          onClick={onConnectNew}
          className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded transition-colors"
        >
          + New
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-slate-500 text-sm mb-3">No projects connected</p>
          <button
            onClick={onConnectNew}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Connect GitHub Repo →
          </button>
        </div>
      ) : (
        <ul className="space-y-1">
          {projects.map((project) => (
            <li key={project.id}>
              <button
                onClick={() => onSelectProject(project)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                  selectedProjectId === project.id
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-600/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm truncate">{project.name}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-slate-500">
                    {CLOUD_PROVIDER_ICONS[project.cloud_provider] || CLOUD_PROVIDER_ICONS.unknown}
                  </span>
                  {project.detected_frameworks.slice(0, 2).map((fw) => (
                    <span key={fw} className="text-[10px] px-1.5 py-0.5 bg-slate-700 text-slate-400 rounded">
                      {fw}
                    </span>
                  ))}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
