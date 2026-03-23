// src/lib/axios.ts
import axios from 'axios';
import { getItem, clearAuth, STORAGE_KEYS } from '../utils/storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor — attach token to every request ───────────────────
api.interceptors.request.use(async (config) => {
  const token = await getItem(STORAGE_KEYS.AUTH_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor — handle 401 globally ────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — wipe auth and let _layout redirect
      await clearAuth();
    }
    return Promise.reject(error);
  }
);
