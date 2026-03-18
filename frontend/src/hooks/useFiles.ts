import { useState, useEffect, useCallback } from 'react';
import { ProjectFile } from '@/types';
import { filesApi } from '@/api/files';

export function useFiles(projectId: string) {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await filesApi.list(projectId);
      setFiles(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { void fetch(); }, [fetch]);

  const addFile = async (data: { file_name: string; content: string; language: string }) => {
    const file = await filesApi.create(projectId, { ...data, file_path: '/' });
    setFiles((prev) => [...prev, file]);
    return file;
  };

  const updateFileContent = async (fileId: string, content: string) => {
    const file = await filesApi.updateContent(projectId, fileId, { content });
    setFiles((prev) => prev.map((item) => item.id === file.id ? file : item));
    return file;
  };

  const deleteFile = async (fileId: string) => {
    await filesApi.remove(projectId, fileId);
    setFiles((prev) => prev.filter((item) => item.id !== fileId));
  };

  return { files, loading, error, refetch: fetch, addFile, updateFileContent, deleteFile };
}
