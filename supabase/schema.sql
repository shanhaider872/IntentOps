-- Enable Row Level Security
alter table if exists public.users enable row level security;

-- Users table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Projects table (connected GitHub repositories)
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  full_name text not null, -- owner/repo format
  description text,
  url text not null,
  default_branch text default 'main',
  language text,
  cloud_provider text, -- aws, azure, gcp
  detected_frameworks text[],
  dockerfile_content text,
  terraform_files jsonb,
  cloudformation_files jsonb,
  is_connected boolean default false,
  last_analyzed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Analyses table (AI analysis results)
create table if not exists public.analyses (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  intent text not null, -- cost, performance, balanced, latency, sustainability
  status text default 'pending', -- pending, running, completed, failed
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  error_message text,
  metrics jsonb, -- { monthlySpend, p99Latency, cpuEfficiency, idleResources }
  chart_data jsonb, -- array of { month, current, projected }
  summary text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Recommendations table
create table if not exists public.recommendations (
  id uuid default gen_random_uuid() primary key,
  analysis_id uuid references public.analyses(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  category text not null, -- Compute, Database, Network, Storage
  description text not null,
  savings numeric default 0,
  performance_gain numeric default 0,
  effort text not null, -- Low, Medium, High
  risk text not null, -- Low, Medium, High
  code_patch text,
  terraform_update text,
  is_applied boolean default false,
  applied_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security Policies

-- Profiles: Users can only read/update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Projects: Users can only access their own projects
create policy "Users can view own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can create own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Analyses: Users can only access their own analyses
create policy "Users can view own analyses"
  on public.analyses for select
  using (auth.uid() = user_id);

create policy "Users can create own analyses"
  on public.analyses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own analyses"
  on public.analyses for update
  using (auth.uid() = user_id);

-- Recommendations: Users can only access their own recommendations
create policy "Users can view own recommendations"
  on public.recommendations for select
  using (auth.uid() = user_id);

create policy "Users can create own recommendations"
  on public.recommendations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own recommendations"
  on public.recommendations for update
  using (auth.uid() = user_id);

-- Functions

-- Function to automatically create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'user_name',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at_column();

create trigger update_projects_updated_at
  before update on public.projects
  for each row execute procedure public.update_updated_at_column();
