import { apiClient } from './client';
import { AIRunResponse, UniversalAIRunAsyncResponse, UniversalAIRunResponse } from '@/types';

export const aiApi = {
  runAllAsync: async (projectId: string, fileId: string): Promise<UniversalAIRunAsyncResponse> => {
    const res = await apiClient.post('/ai/run-all-async', { projectId, fileId });
    return res.data.data as UniversalAIRunAsyncResponse;
  },
  runAll: async (projectId: string, fileId: string): Promise<UniversalAIRunResponse> => {
    const res = await apiClient.post('/ai/run-all', { projectId, fileId });
    return res.data.data as UniversalAIRunResponse;
  },
  explain: async (projectId: string, fileId: string): Promise<AIRunResponse> => {
    const res = await apiClient.post('/ai/explain', { projectId, fileId });
    return res.data.data as AIRunResponse;
  },
  analyze: async (projectId: string, fileId: string): Promise<AIRunResponse> => {
    const res = await apiClient.post('/ai/analyze', { projectId, fileId });
    return res.data.data as AIRunResponse;
  },
  generateTests: async (projectId: string, fileId: string): Promise<AIRunResponse> => {
    const res = await apiClient.post('/ai/generate-tests', { projectId, fileId });
    return res.data.data as AIRunResponse;
  },
  suggestFix: async (projectId: string, fileId: string): Promise<AIRunResponse> => {
    const res = await apiClient.post('/ai/suggest-fix', { projectId, fileId });
    return res.data.data as AIRunResponse;
  },
};
