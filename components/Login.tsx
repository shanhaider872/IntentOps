import React from 'react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { signInWithGitHub, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center font-bold text-3xl text-white shadow-lg shadow-indigo-500/20 mx-auto mb-6">
            IO
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4">IntentOps AI</h1>
          <p className="text-slate-400 text-lg">
            AI-powered cloud optimization for your infrastructure
          </p>
        </div>

        <div className="bg-slate-900/50 rounded-3xl p-8 border border-slate-800">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Connect Your GitHub
          </h2>
          
          <p className="text-slate-400 text-center mb-8">
            Sign in with GitHub to analyze your repositories and get AI-powered cloud optimization recommendations.
          </p>

          <button
            onClick={signInWithGitHub}
            disabled={isLoading}
            className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="animate-pulse">Connecting...</span>
            ) : (
              <>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                Sign in with GitHub
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              By signing in, you agree to analyze your repositories for cloud optimization opportunities.
            </p>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-4 text-center">
          <div className="p-4">
            <div className="text-3xl mb-2">🔍</div>
            <p className="text-slate-400 text-sm">Analyze Code</p>
          </div>
          <div className="p-4">
            <div className="text-3xl mb-2">☁️</div>
            <p className="text-slate-400 text-sm">Detect Cloud</p>
          </div>
          <div className="p-4">
            <div className="text-3xl mb-2">🚀</div>
            <p className="text-slate-400 text-sm">Optimize</p>
          </div>
        </div>
      </div>
    </div>
  );
};
