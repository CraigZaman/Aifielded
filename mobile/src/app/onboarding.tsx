import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Button, Card, Field, Message, Screen } from '../components/ui';
import { useAuth } from '../context/auth';
import { supabase } from '../lib/supabase';

function tokenFromInvitation(value: string) {
  const trimmed = value.trim();
  const match = trimmed.match(/\/join\/([A-Za-z0-9_-]{20,256})(?:[/?#]|$)/);
  return match?.[1] || (/^[A-Za-z0-9_-]{20,256}$/.test(trimmed) ? trimmed : null);
}

export default function OnboardingScreen() {
  const { user, refresh, signOut } = useAuth();
  const params = useLocalSearchParams<{ invitation?: string }>();
  const [mode, setMode] = useState<'join' | 'create'>(params.invitation || user?.user_metadata?.invitation_token ? 'join' : 'create');
  const [invitation, setInvitation] = useState(params.invitation || user?.user_metadata?.invitation_token || '');
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [workspaceName, setWorkspaceName] = useState(user?.user_metadata?.workspace_name || '');
  const [description, setDescription] = useState(user?.user_metadata?.company_description || '');
  const [website, setWebsite] = useState(user?.user_metadata?.company_website || '');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  async function finish() {
    if (!supabase || !user) return;
    setNotice(''); setBusy(true);
    try {
      if (fullName.trim().length < 2 || fullName.trim().length > 80) throw new Error('Enter your full name.');
      const profile = await supabase.from('profiles').update({ full_name: fullName.trim() }).eq('id', user.id).select('id').single();
      if (profile.error) throw profile.error;
      if (mode === 'join') {
        const token = tokenFromInvitation(invitation);
        if (!token) throw new Error('Enter the complete invitation link sent by your organisation.');
        const preview = await supabase.rpc('invitation_preview', { raw_token: token });
        const invitationData = Array.isArray(preview.data) ? preview.data[0] : null;
        if (preview.error || !invitationData || invitationData.expired) throw new Error('That invitation is invalid or expired.');
        const accepted = await supabase.rpc('accept_invitation', { raw_token: token });
        if (accepted.error) throw accepted.error;
      } else {
        if (workspaceName.trim().length < 2 || workspaceName.trim().length > 100) throw new Error('Enter a workspace name between 2 and 100 characters.');
        if (website.trim() && !/^https?:\/\//i.test(website.trim())) throw new Error('Use a complete HTTP or HTTPS website address.');
        const created = await supabase.rpc('create_company_workspace', { workspace_name: workspaceName.trim(), business_description: description.trim(), company_website: website.trim() });
        if (created.error && created.error.code !== '23505') throw created.error;
        const membership = await supabase.from('organisation_memberships').select('organisation_id').eq('user_id', user.id).eq('role', 'owner').eq('status', 'active').maybeSingle();
        if (membership.error || !membership.data) throw new Error('Your workspace was created, but the trial plan needs to be selected.');
        const trial = await supabase.rpc('choose_trial_plan', { workspace: membership.data.organisation_id, chosen_plan: 'sme' });
        if (trial.error) throw new Error('Your workspace is ready, but the trial plan could not be selected.');
      }
      await refresh(); router.replace('/');
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : 'Could not finish setup.');
    } finally { setBusy(false); }
  }

  return <Screen title="Join your workspace" subtitle="Finish setting up your Fielded account.">
    {!!notice && <Message text={notice} error />}
    <Card title="Your account" subtitle={user?.email || ''}><Field label="Full name" value={fullName} onChangeText={setFullName} autoCapitalize="words" maxLength={80} /></Card>
    <Button label="I have an invitation" onPress={() => setMode('join')} secondary={mode !== 'join'} />
    <Button label="Create a workspace" onPress={() => setMode('create')} secondary={mode !== 'create'} />
    {mode === 'join' ? <Card title="Organisation invitation"><Field label="Invitation link or token" value={invitation} onChangeText={setInvitation} autoCapitalize="none" /><Button label="Accept invitation" onPress={() => void finish()} busy={busy} /></Card>
      : <Card title="New workspace" subtitle="Starts with the standard SME trial plan.">
        <Field label="Workspace name" value={workspaceName} onChangeText={setWorkspaceName} maxLength={100} />
        <Field label="What does your company do?" value={description} onChangeText={setDescription} multiline maxLength={4000} />
        <Field label="Company website (optional)" value={website} onChangeText={setWebsite} keyboardType="url" />
        <Button label="Create workspace" onPress={() => void finish()} busy={busy} />
      </Card>}
    <Button label="Use another account" onPress={() => void signOut().then(() => router.replace('/sign-in'))} secondary />
  </Screen>;
}
