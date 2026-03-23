// app/_layout.tsx
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../src/store/authStore';
import { useGetAuthUser } from '../src/queries/auth.queries';

// ── QueryClient — created once outside component so it never resets ────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 min default cache
    },
  },
});

// ── Inner component — needs to be inside QueryClientProvider to use hooks ──
function RootLayoutNav() {
  const { isLoading: isHydrating, hydrate, token } = useAuthStore();
  const { data: user, isLoading: isFetchingUser } = useGetAuthUser();

  // Restore token from SecureStore on first boot
  useEffect(() => {
    hydrate();
  }, []);

  if (isHydrating || isFetchingUser) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const isAuthenticated = !!token && !!user;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="(tabs)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
  );
}

// ── Root — wraps everything with QueryClientProvider ──────────────────────
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootLayoutNav />
    </QueryClientProvider>
  );
}