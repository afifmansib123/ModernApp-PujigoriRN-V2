// src/queries/auth.queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import { setItem, STORAGE_KEYS } from '../utils/storage';
import { authService } from '../services/authService';
import type { AuthUser } from '../store/authStore';

// ── Query Keys — one place, no magic strings ───────────────────────────────
export const authKeys = {
  user: ['authUser'] as const,
};

// ── GET auth user from backend ─────────────────────────────────────────────
export function useGetAuthUser() {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: authKeys.user,
    queryFn: async () => {
      const payload = JSON.parse(atob(token!.split('.')[1]));
      const res = await api.get<{ data: AuthUser }>(`/auth/profile/${payload.sub}`);
      const user = res.data.data;
      setUser(user);        // sync into Zustand so components can use useAuthUser()
      return user;
    },
    enabled: !!token,       // only runs when token exists
    retry: false,           // don't retry on 401
    staleTime: 1000 * 60 * 5, // cache for 5 min
  });
}

// ── SIGN IN ────────────────────────────────────────────────────────────────
export function useSignIn() {
  const queryClient = useQueryClient();
  const setToken = useAuthStore((s) => s.setToken);

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const token = await authService.signIn(email, password);
      return token;
    },
    onSuccess: async (token) => {
      // 1. Save to SecureStore
      await setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      // 2. Put in Zustand so axios interceptor picks it up
      setToken(token);
      // 3. Trigger useGetAuthUser to fetch profile
      await queryClient.invalidateQueries({ queryKey: authKeys.user });
    },
  });
}

// ── SIGN UP ────────────────────────────────────────────────────────────────
export function useSignUp() {
  return useMutation({
    mutationFn: async ({
      username, email, password, name, role,
    }: {
      username: string;
      email: string;
      password: string;
      name: string;
      role: string;
    }) => {
      await authService.signUp(username, email, password, name, role);
    },
  });
}

// ── CONFIRM SIGN UP ────────────────────────────────────────────────────────
export function useConfirmSignUp() {
  return useMutation({
    mutationFn: async ({ email, code }: { email: string; code: string }) => {
      await authService.confirmSignUp(email, code);
    },
  });
}

// ── LOGOUT ────────────────────────────────────────────────────────────────
export function useLogout() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: async () => {
      await logout();
    },
    onSuccess: () => {
      // Wipe all cached queries — user data, projects, everything
      queryClient.clear();
    },
  });
}