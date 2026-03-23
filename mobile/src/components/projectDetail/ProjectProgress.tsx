// mobile/src/components/project/ProjectProgress.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProjectProgressProps {
  raised: number;
  goal: number;
  backers: number;
  daysLeft: number;
}

export default function ProjectProgress({ raised, goal, backers, daysLeft }: ProjectProgressProps) {
  const progress = (raised / goal) * 100;
  const percentFunded = Math.round(progress);

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>৳{raised.toLocaleString()}</Text>
          <Text style={styles.statLabel}>raised of ৳{goal.toLocaleString()}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{percentFunded}%</Text>
          <Text style={styles.statLabel}>funded</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{backers}</Text>
          <Text style={styles.statText}>backers</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{daysLeft}</Text>
          <Text style={styles.statText}>days left</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});