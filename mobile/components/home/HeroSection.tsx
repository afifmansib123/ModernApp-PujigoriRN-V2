// mobile/src/components/home/HeroSection.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface HeroSectionProps {
  userName?: string;
  totalProjects: number;
  totalDonations: number;
}

export default function HeroSection({ userName, totalProjects, totalDonations }: HeroSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>
        Hello{userName ? `, ${userName}` : ''}! 👋
      </Text>
      <Text style={styles.subtitle}>
        Discover and support amazing projects
      </Text>
      
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{totalProjects}</Text>
          <Text style={styles.statLabel}>Active Projects</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{totalDonations}</Text>
          <Text style={styles.statLabel}>Your Donations</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#007AFF',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#E5F0FF',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#E5F0FF',
  },
});