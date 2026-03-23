## Commit - wrapper for expo-secure-store
src/utils/storage.ts
This is a thin wrapper around expo-secure-store. The reason we wrap it instead of calling expo-secure-store directly everywhere:

One place to change if we ever swap the storage lib
Handles errors consistently — SecureStore can throw, raw calls would crash
All keys live in one KEYS constant — no magic strings scattered across files

## Commit - zustand - install and authstore

npx expo install zustand

src/store/authStore.ts (Zustand)
This replaces two things from the old stack:

src/state/slices/globalSlice.ts (Redux slice)
src/state/index.ts (Redux store)
src/providers/ReduxProvider.tsx (Redux provider wrapper)

All three collapse into one file.

## Commit - TanStack React Query - Axios

install : npx expo install axios

| `fetchBaseQuery` in RTK — token injected in `prepareHeaders` | Axios interceptor — auto-attaches token to every request |
| 401 handling per-query | One global 401 handler — clears auth, app redirects automatically |
| Tied to Redux | Standalone — any query lib or plain `await api.get()` can use it |

---

Key concept — interceptors:

Every request →  [request interceptor]  →  server
                      reads token from SecureStore
                      attaches Authorization header

Every response ← [response interceptor] ← server
                      if 401 → clearAuth()
                      if ok  → pass through

OLD                          NEW
─────────────────────────    ─────────────────────────
Redux store          →       Zustand (client state)
RTK Query            →       TanStack Query (server state)
fetchBaseQuery       →       Axios (HTTP client)
amazon-cognito-js    →       stays (no replacement needed)
expo-secure-store    →       stays, wrapped in storage.ts

The reason we split it: Redux was doing two jobs at once — managing local app state AND fetching server data. Now each tool does one job only. Cleaner, easier to debug.