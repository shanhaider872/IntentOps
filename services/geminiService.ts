import { GoogleGenAI, Type } from "@google/genai";
import { OptimizationIntent, Recommendation, Project } from "../types";

const ai = new GoogleGenAI({ apiKey: (import.meta as any).env.GEMINI_API_KEY || '' });

export async function generateRecommendations(
  intent: OptimizationIntent, 
  project?: Project
): Promise<Recommendation[]> {
  
  // Build context from project data if available
  let projectContext = '';
  if (project) {
    projectContext = `
Project Context:
- Repository: ${project.full_name}
- Language: ${project.language || 'Unknown'}
- Cloud Provider: ${project.cloud_provider}
- Frameworks: ${project.detected_frameworks.join(', ') || 'None detected'}
- Infrastructure: ${
  [
    project.has_dockerfile && 'Docker',
    project.has_terraform && 'Terraform',
    project.has_cloudformation && 'CloudFormation',
    project.has_k8s && 'Kubernetes'
  ].filter(Boolean).join(', ') || 'None detected'
}
- Repository Size: ${(project.repo_size_kb / 1024).toFixed(2)} MB
- Files: ${project.file_count}
`;
  }

  const prompt = `
You are an expert cloud infrastructure optimizer. Analyze the following project and provide optimization recommendations.

${projectContext}

Optimization Intent: ${intent}

Based on the intent "${intent}" and the project context above, provide 3-5 high-impact, actionable architectural or code-level recommendations.

For each recommendation, include:
1. A clear title
2. Category (Compute, Database, Network, or Storage)
3. Detailed description
4. Estimated monthly savings in USD
5. Performance gain percentage
6. Implementation effort (Low, Medium, High)
7. Risk level (Low, Medium, High)
8. Optional code patch showing the change
9. Optional Terraform/IaC update

Format your response as a JSON array of recommendations.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              category: { type: Type.STRING },
              description: { type: Type.STRING },
              savings: { type: Type.NUMBER },
              performanceGain: { type: Type.NUMBER },
              effort: { type: Type.STRING },
              risk: { type: Type.STRING },
              codePatch: { type: Type.STRING },
              terraformUpdate: { type: Type.STRING },
            },
            required: ["id", "title", "category", "description", "savings", "performanceGain", "effort", "risk"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const parsed = JSON.parse(text) as Array<Partial<Recommendation>>;
    
    // Ensure all required fields are present
    return parsed.map((rec, index) => ({
      id: rec.id || `rec-${index}`,
      analysis_id: '', // Will be set by caller
      project_id: project?.id || '',
      user_id: '', // Will be set by caller
      title: rec.title || 'Untitled Recommendation',
      category: (rec.category as any) || 'Compute',
      description: rec.description || '',
      savings: rec.savings || 0,
      performanceGain: rec.performanceGain || 0,
      effort: (rec.effort as any) || 'Medium',
      risk: (rec.risk as any) || 'Medium',
      codePatch: rec.codePatch,
      terraformUpdate: rec.terraformUpdate,
    }));
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    
    // Return fallback recommendations based on intent
    return getFallbackRecommendations(intent, project);
  }
}

function getFallbackRecommendations(intent: OptimizationIntent, project?: Project): Recommendation[] {
  const baseRecs: Recommendation[] = [
    {
      id: 'fallback-1',
      analysis_id: '',
      project_id: project?.id || '',
      user_id: '',
      title: 'Enable Container Image Optimization',
      category: 'Compute',
      description: 'Optimize Docker images by using multi-stage builds and smaller base images to reduce deployment time and costs.',
      savings: 450,
      performanceGain: 15,
      effort: 'Medium',
      risk: 'Low',
      codePatch: `# Multi-stage build example
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --only=production
CMD ["node", "dist/index.js"]`,
      terraformUpdate: project?.has_terraform ? `# Update ECS task definition
resource "aws_ecs_task_definition" "app" {
  family                   = "optimized-app"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"  # Reduced from 512
  memory                   = "512"  # Reduced from 1024
  container_definitions    = jsonencode([{
    name  = "app"
    image = "\${aws_ecr_repository.app.repository_url}:latest"
    # Add resource constraints
    ulimits = [{
      name      = "nofile"
      softLimit = 65536
      hardLimit = 65536
    }]
  }])
}` : undefined,
    },
    {
      id: 'fallback-2',
      analysis_id: '',
      project_id: project?.id || '',
      user_id: '',
      title: 'Implement Auto-Scaling Policies',
      category: 'Compute',
      description: 'Add CPU and memory-based auto-scaling to handle traffic spikes efficiently and reduce idle resource costs.',
      savings: 890,
      performanceGain: 25,
      effort: 'Medium',
      risk: 'Medium',
    },
    {
      id: 'fallback-3',
      analysis_id: '',
      project_id: project?.id || '',
      user_id: '',
      title: 'Enable CDN for Static Assets',
      category: 'Network',
      description: 'Use CloudFront or similar CDN to cache and serve static assets closer to users, reducing latency and origin load.',
      savings: 320,
      performanceGain: 40,
      effort: 'Low',
      risk: 'Low',
    },
  ];

  // Customize based on intent
  if (intent === 'cost') {
    baseRecs.push({
      id: 'fallback-cost',
      analysis_id: '',
      project_id: project?.id || '',
      user_id: '',
      title: 'Rightsize EC2 Instances',
      category: 'Compute',
      description: 'Analyze current CPU/memory utilization and downsize over-provisioned instances. Consider Graviton2/3 for better price-performance.',
      savings: 1200,
      performanceGain: 5,
      effort: 'Medium',
      risk: 'Medium',
    });
  } else if (intent === 'performance') {
    baseRecs.push({
      id: 'fallback-perf',
      analysis_id: '',
      project_id: project?.id || '',
      user_id: '',
      title: 'Implement Redis Caching Layer',
      category: 'Database',
      description: 'Add Redis/ElastiCache to cache frequently accessed data and reduce database load.',
      savings: 200,
      performanceGain: 60,
      effort: 'High',
      risk: 'Medium',
    });
  }

  return baseRecs;
}
