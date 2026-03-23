// mobile/app/(tabs)/projects/index.tsx
import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, TextInput, RefreshControl, FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGetProjectsQuery } from '../../../src/state/api';
import { Search, Filter, Users, Clock, X } from 'lucide-react-native';

const CATEGORIES = [
  'all', 'education', 'health', 'environment', 'technology',
  'arts', 'community', 'business', 'charity',
];

export default function ProjectsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState((params.category as string) || 'all');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useGetProjectsQuery({
    page,
    limit: 12,
    search: search || undefined,
    category: category === 'all' ? undefined : category,
    status: 'active',
  });

  const projects = data?.data || [];
  const meta = data?.meta;

  const daysLeft = (endDate: string) => {
    const diff = new Date(endDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86400000));
  };

  const progress = (current: number, target: number) =>
    Math.min(100, target > 0 ? (current / target) * 100 : 0);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Projects</Text>
        <Text style={s.headerSub}>{meta?.total || 0} projects</Text>
      </View>

      {/* Search */}
      <View style={s.searchContainer}>
        <View style={s.searchBar}>
          <Search color="#999" size={16} />
          <TextInput
            style={s.searchInput}
            placeholder="Search projects..."
            value={search}
            onChangeText={(t) => { setSearch(t); setPage(1); }}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X color="#999" size={16} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.categoryScroll}
        contentContainerStyle={s.categoryContent}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[s.catChip, category === cat && s.catChipActive]}
            onPress={() => { setCategory(cat); setPage(1); }}
          >
            <Text style={[s.catText, category === cat && s.catTextActive]}>
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={projects}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          !isLoading ? (
            <View style={s.empty}>
              <Text style={s.emptyIcon}>🔍</Text>
              <Text style={s.emptyTitle}>No projects found</Text>
              <Text style={s.emptyText}>Try different search terms or category</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          meta && meta.totalPages > 1 ? (
            <View style={s.pagination}>
              <TouchableOpacity
                style={[s.pageBtn, page === 1 && s.pageBtnDisabled]}
                onPress={() => setPage(page - 1)}
                disabled={page === 1}
              >
                <Text style={s.pageBtnText}>← Prev</Text>
              </TouchableOpacity>
              <Text style={s.pageInfo}>{page} / {meta.totalPages}</Text>
              <TouchableOpacity
                style={[s.pageBtn, page === meta.totalPages && s.pageBtnDisabled]}
                onPress={() => setPage(page + 1)}
                disabled={page === meta.totalPages}
              >
                <Text style={s.pageBtnText}>Next →</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        renderItem={({ item: project }) => {
          const pct = progress(project.currentAmount, project.targetAmount);
          return (
            <TouchableOpacity
              style={s.card}
              onPress={() =>
                router.push({ pathname: '/(tabs)/projects/[slug]', params: { slug: project.slug } })
              }
            >
              {project.images?.[0] ? (
                <Image source={{ uri: project.images[0] }} style={s.img} />
              ) : (
                <View style={[s.img, s.imgPlaceholder]}>
                  <Text style={s.imgPlaceholderText}>{project.title.charAt(0)}</Text>
                </View>
              )}
              <View style={s.cardBody}>
                <View style={s.row}>
                  <View style={s.catBadge}>
                    <Text style={s.catBadgeText}>{project.category}</Text>
                  </View>
                  <Text style={s.daysLeft}>{daysLeft(project.endDate)}d left</Text>
                </View>
                <Text style={s.title} numberOfLines={2}>{project.title}</Text>
                <Text style={s.desc} numberOfLines={2}>{project.shortDescription}</Text>
                <View style={s.progressBar}>
                  <View style={[s.progressFill, { width: `${pct}%` as any }]} />
                </View>
                <View style={s.footer}>
                  <Text style={s.raised}>৳{project.currentAmount?.toLocaleString() || 0}</Text>
                  <View style={s.metaItem}>
                    <Users color="#999" size={12} />
                    <Text style={s.metaText}>{project.backerCount || 0}</Text>
                  </View>
                  <Text style={s.pct}>{pct.toFixed(0)}%</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
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
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: 14, color: '#D0E8FF', marginTop: 2 },
  searchContainer: { padding: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  searchInput: { flex: 1, fontSize: 15, color: '#333' },
  categoryScroll: { maxHeight: 44 },
  categoryContent: { paddingHorizontal: 12, gap: 8, paddingBottom: 4 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  catChipActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  catText: { fontSize: 13, fontWeight: '600', color: '#555' },
  catTextActive: { color: '#fff' },
  list: { padding: 12, gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  img: { width: '100%', height: 160, backgroundColor: '#E8F4FF' },
  imgPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  imgPlaceholderText: { fontSize: 50, fontWeight: 'bold', color: '#007AFF', opacity: 0.3 },
  cardBody: { padding: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  catBadge: {
    backgroundColor: '#E8F4FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  catBadgeText: { fontSize: 11, color: '#007AFF', textTransform: 'capitalize', fontWeight: '600' },
  daysLeft: { fontSize: 12, color: '#FF9500', fontWeight: '600' },
  title: { fontSize: 15, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
  desc: { fontSize: 13, color: '#666', marginBottom: 10, lineHeight: 18 },
  progressBar: { height: 4, backgroundColor: '#E5E5E5', borderRadius: 2, marginBottom: 8 },
  progressFill: { height: 4, backgroundColor: '#007AFF', borderRadius: 2 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  raised: { fontSize: 14, fontWeight: 'bold', color: '#007AFF', flex: 1 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 12, color: '#999' },
  pct: { fontSize: 12, fontWeight: '700', color: '#34C759' },
  empty: { padding: 60, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 6 },
  emptyText: { fontSize: 14, color: '#999', textAlign: 'center' },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 20,
  },
  pageBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  pageBtnDisabled: { backgroundColor: '#E5E5E5' },
  pageBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  pageInfo: { fontSize: 14, color: '#666' },
});