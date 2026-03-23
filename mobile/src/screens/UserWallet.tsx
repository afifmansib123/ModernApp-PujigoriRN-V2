// mobile/app/(tabs)/wallet.tsx
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
  useGetUserDonationsQuery,
  useGetDonationQRQuery,
  useUpdateDonorMessageMutation,
} from '../../src/state/api';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import WalletStats from '../../src/components/wallet/WalletStats';
import DonationCard from '../../src/components/wallet/DonationCard';
import QRModal from '../../src/components/wallet/QRModal';
import { X, Save } from 'lucide-react-native';

type FilterTab = 'all' | 'success' | 'pending';

export default function WalletScreen() {
  const { data: authUser } = useGetAuthUserQuery();
  const userId = authUser?._id;

  const [selectedTab, setSelectedTab] = useState<FilterTab>('all');
  const [selectedDonation, setSelectedDonation] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [editingDonation, setEditingDonation] = useState<any>(null);
  const [messageText, setMessageText] = useState('');

  const {
    data: donationsData,
    isLoading,
    refetch,
  } = useGetUserDonationsQuery(
    {
      userId: userId || '',
      page: 1,
      limit: 50,
      status: selectedTab === 'all' ? undefined : selectedTab,
    },
    {
      skip: !userId,
    }
  );

  const { data: qrData, isLoading: isQRLoading } = useGetDonationQRQuery(
    {
      id: selectedDonation || '',
      format: 'url',
    },
    {
      skip: !selectedDonation || !showQRModal,
    }
  );

  const [updateMessage, { isLoading: isUpdatingMessage }] = useUpdateDonorMessageMutation();

  const donations = donationsData?.data || [];
  const totalDonations = donations.length;
  const totalAmount = donations.reduce((sum: number, d: any) => sum + d.amount, 0);
  const totalRewards = donations.filter((d: any) => d.rewardValue > 0).length;

  const handleViewQR = (donationId: string) => {
    setSelectedDonation(donationId);
    setShowQRModal(true);
  };

  const handleEditMessage = (donation: any) => {
    setEditingDonation(donation);
    setMessageText(donation.message || '');
    setShowMessageModal(true);
  };

  const handleSaveMessage = async () => {
    if (!editingDonation) return;

    try {
      await updateMessage({
        id: editingDonation._id,
        message: messageText,
      }).unwrap();
      
      setShowMessageModal(false);
      setEditingDonation(null);
      setMessageText('');
      refetch();
      Alert.alert('Success', 'Message updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Failed to update message');
    }
  };

  if (!userId) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Please log in to view your donations</Text>
      </View>
    );
  }

  if (isLoading && donations.length === 0) {
    return <LoadingSpinner />;
  }

  const selectedDonationData = donations.find((d: any) => d._id === selectedDonation);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <Text style={styles.headerSubtitle}>Donations & Rewards</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        {/* Stats */}
        <View style={styles.statsContainer}>
          <WalletStats
            totalDonations={totalDonations}
            totalAmount={totalAmount}
            totalRewards={totalRewards}
          />
        </View>

        {/* Filter Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'all' && styles.tabActive]}
            onPress={() => setSelectedTab('all')}
          >
            <Text style={[styles.tabText, selectedTab === 'all' && styles.tabTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'success' && styles.tabActive]}
            onPress={() => setSelectedTab('success')}
          >
            <Text style={[styles.tabText, selectedTab === 'success' && styles.tabTextActive]}>
              Successful
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'pending' && styles.tabActive]}
            onPress={() => setSelectedTab('pending')}
          >
            <Text style={[styles.tabText, selectedTab === 'pending' && styles.tabTextActive]}>
              Pending
            </Text>
          </TouchableOpacity>
        </View>

        {/* Donations List */}
        <View style={styles.listContainer}>
          {donations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>💝</Text>
              <Text style={styles.emptyTitle}>No donations yet</Text>
              <Text style={styles.emptyText}>
                Start supporting projects to see your donations here
              </Text>
            </View>
          ) : (
            donations.map((donation: any) => (
              <DonationCard
                key={donation._id}
                donation={donation}
                onViewQR={handleViewQR}
                onEditMessage={handleEditMessage}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* QR Modal */}
      <QRModal
        visible={showQRModal}
        onClose={() => {
          setShowQRModal(false);
          setSelectedDonation(null);
        }}
        qrData={qrData}
        donation={selectedDonationData}
        isLoading={isQRLoading}
      />

      {/* Edit Message Modal */}
      <Modal
        visible={showMessageModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.messageModalContainer}>
          <View style={styles.messageModalHeader}>
            <Text style={styles.messageModalTitle}>Edit Message</Text>
            <TouchableOpacity onPress={() => setShowMessageModal(false)}>
              <X color="#666" size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.messageModalContent}>
            <Text style={styles.messageLabel}>Your message to the creator:</Text>
            <TextInput
              style={styles.messageInput}
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Add a message to your donation..."
              multiline
              numberOfLines={6}
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{messageText.length}/500</Text>
          </View>

          <View style={styles.messageModalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowMessageModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, isUpdatingMessage && styles.saveButtonDisabled]}
              onPress={handleSaveMessage}
              disabled={isUpdatingMessage}
            >
              <Save color="#fff" size={16} />
              <Text style={styles.saveButtonText}>
                {isUpdatingMessage ? 'Saving...' : 'Save'}
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
    backgroundColor: '#007AFF',
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
    color: '#E5F0FF',
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    padding: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  tabActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#fff',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
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
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  messageModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  messageModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  messageModalContent: {
    flex: 1,
    padding: 20,
  },
  messageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  messageModalFooter: {
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
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});