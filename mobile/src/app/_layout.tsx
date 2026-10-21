import { Ionicons } from '@expo/vector-icons';
import { router, Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../context/auth';
import { color } from '../components/ui';
import { PushEvents } from '../components/push-events';

function NavigationBack() {
  const pathname = usePathname();
  const { viewer } = useAuth();

  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else if (pathname === '/sign-in') {
      router.replace('/preview');
    } else {
      router.replace(viewer ? '/(tabs)/today' : '/sign-in');
    }
  }

  return <Pressable onPress={goBack} style={styles.back} accessibilityRole="button" accessibilityLabel="Back" hitSlop={8}>
    <Ionicons name="chevron-back" size={23} color={color.green} />
    <Text style={styles.backText}>Back</Text>
  </Pressable>;
}

function RootNavigator() {
  const { loading, viewer } = useAuth();
  return <Stack screenOptions={{ headerShown: true, headerLeft: () => <NavigationBack />, headerStyle: { backgroundColor: color.white }, headerTintColor: color.green, headerTitleStyle: { color: color.ink, fontWeight: '700' } }}>
    <Stack.Screen name="index" options={{ headerShown: false }} />
    <Stack.Screen name="preview" options={{ headerShown: false }} />
    <Stack.Screen name="setup" options={{ title: 'Connection' }} />
    <Stack.Screen name="sign-in" options={{ title: 'Sign in' }} />
    <Stack.Screen name="sign-up" options={{ title: 'Create account' }} />
    <Stack.Screen name="packages" options={{ headerShown: true, title: 'Packages' }} />
    <Stack.Screen name="notifications" options={{ headerShown: true, title: 'Notifications' }} />
    <Stack.Screen name="check-email" options={{ title: 'Confirm email' }} />
    <Stack.Screen name="onboarding" options={{ title: 'Join workspace' }} />
    <Stack.Protected guard={loading || !!viewer} redirectTo="/">
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: true, title: 'My profile' }} />
      <Stack.Screen name="settings" options={{ headerShown: true, title: 'Settings' }} />
      <Stack.Screen name="section/[name]" options={{ headerShown: true, title: 'Workspace' }} />
      <Stack.Screen name="conversation/[id]" options={{ headerShown: true, title: 'Conversation' }} />
      <Stack.Screen name="policy/[id]" options={{ headerShown: true, title: 'Understanding check' }} />
      <Stack.Screen name="concern/[id]" options={{ headerShown: true, title: 'Confidential report' }} />
      <Stack.Screen name="mission/[id]" options={{ headerShown: true, title: 'Mission' }} />
    </Stack.Protected>
  </Stack>;
}

export default function RootLayout() {
  return <SafeAreaProvider><AuthProvider><StatusBar style="dark" /><RootNavigator /><PushEvents /></AuthProvider></SafeAreaProvider>;
}

const styles = StyleSheet.create({
  back: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 1, paddingRight: 12 },
  backText: { color: color.green, fontSize: 16 },
});
