import { router } from 'expo-router';
import { Card, Message, Screen } from '../../components/ui';
import { useAuth } from '../../context/auth';
import { supabase } from '../../lib/supabase';
import { useLoad } from '../../lib/use-load';
import { canManage } from '../../lib/viewer';

export default function ManageScreen() {
  const { viewer } = useAuth();
  const state = useLoad(async () => {
    if (!supabase || !viewer || !canManage(viewer.role)) return { missions: 0, findings: 0, people: 0, tasks: 0 };
    const [missions, findings, people, tasks] = await Promise.all([
      supabase.from('missions').select('id', { count: 'exact', head: true }).eq('organisation_id', viewer.organisationId),
      supabase.from('findings').select('id', { count: 'exact', head: true }).eq('organisation_id', viewer.organisationId),
      supabase.from('organisation_memberships').select('id', { count: 'exact', head: true }).eq('organisation_id', viewer.organisationId).eq('status', 'active'),
      supabase.from('follow_up_tasks').select('id', { count: 'exact', head: true }).eq('organisation_id', viewer.organisationId),
    ]);
    const failure = [missions, findings, people, tasks].find(item => item.error);
    if (failure?.error) throw failure.error;
    return { missions: missions.count || 0, findings: findings.count || 0, people: people.count || 0, tasks: tasks.count || 0 };
  }, [viewer?.organisationId, viewer?.role]);
  return <Screen title="Workspace" subtitle={viewer?.organisationName} refreshing={state.loading} onRefresh={() => void state.refresh()}>
    {state.error && <Message text={state.error} error />}
    <Card title="Missions" subtitle={`${state.data?.missions ?? '—'} discovery missions`} onPress={() => router.push({ pathname: '/section/[name]', params: { name: 'missions' } })} />
    <Card title="Intelligence" subtitle={`${state.data?.findings ?? '—'} findings`} onPress={() => router.push({ pathname: '/section/[name]', params: { name: 'intelligence' } })} />
    <Card title="Follow-up work" subtitle={`${state.data?.tasks ?? '—'} tasks`} onPress={() => router.push({ pathname: '/section/[name]', params: { name: 'follow-ups' } })} />
    <Card title="Team" subtitle={`${state.data?.people ?? '—'} active members`} onPress={() => router.push({ pathname: '/section/[name]', params: { name: 'people' } })} />
    <Card title="Communications" subtitle="Reviewed updates and policy messages" onPress={() => router.push({ pathname: '/section/[name]', params: { name: 'communications' } })} />
  </Screen>;
}
