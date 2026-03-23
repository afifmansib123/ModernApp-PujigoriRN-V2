// mobile/src/components/projectDetail/StoryTab.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface StoryTabProps {
  story: string;
  shortDescription: string;
  risks?: string;
}

export default function StoryTab({ story, shortDescription, risks }: StoryTabProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.description}>{shortDescription}</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About This Project</Text>
        <Text style={styles.text}>{story}</Text>
      </View>

      {risks && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risks & Challenges</Text>
          <Text style={styles.text}>{risks}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 24,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  text: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
});