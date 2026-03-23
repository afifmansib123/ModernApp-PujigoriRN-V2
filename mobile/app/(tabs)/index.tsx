// mobile/app/(tabs)/index.tsx
import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, RefreshControl, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  useGetAuthUserQuery,
  useGetTrendingProjectsQuery,
  useGetProjectsByCategoryQuery,
} from '../../src/state/api';
import { TrendingUp, Search, Heart, Users, Clock } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { data: authUser } = useGetAuthUserQuery();
  const {
    data: trendingData,
    isLoading,
    refetch,
  } = useGetTrendingProjectsQuery({ limit: 6 });
  const { data: categoriesData } = useGetProjectsByCategoryQuery();

  const projects = trendingData?.data || [];
  const categories = categoriesData?.data || [];

  const daysLeft = (endDate: string) => {
    const diff = new Date(endDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86400000));
  };

  const progress = (current: number, target: number) =>
    Math.min(100, target > 0 ? (current / target) * 100 : 0);

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>
            Hello, {authUser?.name?.split(' ')[0] || 'there'} 👋
          </Text>
          <Text style={s.subtitle}>Discover projects to support</Text>
        </View>
      </View>

      {/* Search Bar */}
      <TouchableOpacity
        style={s.searchBar}
        onPress={() => router.push('/(tabs)/projects')}
        activeOpacity={0.8}
      >
        <Search color="#999" size={18} />
        <Text style={s.searchText}>Search projects...</Text>
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        {/* Categories */}
        {categories.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Categories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.slice(0, 8).map((cat: any) => (
                <TouchableOpacity
                  key={cat._id}
                  style={s.categoryChip}
                  onPress={() =>
                    router.push({ pathname: '/(tabs)/projects', params: { category: cat._id } })
                  }
                >
                  <Text style={s.categoryText}>{cat._id}</Text>
                  <Text style={s.categoryCount}>{cat.count}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Trending */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <TrendingUp color="#007AFF" size={18} />
            <Text style={s.sectionTitle}>Trending Projects</Text>
          </View>

          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <View key={i} style={[s.card, s.skeleton]} />
            ))
          ) : projects.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyText}>No projects yet</Text>
            </View>
          ) : (
            projects.map((project: any) => {
              const pct = progress(project.currentAmount, project.targetAmount);
              return (
                <TouchableOpacity
                  key={project._id}
                  style={s.card}
                  onPress={() =>
                    router.push({
                      pathname: '/(tabs)/projects/[slug]',
                      params: { slug: project.slug },
                    })
                  }
                >
                  {project.images?.[0] ? (
                    <Image source={{ uri: project.images[0] }} style={s.cardImage} />
                  ) : (
                    <View style={[s.cardImage, s.cardImagePlaceholder]}>
                      <Text style={s.cardImagePlaceholderText}>
                        {project.title.charAt(0)}
                      </Text>
                    </View>
                  )}
                  <View style={s.cardBody}>
                    <View style={s.categoryBadge}>
                      <Text style={s.categoryBadgeText}>{project.category}</Text>
                    </View>
                    <Text style={s.cardTitle} numberOfLines={2}>{project.title}</Text>
                    <Text style={s.cardDesc} numberOfLines={2}>{project.shortDescription}</Text>

                    {/* Progress */}
                    <View style={s.progressBar}>
                      <View style={[s.progressFill, { width: `${pct}%` as any }]} />
                    </View>
                    <View style={s.cardStats}>
                      <Text style={s.raised}>৳{project.currentAmount?.toLocaleString() || 0}</Text>
                      <Text style={s.target}>of ৳{project.targetAmount?.toLocaleString()}</Text>
                    </View>
                    <View style={s.cardMeta}>
                      <View style={s.metaItem}>
                        <Users color="#999" size={12} />
                        <Text style={s.metaText}>{project.backerCount || 0} backers</Text>
                      </View>
                      <View style={s.metaItem}>
                        <Clock color="#999" size={12} />
                        <Text style={s.metaText}>{daysLeft(project.endDate)}d left</Text>
                      </View>
                      <Text style={s.pct}>{pct.toFixed(0)}%</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* View All Button */}
        <TouchableOpacity
          style={s.viewAllBtn}
          onPress={() => router.push('/(tabs)/projects')}
        >
          <Text style={s.viewAllText}>Browse All Projects</Text>
        </TouchableOpacity>
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#D0E8FF', marginTop: 2 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    padding: 12,
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchText: { color: '#999', fontSize: 15 },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  categoryChip: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
  },
  categoryText: { fontSize: 13, fontWeight: '600', color: '#333', textTransform: 'capitalize' },
  categoryCount: { fontSize: 11, color: '#999', marginTop: 1 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  skeleton: { height: 280 },
  cardImage: { width: '100%', height: 180, backgroundColor: '#E8F4FF' },
  cardImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#C8E6FF',
  },
  cardImagePlaceholderText: { fontSize: 60, fontWeight: 'bold', color: '#007AFF', opacity: 0.4 },
  cardBody: { padding: 14 },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F4FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  categoryBadgeText: { fontSize: 11, color: '#007AFF', textTransform: 'capitalize', fontWeight: '600' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 6 },
  cardDesc: { fontSize: 13, color: '#666', marginBottom: 12, lineHeight: 18 },
  progressBar: { height: 6, backgroundColor: '#E5E5E5', borderRadius: 3, marginBottom: 8 },
  progressFill: { height: 6, backgroundColor: '#007AFF', borderRadius: 3 },
  cardStats: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 8 },
  raised: { fontSize: 15, fontWeight: 'bold', color: '#007AFF' },
  target: { fontSize: 12, color: '#999' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#999' },
  pct: { fontSize: 12, fontWeight: '700', color: '#34C759', marginLeft: 'auto' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#999', fontSize: 15 },
  viewAllBtn: {
    marginHorizontal: 16,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  viewAllText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});