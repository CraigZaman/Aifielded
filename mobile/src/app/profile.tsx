import { useState } from 'react';
import { Button, Card, Field, Message, Screen } from '../components/ui';
import { useAuth } from '../context/auth';
import { supabase } from '../lib/supabase';
import { useLoad } from '../lib/use-load';

type Context = { details: Record<string, string> | null; use_for_dialogue: boolean };
type Document = { id: string; title: string; source_name: string | null; use_for_dialogue: boolean };

export default function ProfileScreen() {
  const { viewer } = useAuth();
  const [bio, setBio] = useState('');
  const [goals, setGoals] = useState('');
  const [skills, setSkills] = useState('');
  const [otherDetails, setOtherDetails] = useState<Record<string, string>>({});
  const [allowDialogue, setAllowDialogue] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const state = useLoad(async () => {
    if (!supabase || !viewer) return { context: null as Context | null, documents: [] as Document[] };
    const [context, documents] = await Promise.all([
      supabase.from('personal_context').select('details,use_for_dialogue').eq('user_id', viewer.id).maybeSingle(),
      supabase.from('personal_reference_documents').select('id,title,source_name,use_for_dialogue').eq('organisation_id', viewer.organisationId).eq('user_id', viewer.id).order('created_at', { ascending: false }).limit(20),
    ]);
    if (context.error || documents.error) throw context.error || documents.error;
    const details = (context.data?.details || {}) as Record<string, string>;
    setOtherDetails(details); setBio(details.bio || ''); setGoals(details.goals || ''); setSkills(details.skills || ''); setAllowDialogue(!!context.data?.use_for_dialogue);
    return { context: context.data as Context | null, documents: (documents.data || []) as Document[] };
  }, [viewer?.id, viewer?.organisationId]);

  async function save() {
    if (!supabase || !viewer) return;
    if ([bio, goals, skills].some(value => value.trim().length > 3000)) { setNotice('Keep each field under 3,000 characters.'); return; }
    setBusy(true); setNotice('');
    const details = { ...otherDetails, bio: bio.trim(), goals: goals.trim(), skills: skills.trim() };
    const { error } = await supabase.rpc('save_personal_context', { profile_details: details, allow_dialogue: allowDialogue });
    setNotice(error ? 'Your profile could not be saved. Please try again.' : 'Personal context saved. Your role and access have not changed.');
    setBusy(false);
  }

  return <Screen title="My profile" subtitle="Private context for your work." refreshing={state.loading} onRefresh={() => void state.refresh()}>
    {state.error && <Message text={state.error} error />}
    <Card title={viewer?.name || 'Your account'} subtitle={`${viewer?.email || ''} · ${viewer?.role || ''}`} />
    <Card title="Personal context" subtitle="Choose what Fielded may use in your private dialogue.">
      <Field label="About me" value={bio} onChangeText={setBio} multiline maxLength={3000} />
      <Field label="Goals" value={goals} onChangeText={setGoals} multiline maxLength={3000} />
      <Field label="Skills" value={skills} onChangeText={setSkills} multiline maxLength={3000} />
      <Button label={allowDialogue ? 'Use this in my dialogue: On' : 'Use this in my dialogue: Off'} onPress={() => setAllowDialogue(value => !value)} secondary />
      <Button label="Save personal context" onPress={() => void save()} busy={busy} />
    </Card>
    {!!notice && <Message text={notice} error={notice.includes('could not') || notice.startsWith('Keep')} />}
    {state.data?.documents.map(document => <Card key={document.id} title={document.title} subtitle={document.source_name || 'Private reference'} meta={document.use_for_dialogue ? 'Included in dialogue' : 'Excluded from dialogue'} />)}
  </Screen>;
}
