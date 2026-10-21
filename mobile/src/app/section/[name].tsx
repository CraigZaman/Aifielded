import * as Crypto from 'expo-crypto';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Empty, Field, Message, Screen, color } from '../../components/ui';
import { useAuth } from '../../context/auth';
import { loadSection, sectionTitles, type SectionName } from '../../lib/sections';
import { supabase } from '../../lib/supabase';
import { useLoad } from '../../lib/use-load';
import { canManage, canManagePeople } from '../../lib/viewer';

function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.choice, selected && styles.choiceActive]} accessibilityRole="radio" accessibilityState={{ selected }}><Text style={[styles.choiceText, selected && styles.choiceTextActive]}>{label}</Text></Pressable>;
}

export default function SectionScreen() {
  const params = useLocalSearchParams<{ name?: string }>();
  const name = params.name && Object.prototype.hasOwnProperty.call(sectionTitles, params.name) ? params.name as SectionName : null;
  const { viewer } = useAuth();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [scope, setScope] = useState<'department' | 'organisation'>('department');
  const [route, setRoute] = useState<'primary' | 'alternate'>('primary');
  const [acknowledged, setAcknowledged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const allowed = !!viewer && !!name && (name === 'suggestions' || name === 'concerns' || (name === 'people' ? canManagePeople(viewer.role) : canManage(viewer.role)));
  const state = useLoad(async () => allowed && viewer && name ? loadSection(name, viewer) : [], [viewer?.id, viewer?.organisationId, name, allowed]);

  async function submit() {
    if (!supabase || !viewer || !name || busy) return;
    const heading = title.trim();
    const content = body.trim();
    if (name === 'suggestions' && (heading.length < 10 || heading.length > 500 || content.length < 10 || content.length > 5000)) {
      setNotice('Add a question (10–500 characters) and context (10–5,000 characters).'); return;
    }
    if (name === 'concerns' && (heading.length < 5 || heading.length > 200 || content.length < 10 || content.length > 10000 || !acknowledged)) {
      setNotice('Complete the report and confirm that it is confidential, not anonymous.'); return;
    }
    setBusy(true);
    setNotice('');
    try {
      const requestId = Crypto.randomUUID();
      const result = name === 'suggestions'
        ? await supabase.rpc('submit_mission_suggestion', { workspace: viewer.organisationId, request_id: requestId, proposed_question: heading, initial_contribution: content, question_scope: scope })
        : await supabase.rpc('submit_confidential_concern', { workspace: viewer.organisationId, request_id: requestId, route, concern_title: heading, concern_body: content, identity_acknowledged: true });
      if (result.error) throw result.error;
      setTitle(''); setBody(''); setAcknowledged(false);
      setNotice(name === 'suggestions' ? 'Suggestion sent for review.' : 'Confidential report sent to designated handlers.');
      await state.refresh();
    } catch {
      setNotice(name === 'suggestions' ? 'The suggestion was not sent. Check your connection and the daily limit.' : 'The report was not sent. An independent active handler must be available for that route.');
    } finally { setBusy(false); }
  }

  if (!name) return <Screen title="Page unavailable"><Message text="That workspace section does not exist." error /></Screen>;
  if (!allowed) return <Screen title={sectionTitles[name]}><Message text="Your workspace role does not permit access to this section." error /></Screen>;
  return <Screen title={sectionTitles[name]} subtitle={name === 'concerns' ? 'A confidential channel to designated handlers. It is not anonymous.' : viewer?.organisationName} refreshing={state.loading} onRefresh={() => void state.refresh()}>
    {name === 'suggestions' && <Card title="Suggest a question to explore">
      <Field label="Question" placeholder="What should your organisation understand better?" value={title} onChangeText={setTitle} maxLength={500} />
      <Field label="Context" placeholder="Add the context you want to contribute" value={body} onChangeText={setBody} multiline maxLength={5000} style={styles.multiline} />
      <View style={styles.choices}><Choice label="My department" selected={scope === 'department'} onPress={() => setScope('department')} /><Choice label="Organisation" selected={scope === 'organisation'} onPress={() => setScope('organisation')} /></View>
      <Button label="Send suggestion" onPress={() => void submit()} busy={busy} />
    </Card>}
    {name === 'concerns' && <Card title="Report a concern" subtitle="This report is confidential but not anonymous. Designated handlers may see your identity.">
      <Field label="Title" placeholder="Briefly describe the concern" value={title} onChangeText={setTitle} maxLength={200} />
      <Field label="Report" placeholder="Tell the handlers what happened" value={body} onChangeText={setBody} multiline maxLength={10000} style={styles.multiline} />
      <View style={styles.choices}><Choice label="Primary route" selected={route === 'primary'} onPress={() => setRoute('primary')} /><Choice label="Alternate route" selected={route === 'alternate'} onPress={() => setRoute('alternate')} /></View>
      <Pressable onPress={() => setAcknowledged(value => !value)} style={styles.acknowledge} accessibilityRole="checkbox" accessibilityState={{ checked: acknowledged }}><Text style={styles.acknowledgeText}>{acknowledged ? '☑' : '☐'} I understand this report is confidential, not anonymous.</Text></Pressable>
      <Button label="Submit confidential report" onPress={() => void submit()} busy={busy} />
    </Card>}
    {!!notice && <Message text={notice} error={notice.includes('not sent') || notice.startsWith('Complete') || notice.startsWith('Add a')} />}
    {!!state.error && <Message text={state.error} error />}
    {state.data?.map(row => <Card key={row.id} title={row.title} subtitle={row.subtitle} meta={row.meta} onPress={name === 'concerns' ? () => router.push({ pathname: '/concern/[id]', params: { id: row.id } }) : name === 'missions' ? () => router.push({ pathname: '/mission/[id]', params: { id: row.id } }) : undefined} />)}
    {!state.loading && !state.error && !state.data?.length && <Empty title="Nothing here yet" body="New records will appear here when your workspace adds them." />}
  </Screen>;
}

const styles = StyleSheet.create({
  multiline: { minHeight: 120, textAlignVertical: 'top', paddingTop: 12 },
  choices: { flexDirection: 'row', gap: 8, marginVertical: 6 },
  choice: { borderWidth: 1, borderColor: color.line, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: color.white },
  choiceActive: { backgroundColor: color.mint, borderColor: color.green },
  choiceText: { color: color.muted, fontSize: 12, fontWeight: '700' },
  choiceTextActive: { color: color.green },
  acknowledge: { paddingVertical: 9 },
  acknowledgeText: { color: color.ink, fontSize: 13, lineHeight: 19 },
});
