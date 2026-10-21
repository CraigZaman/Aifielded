import { useLocalSearchParams } from 'expo-router';
import { Card, Message, Screen } from '../../components/ui';
import { useAuth } from '../../context/auth';
import { supabase } from '../../lib/supabase';
import { useLoad } from '../../lib/use-load';

type Concern = { id: string; title: string; body: string; status: string; response: string | null };
type Update = { id: string; status: string; message: string; created_at: string };

export default function ConcernScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { viewer } = useAuth();
  const state = useLoad(async () => {
    if (!supabase || !viewer || !id) return null;
    const [concern, updates] = await Promise.all([
      supabase.from('confidential_concerns').select('id,title,body,status,response').eq('id', id).eq('organisation_id', viewer.organisationId).maybeSingle(),
      supabase.from('concern_updates').select('id,status,message,created_at').eq('concern_id', id).order('created_at', { ascending: true }),
    ]);
    if (concern.error || updates.error) throw concern.error || updates.error;
    return { concern: concern.data as Concern | null, updates: (updates.data || []) as Update[] };
  }, [id, viewer?.organisationId]);
  return <Screen title="Confidential report" subtitle="Access follows your workspace's reporting permissions." refreshing={state.loading} onRefresh={() => void state.refresh()}>
    {state.error && <Message text={state.error} error />}
    {!state.loading && !state.data?.concern && <Message text="This report could not be found or is not available to your account." error />}
    {state.data?.concern && <Card title={state.data.concern.title} subtitle={state.data.concern.body} meta={state.data.concern.status} />}
    {state.data?.concern?.response && <Card title="Handler response" subtitle={state.data.concern.response} />}
    {state.data?.updates.map(update => <Card key={update.id} title={update.status} subtitle={update.message} meta={new Date(update.created_at).toLocaleDateString()} />)}
  </Screen>;
}
