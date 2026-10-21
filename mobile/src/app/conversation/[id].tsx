import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card, Field, Message, Screen, color } from '../../components/ui';
import { useAuth } from '../../context/auth';
import { apiPost, ApiError } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { useLoad } from '../../lib/use-load';

type Assignment = { id: string; status: string; missions: { id: string; title: string; objective: string; context: string | null; desired_outcome: string | null; status: string } | null };
type ChatMessage = { id: string; sender: string; content: string; confidentiality: string; created_at: string };
type Summary = { id: string; summary: string; status: string };
type Conversation = { messages: ChatMessage[] | null; conversation_summaries: Summary | Summary[] | null; observations: { category: string; summary: string; confidentiality: string }[] | null };

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { viewer } = useAuth();
  const [content, setContent] = useState('');
  const [confidentiality, setConfidentiality] = useState<'PRIVATE' | 'CONTRIBUTE' | 'SHARE'>('PRIVATE');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const state = useLoad(async () => {
    if (!supabase || !viewer || !id) return null;
    const assignment = await supabase.from('mission_assignments').select('id,status,missions(id,title,objective,context,desired_outcome,status)').eq('id', id).eq('organisation_id', viewer.organisationId).eq('user_id', viewer.id).maybeSingle();
    if (assignment.error) throw assignment.error;
    if (!assignment.data) return null;
    const mission = (assignment.data as unknown as Assignment).missions;
    const [conversation, policy] = await Promise.all([
      supabase.from('conversations').select('messages(id,sender,content,confidentiality,created_at),conversation_summaries(id,summary,status),observations(category,summary,confidentiality)').eq('assignment_id', id).maybeSingle(),
      mission ? supabase.from('policy_communications').select('briefing').eq('mission_id', mission.id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    ]);
    if (conversation.error || policy.error) throw conversation.error || policy.error;
    return { assignment: assignment.data as unknown as Assignment, conversation: conversation.data as Conversation | null, policy: policy.data as { briefing: string } | null };
  }, [id, viewer?.id, viewer?.organisationId]);
  const mission = state.data?.assignment.missions;
  const messages = (state.data?.conversation?.messages || []).slice().sort((a, b) => a.created_at.localeCompare(b.created_at));
  const savedSummaries = state.data?.conversation?.conversation_summaries;
  const summaries = savedSummaries ? (Array.isArray(savedSummaries) ? savedSummaries : [savedSummaries]) : [];
  const review = summaries.find(item => item.status === 'draft');
  const approved = summaries.find(item => item.status === 'approved');
  const open = !!state.data && ['invited', 'in_progress'].includes(state.data.assignment.status) && mission?.status === 'active';

  async function send() {
    const trimmed = content.trim();
    if (!id || !trimmed || busy) return;
    if (trimmed.length > 8000) { setNotice('Please shorten this contribution to 8,000 characters.'); return; }
    setBusy(true); setNotice('');
    try {
      await apiPost(`/api/ai/chat`, { assignmentId: id, content: trimmed, confidentiality: state.data?.policy ? 'PRIVATE' : confidentiality });
      setContent('');
      await state.refresh();
    } catch (cause) {
      const saved = cause instanceof ApiError && cause.saved;
      if (saved) { setContent(''); await state.refresh(); }
      setNotice(cause instanceof Error ? `${cause.message}${saved ? ' Your contribution was saved.' : ''}` : 'Could not send. Refresh before retrying.');
    } finally { setBusy(false); }
  }

  async function complete() {
    if (!id || busy || content.trim()) { if (content.trim()) setNotice('Send or clear your draft first.'); return; }
    setBusy(true); setNotice('');
    try { await apiPost(`/api/conversations/${id}/complete`, {}, 185000); await state.refresh(); }
    catch (cause) { setNotice(cause instanceof Error ? cause.message : 'Could not prepare your summary.'); }
    finally { setBusy(false); }
  }

  async function approve() {
    if (!id || !review || busy) return;
    setBusy(true); setNotice('');
    try { await apiPost(`/api/conversations/${id}/approve`, { reviewId: review.id }, 65000); await state.refresh(); setNotice('Summary approved.'); }
    catch (cause) { setNotice(cause instanceof Error ? cause.message : 'Could not approve your summary.'); }
    finally { setBusy(false); }
  }

  return <Screen title={mission?.title || 'Conversation'} subtitle={mission?.objective} refreshing={state.loading} onRefresh={() => void state.refresh()}>
    {state.error && <Message text={state.error} error />}
    {!state.loading && !state.data && <Message text="This assignment is not available to your account." error />}
    {mission && <Card title="Mission brief" subtitle={state.data?.policy?.briefing || [mission.context, mission.desired_outcome].filter(Boolean).join('\n\n') || mission.objective} meta={state.data?.assignment.status} />}
    {messages.map(message => <Card key={message.id} title={message.sender === 'participant' ? 'You' : 'Fielded'} subtitle={message.content} meta={message.sender === 'participant' ? message.confidentiality : 'Private dialogue'} />)}
    {review && <Card title="Review your summary" subtitle={review.summary} meta="Not yet approved">
      {state.data?.conversation?.observations?.map((item, index) => <View key={`${item.category}-${index}`} style={styles.observation}><Text style={styles.observationTitle}>{item.category} · {item.confidentiality}</Text><Text style={styles.observationText}>{item.summary}</Text></View>)}
      <Button label="Approve summary" onPress={() => void approve()} busy={busy} />
    </Card>}
    {approved && <Card title="Approved summary" subtitle={approved.summary} meta="Complete" />}
    {state.data?.policy && <Button label="Policy and understanding check" onPress={() => router.push({ pathname: '/policy/[id]', params: { id: id! } })} secondary />}
    {!!notice && <Message text={notice} error={!notice.includes('approved')} />}
    {open && !review && !approved && <Card title="Your private dialogue" subtitle={state.data?.policy ? 'Policy dialogue stays private. Feedback for HR belongs in the separate understanding check.' : 'Choose how this contribution may be used.'}>
      {!state.data?.policy && <View style={styles.choices}>{(['PRIVATE', 'CONTRIBUTE', 'SHARE'] as const).map(value => <Button key={value} label={value} onPress={() => setConfidentiality(value)} secondary={confidentiality !== value} />)}</View>}
      <Field label="Message" placeholder="Tell Fielded what is happening…" value={content} onChangeText={setContent} multiline maxLength={8000} style={styles.messageInput} />
      <Button label="Send message" onPress={() => void send()} busy={busy} disabled={!content.trim()} />
      {!state.data?.policy && <Button label="Finish and review" onPress={() => void complete()} busy={busy} secondary disabled={!messages.some(item => item.sender === 'participant')} />}
    </Card>}
  </Screen>;
}

const styles = StyleSheet.create({
  choices: { gap: 7 },
  messageInput: { minHeight: 100, textAlignVertical: 'top', paddingTop: 12 },
  observation: { borderTopWidth: 1, borderTopColor: color.line, paddingVertical: 8 },
  observationTitle: { color: color.green, fontSize: 11, fontWeight: '700' },
  observationText: { color: color.ink, fontSize: 13, lineHeight: 19 },
});
