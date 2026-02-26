import { GitHubRepo, GitHubFile, Project, CloudProvider } from '../types';

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Get GitHub token from localStorage (stored during OAuth login)
 */
function getGitHubToken(): string | null {
  const token = localStorage.getItem('github_token');
  if (!token) {
    console.warn('GitHub token not found in localStorage');
  }
  return token;
}

/**
 * Fetch user's repositories from GitHub
 */
export async function fetchUserRepos(): Promise<GitHubRepo[]> {
  const token = getGitHubToken();
  if (!token) {
    throw new Error('GitHub token not found. Please sign in again.');
  }

  const response = await fetch(`${GITHUB_API_BASE}/user/repos?sort=updated&per_page=100`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (response.status === 401) {
    throw new Error('GitHub authentication failed. Please sign in again.');
  }

  if (response.status === 403) {
    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
    if (rateLimitRemaining === '0') {
      const resetTime = response.headers.get('X-RateLimit-Reset');
      const resetDate = resetTime ? new Date(parseInt(resetTime) * 1000) : null;
      throw new Error(`GitHub API rate limit exceeded. Try again ${resetDate ? resetDate.toLocaleTimeString() : 'later'}.`);
    }
    throw new Error('GitHub API access forbidden. You may need to request more permissions.');
  }

  if (response.status === 404) {
    throw new Error('GitHub user not found. Please check your GitHub account.');
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch repos: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch repository contents
 */
export async function fetchRepoContents(owner: string, repo: string, path: string = ''): Promise<GitHubFile[]> {
  const token = getGitHubToken();
  if (!token) {
    throw new Error('GitHub token not found');
  }

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    }
  );

  if (response.status === 404) {
    // File or directory doesn't exist - return empty array
    console.log(`Path "${path}" not found in ${owner}/${repo}, returning empty array`);
    return [];
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch contents: ${response.statusText}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [data];
}

/**
 * Fetch file content
 */
export async function fetchFileContent(owner: string, repo: string, path: string): Promise<string | null> {
  const token = getGitHubToken();
  if (!token) {
    throw new Error('GitHub token not found');
  }

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    }
  );

  if (response.status === 404) {
    // File doesn't exist - return null gracefully
    console.log(`File "${path}" not found in ${owner}/${repo}`);
    return null;
  }

  if (!response.ok) {
    // For other errors, log but don't throw - return null instead
    console.error(`Failed to fetch file "${path}": ${response.statusText}`);
    return null;
  }

  const data = await response.json();
  if (data.content && data.encoding === 'base64') {
    return atob(data.content);
  }
  return null;
}

/**
 * Detect cloud provider from repository files
 */
export async function detectCloudProvider(owner: string, repo: string): Promise<CloudProvider> {
  const files = await fetchRepoContents(owner, repo);
  const fileNames = files.map(f => f.name.toLowerCase());

  // Check for AWS-specific files
  const awsIndicators = ['.aws', 'serverless.yml', 'sam-template.yaml', 'ec2.tf', 'rds.tf', 's3.tf'];
  if (awsIndicators.some(ind => fileNames.some(f => f.includes(ind)))) {
    return 'aws';
  }

  // Check for Azure-specific files
  const azureIndicators = ['azure-pipelines.yml', 'main.bicep', 'azuredeploy.json', '.azure'];
  if (azureIndicators.some(ind => fileNames.some(f => f.includes(ind)))) {
    return 'azure';
  }

  // Check for GCP-specific files
  const gcpIndicators = ['cloudbuild.yaml', 'app.yaml', 'main.tf', 'gcp.tf', '.gcloud'];
  if (gcpIndicators.some(ind => fileNames.some(f => f.includes(ind)))) {
    return 'gcp';
  }

  // Check file contents for provider indicators
  const dockerfile = await fetchFileContent(owner, repo, 'Dockerfile');
  if (dockerfile) {
    if (dockerfile.includes('amazonaws.com') || dockerfile.includes('aws')) return 'aws';
    if (dockerfile.includes('azurecr.io') || dockerfile.includes('azure')) return 'azure';
    if (dockerfile.includes('gcr.io') || dockerfile.includes('google')) return 'gcp';
  }

  return 'unknown';
}

/**
 * Detect frameworks and technologies
 */
export async function detectFrameworks(owner: string, repo: string): Promise<string[]> {
  const frameworks: string[] = [];
  const files = await fetchRepoContents(owner, repo);
  const fileNames = files.map(f => f.name.toLowerCase());

  // Framework detection
  if (fileNames.includes('package.json')) frameworks.push('Node.js');
  if (fileNames.includes('requirements.txt')) frameworks.push('Python');
  if (fileNames.includes('gemfile')) frameworks.push('Ruby');
  if (fileNames.includes('pom.xml')) frameworks.push('Java/Maven');
  if (fileNames.includes('build.gradle')) frameworks.push('Java/Gradle');
  if (fileNames.includes('go.mod')) frameworks.push('Go');
  if (fileNames.includes('cargo.toml')) frameworks.push('Rust');
  if (fileNames.includes('composer.json')) frameworks.push('PHP');

  // Check package.json for specific frameworks
  const packageJson = await fetchFileContent(owner, repo, 'package.json');
  if (packageJson) {
    try {
      const pkg = JSON.parse(packageJson);
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      if (deps.react) frameworks.push('React');
      if (deps.vue) frameworks.push('Vue');
      if (deps.angular) frameworks.push('Angular');
      if (deps.next) frameworks.push('Next.js');
      if (deps.nuxt) frameworks.push('Nuxt.js');
      if (deps.express) frameworks.push('Express');
      if (deps.nestjs) frameworks.push('NestJS');
      if (deps.django) frameworks.push('Django');
      if (deps.flask) frameworks.push('Flask');
      if (deps.fastapi) frameworks.push('FastAPI');
    } catch (e) {
      // Ignore parse errors
    }
  }

  // Check requirements.txt for Python frameworks
  const requirements = await fetchFileContent(owner, repo, 'requirements.txt');
  if (requirements) {
    if (requirements.includes('django')) frameworks.push('Django');
    if (requirements.includes('flask')) frameworks.push('Flask');
    if (requirements.includes('fastapi')) frameworks.push('FastAPI');
    if (requirements.includes('odoo')) frameworks.push('Odoo');
  }

  return [...new Set(frameworks)];
}

/**
 * Check for infrastructure files
 */
export async function checkInfrastructureFiles(owner: string, repo: string): Promise<{
  hasDockerfile: boolean;
  hasTerraform: boolean;
  hasCloudFormation: boolean;
  hasK8s: boolean;
}> {
  const files = await fetchRepoContents(owner, repo);
  const fileNames = files.map(f => f.name.toLowerCase());

  // Check root level
  let hasDockerfile = fileNames.includes('dockerfile') || fileNames.includes('docker-compose.yml');
  let hasTerraform = fileNames.some(f => f.endsWith('.tf'));
  let hasCloudFormation = fileNames.some(f => f.includes('cloudformation') || f.includes('sam-template'));
  let hasK8s = fileNames.some(f => f.includes('k8s') || f.includes('kubernetes') || f.endsWith('.yaml') || f.endsWith('.yml'));

  // Check for terraform directory (if not already found)
  if (!hasTerraform) {
    try {
      const terraformFiles = await fetchRepoContents(owner, repo, 'terraform');
      hasTerraform = terraformFiles.length > 0;
    } catch (e) {
      // Directory doesn't exist or access denied - that's fine
      console.log(`No terraform directory found in ${owner}/${repo}`);
    }
  }

  // Check for k8s directory (if not already found)
  if (!hasK8s) {
    try {
      const k8sFiles = await fetchRepoContents(owner, repo, 'k8s');
      hasK8s = k8sFiles.length > 0;
    } catch (e) {
      // Directory doesn't exist or access denied - that's fine
      console.log(`No k8s directory found in ${owner}/${repo}`);
    }
  }

  // Also check for 'kubernetes' directory
  if (!hasK8s) {
    try {
      const k8sFiles = await fetchRepoContents(owner, repo, 'kubernetes');
      hasK8s = k8sFiles.length > 0;
    } catch (e) {
      // Directory doesn't exist - that's fine
    }
  }

  return {
    hasDockerfile,
    hasTerraform,
    hasCloudFormation,
    hasK8s,
  };
}

/**
 * Analyze repository and create project data
 */
export async function analyzeRepository(repo: GitHubRepo): Promise<Partial<Project>> {
  const [owner, name] = repo.full_name.split('/');

  const [
    cloudProvider,
    frameworks,
    infraFiles,
  ] = await Promise.all([
    detectCloudProvider(owner, name),
    detectFrameworks(owner, name),
    checkInfrastructureFiles(owner, name),
  ]);

  return {
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description,
    url: repo.html_url,
    default_branch: repo.default_branch,
    language: repo.language,
    cloud_provider: cloudProvider,
    detected_frameworks: frameworks,
    ...infraFiles,
    repo_size_kb: repo.size,
    file_count: 0, // Would need tree API to get accurate count
  };
}

/**
 * Get repository file count (approximate)
 */
export async function getRepoFileCount(owner: string, repo: string): Promise<number> {
  const token = getGitHubToken();
  if (!token) return 0;

  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (response.status === 404) {
      // Repository or tree not found - return 0
      console.log(`Repository tree not found for ${owner}/${repo}`);
      return 0;
    }

    if (!response.ok) {
      console.error(`Failed to get file count: ${response.statusText}`);
      return 0;
    }

    const data = await response.json();
    return data.tree?.length || 0;
  } catch (e) {
    console.error(`Error getting file count for ${owner}/${repo}:`, e);
    return 0;
  }
}
