import React, { useState, useEffect } from 'react';
import { Project, Analysis, OptimizationIntent } from '../types';
import { getProjectAnalyses, createAnalysis, updateAnalysisStatus, saveRecommendations } from '../services/projectService';
import { generateRecommendations } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';
import { CLOUD_PROVIDER_COLORS } from '../constants';

interface ProjectDetailProps {
  project: Project;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ project }) => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningAnalysis, setRunningAnalysis] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState<OptimizationIntent>('balanced');

  useEffect(() => {
    loadAnalyses();
  }, [project.id]);

  const loadAnalyses = async () => {
    try {
      const data = await getProjectAnalyses(project.id);
      setAnalyses(data);
    } catch (err) {
      console.error('Failed to load analyses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!user) return;

    setRunningAnalysis(true);
    try {
      // Create analysis record
      const analysis = await createAnalysis({
        project_id: project.id,
        user_id: user.id,
        intent: selectedIntent,
        status: 'running',
        started_at: new Date().toISOString(),
        completed_at: null,
        error_message: null,
        metrics: null,
        chart_data: null,
        summary: null,
      });

      // Generate recommendations
      const recommendations = await generateRecommendations(selectedIntent, project);

      // Save recommendations
      const recommendationsWithIds = recommendations.map(rec => ({
        ...rec,
        analysis_id: analysis.id,
        project_id: project.id,
        user_id: user.id,
      }));

      await saveRecommendations(recommendationsWithIds);

      // Update analysis as completed
      await updateAnalysisStatus(analysis.id, 'completed', {
        completed_at: new Date().toISOString(),
      });

      // Reload analyses
      await loadAnalyses();
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setRunningAnalysis(false);
    }
  };

  const getStatusColor = (status: Analysis['status']) => {
    switch (status) {
      case 'completed': return 'text-emerald-400 bg-emerald-500/10';
      case 'running': return 'text-amber-400 bg-amber-500/10';
      case 'failed': return 'text-rose-400 bg-rose-500/10';
      default: return 'text-slate-400 bg-slate-500/10';
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400">Loading project details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Info Card */}
      <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{project.name}</h2>
            <p className="text-slate-400">{project.full_name}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${CLOUD_PROVIDER_COLORS[project.cloud_provider]}`}>
            {project.cloud_provider.toUpperCase()}
          </span>
        </div>

        {project.description && (
          <p className="text-slate-300 mb-4">{project.description}</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-slate-900/50 rounded-lg p-3">
            <p className="text-xs text-slate-500 uppercase">Language</p>
            <p className="text-white font-medium">{project.language || 'Unknown'}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <p className="text-xs text-slate-500 uppercase">Size</p>
            <p className="text-white font-medium">{(project.repo_size_kb / 1024).toFixed(2)} MB</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <p className="text-xs text-slate-500 uppercase">Files</p>
            <p className="text-white font-medium">{project.file_count}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <p className="text-xs text-slate-500 uppercase">Branch</p>
            <p className="text-white font-medium">{project.default_branch}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {project.detected_frameworks.map((fw) => (
            <span key={fw} className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-xs rounded-full border border-indigo-500/20">
              {fw}
            </span>
          ))}
          {project.has_dockerfile && (
            <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full border border-blue-500/20">
              🐳 Dockerfile
            </span>
          )}
          {project.has_terraform && (
            <span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-full border border-purple-500/20">
              🏗️ Terraform
            </span>
          )}
          {project.has_cloudformation && (
            <span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs rounded-full border border-amber-500/20">
              ☁️ CloudFormation
            </span>
          )}
          {project.has_k8s && (
            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full border border-emerald-500/20">
              ⚓ Kubernetes
            </span>
          )}
        </div>
      </div>

      {/* Run Analysis Section */}
      <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Run AI Analysis</h3>
        
        <div className="flex flex-wrap gap-3 mb-4">
          {(['cost', 'performance', 'balanced', 'latency', 'sustainability'] as OptimizationIntent[]).map((intent) => (
            <button
              key={intent}
              onClick={() => setSelectedIntent(intent)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedIntent === intent
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {intent.charAt(0).toUpperCase() + intent.slice(1)}
            </button>
          ))}
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={runningAnalysis}
          className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {runningAnalysis ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Running Analysis...
            </>
          ) : (
            <>
              🚀 Run {selectedIntent.charAt(0).toUpperCase() + selectedIntent.slice(1)} Analysis
            </>
          )}
        </button>
      </div>

      {/* Analysis History */}
      <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Analysis History</h3>
        
        {analyses.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No analyses run yet. Start your first analysis above!</p>
        ) : (
          <div className="space-y-3">
            {analyses.map((analysis) => (
              <div key={analysis.id} className="bg-slate-900/50 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-medium text-white capitalize">{analysis.intent}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${getStatusColor(analysis.status)}`}>
                      {analysis.status}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm">
                    {new Date(analysis.created_at).toLocaleString()}
                  </p>
                </div>
                {analysis.status === 'completed' && (
                  <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                    View Results →
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
