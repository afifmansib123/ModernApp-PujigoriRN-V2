// mobile/src/components/projectDetail/UpdatesTab.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Update {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface UpdatesTabProps {
  updates: Update[];
}

export default function UpdatesTab({ updates }: UpdatesTabProps) {
  if (!updates || updates.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No updates yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {updates.map((update) => (
        <View key={update._id} style={styles.updateCard}>
          <View style={styles.updateHeader}>
            <Text style={styles.updateTitle}>{update.title}</Text>
            <Text style={styles.updateDate}>
              {new Date(update.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <Text style={styles.updateContent}>{update.content}</Text>
        </View>
      ))}
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
  updateCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  updateHeader: {
    marginBottom: 12,
  },
  updateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  updateDate: {
    fontSize: 12,
    color: '#999',
  },
  updateContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});