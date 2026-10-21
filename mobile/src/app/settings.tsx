import { router } from 'expo-router';
import { useState } from 'react';
import { Button, Card, Field, Message, Screen } from '../components/ui';
import { useAuth } from '../context/auth';
import { supabase } from '../lib/supabase';

export default function SettingsScreen() {
  const { viewer, refresh, signOut } = useAuth();
  const [name, setName] = useState(viewer?.name || '');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  async function save() {
    if (!supabase || !viewer) return;
    if (name.trim().length < 2 || name.trim().length > 80) { setNotice('Enter a name between 2 and 80 characters.'); return; }
    setBusy(true); setNotice('');
    const { data, error } = await supabase.from('profiles').update({ full_name: name.trim() }).eq('id', viewer.id).select('id').single();
    if (error || !data) setNotice('Your name could not be saved.');
    else { await refresh(); setNotice('Your display name has been updated.'); }
    setBusy(false);
  }
  async function leave() {
    setBusy(true);
    try { await signOut(); router.replace('/sign-in'); }
    catch { setNotice('Could not sign out. Try again.'); setBusy(false); }
  }
  return <Screen title="Settings" subtitle={viewer?.organisationName}>
    <Card title="Workspace" subtitle={`${viewer?.organisationName || ''} · ${viewer?.role || ''}`} meta={viewer?.email} />
    <Card title="Your account">
      <Field label="Display name" value={name} onChangeText={setName} autoCapitalize="words" maxLength={80} />
      <Button label="Save name" onPress={() => void save()} busy={busy} />
    </Card>
    <Card title="Privacy boundary" subtitle="Private conversation notes stay in your dialogue. Only approved non-private observations contribute to management intelligence." />
    {!!notice && <Message text={notice} error={notice.includes('could not') || notice.startsWith('Enter')} />}
    <Button label="Sign out" onPress={() => void leave()} secondary busy={busy} />
  </Screen>;
}
