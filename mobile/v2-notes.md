## Commit - wrapper for expo-secure-store
src/utils/storage.ts
This is a thin wrapper around expo-secure-store. The reason we wrap it instead of calling expo-secure-store directly everywhere:

One place to change if we ever swap the storage lib
Handles errors consistently — SecureStore can throw, raw calls would crash
All keys live in one KEYS constant — no magic strings scattered across files