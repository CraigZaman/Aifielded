import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../../context/auth';
import { canManage } from '../../lib/viewer';
import { color } from '../../components/ui';

const iconColor = (value: unknown) => typeof value === 'string' ? value : color.muted;

export default function WorkspaceLayout() {
  const { loading, user, viewer } = useAuth();
  if (loading) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator color={color.green} /></View>;
  if (!user) return <Redirect href="/sign-in" />;
  if (!viewer) return <Redirect href="/onboarding" />;
  return <Tabs screenOptions={{ headerStyle: { backgroundColor: color.white }, headerTitleStyle: { color: color.ink, fontWeight: '700' }, tabBarActiveTintColor: color.green, tabBarInactiveTintColor: color.muted, tabBarStyle: { backgroundColor: color.white, borderTopColor: color.line }, sceneStyle: { backgroundColor: color.background } }}>
    <Tabs.Screen name="today" options={{ title: 'Today', tabBarIcon: ({ color: tint, size }) => <Ionicons name="today-outline" color={iconColor(tint)} size={size} /> }} />
    <Tabs.Screen name="conversations" options={{ title: 'Discuss', tabBarIcon: ({ color: tint, size }) => <Ionicons name="chatbubbles-outline" color={iconColor(tint)} size={size} /> }} />
    <Tabs.Screen name="updates" options={{ title: 'Updates', tabBarIcon: ({ color: tint, size }) => <Ionicons name="megaphone-outline" color={iconColor(tint)} size={size} /> }} />
    <Tabs.Screen name="manage" options={{ title: 'Manage', href: canManage(viewer.role) ? '/manage' : null, tabBarIcon: ({ color: tint, size }) => <Ionicons name="grid-outline" color={iconColor(tint)} size={size} /> }} />
    <Tabs.Screen name="more" options={{ title: 'More', tabBarIcon: ({ color: tint, size }) => <Ionicons name="ellipsis-horizontal-circle-outline" color={iconColor(tint)} size={size} /> }} />
  </Tabs>;
}
