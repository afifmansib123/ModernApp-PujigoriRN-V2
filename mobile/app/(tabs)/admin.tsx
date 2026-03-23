// mobile/app/(tabs)/admin.tsx
import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  useGetDashboardQuery,
  useGetPaymentRequestsQuery,
} from '../../src/state/api';
import {
  FolderKanban, DollarSign, TrendingUp, Users,
  Heart, Clock, CheckCircle, AlertCircle,
} from 'lucide-react-native';

export default function AdminDashboardScreen() {
  const router = useRouter();

  const { data: dashData, isLoading, refetch } = useGetDashboardQuery({ period: 30 });
  const { data: pendingData } = useGetPaymentRequestsQuery({ page: 1, limit: 5, status: 'pending' });

  const overview = dashData?.data?.overview || {};
  const topProjects = dashData?.data?.topProjects || [];
  const recentActivity = dashData?.data?.recentActivity || [];
  const pendingRequests = pendingData?.data || [];

  const stats = [
    { label: 'Total Projects', value: overview.totalProjects || 0, color: '#007AFF', icon: <FolderKanban color="#007AFF" size={20} /> },
    { label: 'Active Projects', value: overview.activeProjects || 0, color: '#34C759', icon: <CheckCircle color="#34C759" size={20} /> },
    { label: 'Total Raised', value: `৳${((overview.totalRaised || 0) / 1000).toFixed(1)}k`, color: '#AF52DE', icon: <DollarSign color="#AF52DE" size={20} /> },
    { label: 'Donations', value: overview.totalDonations || 0, color: '#FF9500', icon: <Heart color="#FF9500" size={20} /> },
    { label: 'Pending', value: overview.pendingPaymentRequests || 0, color: '#FF3B30', icon: <Clock color="#FF3B30" size={20} /> },
    { label: 'Admin Fees', value: `৳${((overview.totalAdminFees || 0) / 1000).toFixed(1)}k`, color: '#FF2D55', icon: <TrendingUp color="#FF2D55" size={20} /> },
    { label: 'Total Users', value: overview.totalUsers || 0, color: '#5856D6', icon: <Users color="#5856D6" size={20} /> },
    { label: 'This Month', value: `৳${((overview.thisMonthStats?.totalRaised || 0) / 1000).toFixed(1)}k`, color: '#00C7BE', icon: <TrendingUp color="#00C7BE" size={20} /> },
  ];

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Admin Panel</Text>
        <Text style={s.headerSub}>Platform Overview</Text>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Grid */}
        <View style={s.statsGrid}>
          {stats.map((stat, i) => (
            <View key={i} style={s.statCard}>
              <View style={[s.statIcon, { backgroundColor: stat.color + '15' }]}>
                {stat.icon}
              </View>
              <Text style={s.statValue}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Manage</Text>
          <View style={s.actionGrid}>
            <TouchableOpacity
              style={s.actionCard}
              onPress={() => router.push('/(tabs)/admin-payments')}
            >
              <Clock color="#FF9500" size={24} />
              <Text style={s.actionTitle}>Review Payments</Text>
              {pendingRequests.length > 0 && (
                <View style={s.badge}>
                  <Text style={s.badgeText}>{pendingRequests.length}</Text>
                </View>
              )}
              <Text style={s.actionDesc}>Approve or reject payment requests</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.actionCard}
              onPress={() => router.push('/(tabs)/admin-projects')}
            >
              <FolderKanban color="#007AFF" size={24} />
              <Text style={s.actionTitle}>Manage Projects</Text>
              <Text style={s.actionDesc}>View and moderate all projects</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pending Payment Requests */}
        {pendingRequests.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeaderRow}>
              <Text style={s.sectionTitle}>Pending Requests</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/admin-payments')}>
                <Text style={s.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>
            {pendingRequests.map((req: any) => (
              <View key={req._id} style={s.requestCard}>
                <View style={s.requestRow}>
                  <Text style={s.requestProject} numberOfLines={1}>
                    {req.project?.title || 'Unknown Project'}
                  </Text>
                  <Text style={s.requestAmount}>৳{req.requestedAmount?.toLocaleString()}</Text>
                </View>
                <Text style={s.requestDate}>
                  {new Date(req.createdAt).toLocaleDateString()}
                  {' • '}Fee: ৳{req.adminFee?.toLocaleString() || 0}
                </Text>
                <TouchableOpacity
                  style={s.reviewBtn}
                  onPress={() => router.push('/(tabs)/admin-payments')}
                >
                  <Text style={s.reviewBtnText}>Review</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Top Projects */}
        {topProjects.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Top Projects</Text>
            {topProjects.map((proj: any, i: number) => (
              <View key={proj._id} style={s.topProjectCard}>
                <View style={s.rank}>
                  <Text style={s.rankText}>{i + 1}</Text>
                </View>
                <View style={s.topProjectInfo}>
                  <Text style={s.topProjectTitle} numberOfLines={1}>{proj.title}</Text>
                  <Text style={s.topProjectMeta}>
                    ৳{proj.currentAmount?.toLocaleString() || 0} •
                    {' '}{proj.backerCount || 0} backers •
                    {' '}{proj.fundingProgress?.toFixed(0) || 0}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Recent Activity</Text>
            {recentActivity.slice(0, 8).map((activity: any, i: number) => (
              <View key={i} style={s.activityItem}>
                <View style={[
                  s.activityIcon,
                  { backgroundColor: activity.type === 'donation' ? '#E8F5E9' : '#E3F2FD' }
                ]}>
                  {activity.type === 'donation'
                    ? <Heart color="#34C759" size={14} />
                    : <DollarSign color="#007AFF" size={14} />
                  }
                </View>
                <View style={s.activityInfo}>
                  <Text style={s.activityTitle}>
                    {activity.type === 'donation' ? 'New donation' : 'Payment request'}
                  </Text>
                  <Text style={s.activityMeta} numberOfLines={1}>
                    {activity.project?.title || 'Unknown'} • ৳{activity.amount?.toLocaleString()}
                  </Text>
                </View>
                <Text style={s.activityTime}>
                  {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    backgroundColor: '#5856D6',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: 14, color: '#D0D0FF', marginTop: 2 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 10,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 6,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
  statLabel: { fontSize: 12, color: '#999' },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 12 },
  viewAll: { fontSize: 14, color: '#007AFF', fontWeight: '600' },
  actionGrid: { flexDirection: 'row', gap: 12 },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 6,
    position: 'relative',
  },
  actionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A' },
  actionDesc: { fontSize: 12, color: '#999', lineHeight: 16 },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  requestRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  requestProject: { fontSize: 14, fontWeight: '600', color: '#333', flex: 1, marginRight: 8 },
  requestAmount: { fontSize: 14, fontWeight: 'bold', color: '#34C759' },
  requestDate: { fontSize: 12, color: '#999', marginBottom: 10 },
  reviewBtn: {
    backgroundColor: '#E8F4FF',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  reviewBtnText: { fontSize: 13, color: '#007AFF', fontWeight: '600' },
  topProjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  rank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  topProjectInfo: { flex: 1 },
  topProjectTitle: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginBottom: 2 },
  topProjectMeta: { fontSize: 12, color: '#999' },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityInfo: { flex: 1 },
  activityTitle: { fontSize: 13, fontWeight: '600', color: '#333' },
  activityMeta: { fontSize: 12, color: '#999' },
  activityTime: { fontSize: 11, color: '#CCC' },
});