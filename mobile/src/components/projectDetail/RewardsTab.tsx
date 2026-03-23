// mobile/src/components/projectDetail/RewardsTab.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface RewardTier {
  _id: string;
  title: string;
  description: string;
  minimumAmount: number;
  items: string[];
  deliveryDate?: string;
}

interface RewardsTabProps {
  rewardTiers: RewardTier[];
  onSelectReward: (tier: RewardTier) => void;
}

export default function RewardsTab({ rewardTiers, onSelectReward }: RewardsTabProps) {
  if (!rewardTiers || rewardTiers.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No rewards available for this project</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {rewardTiers.map((tier) => (
        <TouchableOpacity
          key={tier._id}
          style={styles.rewardCard}
          onPress={() => onSelectReward(tier)}
        >
          <View style={styles.rewardHeader}>
            <Text style={styles.rewardAmount}>৳{tier.minimumAmount.toLocaleString()}</Text>
            <Text style={styles.rewardTitle}>{tier.title}</Text>
          </View>
          
          <Text style={styles.rewardDescription}>{tier.description}</Text>
          
          {tier.items && tier.items.length > 0 && (
            <View style={styles.itemsList}>
              <Text style={styles.itemsLabel}>Includes:</Text>
              {tier.items.map((item, idx) => (
                <View key={idx} style={styles.itemRow}>
                  <Text style={styles.bullet}>✓</Text>
                  <Text style={styles.itemText}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          {tier.deliveryDate && (
            <Text style={styles.delivery}>
              Estimated delivery: {new Date(tier.deliveryDate).toLocaleDateString()}
            </Text>
          )}

          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => onSelectReward(tier)}
          >
            <Text style={styles.selectButtonText}>Select This Reward</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  rewardCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  rewardHeader: {
    marginBottom: 12,
  },
  rewardAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34C759',
    marginBottom: 4,
  },
  rewardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  rewardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  itemsList: {
    marginBottom: 12,
  },
  itemsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  bullet: {
    color: '#34C759',
    marginRight: 8,
    fontSize: 14,
  },
  itemText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
  },
  delivery: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  selectButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});