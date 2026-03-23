// mobile/app/(tabs)/admin-payments.tsx
import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Modal, Alert, FlatList, RefreshControl,
  Platform, TouchableNativeFeedback,
} from 'react-native';
import {
  useGetPaymentRequestsQuery,
  useApprovePaymentRequestMutation,
  useRejectPaymentRequestMutation,
  useMarkPaymentAsPaidMutation,
} from '../../src/state/api';
import { CheckCircle, XCircle, DollarSign, Clock, X } from 'lucide-react-native';

const STATUS_OPTIONS = ['pending', 'approved', 'paid', 'rejected', 'all'];

// Android-safe pressable button
function Btn({ onPress, style, children }: any) {
  if (Platform.OS === 'android') {
    return (
      <TouchableNativeFeedback onPress={onPress} useForeground>
        <View style={style}>{children}</View>
      </TouchableNativeFeedback>
    );
  }
  return (
    <TouchableOpacity onPress={onPress} style={style} activeOpacity={0.7}>
      {children}
    </TouchableOpacity>
  );
}

export default function AdminPaymentsScreen() {
  const [status, setStatus] = useState('pending');
  const [page, setPage] = useState(1);

  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [modalType, setModalType] = useState<'approve' | 'reject' | 'paid' | null>(null);
  const [approveNotes, setApproveNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [paidNotes, setPaidNotes] = useState('');
  const [transactionRef, setTransactionRef] = useState('');

  const { data, isLoading, refetch } = useGetPaymentRequestsQuery({
    page,
    limit: 15,
    status: status === 'all' ? undefined : status,
  });

  const [approve, { isLoading: isApproving }] = useApprovePaymentRequestMutation();
  const [reject, { isLoading: isRejecting }] = useRejectPaymentRequestMutation();
  const [markPaid, { isLoading: isMarkingPaid }] = useMarkPaymentAsPaidMutation();

  const requests = data?.data || [];
  const meta = data?.meta;

  const statusColor = (st: string) => {
    switch (st) {
      case 'pending': return '#FF9500';
      case 'approved': return '#007AFF';
      case 'paid': return '#34C759';
      case 'rejected': return '#FF3B30';
      default: return '#999';
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedRequest(null);
    setApproveNotes('');
    setRejectReason('');
    setPaidNotes('');
    setTransactionRef('');
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    try {
      await approve({ requestId: selectedRequest._id, notes: approveNotes }).unwrap();
      Alert.alert('Success', 'Payment request approved');
      closeModal();
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      Alert.alert('Error', 'Rejection reason is required');
      return;
    }
    try {
      await reject({ requestId: selectedRequest._id, reason: rejectReason }).unwrap();
      Alert.alert('Success', 'Payment request rejected');
      closeModal();
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Failed to reject');
    }
  };

  const handleMarkPaid = async () => {
    try {
      await markPaid({
        requestId: selectedRequest._id,
        notes: paidNotes,
        transactionReference: transactionRef,
      }).unwrap();
      Alert.alert('Success', 'Marked as paid');
      closeModal();
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Failed to mark paid');
    }
  };

  const openModal = (req: any, type: 'approve' | 'reject' | 'paid') => {
    setSelectedRequest(req);
    setModalType(type);
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Payment Requests</Text>
        <Text style={s.headerSub}>{meta?.total || 0} total</Text>
      </View>

      {/* Status Filter - using TouchableOpacity row, NOT nested ScrollView */}
      <View style={s.filterRow}>
        {STATUS_OPTIONS.map((st) => (
          <TouchableOpacity
            key={st}
            style={[s.filterChip, status === st && s.filterChipActive]}
            onPress={() => { setStatus(st); setPage(1); }}
            activeOpacity={0.7}
          >
            <Text style={[s.filterText, status === st && s.filterTextActive]}>
              {st.charAt(0).toUpperCase() + st.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={requests}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        contentContainerStyle={s.list}
        // Critical for Android touch events in FlatList
        removeClippedSubviews={false}
        ListEmptyComponent={
          !isLoading ? (
            <View style={s.empty}>
              <Clock color="#CCC" size={48} />
              <Text style={s.emptyTitle}>No payment requests</Text>
              <Text style={s.emptyText}>
                {status === 'pending' ? 'No pending requests' : 'Try a different filter'}
              </Text>
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
        renderItem={({ item: req }) => (
          <View style={s.card} collapsable={false}>
            <View style={s.cardHeader}>
              <Text style={s.projectTitle} numberOfLines={1}>
                {req.project?.title || 'Unknown Project'}
              </Text>
              <View style={[s.statusBadge, { backgroundColor: statusColor(req.status) + '20' }]}>
                <Text style={[s.statusText, { color: statusColor(req.status) }]}>
                  {req.status}
                </Text>
              </View>
            </View>

            <View style={s.amountsRow}>
              <View style={s.amountItem}>
                <Text style={s.amountLabel}>Requested</Text>
                <Text style={s.amountValue}>৳{req.requestedAmount?.toLocaleString()}</Text>
              </View>
              <View style={s.amountDivider} />
              <View style={s.amountItem}>
                <Text style={s.amountLabel}>Admin Fee (5%)</Text>
                <Text style={[s.amountValue, { color: '#FF3B30' }]}>
                  ৳{req.adminFee?.toLocaleString() ?? '—'}
                </Text>
              </View>
              <View style={s.amountDivider} />
              <View style={s.amountItem}>
                <Text style={s.amountLabel}>Net Amount</Text>
                <Text style={[s.amountValue, { color: '#34C759' }]}>
                  ৳{req.netAmount?.toLocaleString()}
                </Text>
              </View>
            </View>

            <Text style={s.dateText}>
              {new Date(req.createdAt).toLocaleDateString()}
            </Text>

            {(req.adminNotes || req.rejectionReason) && (
              <View style={s.notesBox}>
                <Text style={s.notesText}>{req.adminNotes || req.rejectionReason}</Text>
              </View>
            )}

            {/* Actions - collapsable={false} is the key Android fix */}
            <View style={s.actions} collapsable={false}>
              {req.status === 'pending' && (
                <>
                  <TouchableOpacity
                    style={s.approveBtn}
                    onPress={() => openModal(req, 'approve')}
                    activeOpacity={0.7}
                  >
                    <CheckCircle color="#34C759" size={15} />
                    <Text style={s.approveBtnText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.rejectBtn}
                    onPress={() => openModal(req, 'reject')}
                    activeOpacity={0.7}
                  >
                    <XCircle color="#FF3B30" size={15} />
                    <Text style={s.rejectBtnText}>Reject</Text>
                  </TouchableOpacity>
                </>
              )}
              {req.status === 'approved' && (
                <TouchableOpacity
                  style={s.paidBtn}
                  onPress={() => openModal(req, 'paid')}
                  activeOpacity={0.7}
                >
                  <DollarSign color="#007AFF" size={15} />
                  <Text style={s.paidBtnText}>Mark as Paid</Text>
                </TouchableOpacity>
              )}
              {(req.status === 'paid' || req.status === 'rejected') && (
                <Text style={s.completedText}>
                  {req.status === 'paid' ? '✓ Completed' : '✗ Rejected'}
                </Text>
              )}
            </View>
          </View>
        )}
      />

      {/* Modal */}
      <Modal
        visible={!!modalType}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <View style={s.modal}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>
              {modalType === 'approve' ? 'Approve Request' :
               modalType === 'reject' ? 'Reject Request' : 'Mark as Paid'}
            </Text>
            <TouchableOpacity onPress={closeModal} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X color="#666" size={22} />
            </TouchableOpacity>
          </View>

          <ScrollView style={s.modalBody} keyboardShouldPersistTaps="handled">
            <Text style={s.modalProject}>{selectedRequest?.project?.title}</Text>

            <View style={s.modalAmounts}>
              <Text style={s.modalAmountLabel}>
                Amount: ৳{selectedRequest?.requestedAmount?.toLocaleString()}
              </Text>
              <Text style={s.modalAmountLabel}>
                Fee: ৳{selectedRequest?.adminFee?.toLocaleString() ?? '—'}
              </Text>
              <Text style={s.modalAmountLabelBold}>
                Net: ৳{selectedRequest?.netAmount?.toLocaleString()}
              </Text>
            </View>

            {modalType === 'approve' && (
              <View>
                <Text style={s.inputLabel}>Notes (Optional)</Text>
                <TextInput
                  style={[s.textInput, s.textarea]}
                  value={approveNotes}
                  onChangeText={setApproveNotes}
                  placeholder="Add approval notes..."
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            )}

            {modalType === 'reject' && (
              <View>
                <Text style={s.inputLabel}>Rejection Reason *</Text>
                <TextInput
                  style={[s.textInput, s.textarea]}
                  value={rejectReason}
                  onChangeText={setRejectReason}
                  placeholder="Required: explain why..."
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            )}

            {modalType === 'paid' && (
              <View>
                <Text style={s.inputLabel}>Transaction Reference</Text>
                <TextInput
                  style={s.textInput}
                  value={transactionRef}
                  onChangeText={setTransactionRef}
                  placeholder="Bank transaction ID"
                />
                <Text style={s.inputLabel}>Notes (Optional)</Text>
                <TextInput
                  style={[s.textInput, s.textarea]}
                  value={paidNotes}
                  onChangeText={setPaidNotes}
                  placeholder="Add notes..."
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            )}
          </ScrollView>

          <View style={s.modalFooter}>
            <TouchableOpacity style={s.cancelBtn} onPress={closeModal} activeOpacity={0.7}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                s.confirmBtn,
                modalType === 'approve' ? s.confirmApprove :
                modalType === 'reject' ? s.confirmReject : s.confirmPaid,
                (isApproving || isRejecting || isMarkingPaid) && s.confirmDisabled,
              ]}
              onPress={
                modalType === 'approve' ? handleApprove :
                modalType === 'reject' ? handleReject : handleMarkPaid
              }
              disabled={isApproving || isRejecting || isMarkingPaid}
              activeOpacity={0.7}
            >
              <Text style={s.confirmText}>
                {isApproving || isRejecting || isMarkingPaid
                  ? 'Processing...'
                  : modalType === 'approve' ? 'Approve'
                  : modalType === 'reject' ? 'Reject'
                  : 'Mark Paid'}
              </Text>
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
  // Filter as a plain row - NO nested ScrollView
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  filterChipActive: { backgroundColor: '#5856D6', borderColor: '#5856D6' },
  filterText: { fontSize: 12, fontWeight: '600', color: '#555' },
  filterTextActive: { color: '#fff' },
  list: { padding: 12, gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  projectTitle: { fontSize: 15, fontWeight: 'bold', color: '#1A1A1A', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  amountsRow: { flexDirection: 'row', marginBottom: 8 },
  amountItem: { flex: 1, alignItems: 'center' },
  amountLabel: { fontSize: 10, color: '#999', marginBottom: 2 },
  amountValue: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A' },
  amountDivider: { width: 1, backgroundColor: '#F0F0F0' },
  dateText: { fontSize: 12, color: '#999', marginBottom: 8 },
  notesBox: {
    backgroundColor: '#F8F8F8',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#E5E5E5',
  },
  notesText: { fontSize: 12, color: '#666', fontStyle: 'italic' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
  },
  approveBtnText: { color: '#34C759', fontSize: 13, fontWeight: '700' },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 12,
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
  },
  rejectBtnText: { color: '#FF3B30', fontSize: 13, fontWeight: '700' },
  paidBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  paidBtnText: { color: '#007AFF', fontSize: 13, fontWeight: '700' },
  completedText: { fontSize: 13, color: '#999', flex: 1, textAlign: 'center' },
  empty: { padding: 60, alignItems: 'center', gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  emptyText: { fontSize: 14, color: '#999' },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 20,
  },
  pageBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#5856D6', borderRadius: 8 },
  pageBtnDisabled: { backgroundColor: '#E5E5E5' },
  pageBtnText: { color: '#fff', fontWeight: '600' },
  pageInfo: { fontSize: 14, color: '#666' },
  modal: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  modalBody: { flex: 1, padding: 20 },
  modalProject: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
  modalAmounts: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 4,
  },
  modalAmountLabel: { fontSize: 13, color: '#666' },
  modalAmountLabelBold: { fontSize: 14, fontWeight: 'bold', color: '#34C759' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6 },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333',
    marginBottom: 14,
  },
  textarea: { minHeight: 100 },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelText: { fontSize: 16, fontWeight: '600', color: '#666' },
  confirmBtn: { flex: 2, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  confirmApprove: { backgroundColor: '#34C759' },
  confirmReject: { backgroundColor: '#FF3B30' },
  confirmPaid: { backgroundColor: '#007AFF' },
  confirmDisabled: { opacity: 0.6 },
  confirmText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});