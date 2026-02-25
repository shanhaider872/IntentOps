import React, { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Sidebar } from './components/Sidebar';
import { RecommendationCard } from './components/RecommendationCard';
import { generateRecommendations } from './services/geminiService';
import { OptimizationIntent, Recommendation, CloudMetric, CostData, Project, Analysis } from './types';
import { useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { ConnectProject } from './components/ConnectProject';
import { ProjectDetail } from './components/ProjectDetail';
import { getUserProjects, getProjectRecommendations } from './services/projectService';
import { INTENT_OPTIONS } from './constants';

const App: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [intent, setIntent] = useState<OptimizationIntent>('balanced');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [metrics, setMetrics] = useState<CloudMetric[]>([]);
  const [chartData, setChartData] = useState<CostData[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(true);

  // Load user projects
  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;
    try {
      setProjectsLoading(true);
      const userProjects = await getUserProjects(user.id);
      setProjects(userProjects);
      if (userProjects.length > 0 && !selectedProject) {
        setSelectedProject(userProjects[0]);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setProjectsLoading(false);
    }
  };

  // Load recommendations when project or intent changes
  useEffect(() => {
    if (selectedProject) {
      loadRecommendations();
    }
  }, [selectedProject, intent]);

  const loadRecommendations = async () => {
    if (!selectedProject) return;
    setLoading(true);
    try {
      const projectRecommendations = await getProjectRecommendations(selectedProject.id);
      setRecommendations(projectRecommendations);
      
      // Generate mock metrics based on project data
      const mockMetrics: CloudMetric[] = [
        { name: 'Monthly Spend', value: Math.round(selectedProject.repo_size_kb / 100), unit: '$', change: 12.5, trend: 'up' },
        { name: 'P99 Latency', value: selectedProject.file_count > 100 ? 245 : 120, unit: 'ms', change: -5.2, trend: 'down' },
        { name: 'CPU Efficiency', value: selectedProject.has_dockerfile ? 45 : 34, unit: '%', change: -2.1, trend: 'down' },
        { name: 'Idle Resources', value: selectedProject.has_terraform ? 12 : 18, unit: 'units', change: 8.4, trend: 'up' },
      ];
      setMetrics(mockMetrics);

      // Generate mock chart data
      const mockChartData: CostData[] = [
        { month: 'Jan', current: 8200, projected: 7800 },
        { month: 'Feb', current: 9100, projected: 8100 },
        { month: 'Mar', current: 10500, projected: 8500 },
        { month: 'Apr', current: Math.round(selectedProject.repo_size_kb / 100) * 100, projected: 6200 },
      ];
      setChartData(mockChartData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyRec = (id: string) => {
    alert(`Initiating Auto-Refactor for: ${id}. Integrating with GitHub repository...`);
  };

  const handleProjectConnected = (project: Project) => {
    setProjects(prev => [project, ...prev]);
    setSelectedProject(project);
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setActiveTab('dashboard');
  };

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      {!selectedProject ? (
        <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">No Project Selected</h2>
          <p className="text-slate-400 mb-6">Connect a GitHub repository to start analyzing for optimizations.</p>
          <button 
            onClick={() => setShowConnectModal(true)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all"
          >
            Connect GitHub Repository
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((m) => (
              <div key={m.name} className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
                <p className="text-slate-400 text-sm font-medium mb-1">{m.name}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-white">
                    {m.unit === '$' ? `$${m.value.toLocaleString()}` : `${m.value}${m.unit}`}
                  </h3>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                    m.trend === 'up' ? 'text-rose-400 bg-rose-500/10' : 'text-emerald-400 bg-emerald-500/10'
                  }`}>
                    {m.trend === 'up' ? '↑' : '↓'} {Math.abs(m.change)}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
              <h3 className="text-lg font-bold text-white mb-6">Cost Projection</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Area type="monotone" dataKey="current" stroke="#6366f1" fillOpacity={1} fill="url(#colorCurrent)" name="Current" />
                    <Area type="monotone" dataKey="projected" stroke="#10b981" fillOpacity={1} fill="url(#colorProjected)" name="Optimized" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
              <h3 className="text-lg font-bold text-white mb-6">Resource Utilization</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'CPU', value: 65 },
                    { name: 'Memory', value: 82 },
                    { name: 'Storage', value: 45 },
                    { name: 'Network', value: 78 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderIntentHub = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-slate-800/40 p-8 rounded-2xl border border-slate-700/50">
        <h2 className="text-2xl font-bold text-white mb-4">Select Optimization Intent</h2>
        <p className="text-slate-400 mb-8">Choose your primary goal for AI-powered recommendations.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {INTENT_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => setIntent(option.id as OptimizationIntent)}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                intent === option.id 
                  ? 'border-indigo-500 bg-indigo-500/10' 
                  : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="text-3xl mb-3">{option.icon}</div>
              <h3 className="font-bold text-white mb-2">{option.label}</h3>
              <p className="text-sm text-slate-400">{option.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRecommendations = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">AI Recommendations</h2>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Intent:</span>
          <span className="px-3 py-1 bg-indigo-600/20 text-indigo-400 rounded-full text-sm font-medium capitalize">
            {intent}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : recommendations.length === 0 ? (
        <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-12 text-center">
          <p className="text-slate-400 mb-4">No recommendations yet.</p>
          {selectedProject ? (
            <button 
              onClick={() => setActiveTab('intent')}
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Select an intent and run analysis →
            </button>
          ) : (
            <button 
              onClick={() => setShowConnectModal(true)}
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Connect a project first →
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {recommendations.map((rec) => (
            <RecommendationCard key={rec.id} rec={rec} onApply={handleApplyRec} />
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'intent': return renderIntentHub();
      case 'recs': return renderRecommendations();
      case 'refactor': return (
        <div className="bg-slate-800/40 p-12 rounded-2xl border border-slate-700/50 text-center animate-in fade-in duration-500">
          <div className="text-6xl mb-6">🚀</div>
          <h2 className="text-3xl font-bold text-white mb-4">Auto-Refactor (Beta)</h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-8">
            Connect your GitHub repository to allow IntentOps AI to automatically generate Pull Requests for code and infrastructure optimizations.
          </p>
          <button 
            onClick={() => setShowConnectModal(true)}
            className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 transition-all"
          >
            Connect GitHub Repository
          </button>
        </div>
      );
      case 'sim': return (
        <div className="bg-slate-800/40 p-12 rounded-2xl border border-slate-700/50 text-center animate-in fade-in duration-500">
          <div className="text-6xl mb-6">🧪</div>
          <h2 className="text-3xl font-bold text-white mb-4">Simulations</h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-8">
            Test optimization scenarios before applying them to your infrastructure.
          </p>
          {selectedProject ? (
            <ProjectDetail project={selectedProject} />
          ) : (
            <button 
              onClick={() => setShowConnectModal(true)}
              className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 transition-all"
            >
              Connect Project to Simulate
            </button>
          )}
        </div>
      );
      default: return renderDashboard();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={handleSelectProject}
        onConnectProject={() => setShowConnectModal(true)}
      />
      
      <main className="ml-64 p-10 min-h-screen">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
            <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Context:</span>
            <span className="text-indigo-400 font-bold text-sm">
              {selectedProject ? selectedProject.full_name : 'No Project Selected'}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              <img src="https://picsum.photos/32/32?random=1" className="w-8 h-8 rounded-full border-2 border-slate-950" />
              <img src="https://picsum.photos/32/32?random=2" className="w-8 h-8 rounded-full border-2 border-slate-950" />
              <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold">+3</div>
            </div>
            <button className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 hover:border-slate-500 transition-all relative">
              🔔
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-slate-950"></span>
            </button>
            <div className="h-10 w-px bg-slate-800"></div>
            <button 
              onClick={() => {/* TODO: Add user menu */}}
              className="flex items-center gap-3 bg-slate-800/80 hover:bg-slate-700 p-1.5 pr-4 rounded-xl border border-slate-700 transition-all"
            >
              <img src={user.user_metadata?.avatar_url || "https://picsum.photos/32/32?random=10"} className="w-8 h-8 rounded-lg" />
              <span className="text-sm font-bold">{user.user_metadata?.full_name || user.email}</span>
            </button>
          </div>
        </header>

        {renderContent()}
      </main>

      {showConnectModal && (
        <ConnectProject 
          onProjectConnected={handleProjectConnected}
          onClose={() => setShowConnectModal(false)}
        />
      )}
    </div>
  );
};

export default App;
