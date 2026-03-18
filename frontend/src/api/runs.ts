import { apiClient } from './client';
import { AnalysisRun, RunHistoryItem } from '@/types';

export const runsApi = {
  listAll: async (limit = 100): Promise<RunHistoryItem[]> => {
    const res = await apiClient.get('/runs', { params: { limit } });
    return res.data.data as RunHistoryItem[];
  },
  getById: async (runId: string): Promise<AnalysisRun> => {
    const res = await apiClient.get(`/runs/${runId}`);
    return res.data.data as AnalysisRun;
  },
  listByProject: async (projectId: string): Promise<AnalysisRun[]> => {
    const res = await apiClient.get(`/projects/${projectId}/runs`);
    return res.data.data as AnalysisRun[];
  },
};
