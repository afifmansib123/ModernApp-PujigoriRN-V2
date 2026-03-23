// mobile/src/components/wallet/DonationCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Gift, MessageSquare, QrCode } from 'lucide-react-native';

interface DonationCardProps {
  donation: {
    _id: string;
    amount: number;
    paymentStatus: string;
    transactionId: string;
    rewardValue: number;
    rewardStatus?: string;
    message?: string;
    project: {
      title: string;
    };
    createdAt: string;
  };
  onViewQR: (id: string) => void;
  onEditMessage: (donation: any) => void;
}

export default function DonationCard({ donation, onViewQR, onEditMessage }: DonationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return '#34C759';
      case 'pending':
        return '#FF9500';
      case 'failed':
        return '#FF3B30';
      default:
        return '#999';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'success':
        return 'Success';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.projectTitle} numberOfLines={2}>
            {donation.project?.title || 'Project'}
          </Text>
          <Text style={styles.date}>
            {new Date(donation.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(donation.paymentStatus) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(donation.paymentStatus) }]}>
            {getStatusLabel(donation.paymentStatus)}
          </Text>
        </View>
      </View>

      {/* Amount */}
      <View style={styles.amountSection}>
        <Text style={styles.amount}>৳{donation.amount.toLocaleString()}</Text>
        <Text style={styles.transactionId}>ID: {donation.transactionId}</Text>
      </View>

      {/* Reward Section */}
      {donation.rewardValue > 0 && donation.paymentStatus === 'success' && (
        <View style={styles.rewardSection}>
          <View style={styles.rewardHeader}>
            <View style={styles.rewardInfo}>
              <Gift color="#9333EA" size={16} />
              <Text style={styles.rewardText}>Reward: ৳{donation.rewardValue}</Text>
            </View>
            <Text style={styles.rewardStatus}>
              {donation.rewardStatus === 'pending' ? '⏳ Pending' : '✓ Redeemed'}
            </Text>
          </View>
          {donation.rewardStatus === 'pending' && (
            <TouchableOpacity
              style={styles.qrButton}
              onPress={() => onViewQR(donation._id)}
            >
              <QrCode color="#fff" size={16} />
              <Text style={styles.qrButtonText}>View QR Code</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Message Section */}
      <View style={styles.messageSection}>
        <MessageSquare color="#999" size={16} />
        <View style={styles.messageContent}>
          <Text style={styles.messageText} numberOfLines={2}>
            {donation.message || 'No message'}
          </Text>
          {donation.paymentStatus === 'success' && (
            <TouchableOpacity onPress={() => onEditMessage(donation)}>
              <Text style={styles.editButton}>Edit message</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  amountSection: {
    marginBottom: 12,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  transactionId: {
    fontSize: 10,
    color: '#999',
  },
  rewardSection: {
    backgroundColor: '#F3E8FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9333EA',
  },
  rewardStatus: {
    fontSize: 11,
    color: '#666',
  },
  qrButton: {
    backgroundColor: '#9333EA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 6,
  },
  qrButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  messageSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  messageContent: {
    flex: 1,
  },
  messageText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  editButton: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
});