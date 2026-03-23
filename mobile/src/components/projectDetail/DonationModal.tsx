// mobile/src/components/projectDetail/DonationModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useInitiatePaymentMutation } from '../../state/api';

interface RewardTier {
  _id: string;
  title: string;
  minimumAmount: number;
  description: string;
}

interface DonationModalProps {
  visible: boolean;
  onClose: () => void;
  project: {
    _id: string;
    title: string;
    rewardTiers?: RewardTier[];
  };
  selectedReward?: RewardTier | null;
  userId?: string;
}

export default function DonationModal({
  visible,
  onClose,
  project,
  selectedReward,
  userId,
}: DonationModalProps) {
  const [amount, setAmount] = useState(selectedReward?.minimumAmount.toString() || '100');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const [initiatePayment, { isLoading }] = useInitiatePaymentMutation();

// mobile/src/components/projectDetail/DonationModal.tsx
// Replace handleSubmit function with debug version:

const handleSubmit = async () => {
  console.log('=== DONATION SUBMIT DEBUG ===');
  console.log('Name:', name, 'Type:', typeof name);
  console.log('Email:', email, 'Type:', typeof email);
  console.log('Phone:', phone, 'Type:', typeof phone);
  console.log('Message:', message, 'Type:', typeof message);
  
  // Simple validation
  if (name.length === 0 || email.length === 0) {
    Alert.alert('Error', 'Please fill in your name and email');
    return;
  }

  const amountNum = parseInt(amount);
  if (isNaN(amountNum) || amountNum < 10) {
    Alert.alert('Error', 'Minimum donation amount is ৳10');
    return;
  }

  if (selectedReward && amountNum < selectedReward.minimumAmount) {
    Alert.alert(
      'Error',
      `Minimum amount for this reward is ৳${selectedReward.minimumAmount}`
    );
    return;
  }

const payload = {
  projectId: project._id,
  amount: amountNum,
  rewardTierId: selectedReward?._id || undefined,
  customerName: name,
  customerEmail: email,
  customerPhone: phone.length > 0 ? phone : '01700000000',  // Backend default
  customerAddress: 'Dhaka, Bangladesh',  // Add this - backend requires it
  isAnonymous,
  message: message.length > 0 ? message : undefined,
};

  console.log('Payload:', JSON.stringify(payload, null, 2));

  try {
    const result = await initiatePayment(payload).unwrap();

    console.log('Result:', result);

    if (result.data?.paymentGateway) {
      setPaymentUrl(result.data.paymentGateway);
    }
  } catch (error: any) {
    console.error('Payment error:', error);
    Alert.alert('Error', error?.data?.message || 'Payment initiation failed');
  }
};

  const handleWebViewNavigationStateChange = (navState: any) => {
    const { url } = navState;
    
    if (url.includes('/payment/success')) {
      Alert.alert('Success', 'Payment completed successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setPaymentUrl(null);
            onClose();
          },
        },
      ]);
    }
    
    if (url.includes('/payment/failed')) {
      Alert.alert('Failed', 'Payment failed. Please try again.', [
        {
          text: 'OK',
          onPress: () => {
            setPaymentUrl(null);
          },
        },
      ]);
    }
  };

  if (paymentUrl) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.webViewContainer}>
          <View style={styles.webViewHeader}>
            <Text style={styles.webViewTitle}>Payment Gateway</Text>
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Cancel Payment',
                  'Are you sure you want to cancel this payment?',
                  [
                    { text: 'No', style: 'cancel' },
                    {
                      text: 'Yes',
                      onPress: () => {
                        setPaymentUrl(null);
                        onClose();
                      },
                    },
                  ]
                );
              }}
            >
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <WebView
            source={{ uri: paymentUrl }}
            onNavigationStateChange={handleWebViewNavigationStateChange}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
              </View>
            )}
          />
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Support This Project</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.projectTitle}>{project.title}</Text>

          {selectedReward && (
            <View style={styles.rewardBox}>
              <Text style={styles.rewardLabel}>Selected Reward</Text>
              <Text style={styles.rewardTitle}>{selectedReward.title}</Text>
              <Text style={styles.rewardMinimum}>
                Minimum: ৳{selectedReward.minimumAmount.toLocaleString()}
              </Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.label}>Donation Amount *</Text>
            <TextInput
              style={styles.input}
              placeholder="100"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Your Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              value={name}
              onChangeText={setName}
              editable={!isAnonymous}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="john@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Phone (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="01XXX-XXXXXX"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Message (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Leave a message for the creator..."
              multiline
              numberOfLines={4}
              value={message}
              onChangeText={setMessage}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Make donation anonymous</Text>
            <Switch value={isAnonymous} onValueChange={setIsAnonymous} />
          </View>

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Donation Amount:</Text>
              <Text style={styles.summaryValue}>৳{amount || '0'}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Continue to Payment</Text>
            )}
          </TouchableOpacity>
        </View>
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
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  rewardBox: {
    backgroundColor: '#F0F8FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  rewardLabel: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  rewardMinimum: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 14,
    color: '#333',
  },
  summary: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34C759',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  webViewContainer: {
    flex: 1,
  },
  webViewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  webViewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});