// mobile/src/components/wallet/QRModal.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Gift, CheckCircle, X } from 'lucide-react-native';

interface QRModalProps {
  visible: boolean;
  onClose: () => void;
  qrData: any;
  donation: any;
  isLoading: boolean;
}

export default function QRModal({ visible, onClose, qrData, donation, isLoading }: QRModalProps) {
  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Reward QR Code</Text>
          <TouchableOpacity onPress={onClose}>
            <X color="#666" size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#9333EA" />
            </View>
          ) : qrData?.data ? (
            <>
              {/* QR Code Image */}
              <View style={styles.qrContainer}>
                {qrData.data.qrCodeUrl ? (
                  <Image
                    source={{ uri: qrData.data.qrCodeUrl }}
                    style={styles.qrImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={styles.errorText}>QR code not available</Text>
                )}
              </View>

              {/* Reward Details */}
              <View style={styles.rewardCard}>
                <View style={styles.rewardHeader}>
                  <Gift color="#9333EA" size={20} />
                  <Text style={styles.rewardHeaderText}>Your Reward Voucher</Text>
                </View>

                <View style={styles.detailsContainer}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Reward Value:</Text>
                    <Text style={styles.detailValue}>
                      ৳{qrData.data.rewardValue.toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Donation Amount:</Text>
                    <Text style={styles.detailAmount}>
                      ৳{donation?.amount.toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>
                        {qrData.data.rewardStatus === 'pending'
                          ? '⏳ Ready to Redeem'
                          : '✓ Redeemed'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Valid Until:</Text>
                    <Text style={styles.detailText}>
                      {(() => {
                        try {
                          const createdDate = new Date(donation?.createdAt);
                          const expiryDate = new Date(createdDate);
                          expiryDate.setDate(expiryDate.getDate() + 30);
                          return expiryDate.toLocaleDateString();
                        } catch {
                          return 'N/A';
                        }
                      })()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Instructions */}
              <View style={styles.instructionsCard}>
                <View style={styles.instructionsHeader}>
                  <CheckCircle color="#1976D2" size={16} />
                  <Text style={styles.instructionsTitle}>How to Redeem</Text>
                </View>
                <View style={styles.instructionsList}>
                  <Text style={styles.instructionItem}>1. Show this QR code to the project creator</Text>
                  <Text style={styles.instructionItem}>2. They will scan and verify your reward</Text>
                  <Text style={styles.instructionItem}>3. Collect your physical reward on-site</Text>
                  <Text style={styles.instructionItem}>4. Status will update to "Redeemed"</Text>
                </View>
              </View>

              <Text style={styles.footerText}>
                Show this QR code at the project location to redeem your reward
              </Text>
            </>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to load QR code</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  qrContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  qrImage: {
    width: 256,
    height: 256,
  },
  rewardCard: {
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#9333EA',
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  rewardHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9333EA',
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
  },
  detailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34C759',
  },
  detailAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  detailText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FFF9E6',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF9500',
  },
  instructionsCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1976D2',
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
  },
  instructionsList: {
    gap: 6,
  },
  instructionItem: {
    fontSize: 13,
    color: '#1565C0',
    lineHeight: 20,
  },
  footerText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  errorContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#999',
  },
});