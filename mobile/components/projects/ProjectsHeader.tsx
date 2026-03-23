// mobile/src/components/projects/ProjectsHeader.tsx
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Search } from 'lucide-react-native';

interface ProjectsHeaderProps {
  searchTerm: string;
  onSearchChange: (text: string) => void;
}

export default function ProjectsHeader({ searchTerm, onSearchChange }: ProjectsHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Discover Projects</Text>
      <View style={styles.searchContainer}>
        <Search color="#666" size={20} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search projects..."
          value={searchTerm}
          onChangeText={onSearchChange}
          placeholderTextColor="#999"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#333',
  },
});