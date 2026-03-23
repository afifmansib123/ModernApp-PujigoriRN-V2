// mobile/src/components/wallet/WalletStats.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Gift, CheckCircle, QrCode } from "lucide-react-native";

interface WalletStatsProps {
  totalDonations: number;
  totalAmount: number;
  totalRewards: number;
}

export default function WalletStats({
  totalDonations,
  totalAmount,
  totalRewards,
}: WalletStatsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.statCard}>
        <View style={styles.iconContainer}>
          <Gift color="#1976D2" size={24} />
        </View>
        <View style={styles.statContent}>
          <Text style={styles.statLabel}>Total Donations</Text>
          <Text style={styles.statValue}>{totalDonations}</Text>
        </View>
      </View>

      <View style={styles.statCard}>
        <View style={[styles.iconContainer, { backgroundColor: "#E8F5E9" }]}>
          <CheckCircle color="#388E3C" size={24} />
        </View>
        <View style={styles.statContent}>
          <Text style={styles.statLabel}>Total Amount</Text>
          <Text style={styles.statValue}>৳{totalAmount.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.statCard}>
        <View style={[styles.iconContainer, { backgroundColor: "#F3E5F5" }]}>
          <QrCode color="#7B1FA2" size={24} />
        </View>
        <View style={styles.statContent}>
          <Text style={styles.statLabel}>Rewards Earned</Text>
          <Text style={styles.statValue}>{totalRewards}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundColor: {
    color: "#E3F2FD",
  },
  container: {
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
});
