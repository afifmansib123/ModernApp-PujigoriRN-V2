import * as SecureStore from 'expo-secure-store';

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_ROLE:  'user_role',
} as const;

// ── Generic get ────────────────────────────────────────────────────────────
export async function getItem(key : string) : Promise<string | null> {
    try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;  
  }
}

// ── Generic set ────────────────────────────────────────────────────────────
export async function setItem(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (e) {
    console.warn('storage.setItem failed', e);
  }
}

// ── Generic delete ─────────────────────────────────────────────────────────
export async function deleteItem(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // silently ignore
  }
}

// ── Convenience: clear all auth data on logout ─────────────────────────────
export async function clearAuth(): Promise<void> {
  await deleteItem(STORAGE_KEYS.AUTH_TOKEN);
  await deleteItem(STORAGE_KEYS.USER_ROLE);
}