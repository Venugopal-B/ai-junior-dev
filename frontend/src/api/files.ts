import { apiClient } from './client';
import { ProjectFile } from '@/types';

export const filesApi = {
  list: async (projectId: string): Promise<ProjectFile[]> => {
    const res = await apiClient.get(`/projects/${projectId}/files`);
    return res.data.data as ProjectFile[];
  },
  create: async (projectId: string, data: { file_name: string; file_path?: string; content: string; language: string }): Promise<ProjectFile> => {
    const res = await apiClient.post(`/projects/${projectId}/files`, data);
    return res.data.data as ProjectFile;
  },
  updateContent: async (projectId: string, fileId: string, data: { content: string }): Promise<ProjectFile> => {
    const res = await apiClient.put(`/projects/${projectId}/files/${fileId}`, data);
    return res.data.data as ProjectFile;
  },
  remove: async (projectId: string, fileId: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/files/${fileId}`);
  },
};
