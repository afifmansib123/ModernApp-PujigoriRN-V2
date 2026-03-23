import { Stack } from 'expo-router';
import { ReduxProvider } from '../src/providers/ReduxProvider';
import { useGetAuthUserQuery } from '../src/state/api';
import { View, ActivityIndicator } from 'react-native';

function RootLayoutNav() {
  const { data: user, isLoading, error } = useGetAuthUserQuery();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const isAuthenticated = user && !error;

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

export default function RootLayout() {
  return (
    <ReduxProvider>
      <RootLayoutNav />
    </ReduxProvider>
  );
}
