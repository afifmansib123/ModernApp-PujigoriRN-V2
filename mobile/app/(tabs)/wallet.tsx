// mobile/app/(tabs)/wallet.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGetAuthUserQuery } from '../../src/state/api';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import UserWallet from '../../src/screens/UserWallet';
import CreatorWallet from '../../src/screens/CreatorWallet';

export default function WalletScreen() {
  const { data: authUser, isLoading } = useGetAuthUserQuery();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!authUser) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Please log in to view your wallet</Text>
      </View>
    );
  }

  // Check user role from your auth structure
  const userRole = authUser.role || 'user';

  console.log('User role:', userRole); // Debug log

  // Show appropriate wallet based on role
  if (userRole === 'creator') {
    return <CreatorWallet />;
  }

  // Default to user wallet
  return <UserWallet />;
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
});