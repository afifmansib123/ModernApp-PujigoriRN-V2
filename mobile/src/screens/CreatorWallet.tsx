// mobile/app/(tabs)/creator-wallet.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import {
  useGetAuthUserQuery,
  useGetCreatorBalancesQuery,
  useGetCreatorPaymentRequestsQuery,
  useCreatePaymentRequestMutation,
} from '../../src/state/api';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Wallet, TrendingUp, Clock, CheckCircle, XCircle, X } from 'lucide-react-native';

export default function CreatorWalletScreen() {
  const { data: authUser } = useGetAuthUserQuery();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [requestAmount, setRequestAmount] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountHolder: '',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    branchName: '',
  });

  const {
    data: balancesResponse,
    isLoading: isLoadingBalances,
    refetch: refetchBalances,
  } = useGetCreatorBalancesQuery();

  const {
    data: requestsData,
    isLoading: isLoadingRequests,
    refetch: refetchRequests,
  } = useGetCreatorPaymentRequestsQuery({
    page: 1,
    limit: 20,
  });

  const [createRequest, { isLoading: isCreatingRequest }] = useCreatePaymentRequestMutation();

  const balances = balancesResponse?.data;
  const totalAvailable = balances?.totalAvailable || 0;
  const projects = balances?.projects || [];
  const requests = requestsData?.data || [];

  const handleCreateRequest = async () => {
    if (!selectedProjectId || !requestAmount || parseFloat(requestAmount) <= 0) {
      Alert.alert('Error', 'Please select a project and enter a valid amount');
      return;
    }

    if (
      !bankDetails.accountHolder ||
      !bankDetails.bankName ||
      !bankDetails.accountNumber ||
      !bankDetails.branchName
    ) {
      Alert.alert('Error', 'Please fill in all required bank details');
      return;
    }

    const selectedProject = projects.find((p: any) => p.projectId === selectedProjectId);
    if (!selectedProject || parseFloat(requestAmount) > selectedProject.availableAmount) {
      Alert.alert('Error', 'Requested amount exceeds available balance');
      return;
    }

    try {
      await createRequest({
        projectId: selectedProjectId,
        requestedAmount: parseFloat(requestAmount),
        bankDetails: {
          accountHolder: bankDetails.accountHolder,
          bankName: bankDetails.bankName,
          accountNumber: bankDetails.accountNumber,
          routingNumber: bankDetails.routingNumber || undefined,
          branchName: bankDetails.branchName,
        },
      }).unwrap();

      setShowRequestModal(false);
      setSelectedProjectId('');
      setRequestAmount('');
      setBankDetails({
        accountHolder: '',
        bankName: '',
        accountNumber: '',
        routingNumber: '',
        branchName: '',
      });

      refetchBalances();
      refetchRequests();
      Alert.alert('Success', 'Withdrawal request submitted successfully!');
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Failed to create payment request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FF9500';
      case 'approved':
        return '#007AFF';
      case 'paid':
        return '#34C759';
      case 'rejected':
        return '#FF3B30';
      default:
        return '#999';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock color="#FF9500" size={16} />;
      case 'approved':
      case 'paid':
        return <CheckCircle color="#34C759" size={16} />;
      case 'rejected':
        return <XCircle color="#FF3B30" size={16} />;
      default:
        return null;
    }
  };

  if (isLoadingBalances && isLoadingRequests) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Creator Wallet</Text>
        <Text style={styles.headerSubtitle}>Manage your earnings</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingBalances || isLoadingRequests}
            onRefresh={() => {
              refetchBalances();
              refetchRequests();
            }}
          />
        }
      >
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <View>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>৳{totalAvailable.toLocaleString()}</Text>
              <Text style={styles.balanceSubtext}>
                Across {projects.length} project{projects.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.withdrawButton, totalAvailable <= 0 && styles.withdrawButtonDisabled]}
              onPress={() => setShowRequestModal(true)}
              disabled={totalAvailable <= 0}
            >
              <Wallet color="#fff" size={20} />
              <Text style={styles.withdrawButtonText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Project Balances */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp color="#007AFF" size={20} />
            <Text style={styles.sectionTitle}>Balance by Project</Text>
          </View>

          {projects.length > 0 ? (
            projects.map((project: any) => (
              <View key={project.projectId} style={styles.projectCard}>
                <View style={styles.projectHeader}>
                  <Text style={styles.projectTitle} numberOfLines={1}>
                    {project.projectTitle}
                  </Text>
                  <Text style={styles.projectAvailable}>
                    ৳{project.availableAmount.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.projectStats}>
                  <Text style={styles.projectStat}>
                    Raised: ৳{project.totalRaised.toLocaleString()}
                  </Text>
                  <Text style={styles.projectStat}>•</Text>
                  <Text style={styles.projectStat}>
                    Net: ৳{project.totalNetAmount.toLocaleString()}
                  </Text>
                  <Text style={styles.projectStat}>•</Text>
                  <Text style={styles.projectStat}>
                    Requested: ৳{project.alreadyRequested.toLocaleString()}
                  </Text>
                </View>
                <Text style={styles.projectDonations}>
                  {project.donationCount} donation{project.donationCount !== 1 ? 's' : ''}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No projects with available funds</Text>
            </View>
          )}
        </View>

        {/* Payment Requests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Request History</Text>

          {requests.length > 0 ? (
            requests.map((request: any) => (
              <View key={request._id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <Text style={styles.requestProject} numberOfLines={1}>
                    {request.project?.title || 'Unknown Project'}
                  </Text>
                  <View
                    style={[
                      styles.requestStatus,
                      { backgroundColor: getStatusColor(request.status) + '20' },
                    ]}
                  >
                    {getStatusIcon(request.status)}
                    <Text style={[styles.requestStatusText, { color: getStatusColor(request.status) }]}>
                      {request.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.requestDetails}>
                  <View style={styles.requestRow}>
                    <Text style={styles.requestLabel}>Amount:</Text>
                    <Text style={styles.requestValue}>
                      ৳{request.requestedAmount?.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.requestRow}>
                    <Text style={styles.requestLabel}>Net:</Text>
                    <Text style={styles.requestValue}>
                      ৳{request.netAmount?.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.requestRow}>
                    <Text style={styles.requestLabel}>Date:</Text>
                    <Text style={styles.requestValue}>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                {(request.adminNotes || request.rejectionReason) && (
                  <View style={styles.requestNotes}>
                    <Text style={styles.requestNotesText}>
                      {request.adminNotes || request.rejectionReason}
                    </Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No payment requests yet</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Request Modal */}
      <Modal
        visible={showRequestModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Request Withdrawal</Text>
            <TouchableOpacity onPress={() => setShowRequestModal(false)}>
              <X color="#666" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Project Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Select Project *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {projects
                  .filter((proj: any) => proj.availableAmount > 0)
                  .map((proj: any) => (
                    <TouchableOpacity
                      key={proj.projectId}
                      style={[
                        styles.projectOption,
                        selectedProjectId === proj.projectId && styles.projectOptionActive,
                      ]}
                      onPress={() => {
                        setSelectedProjectId(proj.projectId);
                        setRequestAmount(proj.availableAmount.toString());
                      }}
                    >
                      <Text
                        style={[
                          styles.projectOptionText,
                          selectedProjectId === proj.projectId && styles.projectOptionTextActive,
                        ]}
                        numberOfLines={2}
                      >
                        {proj.projectTitle}
                      </Text>
                      <Text
                        style={[
                          styles.projectOptionAmount,
                          selectedProjectId === proj.projectId && styles.projectOptionAmountActive,
                        ]}
                      >
                        ৳{proj.availableAmount.toLocaleString()}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>

            {/* Amount */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Amount *</Text>
              <TextInput
                style={styles.formInput}
                value={requestAmount}
                onChangeText={setRequestAmount}
                placeholder="Enter amount"
                keyboardType="numeric"
              />
            </View>

            {/* Bank Details */}
            <Text style={styles.sectionHeader}>Bank Account Details</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Account Holder Name *</Text>
              <TextInput
                style={styles.formInput}
                value={bankDetails.accountHolder}
                onChangeText={(text) => setBankDetails({ ...bankDetails, accountHolder: text })}
                placeholder="Full name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Bank Name *</Text>
              <TextInput
                style={styles.formInput}
                value={bankDetails.bankName}
                onChangeText={(text) => setBankDetails({ ...bankDetails, bankName: text })}
                placeholder="e.g. Dutch-Bangla Bank"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Branch Name *</Text>
              <TextInput
                style={styles.formInput}
                value={bankDetails.branchName}
                onChangeText={(text) => setBankDetails({ ...bankDetails, branchName: text })}
                placeholder="e.g. Gulshan Branch"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Account Number *</Text>
              <TextInput
                style={styles.formInput}
                value={bankDetails.accountNumber}
                onChangeText={(text) => setBankDetails({ ...bankDetails, accountNumber: text })}
                placeholder="Enter account number"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Routing Number (Optional)</Text>
              <TextInput
                style={styles.formInput}
                value={bankDetails.routingNumber}
                onChangeText={(text) => setBankDetails({ ...bankDetails, routingNumber: text })}
                placeholder="9-digit routing number"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Payment requests are reviewed by admin and typically processed within 3-5 business days.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowRequestModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, isCreatingRequest && styles.submitButtonDisabled]}
              onPress={handleCreateRequest}
              disabled={isCreatingRequest}
            >
              <Text style={styles.submitButtonText}>
                {isCreatingRequest ? 'Submitting...' : 'Submit Request'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#34C759',
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E5F5E9',
  },
  scrollView: {
    flex: 1,
  },
  balanceCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#34C759',
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: 12,
    color: '#999',
  },
  withdrawButton: {
    backgroundColor: '#34C759',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  withdrawButtonDisabled: {
    opacity: 0.5,
  },
  withdrawButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  projectCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  projectAvailable: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34C759',
  },
  projectStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  projectStat: {
    fontSize: 12,
    color: '#666',
  },
  projectDonations: {
    fontSize: 11,
    color: '#999',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  requestCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestProject: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  requestStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  requestStatusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  requestDetails: {
    gap: 8,
  },
  requestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  requestLabel: {
    fontSize: 13,
    color: '#666',
  },
  requestValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  requestNotes: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  requestNotesText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  projectOption: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    minWidth: 150,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  projectOptionActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#34C759',
  },
  projectOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  projectOptionTextActive: {
    color: '#34C759',
  },
  projectOptionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  projectOptionAmountActive: {
    color: '#34C759',
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  infoText: {
    fontSize: 12,
    color: '#1976D2',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#34C759',
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});