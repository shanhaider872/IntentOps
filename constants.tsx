// Category colors for recommendation cards
export const CATEGORY_COLORS: Record<string, string> = {
  Compute: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Database: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Network: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Storage: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

// Cloud provider icons
export const CLOUD_PROVIDER_ICONS: Record<string, string> = {
  aws: '☁️ AWS',
  azure: '☁️ Azure',
  gcp: '☁️ GCP',
  unknown: '❓ Unknown',
};

// Cloud provider colors
export const CLOUD_PROVIDER_COLORS: Record<string, string> = {
  aws: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  azure: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  gcp: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  unknown: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
};

// Intent options for the intent selector
export const INTENT_OPTIONS = [
  { id: 'cost', label: 'Minimize Cost', icon: '💰', desc: 'Aggressive downsizing and serverless migration.' },
  { id: 'performance', label: 'Maximize Performance', icon: '⚡', desc: 'Prioritize low latency and high availability.' },
  { id: 'balanced', label: 'Balanced', icon: '⚖️', desc: 'Sweet spot between savings and system health.' },
  { id: 'latency', label: 'Reduce Latency', icon: '⏱️', desc: 'Focus on edge delivery and cache optimization.' },
  { id: 'sustainability', label: 'Sustainability', icon: '🌿', desc: 'Optimize for lowest carbon footprint regions.' },
];

// Navigation items
export const NAV_ITEMS = [
  { icon: '📊', label: 'Dashboard', id: 'dashboard' },
  { icon: '🎯', label: 'Intent Hub', id: 'intent' },
  { icon: '🛠️', label: 'Recommendations', id: 'recs' },
  { icon: '🚀', label: 'Auto-Refactor', id: 'refactor' },
  { icon: '🧪', label: 'Simulations', id: 'sim' },
  { icon: '⚙️', label: 'Integrations', id: 'settings' },
];
