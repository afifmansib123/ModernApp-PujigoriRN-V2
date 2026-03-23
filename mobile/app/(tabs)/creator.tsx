// mobile/app/(tabs)/creator.tsx
import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  useGetAuthUserQuery,
  useGetProjectsByCreatorQuery,
} from '../../src/state/api';
import {
  FolderKanban, TrendingUp, DollarSign, Users,
  PlusCircle, ChevronRight, Clock, CheckCircle, Target,
} from 'lucide-react-native';

export default function CreatorDashboardScreen() {
  const router = useRouter();
  const { data: authUser } = useGetAuthUserQuery();
  const userId = authUser?._id;

  const { data: projectsData, isLoading, refetch } = useGetProjectsByCreatorQuery(
    { creatorId: userId || '', page: 1, limit: 20 },
    { skip: !userId }
  );

  const projects = projectsData?.data || [];
  const stats = {
    total: projects.length,
    active: projects.filter((p: any) => p.status === 'active').length,
    raised: projects.reduce((sum: number, p: any) => sum + (p.currentAmount || 0), 0),
    backers: projects.reduce((sum: number, p: any) => sum + (p.backerCount || 0), 0),
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return '#34C759';
      case 'funded': return '#007AFF';
      case 'expired': return '#FF9500';
      case 'cancelled': return '#FF3B30';
      default: return '#999';
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle color={statusColor(status)} size={14} />;
      case 'funded': return <Target color={statusColor(status)} size={14} />;
      default: return <Clock color={statusColor(status)} size={14} />;
    }
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Creator Studio</Text>
          <Text style={s.headerSub}>Welcome, {authUser?.name?.split(' ')[0] || 'Creator'}</Text>
        </View>
        <TouchableOpacity
          style={s.createBtn}
          onPress={() => router.push('/(tabs)/create')}
        >
          <PlusCircle color="#fff" size={20} />
          <Text style={s.createBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats */}
        <View style={s.statsGrid}>
          <View style={s.statCard}>
            <FolderKanban color="#007AFF" size={22} />
            <Text style={s.statValue}>{stats.total}</Text>
            <Text style={s.statLabel}>Projects</Text>
          </View>
          <View style={s.statCard}>
            <TrendingUp color="#34C759" size={22} />
            <Text style={s.statValue}>{stats.active}</Text>
            <Text style={s.statLabel}>Active</Text>
          </View>
          <View style={s.statCard}>
            <DollarSign color="#FF9500" size={22} />
            <Text style={[s.statValue, { fontSize: 14 }]}>
              ৳{(stats.raised / 1000).toFixed(1)}k
            </Text>
            <Text style={s.statLabel}>Raised</Text>
          </View>
          <View style={s.statCard}>
            <Users color="#AF52DE" size={22} />
            <Text style={s.statValue}>{stats.backers}</Text>
            <Text style={s.statLabel}>Backers</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Quick Actions</Text>
          <View style={s.actionRow}>
            <TouchableOpacity
              style={s.actionCard}
              onPress={() => router.push('/(tabs)/create')}
            >
              <PlusCircle color="#34C759" size={24} />
              <Text style={s.actionText}>Create Project</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.actionCard}
              onPress={() => router.push('/(tabs)/creator-wallet')}
            >
              <DollarSign color="#007AFF" size={24} />
              <Text style={s.actionText}>My Earnings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Projects */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Your Projects</Text>

          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <View key={i} style={[s.projectCard, s.skeleton]} />
            ))
          ) : projects.length === 0 ? (
            <View style={s.empty}>
              <FolderKanban color="#CCC" size={48} />
              <Text style={s.emptyTitle}>No projects yet</Text>
              <TouchableOpacity
                style={s.emptyBtn}
                onPress={() => router.push('/(tabs)/create')}
              >
                <Text style={s.emptyBtnText}>Create Your First Project</Text>
              </TouchableOpacity>
            </View>
          ) : (
            projects.map((project: any) => {
              const pct = project.targetAmount
                ? Math.min(100, (project.currentAmount / project.targetAmount) * 100)
                : 0;
              return (
                <TouchableOpacity
                  key={project._id}
                  style={s.projectCard}
                  onPress={() =>
                    router.push({ pathname: '/(tabs)/projects/[slug]', params: { slug: project.slug } })
                  }
                >
                  <View style={s.projectHeader}>
                    <View style={s.projectTitleRow}>
                      <Text style={s.projectTitle} numberOfLines={2}>{project.title}</Text>
                      <View style={[s.statusBadge, { backgroundColor: statusColor(project.status) + '20' }]}>
                        {statusIcon(project.status)}
                        <Text style={[s.statusText, { color: statusColor(project.status) }]}>
                          {project.status}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={s.progressBar}>
                    <View style={[s.progressFill, { width: `${pct}%` as any }]} />
                  </View>

                  <View style={s.projectStats}>
                    <Text style={s.raisedText}>
                      ৳{project.currentAmount?.toLocaleString() || 0}
                      <Text style={s.targetText}> / ৳{project.targetAmount?.toLocaleString()}</Text>
                    </Text>
                    <View style={s.projectMetaRow}>
                      <Text style={s.metaText}>{project.backerCount || 0} backers</Text>
                      <Text style={s.metaText}>•</Text>
                      <Text style={s.metaText}>{pct.toFixed(0)}%</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    backgroundColor: '#34C759',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: 14, color: '#C8F5D8', marginTop: 2 },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  statsGrid: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  statLabel: { fontSize: 11, color: '#999' },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 12 },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  actionText: { fontSize: 13, fontWeight: '600', color: '#333' },
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  skeleton: { height: 100 },
  projectHeader: { marginBottom: 10 },
  projectTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  projectTitle: { fontSize: 15, fontWeight: 'bold', color: '#1A1A1A', flex: 1 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  progressBar: { height: 4, backgroundColor: '#E5E5E5', borderRadius: 2, marginBottom: 10 },
  progressFill: { height: 4, backgroundColor: '#34C759', borderRadius: 2 },
  projectStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  raisedText: { fontSize: 14, fontWeight: 'bold', color: '#34C759' },
  targetText: { color: '#999', fontWeight: 'normal' },
  projectMetaRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  metaText: { fontSize: 12, color: '#999' },
  empty: { padding: 40, alignItems: 'center', gap: 12 },
  emptyTitle: { fontSize: 16, color: '#999' },
  emptyBtn: {
    backgroundColor: '#34C759',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyBtnText: { color: '#fff', fontWeight: '600' },
});