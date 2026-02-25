import React from 'react';
import { Project } from '../types';
import { ProjectList } from './ProjectList';

const navItems = [
  { icon: '📊', label: 'Dashboard', id: 'dashboard' },
  { icon: '🎯', label: 'Intent Hub', id: 'intent' },
  { icon: '🛠️', label: 'Recommendations', id: 'recs' },
  { icon: '🚀', label: 'Auto-Refactor', id: 'refactor' },
  { icon: '🧪', label: 'Simulations', id: 'sim' },
  { icon: '⚙️', label: 'Integrations', id: 'settings' },
];

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
  onConnectProject: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab,
  projects,
  selectedProject,
  onSelectProject,
  onConnectProject
}) => {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20">
            IO
          </div>
          <div>
            <h1 className="font-bold text-lg text-white">IntentOps</h1>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">AI Optimizer</span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 py-6 px-3 overflow-y-auto">
        <ul className="space-y-1 mb-6">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  activeTab === item.id 
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* Project Management Section */}
        <div className="border-t border-slate-800 pt-4">
          <ProjectList 
            projects={projects}
            selectedProjectId={selectedProject?.id}
            onSelectProject={onSelectProject}
            onConnectNew={onConnectProject}
          />
        </div>
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <p className="text-xs text-slate-400 mb-2">Cloud Connectivity</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm font-medium text-slate-200 uppercase tracking-tight">
              {selectedProject?.cloud_provider || 'No Provider'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
