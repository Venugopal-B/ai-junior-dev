export interface User { id: string; name: string; email: string; created_at: string; updated_at: string; }
export interface Project { id: string; user_id: string; name: string; description: string | null; primary_language: string; file_count?: number; run_count?: number; created_at: string; updated_at: string; }
export interface ProjectFile { id: string; project_id: string; file_name: string; file_path: string; content: string; language: string; created_at: string; updated_at: string; }
export type RunType = 'explain' | 'analyze' | 'generate-tests' | 'suggest-fix';
export type RunStatus = 'pending' | 'running' | 'success' | 'failed';
export interface AnalysisRun { id: string; project_id: string; file_id: string | null; run_type: RunType; input_summary: string; output_summary: string; raw_result_json: Record<string, unknown>; status: RunStatus; created_at: string; }
export interface RunHistoryItem extends AnalysisRun { project_name: string; project_language: string; file_name: string | null; }
export interface CodeExplanationResult { summary: string; keyFunctions: Array<{ name: string; description: string }>; responsibilities: string[]; riskyAreas: Array<{ area: string; risk: string }>; }
export interface BugIssue { title: string; severity: 'high' | 'medium' | 'low'; explanation: string; affectedArea: string; suggestedAction: string; }
export interface BugAnalysisResult { summary: string; issues: BugIssue[]; }
export interface TestScenario { name: string; description: string; covered: boolean; }
export interface TestGenerationResult { summary: string; framework: string; scenarios: TestScenario[]; generatedTestCode: string; }
export interface FixItem { title: string; explanation: string; originalCode: string; suggestedCode: string; diffSummary: string; }
export interface FixSuggestionResult { summary: string; fixes: FixItem[]; }
export type AIResult = CodeExplanationResult | BugAnalysisResult | TestGenerationResult | FixSuggestionResult;
export interface AIRunResultsMap {
  explain: CodeExplanationResult;
  analyze: BugAnalysisResult;
  'generate-tests': TestGenerationResult;
  'suggest-fix': FixSuggestionResult;
}
export interface UniversalRunResult { mode: 'universal'; results: AIRunResultsMap; }
export interface AIRunResponse { run: AnalysisRun; result: AIResult; }
export interface UniversalAIRunResponse { run: AnalysisRun; result: UniversalRunResult; }
export interface UniversalAIRunAsyncResponse { jobId: string; status: 'queued' | 'running' | 'success' | 'failed'; run: AnalysisRun; }
export interface ApiResponse<T = unknown> { success: boolean; data?: T; message?: string; error?: string; errors?: Array<{ field: string; message: string }>; }
