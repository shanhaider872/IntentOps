import React, { useState, useEffect } from 'react';
import { fetchUserRepos, analyzeRepository, getRepoFileCount } from '../services/githubService';
import { createProject } from '../services/projectService';
import { GitHubRepo, Project } from '../types';
import { useAuth } from '../context/AuthContext';

interface ConnectProjectProps {
  onProjectConnected: (project: Project) => void;
  onClose: () => void;
}

export const ConnectProject: React.FC<ConnectProjectProps> = ({ onProjectConnected, onClose }) => {
  const { user } = useAuth();
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRepos();
  }, []);

  const loadRepos = async () => {
    try {
      setLoading(true);
      const userRepos = await fetchUserRepos();
      setRepos(userRepos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load repositories');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (repo: GitHubRepo) => {
    if (!user) return;
    
    setConnecting(repo.full_name);
    setError(null);

    try {
      // Analyze repository
      const [repoAnalysis, fileCount] = await Promise.all([
        analyzeRepository(repo),
        getRepoFileCount(repo.full_name.split('/')[0], repo.name),
      ]);

      // Create project in database
      const project = await createProject({
        user_id: user.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        url: repo.html_url,
        default_branch: repo.default_branch,
        language: repo.language,
        cloud_provider: repoAnalysis.cloud_provider || 'unknown',
        detected_frameworks: repoAnalysis.detected_frameworks || [],
        has_dockerfile: repoAnalysis.has_dockerfile || false,
        has_terraform: repoAnalysis.has_terraform || false,
        has_cloudformation: repoAnalysis.has_cloudformation || false,
        has_k8s: repoAnalysis.has_k8s || false,
        repo_size_kb: repo.size,
        file_count: fileCount,
      });

      onProjectConnected(project);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect repository');
    } finally {
      setConnecting(null);
    }
  };

  const filteredRepos = repos.filter(repo => 
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 max-w-2xl w-full mx-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-300">Loading your repositories...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Connect GitHub Repository</h2>
            <p className="text-slate-400 mt-1">Select a repository to analyze for optimizations</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search repositories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="overflow-y-auto flex-1 space-y-2">
          {filteredRepos.map((repo) => (
            <div 
              key={repo.id}
              className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-indigo-500/30 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white">{repo.name}</span>
                    {repo.private && (
                      <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded-full">
                        Private
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm mb-2">{repo.full_name}</p>
                  {repo.description && (
                    <p className="text-slate-500 text-sm mb-2">{repo.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    {repo.language && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        {repo.language}
                      </span>
                    )}
                    <span>⭐ {repo.stargazers_count}</span>
                    <span>🍴 {repo.forks_count}</span>
                    <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleConnect(repo)}
                  disabled={connecting === repo.full_name}
                  className="ml-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-lg font-medium transition-all"
                >
                  {connecting === repo.full_name ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing...
                    </span>
                  ) : (
                    'Connect'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800 text-center text-slate-500 text-sm">
          Showing {filteredRepos.length} of {repos.length} repositories
        </div>
      </div>
    </div>
  );
};
