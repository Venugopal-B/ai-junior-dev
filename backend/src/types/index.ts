export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  primary_language: string;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  file_name: string;
  file_path: string;
  content: string;
  language: string;
  created_at: Date;
  updated_at: Date;
}

export type RunType = 'explain' | 'analyze' | 'generate-tests' | 'suggest-fix';
export type RunStatus = 'pending' | 'running' | 'success' | 'failed';

export interface AnalysisRun {
  id: string;
  project_id: string;
  file_id?: string;
  run_type: RunType;
  input_summary?: string;
  output_summary?: string;
  raw_result_json?: Record<string, unknown>;
  status: RunStatus;
  created_at: Date;
}

export interface RunHistoryItem extends AnalysisRun {
  project_name: string;
  project_language: string;
  file_name: string | null;
}

export interface GeneratedTest {
  id: string;
  project_id: string;
  file_id: string;
  title: string;
  framework: string;
  content: string;
  created_at: Date;
}

export interface FixSuggestion {
  id: string;
  project_id: string;
  file_id: string;
  title: string;
  explanation: string;
  original_code?: string;
  suggested_code?: string;
  diff_text?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: Date;
}

// AI Response Types
export interface ExplainResult {
  summary: string;
  keyFunctions: { name: string; description: string }[];
  responsibilities: string[];
  riskyAreas: { area: string; risk: string }[];
}

export interface BugIssue {
  title: string;
  severity: 'high' | 'medium' | 'low';
  explanation: string;
  affectedArea: string;
  suggestedAction: string;
}

export interface BugAnalysisResult {
  summary: string;
  issues: BugIssue[];
}

export interface TestScenario {
  name: string;
  description: string;
  covered: boolean;
}

export interface TestGenerationResult {
  summary: string;
  framework: string;
  scenarios: TestScenario[];
  generatedTestCode: string;
}

export interface FixItem {
  title: string;
  explanation: string;
  originalCode: string;
  suggestedCode: string;
  diffSummary: string;
}

export interface FixSuggestionResult {
  summary: string;
  fixes: FixItem[];
}

export type CodeExplanationResult = ExplainResult;

export interface AIRunResultsMap {
  explain: CodeExplanationResult;
  analyze: BugAnalysisResult;
  'generate-tests': TestGenerationResult;
  'suggest-fix': FixSuggestionResult;
}

export interface UniversalRunResult {
  mode: 'universal';
  results: AIRunResultsMap;
}

export interface AuthTokens {
  accessToken: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Array<{ field: string; message: string }>;
}

// Express augmentation
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; userId: string; email: string };
    }
  }
}
