import { useState, useEffect, useCallback } from 'react';
import { Project } from '@/types';
import { projectsApi } from '@/api/projects';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectsApi.list();
      setProjects(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetch(); }, [fetch]);

  const createProject = async (data: { name: string; description?: string; primary_language: string }) => {
    const project = await projectsApi.create(data);
    setProjects((prev) => [project, ...prev]);
    return project;
  };

  const deleteProject = async (id: string) => {
    await projectsApi.delete(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return { projects, loading, error, refetch: fetch, createProject, deleteProject };
}
