import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/auth';
import { apiConfigured } from '../lib/supabase';

export default function Index() {
  const { loading, user, viewer } = useAuth();
  if (loading) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator color="#0f766e" /></View>;
  if (!apiConfigured) return <Redirect href="/sign-in" />;
  if (viewer) return <Redirect href="/(tabs)/today" />;
  if (user) return <Redirect href="/onboarding" />;
  return <Redirect href="/sign-in" />;
}
