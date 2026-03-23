import {create} from "zustand";
import { authService } from "../services/authService";
import { clearAuth, getItem, setItem, STORAGE_KEYS } from '../utils/storage';

// ── Types ──────────────────────────────────────────────────────────────────
export type UserRole = 'user' | 'creator' | 'admin';

export interface AuthUser {
  _id: string;
  cognitoId: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  // ── Data ──
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;

  // ── Actions ──
  setUser:  (user: AuthUser | null) => void;
  setToken: (token: string | null)  => void;
  logout:   () => Promise<void>;
  hydrate:  () => Promise<void>;  // called once on app start
}

// ── Store ──────────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>((set) => ({
  user:      null,
  token:     null,
  isLoading: true,   // true on boot until hydrate() finishes

  setUser:  (user)  => set({ user }),
  setToken: (token) => set({ token }),

  // Called on app boot — restores token from SecureStore
  hydrate: async () => {
    try {
      const token = await getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        set({ token });
      }
    } catch {
      // storage read failed — start fresh
    } finally {
      set({ isLoading: false });  // always stop the loading state
    }
  },

  logout: async () => {
    // 1. Sign out from Cognito
    await authService.logout();
    // 2. Wipe SecureStore
    await clearAuth();
    // 3. Clear store state
    set({ user: null, token: null });
  },
}));

// ── Selector helpers (use these in components, not the whole store) ─────────
export const useAuthUser  = () => useAuthStore((s) => s.user);
export const useAuthToken = () => useAuthStore((s) => s.token);
export const useIsLoading = () => useAuthStore((s) => s.isLoading);
export const useUserRole  = () => useAuthStore((s) => s.user?.role ?? null);
