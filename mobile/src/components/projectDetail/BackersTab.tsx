// mobile/src/components/projectDetail/BackersTab.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Backer {
  _id: string;
  user?: {
    name: string;
  };
  amount: number;
  message?: string;
  createdAt: string;
  isAnonymous: boolean;
}

interface BackersTabProps {
  backers: Backer[];
}

export default function BackersTab({ backers }: BackersTabProps) {
  if (!backers || backers.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No backers yet. Be the first!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {backers.map((item) => {
        const name = item.isAnonymous ? 'Anonymous' : item.user?.name || 'Anonymous';
        
        return (
          <View key={item._id} style={styles.backerCard}>
            <View style={styles.backerHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{name.charAt(0)}</Text>
              </View>
              <View style={styles.backerInfo}>
                <Text style={styles.backerName}>{name}</Text>
                <Text style={styles.backerAmount}>৳{item.amount.toLocaleString()}</Text>
              </View>
              <Text style={styles.backerDate}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
            {item.message && (
              <Text style={styles.backerMessage}>{item.message}</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  backerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  backerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backerInfo: {
    flex: 1,
  },
  backerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  backerAmount: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '600',
  },
  backerDate: {
    fontSize: 12,
    color: '#999',
  },
  backerMessage: {
    fontSize: 13,
    color: '#666',
    marginTop: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});