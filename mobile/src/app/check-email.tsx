import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen, Card, Field, Button, Message } from '../components/ui';
import { useAuth } from '../context/auth';
import { apiConfigured, supabase } from '../lib/supabase';

export default function CheckEmailScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const { refresh } = useAuth();
  const [email, setEmail] = useState(params.email || '');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function confirm() {
    if (!supabase) { setMessage('Email confirmation is not connected in this build yet.'); return; }
    if (!/^\S+@\S+\.\S+$/.test(email.trim()) || !/^\d{6,10}$/.test(code.trim())) {
      setMessage('Enter your email address and the verification code from the message.');
      return;
    }
    setBusy(true); setMessage('');
    try {
      const { data, error } = await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token: code.trim(), type: 'email' });
      if (error) throw error;
      if (!data.user?.email_confirmed_at || !data.session) throw new Error('Email confirmed. Please sign in to continue.');
      await refresh();
      router.replace('/');
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'The code could not be verified. Request a new code and try again.');
    } finally { setBusy(false); }
  }
  async function resend() {
    if (!supabase) { setMessage('Email confirmation is not connected in this build yet.'); return; }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setMessage('Enter a valid email address.'); return; }
    setBusy(true);
    const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim().toLowerCase() });
    setMessage(error ? 'We could not send a new code right now. Please try again later.' : 'If your email is awaiting confirmation, a new code has been sent.');
    setBusy(false);
  }
  return <Screen title="Confirm your email" subtitle="Enter the code from your email to continue here in the app.">
    {!apiConfigured && <Message text="Email confirmation will be available after the production workspace connection is enabled." />}
    <Card title="One more step" subtitle="Your organisation's workspace is protected until your email is verified." />
    <Field label="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" autoComplete="email" />
    <Field label="Verification code" value={code} onChangeText={setCode} keyboardType="number-pad" autoComplete="one-time-code" textContentType="oneTimeCode" maxLength={10} />
    {!!message && <Message text={message} error />}
    <Button label="Confirm and continue" onPress={() => void confirm()} busy={busy} />
    <Button label="Send a new code" onPress={() => void resend()} busy={busy} secondary />
    <Button label="Back to sign in" onPress={() => router.replace('/sign-in')} secondary />
  </Screen>;
}
