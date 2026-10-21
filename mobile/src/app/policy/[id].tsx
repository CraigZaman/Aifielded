import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Field, Message, Screen, color } from '../../components/ui';
import { useAuth } from '../../context/auth';
import { apiPost } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { useLoad } from '../../lib/use-load';

type Question = { question: string; options: string[]; correctIndex?: number; explanation?: string; sourceQuote?: string };
type Result = { score: number; questions: Question[] };

export default function PolicyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { viewer } = useAuth();
  const [answers, setAnswers] = useState<number[]>([-1, -1, -1]);
  const [concerns, setConcerns] = useState<'yes' | 'no' | ''>('');
  const [feedback, setFeedback] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [submitted, setSubmitted] = useState<Result | null>(null);
  const state = useLoad(async () => {
    if (!supabase || !viewer || !id) return null;
    const assignment = await supabase.from('mission_assignments').select('id,mission_id,status,missions(title,status)').eq('id', id).eq('user_id', viewer.id).eq('organisation_id', viewer.organisationId).maybeSingle();
    if (assignment.error) throw assignment.error;
    if (!assignment.data) return null;
    const [policy, result] = await Promise.all([
      supabase.from('policy_communications').select('version,policy_text,briefing,questions,source_name').eq('mission_id', assignment.data.mission_id).maybeSingle(),
      supabase.rpc('policy_check_result', { target_assignment: id }),
    ]);
    if (policy.error || result.error) throw policy.error || result.error;
    if (!policy.data) return null;
    const mission = assignment.data.missions as unknown as { title: string; status: string } | null;
    return { assignment: assignment.data, policy: policy.data, result: result.data as Result | null, mission };
  }, [id, viewer?.id, viewer?.organisationId]);
  const questions = (state.data?.policy.questions || []) as Question[];
  const result = submitted || state.data?.result;
  const open = !!state.data && ['invited', 'in_progress'].includes(state.data.assignment.status) && state.data.mission?.status === 'active';

  async function submit() {
    if (!id || busy || questions.length !== 3 || answers.includes(-1) || !concerns || !acknowledged) {
      setNotice('Answer all three questions, choose whether you have concerns, and confirm your submission.'); return;
    }
    setBusy(true); setNotice('');
    try {
      const saved = await apiPost<Result>('/api/communications/check', { assignmentId: id, answers, acknowledged, hasConcerns: concerns === 'yes', feedback }, 70000);
      setSubmitted(saved);
    } catch (cause) { setNotice(cause instanceof Error ? cause.message : 'The check could not be saved.'); }
    finally { setBusy(false); }
  }

  return <Screen title={state.data?.mission?.title || 'Understanding check'} subtitle={state.data ? `Policy version ${state.data.policy.version}` : undefined} refreshing={state.loading} onRefresh={() => void state.refresh()}>
    {state.error && <Message text={state.error} error />}
    {!state.loading && !state.data && <Message text="This policy assignment is not available to your account." error />}
    {state.data && <Card title="Policy briefing" subtitle={state.data.policy.briefing} meta={state.data.policy.source_name || undefined} />}
    {state.data && <Card title="Published policy" subtitle={state.data.policy.policy_text} />}
    {open && <Button label="Discuss privately with Fielded" onPress={() => router.push({ pathname: '/conversation/[id]', params: { id: id! } })} secondary />}
    {result ? <Card title={`Check saved: ${result.score} / 3 correct`} subtitle="This is an understanding check, not a compliance certification.">
      {result.questions.map((question, index) => <View key={index} style={styles.question}><Text style={styles.questionTitle}>{index + 1}. {question.question}</Text><Text style={styles.explanation}>Correct answer: {question.options[question.correctIndex ?? 0]}</Text>{!!question.explanation && <Text style={styles.explanation}>{question.explanation}</Text>}</View>)}
    </Card> : open && <Card title="Three quick questions" subtitle="HR can see your name, acknowledgement, score, concern flag, and feedback submitted here. Your private chat is not included.">
      {questions.map((question, index) => <View key={index} style={styles.question}>
        <Text style={styles.questionTitle}>{index + 1}. {question.question}</Text>
        {question.options.map((option, optionIndex) => <Pressable key={optionIndex} onPress={() => setAnswers(current => current.map((value, answerIndex) => answerIndex === index ? optionIndex : value))} style={[styles.option, answers[index] === optionIndex && styles.optionActive]} accessibilityRole="radio" accessibilityState={{ selected: answers[index] === optionIndex }}><Text style={styles.optionText}>{option}</Text></Pressable>)}
      </View>)}
      <Text style={styles.questionTitle}>Do you have concerns or need clarification?</Text>
      <Button label="Yes, ask HR to follow up" onPress={() => setConcerns('yes')} secondary={concerns !== 'yes'} />
      <Button label="No concerns to flag" onPress={() => setConcerns('no')} secondary={concerns !== 'no'} />
      <Field label="Feedback for HR (optional)" value={feedback} onChangeText={setFeedback} multiline maxLength={2000} style={styles.feedback} />
      <Message text="For sensitive reports, use the designated reporting channel. Do not include allegations or identifying details here." />
      <Pressable onPress={() => setAcknowledged(value => !value)} accessibilityRole="checkbox" accessibilityState={{ checked: acknowledged }}><Text style={styles.explanation}>{acknowledged ? '☑' : '☐'} I have read this policy and confirm submission of my answers and the information described above. This does not mean I agree with every provision.</Text></Pressable>
      {!!notice && <Message text={notice} error />}
      <Button label="Submit understanding check" onPress={() => void submit()} busy={busy} />
    </Card>}
    {state.data && !result && !open && <Message text="This understanding check is closed for your account. If you already submitted it, pull down to refresh the saved result." />}
  </Screen>;
}

const styles = StyleSheet.create({
  question: { borderTopWidth: 1, borderTopColor: color.line, paddingTop: 14, gap: 8 },
  questionTitle: { color: color.ink, fontSize: 14, fontWeight: '700', lineHeight: 20 },
  option: { borderWidth: 1, borderColor: color.line, borderRadius: 10, padding: 12 },
  optionActive: { borderColor: color.green, backgroundColor: color.mint },
  optionText: { color: color.ink, fontSize: 13, lineHeight: 19 },
  explanation: { color: color.muted, fontSize: 13, lineHeight: 19 },
  feedback: { minHeight: 85, textAlignVertical: 'top', paddingTop: 12 },
});
