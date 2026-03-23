// mobile/src/components/projects/ProjectsList.tsx
import React from 'react';
import { FlatList, View, Text, StyleSheet, RefreshControl } from 'react-native';
import ProjectCard from '../shared/ProjectCard';

interface ProjectsListProps {
  projects: any[];
  isLoading: boolean;
  onRefresh: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export default function ProjectsList({
  projects,
  isLoading,
  onRefresh,
  onLoadMore,
  hasMore,
}: ProjectsListProps) {
  const renderFooter = () => {
    if (!hasMore || projects.length === 0) return null;
    return (
      <View style={styles.footer}>
        <Text style={styles.footerText}>Load more...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🔍</Text>
        <Text style={styles.emptyTitle}>No projects found</Text>
        <Text style={styles.emptyText}>Try adjusting your search or filters</Text>
      </View>
    );
  };

  return (
    <FlatList
      data={projects}
      renderItem={({ item }) => <ProjectCard project={item} />}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
      }
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
  },
});