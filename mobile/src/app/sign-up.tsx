import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Button, Card, Field, Message, Screen, color } from '../components/ui';
import { useAuth } from '../context/auth';
import { businessRoles, departments } from '../lib/profile-options';
import { apiConfigured, supabase } from '../lib/supabase';
import { isPlanId, plans, type PlanId } from '../lib/plans';

type Path = 'manager' | 'employee';
type Invitation = { expired?: boolean; invited_email?: string | null; organisation_name?: string };

function invitationToken(value: string) {
  const candidate = value.trim();
  const match = candidate.match(/\/join\/([A-Za-z0-9_-]{20,256})(?:[/?#]|$)/);
  return match?.[1] || (/^[A-Za-z0-9_-]{20,256}$/.test(candidate) ? candidate : null);
}

function SelectOptions({ label, options, value, onChange }: { label: string; options: readonly (readonly [string, string])[]; value: string; onChange: (value: string) => void }) {
  return <Card title={label}>{options.map(([option, title]) => <Pressable key={option} onPress={() => onChange(option)} accessibilityRole="radio" accessibilityState={{ selected: value === option }} style={[styles.option, value === option && styles.selected]}><Text style={styles.optionText}>{value === option ? '◉' : '○'}  {title}</Text></Pressable>)}</Card>;
}

export default function SignUpScreen() {
  const { plan } = useLocalSearchParams<{ plan?: string }>();
  const { refresh } = useAuth();
  const [path, setPath] = useState<Path>('manager');
  const [selectedPlan, setSelectedPlan] = useState<PlanId>(isPlanId(plan) ? plan : 'sme');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessRole, setBusinessRole] = useState('');
  const [department, setDepartment] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [invitation, setInvitation] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  async function openLegal(page: 'terms' | 'privacy') {
    setNotice('');
    try {
      await WebBrowser.openBrowserAsync(`https://fielded.ai/${page}`, {
        createTask: false,
        showInRecents: false,
        dismissButtonStyle: 'close',
        toolbarColor: color.white,
        controlsColor: color.green,
      });
    } catch {
      setNotice('Could not open this document. Please try again.');
    }
  }

  async function signUp() {
    if (!supabase) {
      setNotice('Live account creation is not connected in this build yet. You can explore the native app preview below.');
      return;
    }
    if (busy) return;
    setNotice('');
    const address = email.trim().toLowerCase();
    if (name.trim().length < 2 || name.trim().length > 80 || !/^\S+@\S+\.\S+$/.test(address) || password.length < 8) {
      setNotice('Enter your name, a valid work email, and a password of at least 8 characters.'); return;
    }
    if (!businessRole || !department) { setNotice('Choose your position and team.'); return; }
    if (!termsAccepted) { setNotice('Accept the private beta terms and acknowledge the privacy notice to continue.'); return; }
    if (path === 'manager' && (workspaceName.trim().length < 2 || workspaceName.trim().length > 100 || description.length > 4000 || (website.trim() && !/^https?:\/\/\S+$/i.test(website.trim())))) {
      setNotice('Enter a workspace name and a complete website address if you have one.'); return;
    }
    const token = path === 'employee' ? invitationToken(invitation) : null;
    if (path === 'employee' && !token) { setNotice('Enter the complete Fielded invitation link sent by your organisation.'); return; }
    setBusy(true);
    try {
      let invitedEmail: string | null = null;
      if (token) {
        const preview = await supabase.rpc('invitation_preview', { raw_token: token });
        const details = (Array.isArray(preview.data) ? preview.data[0] : preview.data) as Invitation | null;
        if (preview.error || !details || details.expired) throw new Error('This invitation is invalid or expired. Ask for a new link.');
        invitedEmail = details.invited_email || null;
        if (invitedEmail && invitedEmail.toLowerCase() !== address) throw new Error(`Use the email address on the invitation: ${invitedEmail}`);
      }
      const result = await supabase.auth.signUp({
        email: invitedEmail || address,
        password,
        options: {
          // Native members enter the email OTP on /check-email. The same email
          // keeps its confirmation link for people who signed up on the web.
          data: {
            full_name: name.trim(), business_role: businessRole, department,
            onboarding_path: path, trial_plan: path === 'manager' ? selectedPlan : undefined,
            workspace_name: path === 'manager' ? workspaceName.trim() : undefined,
            company_description: path === 'manager' ? description.trim() : undefined,
            company_website: path === 'manager' ? website.trim() : undefined,
            invitation_token: token || undefined,
          },
        },
      });
      if (result.error) throw result.error;
      if (result.data.session && result.data.user?.email_confirmed_at) {
        await refresh();
        router.replace({ pathname: '/onboarding', params: token ? { invitation: token } : {} });
      } else {
        if (result.data.session) await supabase.auth.signOut({ scope: 'local' });
        router.replace({ pathname: '/check-email', params: { email: address } });
      }
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : 'Could not create your account. Please try again.');
    } finally { setBusy(false); }
  }

  return <Screen title="Create an account" subtitle="Join your organisation or start a Fielded workspace.">
    {!apiConfigured && <Message text="This is the native registration screen. Account creation will work when the production workspace connection is enabled." />}
    {!!notice && <Message text={notice} error />}
    <Button label="Start a workspace" onPress={() => setPath('manager')} secondary={path !== 'manager'} />
    <Button label="Join with an invitation" onPress={() => setPath('employee')} secondary={path !== 'employee'} />
    {path === 'employee' && <Field label="Invitation link or token" value={invitation} onChangeText={setInvitation} autoCapitalize="none" />}
    <Card title="Your account">
      <Field label="Full name" value={name} onChangeText={setName} autoCapitalize="words" maxLength={80} />
      <Field label="Work email" value={email} onChangeText={setEmail} keyboardType="email-address" autoComplete="email" />
      <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" />
    </Card>
    {path === 'manager' && <Card title="Your organisation">
      <Field label="Workspace name" value={workspaceName} onChangeText={setWorkspaceName} maxLength={100} />
      <Field label="What does your company do? (optional)" value={description} onChangeText={setDescription} multiline maxLength={4000} />
      <Field label="Company website (optional)" value={website} onChangeText={setWebsite} keyboardType="url" />
    </Card>}
    <SelectOptions label="Your position" options={businessRoles} value={businessRole} onChange={setBusinessRole} />
    <SelectOptions label="Team or function" options={departments} value={department} onChange={setDepartment} />
    {path === 'manager' && <>
      <SelectOptions label="Workspace package" options={plans.map(item => [item.id, `${item.name} · up to ${item.seats} people · ${item.monthlyPrice}/month after trial`] as const)} value={selectedPlan} onChange={value => setSelectedPlan(value as PlanId)} />
      <Message text="Published pricing is in GBP. The live service requires payment details for a 30-day trial; this mobile build does not collect payment or activate a subscription. Access-code signup is not yet available." />
    </>}
    <Button label="Read terms" onPress={() => void openLegal('terms')} secondary />
    <Button label="Read privacy notice" onPress={() => void openLegal('privacy')} secondary />
    <Pressable onPress={() => setTermsAccepted(value => !value)} accessibilityRole="checkbox" accessibilityState={{ checked: termsAccepted }} style={styles.consent}><Text style={styles.consentText}>{termsAccepted ? '☑' : '☐'} I agree to the private beta terms and acknowledge the privacy notice.</Text></Pressable>
    <Button label="Create account" onPress={() => void signUp()} busy={busy} />
    {!apiConfigured && <Button label="Explore app preview" onPress={() => router.replace('/preview')} secondary />}
    <Button label="Already have an account? Sign in" onPress={() => router.replace('/sign-in')} secondary />
  </Screen>;
}

const styles = StyleSheet.create({
  option: { paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: color.line, borderRadius: 9 },
  selected: { backgroundColor: color.mint, borderColor: color.green },
  optionText: { color: color.ink, fontSize: 13 },
  consent: { padding: 15 },
  consentText: { color: color.ink, fontSize: 13, lineHeight: 20 },
});
