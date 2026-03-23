// mobile/app/(tabs)/_layout.tsx
import { Tabs, Redirect } from 'expo-router';
import { useGetAuthUserQuery } from '../../src/state/api';
import {
  Home, Search, Wallet, User,
  Shield, DollarSign, LayoutDashboard, FolderKanban,
} from 'lucide-react-native';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function TabsLayout() {
  const { data: authUser, isLoading } = useGetAuthUserQuery();

  if (isLoading) return <LoadingSpinner />;
  if (!authUser) return <Redirect href="/signin" />;

  const role = authUser.role;
  const isAdmin   = role === 'admin';
  const isCreator = role === 'creator';
  const isUser    = role === 'user';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:
          isAdmin ? '#5856D6' : isCreator ? '#34C759' : '#007AFF',
      }}
    >
      {/* ── USER / CREATOR ── */}
      <Tabs.Screen
        name="index"
        options={{
          href: isAdmin ? null : undefined,
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: isAdmin ? null : undefined,
          title: 'Explore',
          tabBarIcon: ({ color }) => <Search color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          href: isAdmin ? null : undefined,
          title: isCreator ? 'Earnings' : 'Wallet',
          tabBarIcon: ({ color }) => <Wallet color={color} size={22} />,
        }}
      />

      {/* ── CREATOR ONLY ── */}
      <Tabs.Screen
        name="creator"
        options={{
          href: isCreator ? undefined : null,
          title: 'Studio',
          tabBarIcon: ({ color }) => <LayoutDashboard color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          href: null, // always hidden from tab bar, navigated to programmatically
        }}
      />

      {/* ── ADMIN ONLY ── */}
      <Tabs.Screen
        name="admin"
        options={{
          href: isAdmin ? undefined : null,
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Shield color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="admin-projects"
        options={{
          href: isAdmin ? undefined : null,
          title: 'Projects',
          tabBarIcon: ({ color }) => <FolderKanban color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="admin-payments"
        options={{
          href: isAdmin ? undefined : null,
          title: 'Payments',
          tabBarIcon: ({ color }) => <DollarSign color={color} size={22} />,
        }}
      />

      {/* ── ALL ROLES ── */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User color={color} size={22} />,
        }}
      />
    </Tabs>
  );
}