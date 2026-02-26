export type OptimizationIntent = 'cost' | 'performance' | 'balanced' | 'latency' | 'sustainability';

export type CloudProvider = 'aws' | 'azure' | 'gcp' | 'unknown';

export interface CloudMetric {
  name: string;
  value: number;
  unit: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface Recommendation {
  id: string;
  analysis_id: string;
  project_id: string;
  user_id: string;
  title: string;
  category: 'Compute' | 'Database' | 'Network' | 'Storage';
  description: string;
  savings: number;
  performanceGain: number;
  effort: 'Low' | 'Medium' | 'High';
  risk: 'Low' | 'Medium' | 'High';
  codePatch?: string;
  terraformUpdate?: string;
  createdAt?: string;
}

export interface CostData {
  month: string;
  current: number;
  projected: number;
}

// GitHub Types
export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  default_branch: string;
  language: string | null;
  size: number;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  private: boolean;
  updated_at: string;
}

export interface GitHubFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  content?: string;
  encoding?: string;
}

// Project Types
export interface Project {
  id: string;
  user_id: string;
  name: string;
  full_name: string;
  description: string | null;
  url: string;
  default_branch: string;
  language: string | null;
  cloud_provider: CloudProvider;
  detected_frameworks: string[];
  has_dockerfile: boolean;
  has_terraform: boolean;
  has_cloudformation: boolean;
  has_k8s: boolean;
  repo_size_kb: number;
  file_count: number;
  created_at: string;
  updated_at: string;
}

// Analysis Types
export interface Analysis {
  id: string;
  project_id: string;
  user_id: string;
  intent: OptimizationIntent;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  metrics: CloudMetric[] | null;
  chart_data: CostData[] | null;
  summary: string | null;
  created_at: string;
}

// User Profile
export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  github_username: string | null;
  created_at: string;
  updated_at: string;
}
