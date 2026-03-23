// mobile/app/(tabs)/projects/[slug].tsx
import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, Modal, TextInput, Alert, Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  useGetProjectQuery,
  useGetAuthUserQuery,
  useInitiatePaymentMutation,
} from '../../../src/state/api';
import {
  ArrowLeft, Users, Clock, Heart, ChevronRight,
  MapPin, Share2,
} from 'lucide-react-native';

export default function ProjectDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();

  const { data: projectData, isLoading } = useGetProjectQuery(slug);
  const { data: authUser } = useGetAuthUserQuery();
  const [initiatePayment, { isLoading: isPaying }] = useInitiatePaymentMutation();

  const [activeTab, setActiveTab] = useState<'story' | 'rewards' | 'updates' | 'backers'>('story');
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedTier, setSelectedTier] = useState<any>(null);

  const project = projectData?.data;

  if (isLoading || !project) {
    return (
      <View style={s.loadingContainer}>
        <Text style={s.loadingText}>Loading...</Text>
      </View>
    );
  }

  const pct = project.targetAmount
    ? Math.min(100, (project.currentAmount / project.targetAmount) * 100)
    : 0;
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(project.endDate).getTime() - Date.now()) / 86400000)
  );

  const handleDonate = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 50) {
      Alert.alert('Error', 'Minimum donation is ৳50');
      return;
    }
    if (!authUser) {
      Alert.alert('Login Required', 'Please sign in to donate');
      return;
    }
    try {
      const result = await initiatePayment({
        projectId: project._id,
        amount: amt,
        rewardTierId: selectedTier?._id,
        message: '',
      }).unwrap();

      setShowDonateModal(false);
      if (result.data?.paymentUrl) {
        Linking.openURL(result.data.paymentUrl);
      }
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Payment failed');
    }
  };

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={s.heroContainer}>
          {project.images?.[0] ? (
            <Image source={{ uri: project.images[0] }} style={s.heroImage} />
          ) : (
            <View style={[s.heroImage, s.heroPlaceholder]}>
              <Text style={s.heroPlaceholderText}>{project.title.charAt(0)}</Text>
            </View>
          )}
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <ArrowLeft color="#fff" size={22} />
          </TouchableOpacity>
          <View style={s.heroBadge}>
            <Text style={s.heroBadgeText}>{project.category}</Text>
          </View>
        </View>

        <View style={s.body}>
          {/* Title */}
          <Text style={s.title}>{project.title}</Text>
          <Text style={s.shortDesc}>{project.shortDescription}</Text>

          {/* Location */}
          <View style={s.locationRow}>
            <MapPin color="#999" size={14} />
            <Text style={s.locationText}>
              {project.location?.district}, {project.location?.division}
            </Text>
          </View>

          {/* Stats */}
          <View style={s.statsRow}>
            <View style={s.statItem}>
              <Text style={s.statValue}>৳{project.currentAmount?.toLocaleString() || 0}</Text>
              <Text style={s.statLabel}>raised</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Text style={s.statValue}>{project.backerCount || 0}</Text>
              <Text style={s.statLabel}>backers</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Text style={s.statValue}>{daysLeft}</Text>
              <Text style={s.statLabel}>days left</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Text style={s.statValue}>{pct.toFixed(0)}%</Text>
              <Text style={s.statLabel}>funded</Text>
            </View>
          </View>

          {/* Progress */}
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${pct}%` as any }]} />
          </View>
          <Text style={s.target}>Goal: ৳{project.targetAmount?.toLocaleString()}</Text>

          {/* Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabs}>
            {(['story', 'rewards', 'updates', 'backers'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[s.tab, activeTab === tab && s.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Tab Content */}
          {activeTab === 'story' && (
            <View style={s.tabContent}>
              <Text style={s.bodyText}>{project.description}</Text>
              {project.story && (
                <>
                  <Text style={s.subHeading}>Our Story</Text>
                  <Text style={s.bodyText}>{project.story}</Text>
                </>
              )}
              {project.risks && (
                <>
                  <Text style={s.subHeading}>Risks & Challenges</Text>
                  <Text style={s.bodyText}>{project.risks}</Text>
                </>
              )}
            </View>
          )}

          {activeTab === 'rewards' && (
            <View style={s.tabContent}>
              {project.rewardTiers?.length > 0 ? (
                project.rewardTiers.map((tier: any) => (
                  <View key={tier._id} style={s.tierCard}>
                    <Text style={s.tierAmount}>৳{tier.minimumAmount?.toLocaleString()}+</Text>
                    <Text style={s.tierTitle}>{tier.title}</Text>
                    <Text style={s.tierDesc}>{tier.description}</Text>
                    {tier.items?.length > 0 && (
                      <View style={s.tierItems}>
                        {tier.items.map((item: string, idx: number) => (
                          <Text key={idx} style={s.tierItem}>• {item}</Text>
                        ))}
                      </View>
                    )}
                    {tier.estimatedDelivery && (
                      <Text style={s.tierDelivery}>
                        Est. delivery: {new Date(tier.estimatedDelivery).toLocaleDateString()}
                      </Text>
                    )}
                    <TouchableOpacity
                      style={s.selectTierBtn}
                      onPress={() => {
                        setSelectedTier(tier);
                        setAmount(tier.minimumAmount.toString());
                        setShowDonateModal(true);
                      }}
                    >
                      <Text style={s.selectTierText}>Select This Reward</Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={s.emptyTabText}>No reward tiers available</Text>
              )}
            </View>
          )}

          {activeTab === 'updates' && (
            <View style={s.tabContent}>
              {project.updates?.length > 0 ? (
                project.updates.map((update: any) => (
                  <View key={update._id} style={s.updateCard}>
                    <Text style={s.updateDate}>
                      {new Date(update.createdAt).toLocaleDateString()}
                    </Text>
                    <Text style={s.updateTitle}>{update.title}</Text>
                    <Text style={s.updateBody}>{update.content}</Text>
                  </View>
                ))
              ) : (
                <Text style={s.emptyTabText}>No updates yet</Text>
              )}
            </View>
          )}

          {activeTab === 'backers' && (
            <View style={s.tabContent}>
              <Text style={s.backersCount}>
                {project.backerCount || 0} people have backed this project
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky Donate Button */}
      <View style={s.stickyFooter}>
        <TouchableOpacity
          style={s.donateBtn}
          onPress={() => setShowDonateModal(true)}
        >
          <Heart color="#fff" size={18} fill="#fff" />
          <Text style={s.donateBtnText}>Back This Project</Text>
        </TouchableOpacity>
      </View>

      {/* Donate Modal */}
      <Modal visible={showDonateModal} animationType="slide" presentationStyle="pageSheet">
        <View style={s.modal}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>
              {selectedTier ? `Back: ${selectedTier.title}` : 'Make a Donation'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowDonateModal(false);
                setSelectedTier(null);
                setAmount('');
              }}
            >
              <Text style={s.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={s.modalBody}>
            <Text style={s.modalProject}>{project.title}</Text>

            {selectedTier && (
              <View style={s.selectedTierInfo}>
                <Text style={s.selectedTierTitle}>{selectedTier.title}</Text>
                <Text style={s.selectedTierMin}>
                  Minimum: ৳{selectedTier.minimumAmount?.toLocaleString()}
                </Text>
              </View>
            )}

            <Text style={s.amountLabel}>Donation Amount (৳)</Text>
            <TextInput
              style={s.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount"
              keyboardType="numeric"
            />

            {/* Quick amounts */}
            <View style={s.quickAmounts}>
              {[100, 500, 1000, 5000].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[s.quickAmt, amount === amt.toString() && s.quickAmtActive]}
                  onPress={() => setAmount(amt.toString())}
                >
                  <Text style={[s.quickAmtText, amount === amt.toString() && s.quickAmtTextActive]}>
                    ৳{amt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={s.feeNote}>
              <Text style={s.feeNoteText}>
                A 5% platform fee applies. Creators receive 95% of all donations.
              </Text>
            </View>
          </ScrollView>
          <View style={s.modalFooter}>
            <TouchableOpacity
              style={s.cancelBtn}
              onPress={() => { setShowDonateModal(false); setSelectedTier(null); setAmount(''); }}
            >
              <Text style={s.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.payBtn, isPaying && s.payBtnDisabled]}
              onPress={handleDonate}
              disabled={isPaying}
            >
              <Text style={s.payBtnText}>{isPaying ? 'Processing...' : 'Proceed to Pay'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#666', fontSize: 16 },
  heroContainer: { position: 'relative' },
  heroImage: { width: '100%', height: 280 },
  heroPlaceholder: {
    backgroundColor: '#C8E6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroPlaceholderText: { fontSize: 80, fontWeight: 'bold', color: '#007AFF', opacity: 0.3 },
  backBtn: {
    position: 'absolute',
    top: 48,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    padding: 8,
  },
  heroBadge: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  heroBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  body: { padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 8 },
  shortDesc: { fontSize: 15, color: '#555', lineHeight: 22, marginBottom: 10 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  locationText: { fontSize: 13, color: '#999' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#007AFF' },
  statLabel: { fontSize: 11, color: '#999', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#F0F0F0', marginHorizontal: 4 },
  progressBar: { height: 8, backgroundColor: '#E5E5E5', borderRadius: 4, marginBottom: 6 },
  progressFill: { height: 8, backgroundColor: '#007AFF', borderRadius: 4 },
  target: { fontSize: 13, color: '#666', marginBottom: 16, textAlign: 'right' },
  tabs: { marginBottom: 16 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  tabActive: { backgroundColor: '#007AFF' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#666' },
  tabTextActive: { color: '#fff' },
  tabContent: { paddingBottom: 100 },
  subHeading: { fontSize: 17, fontWeight: 'bold', color: '#1A1A1A', marginTop: 16, marginBottom: 8 },
  bodyText: { fontSize: 15, color: '#444', lineHeight: 24 },
  tierCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E8F4FF',
  },
  tierAmount: { fontSize: 22, fontWeight: 'bold', color: '#007AFF', marginBottom: 4 },
  tierTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 6 },
  tierDesc: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 8 },
  tierItems: { marginBottom: 8 },
  tierItem: { fontSize: 13, color: '#555', marginBottom: 3 },
  tierDelivery: { fontSize: 12, color: '#999', marginBottom: 12 },
  selectTierBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectTierText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  updateCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  updateDate: { fontSize: 12, color: '#999', marginBottom: 4 },
  updateTitle: { fontSize: 15, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 6 },
  updateBody: { fontSize: 14, color: '#555', lineHeight: 20 },
  backersCount: { fontSize: 16, color: '#555', textAlign: 'center', paddingVertical: 30 },
  emptyTabText: { fontSize: 15, color: '#999', textAlign: 'center', paddingVertical: 40 },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  donateBtn: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
  },
  donateBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
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
  modalClose: { fontSize: 20, color: '#666' },
  modalBody: { flex: 1, padding: 20 },
  modalProject: { fontSize: 15, color: '#555', marginBottom: 16 },
  selectedTierInfo: {
    backgroundColor: '#E8F4FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectedTierTitle: { fontSize: 15, fontWeight: '600', color: '#007AFF' },
  selectedTierMin: { fontSize: 13, color: '#555', marginTop: 2 },
  amountLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  amountInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 12,
  },
  quickAmounts: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  quickAmt: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  quickAmtActive: { backgroundColor: '#007AFF' },
  quickAmtText: { fontSize: 14, fontWeight: '600', color: '#555' },
  quickAmtTextActive: { color: '#fff' },
  feeNote: { backgroundColor: '#FFF8E1', padding: 10, borderRadius: 8 },
  feeNoteText: { fontSize: 12, color: '#8B6914' },
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
  cancelBtnText: { fontSize: 16, fontWeight: '600', color: '#666' },
  payBtn: {
    flex: 2,
    paddingVertical: 14,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    alignItems: 'center',
  },
  payBtnDisabled: { opacity: 0.6 },
  payBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});