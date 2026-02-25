import { supabase } from './supabaseClient';
import { Project, Analysis, Recommendation, OptimizationIntent, CloudMetric, CostData } from '../types';

export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: project.user_id,
      name: project.name,
      full_name: project.full_name,
      description: project.description || '',
      url: project.url,
      default_branch: project.default_branch,
      language: project.language || '',
      cloud_provider: project.cloud_provider || 'unknown',
      detected_frameworks: project.detected_frameworks,
      has_dockerfile: project.has_dockerfile,
      has_terraform: project.has_terraform,
      has_cloudformation: project.has_cloudformation,
      has_k8s: project.has_k8s,
      repo_size_kb: project.repo_size_kb,
      file_count: project.file_count,
    })
    .select()
    .single();

  if (error) throw error;
  
  return data as unknown as Project;
}

export async function getUserProjects(userId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  return (data || []) as unknown as Project[];
}

export async function getProjectById(projectId: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) return null;
  
  return data as unknown as Project;
}

export async function deleteProject(projectId: string): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) throw error;
}

export async function updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)
    .select()
    .single();

  if (error) throw error;
  
  return data as unknown as Project;
}

// Analysis operations
export async function createAnalysis(analysis: Omit<Analysis, 'id' | 'created_at'>): Promise<Analysis> {
  const { data, error } = await supabase
    .from('analyses')
    .insert({
      project_id: analysis.project_id,
      user_id: analysis.user_id,
      intent: analysis.intent,
      status: analysis.status,
      started_at: analysis.started_at,
      completed_at: analysis.completed_at,
      error_message: analysis.error_message,
      metrics: analysis.metrics as any,
      chart_data: analysis.chart_data as any,
      summary: analysis.summary,
    })
    .select()
    .single();

  if (error) throw error;
  
  return data as unknown as Analysis;
}

export async function getProjectAnalyses(projectId: string): Promise<Analysis[]> {
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  return (data || []) as unknown as Analysis[];
}

export async function getAnalysisById(analysisId: string): Promise<Analysis | null> {
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('id', analysisId)
    .single();

  if (error) return null;
  
  return data as unknown as Analysis;
}

export async function updateAnalysisStatus(
  analysisId: string, 
  status: Analysis['status'], 
  updates?: Partial<Analysis>
): Promise<void> {
  const { error } = await supabase
    .from('analyses')
    .update({ 
      status, 
      ...updates,
      completed_at: status === 'completed' || status === 'failed' ? new Date().toISOString() : undefined,
    } as any)
    .eq('id', analysisId);

  if (error) throw error;
}

// Recommendation operations
export async function saveRecommendations(
  recommendations: Omit<Recommendation, 'id' | 'created_at'>[]
): Promise<void> {
  const recommendationsToInsert = recommendations.map(rec => ({
    analysis_id: rec.analysis_id,
    project_id: rec.project_id,
    user_id: rec.user_id,
    title: rec.title,
    category: rec.category,
    description: rec.description,
    savings: rec.savings,
    performance_gain: rec.performanceGain,
    effort: rec.effort,
    risk: rec.risk,
    code_patch: rec.codePatch,
    terraform_update: rec.terraformUpdate,
  }));

  const { error } = await supabase
    .from('recommendations')
    .insert(recommendationsToInsert as any);

  if (error) throw error;
}

export async function getAnalysisRecommendations(analysisId: string): Promise<Recommendation[]> {
  const { data, error } = await supabase
    .from('recommendations')
    .select('*')
    .eq('analysis_id', analysisId)
    .order('savings', { ascending: false });

  if (error) throw error;
  
  return (data || []).map(r => ({
    ...r,
    performanceGain: r.performance_gain,
    codePatch: r.code_patch,
    terraformUpdate: r.terraform_update,
    createdAt: r.created_at,
  })) as unknown as Recommendation[];
}

export async function getProjectRecommendations(projectId: string): Promise<Recommendation[]> {
  const { data, error } = await supabase
    .from('recommendations')
    .select('*')
    .eq('project_id', projectId)
    .order('savings', { ascending: false });

  if (error) throw error;
  
  return (data || []).map(r => ({
    ...r,
    performanceGain: r.performance_gain,
    codePatch: r.code_patch,
    terraformUpdate: r.terraform_update,
    createdAt: r.created_at,
  })) as unknown as Recommendation[];
}
