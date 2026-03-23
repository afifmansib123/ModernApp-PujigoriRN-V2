// mobile/src/components/home/TrendingCarousel.tsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import ProjectCard from '../shared/ProjectCard';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface TrendingCarouselProps {
  projects: any[];
}

export default function TrendingCarousel({ projects }: TrendingCarouselProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔥 Trending Projects</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {projects.map((project) => (
          <View key={project._id} style={styles.cardWrapper}>
            <ProjectCard project={project} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  cardWrapper: {
    width: SCREEN_WIDTH * 0.75,
    marginHorizontal: 4,
  },
});