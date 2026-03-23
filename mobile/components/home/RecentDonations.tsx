// mobile/src/components/home/RecentDonations.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

interface Donation {
  _id: string;
  amount: number;
  donor?: {
    name: string;
  };
  user?: {
    name: string;
  };
  project: {
    title: string;
  };
  createdAt: string;
  anonymous?: boolean;
}

interface RecentDonationsProps {
  donations: Donation[];
}

export default function RecentDonations({ donations }: RecentDonationsProps) {
  const renderItem = ({ item }: { item: Donation }) => {
    const donorName = item.anonymous 
      ? 'Anonymous' 
      : item.donor?.name || item.user?.name || 'Anonymous';

    return (
      <View style={styles.donationItem}>
        <View style={styles.donationLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{donorName.charAt(0)}</Text>
          </View>
          <View style={styles.donationInfo}>
            <Text style={styles.donorName}>{donorName}</Text>
            <Text style={styles.projectName} numberOfLines={1}>
              {item.project?.title || 'Unknown Project'}
            </Text>
          </View>
        </View>
        <Text style={styles.amount}>৳{item.amount.toLocaleString()}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💚 Recent Donations</Text>
      <FlatList
        data={donations}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  donationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  donationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  donationInfo: {
    flex: 1,
  },
  donorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  projectName: {
    fontSize: 12,
    color: '#666',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#34C759',
  },
});