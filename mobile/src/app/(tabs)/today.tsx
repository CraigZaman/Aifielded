import { router } from 'expo-router';
import { Card, Empty, Message, Screen } from '../../components/ui';
import { useAuth } from '../../context/auth';
import { supabase } from '../../lib/supabase';
import { useLoad } from '../../lib/use-load';

type Assignment = { id: string; status: string; missions: { title: string; objective: string } | null };
type Task = { id: string; title: string; description: string | null; status: string; due_at: string | null };

export default function TodayScreen() {
  const { viewer } = useAuth();
  const state = useLoad(async () => {
    if (!supabase || !viewer) return { assignments: [] as Assignment[], tasks: [] as Task[] };
    const [assignments, tasks] = await Promise.all([
      supabase.from('mission_assignments').select('id,status,missions(title,objective)').eq('user_id', viewer.id).eq('organisation_id', viewer.organisationId).order('created_at', { ascending: false }),
      supabase.from('follow_up_tasks').select('id,title,description,status,due_at').eq('assignee_id', viewer.id).eq('organisation_id', viewer.organisationId).order('created_at', { ascending: false }),
    ]);
    if (assignments.error || tasks.error) throw assignments.error || tasks.error;
    return { assignments: (assignments.data || []) as unknown as Assignment[], tasks: (tasks.data || []) as Task[] };
  }, [viewer?.id, viewer?.organisationId]);
  return <Screen title={`Good to see you, ${viewer?.name.split(' ')[0] || 'there'}.`} subtitle="Your work and conversations, all in one place." refreshing={state.loading} onRefresh={() => void state.refresh()}>
    {state.error && <Message text={state.error} error />}
    {state.data?.assignments.map(item => <Card key={item.id} title={item.missions?.title || 'Mission conversation'} subtitle={item.missions?.objective} meta={item.status} onPress={() => router.push({ pathname: '/conversation/[id]', params: { id: item.id } })} />)}
    {state.data?.tasks.map(item => <Card key={item.id} title={item.title} subtitle={item.description || undefined} meta={`Follow-up · ${item.status}`} />)}
    {!state.loading && !state.error && !state.data?.assignments.length && !state.data?.tasks.length && <Empty title="You're up to date" body="New conversations and follow-up work will appear here." />}
  </Screen>;
}
