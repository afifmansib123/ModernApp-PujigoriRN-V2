// mobile/src/components/home/CategoriesGrid.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const categories = [
  { name: 'Technology', icon: '💻', color: '#007AFF' },
  { name: 'Art', icon: '🎨', color: '#FF2D55' },
  { name: 'Music', icon: '🎵', color: '#AF52DE' },
  { name: 'Film', icon: '🎬', color: '#FF9500' },
  { name: 'Games', icon: '🎮', color: '#34C759' },
  { name: 'Food', icon: '🍔', color: '#FF3B30' },
];

export default function CategoriesGrid() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📂 Categories</Text>
      <View style={styles.grid}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.name}
            style={[styles.categoryBox, { backgroundColor: category.color }]}
            onPress={() => router.push(`/category/${category.name.toLowerCase()}`)}
          >
            <Text style={styles.icon}>{category.icon}</Text>
            <Text style={styles.categoryName}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryBox: {
    width: '48%',
    aspectRatio: 1.5,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});