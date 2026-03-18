import { apiClient } from './client';
import { Project } from '@/types';

export const projectsApi = {
  list: async (): Promise<Project[]> => {
    const res = await apiClient.get('/projects');
    return res.data.data as Project[];
  },
  getById: async (id: string): Promise<Project> => {
    const res = await apiClient.get(`/projects/${id}`);
    return res.data.data as Project;
  },
  create: async (data: { name: string; description?: string; primary_language: string }): Promise<Project> => {
    const res = await apiClient.post('/projects', data);
    return res.data.data as Project;
  },
  delete: async (id: string): Promise<void> => { await apiClient.delete(`/projects/${id}`); },
};
