// mobile/src/components/shared/ProjectCard.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

interface ProjectCardProps {
  project: {
    _id: string;
    title: string;
    slug: string;
    coverImage: string;
    targetAmount?: number;
    currentAmount?: number;
    goal?: number;
    raised?: number;
    category: string;
    creator: {
      name: string;
    };
  };
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  
  // Handle both field name variations
  const raised = project.raised ?? project.currentAmount ?? 0;
  const goal = project.goal ?? project.targetAmount ?? 1;
  const progress = (raised / goal) * 100;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/project/${project.slug}`)}
    >
      <Image 
        source={{ uri: project.coverImage }} 
        style={styles.image}
      />
      <View style={styles.content}>
        <Text style={styles.category}>{project.category || 'General'}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {project.title}
        </Text>
        <Text style={styles.creator}>by {project.creator?.name || 'Unknown'}</Text>
        
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
        </View>
        
        <View style={styles.stats}>
          <Text style={styles.raised}>৳{raised.toLocaleString()}</Text>
          <Text style={styles.goal}>of ৳{goal.toLocaleString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#E5E5E5',
  },
  content: {
    padding: 12,
  },
  category: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  creator: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E5E5',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 3,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  raised: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginRight: 4,
  },
  goal: {
    fontSize: 12,
    color: '#666',
  },
});