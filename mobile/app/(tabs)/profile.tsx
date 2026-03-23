// mobile/app/(tabs)/profile.tsx
import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Alert, Modal, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  useGetAuthUserQuery,
  useUpdateUserProfileMutation,
} from '../../src/state/api';
import { authService } from '../../src/services/authService';
import {
  User, Mail, LogOut, ChevronRight, Edit2, Shield,
  FolderKanban, Heart, Wallet,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { data: authUser, refetch } = useGetAuthUserQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await authService.logout();
            router.replace('/signin');
          } catch (error) {
            console.error('Logout error:', error);
          }
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    setEditName(authUser?.name || '');
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    try {
      await updateProfile({ userId: authUser?._id, data: { name: editName } }).unwrap();
      setShowEditModal(false);
      refetch();
      Alert.alert('Success', 'Profile updated');
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Failed to update');
    }
  };

  const roleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#5856D6';
      case 'creator': return '#34C759';
      default: return '#007AFF';
    }
  };

  const roleLabel = (role: string) => {
    switch (role) {
      case 'admin': return '⚡ Admin';
      case 'creator': return '🚀 Creator';
      default: return '👤 User';
    }
  };

  const menuSections = [
    ...(authUser?.role === 'user' ? [{
      title: 'My Activity',
      items: [
        { icon: <Heart color="#FF3B30" size={20} />, label: 'My Donations', onPress: () => router.push('/(tabs)/wallet') },
      ],
    }] : []),
    ...(authUser?.role === 'creator' ? [{
      title: 'Creator',
      items: [
        { icon: <FolderKanban color="#34C759" size={20} />, label: 'My Projects', onPress: () => router.push('/(tabs)/creator') },
        { icon: <Wallet color="#34C759" size={20} />, label: 'Creator Wallet', onPress: () => router.push('/(tabs)/creator-wallet') },
      ],
    }] : []),
    ...(authUser?.role === 'admin' ? [{
      title: 'Administration',
      items: [
        { icon: <Shield color="#5856D6" size={20} />, label: 'Admin Dashboard', onPress: () => router.push('/(tabs)/admin') },
        { icon: <FolderKanban color="#5856D6" size={20} />, label: 'Manage Projects', onPress: () => router.push('/(tabs)/admin-projects') },
        { icon: <Wallet color="#5856D6" size={20} />, label: 'Payment Requests', onPress: () => router.push('/(tabs)/admin-payments') },
      ],
    }] : []),
  ];

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={s.userCard}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>
              {authUser?.name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
          <View style={s.userInfo}>
            <Text style={s.userName}>{authUser?.name || 'User'}</Text>
            <Text style={s.userEmail}>{authUser?.email}</Text>
            <View style={[s.roleBadge, { backgroundColor: roleColor(authUser?.role || 'user') + '15' }]}>
              <Text style={[s.roleText, { color: roleColor(authUser?.role || 'user') }]}>
                {roleLabel(authUser?.role || 'user')}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={s.editBtn} onPress={handleEditProfile}>
            <Edit2 color="#007AFF" size={18} />
          </TouchableOpacity>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, si) => (
          <View key={si} style={s.section}>
            <Text style={s.sectionTitle}>{section.title}</Text>
            <View style={s.menuCard}>
              {section.items.map((item, ii) => (
                <TouchableOpacity
                  key={ii}
                  style={[s.menuItem, ii < section.items.length - 1 && s.menuItemBorder]}
                  onPress={item.onPress}
                >
                  <View style={s.menuIcon}>{item.icon}</View>
                  <Text style={s.menuLabel}>{item.label}</Text>
                  <ChevronRight color="#CCC" size={18} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Account Info */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Account</Text>
          <View style={s.menuCard}>
            <View style={[s.menuItem, s.menuItemBorder]}>
              <View style={s.menuIcon}><Mail color="#666" size={20} /></View>
              <Text style={s.menuLabel}>{authUser?.email}</Text>
            </View>
            <View style={s.menuItem}>
              <View style={s.menuIcon}><User color="#666" size={20} /></View>
              <Text style={s.menuLabel}>ID: {authUser?._id?.slice(-8)}</Text>
            </View>
          </View>
        </View>

        {/* Logout */}
        <View style={s.section}>
          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
            <LogOut color="#FF3B30" size={20} />
            <Text style={s.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={showEditModal} animationType="slide" presentationStyle="pageSheet">
        <View style={s.modal}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={s.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={s.modalBody}>
            <Text style={s.inputLabel}>Full Name</Text>
            <TextInput
              style={s.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Your full name"
              autoFocus
            />
          </View>
          <View style={s.modalFooter}>
            <TouchableOpacity style={s.cancelBtn} onPress={() => setShowEditModal(false)}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.saveBtn, isUpdating && s.saveBtnDisabled]}
              onPress={handleSaveProfile}
              disabled={isUpdating}
            >
              <Text style={s.saveText}>{isUpdating ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  userCard: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  userInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 2 },
  userEmail: { fontSize: 13, color: '#999', marginBottom: 6 },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  roleText: { fontSize: 12, fontWeight: '700' },
  editBtn: { padding: 8 },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#999', marginBottom: 8, textTransform: 'uppercase' },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  menuIcon: { width: 28, alignItems: 'center' },
  menuLabel: { flex: 1, fontSize: 15, color: '#1A1A1A' },
  logoutBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#FF3B30' },
  modal: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 20,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  modalClose: { fontSize: 20, color: '#666' },
  modalBody: { flex: 1, padding: 20 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: '#E5E5E5',
    borderRadius: 8, padding: 12,
    fontSize: 16, color: '#333',
  },
  modalFooter: {
    flexDirection: 'row', gap: 12, padding: 20,
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  cancelBtn: {
    flex: 1, paddingVertical: 14,
    backgroundColor: '#F0F0F0', borderRadius: 10, alignItems: 'center',
  },
  cancelText: { fontSize: 16, fontWeight: '600', color: '#666' },
  saveBtn: {
    flex: 1, paddingVertical: 14,
    backgroundColor: '#007AFF', borderRadius: 10, alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});