
export interface UserPreferences {
  salaryWeight: number;
  remoteWeight: number;
  cultureWeight: number;
  growthWeight: number;
  techStackWeight: number;
  customNotes: string;
  openaiKey?: string;
}

export interface JobPosting {
  id: string;
  url: string;
  title?: string;
  company?: string;
  location?: string;
  description?: string;
}

export interface ScrapedJob {
  id: string;
  url: string;
  title: string;
  company: string;
  description: string;
}

export interface MetricScore {
  category: string;
  score: number; // 0-100
  reasoning: string;
}

export type WorthApplyingStatus = 'Highly Recommended' | 'Worth Applying' | 'Maybe' | 'Skip It';

export interface JobEvaluation {
  jobId: string;
  detectedTitle: string;
  detectedCompany: string;
  worthApplyingScore: number;
  status: WorthApplyingStatus;
  metrics: MetricScore[];
  pros: string[];
  cons: string[];
  summary: string;
  verdict: string;
  coverLetter: string;
  tailoredResume: string;
}

export interface EvaluationResult {
  evaluations: JobEvaluation[];
  overallInsight: string;
}
