import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse } from '@/types';

const API_URL = (import.meta as Record<string, any>).env?.VITE_API_URL ?? 'http://localhost:4000/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res: AxiosResponse<ApiResponse>) => res,
  (err: AxiosError<ApiResponse>) => {
    const message =
      err.response?.data?.message ??
      err.response?.data?.error ??
      err.message ??
      'Request failed';
    return Promise.reject(new Error(message));
  }
);
