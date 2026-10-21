import { router, useLocalSearchParams } from 'expo-router';
import { Button, Card, Empty, Message, Screen } from '../../components/ui';
import { useAuth } from '../../context/auth';
import { apiPost } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { useLoad } from '../../lib/use-load';
import { canManage } from '../../lib/viewer';
import { useState } from 'react';

type Mission = { id: string; title: string; objective: string; context: string | null; desired_outcome: string | null; status: string };
type Finding = { id: string; title: string; summary: string; recommended_action: string | null; confidence: number | null };
type Theme = { id: string; title: string; description: string; evidence_count: number | null };
type Hypothesis = { id: string; title: string; description: string; status: string };
type Observation = { id: string; summary: string; detail: string; category: string; confidentiality: string };
type Assignment = { id: string; status: string; user_id: string };

export default function MissionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { viewer } = useAuth();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const state = useLoad(async () => {
    if (!supabase || !viewer || !id || !canManage(viewer.role)) return null;
    const [mission, assignments, findings, themes, hypotheses, observations, analysis, policy] = await Promise.all([
      supabase.from('missions').select('id,title,objective,context,desired_outcome,status').eq('id', id).eq('organisation_id', viewer.organisationId).maybeSingle(),
      supabase.from('mission_assignments').select('id,status,user_id').eq('mission_id', id).order('created_at').limit(200),
      supabase.from('findings').select('id,title,summary,recommended_action,confidence').eq('mission_id', id).order('confidence', { ascending: false }).limit(60),
      supabase.from('themes').select('id,title,description,evidence_count').eq('mission_id', id).order('confidence', { ascending: false }).limit(60),
      supabase.from('hypotheses').select('id,title,description,status').eq('mission_id', id).order('confidence', { ascending: false }).limit(60),
      supabase.from('management_observations').select('id,summary,detail,category,confidentiality').eq('mission_id', id).eq('organisation_id', viewer.organisationId).eq('participant_approved', true).neq('confidentiality', 'PRIVATE').order('created_at', { ascending: false }).limit(60),
      supabase.from('mission_analysis_status').select('status,completed_at,error_code').eq('mission_id', id).eq('organisation_id', viewer.organisationId).maybeSingle(),
      supabase.from('policy_communications').select('mission_id').eq('mission_id', id).maybeSingle(),
    ]);
    const failed = [mission, assignments, findings, themes, hypotheses, observations, analysis, policy].find(item => item.error);
    if (failed?.error) throw failed.error;
    if (!mission.data) return null;
    return {
      mission: mission.data as Mission,
      assignments: (assignments.data || []) as Assignment[],
      findings: (findings.data || []) as Finding[],
      themes: (themes.data || []) as Theme[],
      hypotheses: (hypotheses.data || []) as Hypothesis[],
      observations: (observations.data || []) as Observation[],
      analysis: analysis.data,
      policy: !!policy.data,
    };
  }, [id, viewer?.id, viewer?.organisationId, viewer?.role]);

  async function synthesise() {
    if (!id || busy) return;
    setBusy(true); setNotice('');
    try {
      const result = await apiPost<{ message: string }>(`/api/missions/${id}/synthesise`, {}, 125000);
      setNotice(result.message || 'Evidence synthesis requested. Refresh to see the latest status.');
      await state.refresh();
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : 'Evidence could not be synthesised.');
    } finally { setBusy(false); }
  }

  if (!viewer || !canManage(viewer.role)) return <Screen title="Mission"><Message text="Your workspace role does not permit this page." error /></Screen>;
  const item = state.data;
  return <Screen title={item?.mission.title || 'Mission'} subtitle={item?.mission.objective} refreshing={state.loading} onRefresh={() => void state.refresh()}>
    {!!state.error && <Message text={state.error} error />}
    {!state.loading && !state.error && !item && <Message text="This mission is not available to your account." error />}
    {item && <>
      <Card title="Mission brief" subtitle={[item.mission.context, item.mission.desired_outcome].filter(Boolean).join('\n\n') || item.mission.objective} meta={item.mission.status} />
      <Card title="Participation" subtitle={`${item.assignments.length} invited · ${item.assignments.filter(assignment => assignment.status === 'completed').length} completed`} />
      {item.analysis && <Card title="Analysis status" subtitle={item.analysis.error_code === 'AI_DAILY_LIMIT' ? 'Daily AI allowance reached; queued for the next UTC day.' : item.analysis.status} meta={item.analysis.completed_at || undefined} />}
      {item.policy && <Button label="Communication details" secondary onPress={() => router.push({ pathname: '/section/[name]', params: { name: 'communications' } })} />}
      <Card title="Findings" subtitle="Leadership review of approved evidence.">
        {item.findings.length ? item.findings.map(finding => <Card key={finding.id} title={finding.title} subtitle={[finding.summary, finding.recommended_action && `Recommended: ${finding.recommended_action}`].filter(Boolean).join('\n\n')} meta={finding.confidence == null ? undefined : `${Math.round(Number(finding.confidence) * 100)}% confidence`} />) : <Empty title="Evidence is still forming" body="Findings appear after approved contributions are synthesised." />}
      </Card>
      {item.themes.length > 0 && <Card title="Themes">{item.themes.map(theme => <Card key={theme.id} title={theme.title} subtitle={theme.description} meta={`${theme.evidence_count || 0} observations`} />)}</Card>}
      {item.hypotheses.length > 0 && <Card title="Hypotheses">{item.hypotheses.map(hypothesis => <Card key={hypothesis.id} title={hypothesis.title} subtitle={hypothesis.description} meta={hypothesis.status} />)}</Card>}
      <Card title="Approved observations" subtitle="PRIVATE contributions are excluded.">
        {item.observations.length ? item.observations.map(observation => <Card key={observation.id} title={observation.summary} subtitle={observation.detail} meta={`${observation.category} · ${observation.confidentiality}`} />) : <Empty title="No approved observations yet" body="Participants must approve non-private contributions before they appear here." />}
      </Card>
      <Button label="Synthesise approved evidence" onPress={() => void synthesise()} busy={busy} secondary />
      {!!notice && <Message text={notice} error={!notice.includes('requested')} />}
    </>}
  </Screen>;
}
