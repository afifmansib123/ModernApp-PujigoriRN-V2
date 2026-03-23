// mobile/app/(tabs)/admin-projects.tsx
import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Modal, Alert, FlatList, Image, RefreshControl,
} from 'react-native';
import {
  useGetAdminProjectsQuery,
  useUpdateProjectStatusMutation,
  useDeleteProjectMutation,
} from '../../src/state/api';
import { Search, X, CheckCircle, Clock, Target, XCircle, Trash2, TrendingUp } from 'lucide-react-native';

const STATUS_OPTIONS = ['all', 'active', 'funded', 'expired', 'cancelled', 'draft'];

export default function AdminProjectsScreen() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');

  const { data, isLoading, refetch } = useGetAdminProjectsQuery({
    page, limit: 10,
    status: status === 'all' ? undefined : status,
    search: search || undefined,
  });

  const [updateStatus, { isLoading: isUpdating }] = useUpdateProjectStatusMutation();
  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();

  const projects = data?.data || [];
  const meta = data?.meta;

  const statusColor = (st: string) => {
    switch (st) {
      case 'active': return '#34C759';
      case 'funded': return '#007AFF';
      case 'expired': return '#FF9500';
      case 'cancelled': return '#FF3B30';
      default: return '#999';
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedProject || !newStatus || newStatus === selectedProject.status) return;
    try {
      await updateStatus({
        projectId: selectedProject._id,
        status: newStatus,
        reason: statusReason || undefined,
      }).unwrap();
      Alert.alert('Success', `Status updated to ${newStatus}`);
      setShowStatusModal(false);
      setSelectedProject(null);
      setStatusReason('');
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = (project: any) => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to permanently delete "${project.title}"?\n\n` +
      (project.backerCount > 0 ? `⚠️ This project has ${project.backerCount} backers!\n\n` : '') +
      'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProject(project._id).unwrap();
              Alert.alert('Deleted', 'Project has been deleted');
            } catch (error: any) {
              Alert.alert('Error', error?.data?.message || 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Projects</Text>
        <Text style={s.headerSub}>{meta?.total || 0} total</Text>
      </View>

      {/* Search */}
      <View style={s.searchRow}>
        <View style={s.searchBar}>
          <Search color="#999" size={16} />
          <TextInput
            style={s.searchInput}
            value={search}
            onChangeText={(t) => { setSearch(t); setPage(1); }}
            placeholder="Search projects..."
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X color="#999" size={16} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Status Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.filterScroll}
        contentContainerStyle={s.filterContent}
      >
        {STATUS_OPTIONS.map((st) => (
          <TouchableOpacity
            key={st}
            style={[s.filterChip, status === st && s.filterChipActive]}
            onPress={() => { setStatus(st); setPage(1); }}
          >
            <Text style={[s.filterText, status === st && s.filterTextActive]}>
              {st === 'all' ? 'All' : st.charAt(0).toUpperCase() + st.slice(1)}
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
              <Text style={s.emptyText}>No projects found</Text>
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
          const pct = project.targetAmount
            ? Math.min(100, (project.currentAmount / project.targetAmount) * 100) : 0;
          return (
            <View style={s.card}>
              {project.images?.[0] ? (
                <Image source={{ uri: project.images[0] }} style={s.cardImage} />
              ) : (
                <View style={[s.cardImage, s.cardImagePlaceholder]}>
                  <Text style={s.cardImageText}>{project.title.charAt(0)}</Text>
                </View>
              )}
              <View style={s.cardBody}>
                <View style={s.cardTitleRow}>
                  <Text style={s.cardTitle} numberOfLines={2}>{project.title}</Text>
                  <View style={[s.statusBadge, { backgroundColor: statusColor(project.status) + '20' }]}>
                    <Text style={[s.statusText, { color: statusColor(project.status) }]}>
                      {project.status}
                    </Text>
                  </View>
                </View>
                <Text style={s.cardCategory}>{project.category} • {project.location?.district}</Text>

                <View style={s.progressBar}>
                  <View style={[s.progressFill, { width: `${pct}%` as any }]} />
                </View>
                <View style={s.cardStats}>
                  <Text style={s.raised}>৳{project.currentAmount?.toLocaleString() || 0}</Text>
                  <Text style={s.target}>/ ৳{project.targetAmount?.toLocaleString()}</Text>
                  <Text style={s.pct}>{pct.toFixed(0)}%</Text>
                  <Text style={s.backers}>{project.backerCount || 0} backers</Text>
                </View>

                <View style={s.cardActions}>
                  <TouchableOpacity
                    style={s.statusBtn}
                    onPress={() => {
                      setSelectedProject(project);
                      setNewStatus(project.status);
                      setShowStatusModal(true);
                    }}
                  >
                    <TrendingUp color="#007AFF" size={14} />
                    <Text style={s.statusBtnText}>Status</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.deleteBtn}
                    onPress={() => handleDelete(project)}
                    disabled={isDeleting}
                  >
                    <Trash2 color="#FF3B30" size={14} />
                    <Text style={s.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />

      {/* Status Update Modal */}
      <Modal visible={showStatusModal} animationType="slide" presentationStyle="pageSheet">
        <View style={s.modal}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Update Status</Text>
            <TouchableOpacity onPress={() => setShowStatusModal(false)}>
              <Text style={s.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={s.modalBody}>
            <Text style={s.modalProject} numberOfLines={2}>{selectedProject?.title}</Text>
            <Text style={s.modalLabel}>Current Status</Text>
            <View style={[s.currentStatus, { backgroundColor: statusColor(selectedProject?.status) + '20' }]}>
              <Text style={[s.currentStatusText, { color: statusColor(selectedProject?.status) }]}>
                {selectedProject?.status}
              </Text>
            </View>
            <Text style={s.modalLabel}>New Status</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {['draft', 'active', 'funded', 'expired', 'cancelled'].map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[s.newStatusOpt, newStatus === st && s.newStatusOptActive]}
                  onPress={() => setNewStatus(st)}
                >
                  <Text style={[s.newStatusText, newStatus === st && s.newStatusTextActive]}>
                    {st}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={s.modalLabel}>Reason (Optional)</Text>
            <TextInput
              style={[s.reasonInput]}
              value={statusReason}
              onChangeText={setStatusReason}
              placeholder="Provide a reason..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </ScrollView>
          <View style={s.modalFooter}>
            <TouchableOpacity
              style={s.cancelBtn}
              onPress={() => setShowStatusModal(false)}
            >
              <Text style={s.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.confirmBtn, (isUpdating || newStatus === selectedProject?.status) && s.confirmBtnDisabled]}
              onPress={handleUpdateStatus}
              disabled={isUpdating || newStatus === selectedProject?.status}
            >
              <Text style={s.confirmBtnText}>{isUpdating ? 'Updating...' : 'Update'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  searchRow: { padding: 12 },
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
  filterScroll: { maxHeight: 44 },
  filterContent: { paddingHorizontal: 12, gap: 8 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E5E5E5',
  },
  filterChipActive: { backgroundColor: '#5856D6', borderColor: '#5856D6' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#555' },
  filterTextActive: { color: '#fff' },
  list: { padding: 12, gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardImage: { width: '100%', height: 140 },
  cardImagePlaceholder: {
    backgroundColor: '#D0D0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImageText: { fontSize: 50, fontWeight: 'bold', color: '#5856D6', opacity: 0.3 },
  cardBody: { padding: 12 },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 4 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#1A1A1A', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  cardCategory: { fontSize: 12, color: '#999', marginBottom: 10, textTransform: 'capitalize' },
  progressBar: { height: 4, backgroundColor: '#E5E5E5', borderRadius: 2, marginBottom: 8 },
  progressFill: { height: 4, backgroundColor: '#5856D6', borderRadius: 2 },
  cardStats: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  raised: { fontSize: 13, fontWeight: 'bold', color: '#5856D6' },
  target: { fontSize: 12, color: '#999' },
  pct: { fontSize: 12, fontWeight: '700', color: '#34C759', marginLeft: 'auto' },
  backers: { fontSize: 12, color: '#999' },
  cardActions: { flexDirection: 'row', gap: 8 },
  statusBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    backgroundColor: '#E8F4FF',
    borderRadius: 8,
  },
  statusBtnText: { fontSize: 13, color: '#007AFF', fontWeight: '600' },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
  },
  deleteBtnText: { fontSize: 13, color: '#FF3B30', fontWeight: '600' },
  empty: { padding: 60, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#999' },
  pagination: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 16, paddingVertical: 20,
  },
  pageBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#5856D6', borderRadius: 8 },
  pageBtnDisabled: { backgroundColor: '#E5E5E5' },
  pageBtnText: { color: '#fff', fontWeight: '600' },
  pageInfo: { fontSize: 14, color: '#666' },
  modal: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 20,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  modalClose: { fontSize: 20, color: '#666' },
  modalBody: { flex: 1, padding: 20 },
  modalProject: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 16 },
  modalLabel: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 8 },
  currentStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  currentStatusText: { fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
  newStatusOpt: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  newStatusOptActive: { backgroundColor: '#5856D6' },
  newStatusText: { fontSize: 14, fontWeight: '600', color: '#555', textTransform: 'capitalize' },
  newStatusTextActive: { color: '#fff' },
  reasonInput: {
    borderWidth: 1, borderColor: '#E5E5E5',
    borderRadius: 8, padding: 12,
    fontSize: 15, color: '#333',
    minHeight: 100,
  },
  modalFooter: {
    flexDirection: 'row', gap: 12, padding: 20,
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  cancelBtn: {
    flex: 1, paddingVertical: 14,
    backgroundColor: '#F0F0F0', borderRadius: 10, alignItems: 'center',
  },
  cancelBtnText: { fontSize: 16, fontWeight: '600', color: '#666' },
  confirmBtn: {
    flex: 1, paddingVertical: 14,
    backgroundColor: '#5856D6', borderRadius: 10, alignItems: 'center',
  },
  confirmBtnDisabled: { opacity: 0.5 },
  confirmBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});