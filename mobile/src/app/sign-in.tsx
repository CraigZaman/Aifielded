import { useState } from 'react';
import { Link, router } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Field, Message, color } from '../components/ui';
import { useAuth } from '../context/auth';
import { apiConfigured, supabase } from '../lib/supabase';

export default function SignInScreen() {
  const { refresh } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function signIn() {
    if (!supabase) {
      setError('Live sign-in is not connected in this build yet. You can explore the native app preview below.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim()) || password.length < 8) {
      setError('Enter a valid email and a password of at least 8 characters.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (authError) throw authError;
      if (!data.user?.email_confirmed_at) {
        await supabase.auth.signOut({ scope: 'local' });
        router.replace({ pathname: '/check-email', params: { email: email.trim() } });
        return;
      }
      await refresh();
      router.replace('/');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not sign in. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
      <View style={styles.brand}><View style={styles.mark}><Text style={styles.markText}>F</Text></View><Text style={styles.brandText}>Fielded</Text></View>
      <Text style={styles.eyebrow}>YOUR WORKSPACE</Text>
      <Text style={styles.title}>Welcome back.</Text>
      <Text style={styles.subtitle}>Sign in to see the work, discussions and updates that matter to you.</Text>
      <View style={styles.form}>
        {!apiConfigured && <Message text="Live accounts are not connected yet. Explore the native screens below while the workspace connection is being completed." />}
        {!!error && <Message text={error} error />}
        <Field label="Work email" placeholder="you@company.com" value={email} onChangeText={setEmail} keyboardType="email-address" textContentType="username" autoComplete="email" />
        <Field label="Password" placeholder="Your password" value={password} onChangeText={setPassword} secureTextEntry textContentType="password" autoComplete="password" />
        <Button label="Sign in" onPress={() => void signIn()} busy={busy} />
        {!apiConfigured && <Button label="Explore app preview" onPress={() => router.replace('/preview')} secondary />}
      </View>
      <Text style={styles.help}>Need access? Ask your organisation for an invitation.</Text>
      <Link href="/sign-up" style={styles.link}>New to Fielded? Create an account</Link>
      <Link href="/packages" style={styles.link}>View packages and pricing</Link>
      <Link href="/notifications" style={styles.link}>Test phone notifications</Link>
      <Link href="/check-email" style={styles.link}>Waiting for email confirmation?</Link>
    </ScrollView>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.background },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 26, paddingVertical: 44 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 42 },
  mark: { width: 41, height: 41, borderRadius: 12, backgroundColor: color.navy, alignItems: 'center', justifyContent: 'center' },
  markText: { color: color.white, fontSize: 28, fontWeight: '800' },
  brandText: { color: color.ink, fontSize: 22, fontWeight: '700' },
  eyebrow: { color: color.green, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: color.ink, fontSize: 32, fontWeight: '700', letterSpacing: -1, marginTop: 7 },
  subtitle: { color: color.muted, fontSize: 15, lineHeight: 23, marginTop: 9 },
  form: { gap: 11, marginTop: 31 },
  help: { color: color.muted, fontSize: 13, marginTop: 24, lineHeight: 19 },
  link: { color: color.green, fontSize: 13, fontWeight: '700', marginTop: 14 },
});
