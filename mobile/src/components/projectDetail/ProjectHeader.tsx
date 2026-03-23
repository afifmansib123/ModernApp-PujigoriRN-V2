// mobile/src/components/project/ProjectHeader.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';

interface ProjectHeaderProps {
  project: {
    title: string;
    coverImage: string;
    category: string;
    creator: {
      name: string;
    };
    location?: {
      district: string;
      division: string;
    };
  };
}

export default function ProjectHeader({ project }: ProjectHeaderProps) {
  return (
    <View style={styles.container}>
      <Image source={{ uri: project.coverImage }} style={styles.coverImage} />
      <View style={styles.content}>
        <Text style={styles.category}>{project.category}</Text>
        <Text style={styles.title}>{project.title}</Text>
        <View style={styles.meta}>
          <Text style={styles.creator}>by {project.creator.name}</Text>
          {project.location && (
            <Text style={styles.location}>
              📍 {project.location.district}, {project.location.division}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  coverImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#E5E5E5',
  },
  content: {
    padding: 20,
  },
  category: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  meta: {
    gap: 4,
  },
  creator: {
    fontSize: 14,
    color: '#666',
  },
  location: {
    fontSize: 12,
    color: '#999',
  },
});