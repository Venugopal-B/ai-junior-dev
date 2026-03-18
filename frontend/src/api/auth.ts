import { apiClient } from './client';
import { User } from '@/types';

interface AuthResult { user: User; tokens: { accessToken: string }; }

export const authApi = {
  register: async (name: string, email: string, password: string): Promise<AuthResult> => {
    const res = await apiClient.post('/auth/register', { name, email, password });
    return res.data.data as AuthResult;
  },
  login: async (email: string, password: string): Promise<AuthResult> => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data.data as AuthResult;
  },
  getMe: async (): Promise<User> => {
    const res = await apiClient.get('/auth/me');
    return res.data.data as User;
  },
};
