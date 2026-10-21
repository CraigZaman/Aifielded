import { router } from 'expo-router';
import { Card, Empty, Message, Screen } from '../../components/ui';
import { useAuth } from '../../context/auth';
import { supabase } from '../../lib/supabase';
import { useLoad } from '../../lib/use-load';

type Assignment = { id: string; status: string; missions: { title: string; objective: string } | null };

export default function ConversationsScreen() {
  const { viewer } = useAuth();
  const state = useLoad(async () => {
    if (!supabase || !viewer) return [] as Assignment[];
    const { data, error } = await supabase.from('mission_assignments').select('id,status,missions(title,objective)').eq('user_id', viewer.id).eq('organisation_id', viewer.organisationId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as unknown as Assignment[];
  }, [viewer?.id, viewer?.organisationId]);
  return <Screen title="Conversations" subtitle="Your direct dialogue with Fielded." refreshing={state.loading} onRefresh={() => void state.refresh()}>
    {state.error && <Message text={state.error} error />}
    {state.data?.map(item => <Card key={item.id} title={item.missions?.title || 'Conversation'} subtitle={item.missions?.objective} meta={item.status} onPress={() => router.push({ pathname: '/conversation/[id]', params: { id: item.id } })} />)}
    {!state.loading && !state.error && !state.data?.length && <Empty title="No conversations assigned" body="When your organisation invites you into a mission, it will appear here." />}
  </Screen>;
}
