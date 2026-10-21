import { supabase } from './supabase';
import type { Viewer } from './viewer';

export type SectionName = 'missions' | 'intelligence' | 'investigations' | 'follow-ups' | 'publishing' | 'communications' | 'company' | 'people' | 'suggestions' | 'concerns';
export type SectionRow = { id: string; title: string; subtitle?: string; meta?: string };

export const sectionTitles: Record<SectionName, string> = {
  missions: 'Missions', intelligence: 'Intelligence', investigations: 'Investigations', 'follow-ups': 'Follow-up work',
  publishing: 'Publishing', communications: 'Communications', company: 'Company', people: 'People',
  suggestions: 'Suggestions', concerns: 'Confidential concerns',
};

const text = (value: unknown) => typeof value === 'string' ? value : '';
const relationTitle = (value: unknown) => {
  const relation = Array.isArray(value) ? value[0] : value;
  return relation && typeof relation === 'object' && 'title' in relation ? text(relation.title) : '';
};

export async function loadSection(name: SectionName, viewer: Viewer): Promise<SectionRow[]> {
  if (!supabase) return [];
  const org = viewer.organisationId;
  switch (name) {
    case 'missions': {
      const { data, error } = await supabase.from('missions').select('id,title,objective,status,created_at').eq('organisation_id', org).order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return (data || []).map(row => ({ id: row.id, title: row.title, subtitle: row.objective, meta: row.status }));
    }
    case 'intelligence': {
      const [themes, hypotheses, findings] = await Promise.all([
        supabase.from('themes').select('id,title,description,confidence').eq('organisation_id', org).order('confidence', { ascending: false }).limit(40),
        supabase.from('hypotheses').select('id,title,description,status').eq('organisation_id', org).limit(40),
        supabase.from('findings').select('id,title,summary,confidence').eq('organisation_id', org).order('confidence', { ascending: false }).limit(40),
      ]);
      const failure = [themes, hypotheses, findings].find(result => result.error);
      if (failure?.error) throw failure.error;
      return [
        ...(findings.data || []).map(row => ({ id: row.id, title: row.title, subtitle: row.summary, meta: 'Finding' })),
        ...(themes.data || []).map(row => ({ id: row.id, title: row.title, subtitle: row.description, meta: 'Theme' })),
        ...(hypotheses.data || []).map(row => ({ id: row.id, title: row.title, subtitle: row.description, meta: `Hypothesis · ${row.status}` })),
      ];
    }
    case 'investigations': {
      const { data, error } = await supabase.from('investigation_proposals').select('id,title,rationale,status,created_at').eq('organisation_id', org).order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return (data || []).map(row => ({ id: row.id, title: row.title, subtitle: row.rationale, meta: row.status }));
    }
    case 'follow-ups': {
      const { data, error } = await supabase.from('follow_up_tasks').select('id,title,description,status,due_at').eq('organisation_id', org).order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return (data || []).map(row => ({ id: row.id, title: row.title, subtitle: row.description, meta: row.status }));
    }
    case 'publishing': {
      const { data, error } = await supabase.from('publication_requests').select('id,kind,status,created_at,payload').eq('organisation_id', org).order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return (data || []).map(row => ({ id: row.id, title: text((row.payload as { title?: unknown } | null)?.title) || row.kind, meta: row.status, subtitle: row.kind }));
    }
    case 'communications': {
      const { data, error } = await supabase.from('policy_communications').select('mission_id,version,briefing,missions(title,status)').eq('organisation_id', org).order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return (data || []).map(row => ({ id: row.mission_id, title: relationTitle(row.missions) || 'Communication', subtitle: row.briefing, meta: `Version ${row.version}` }));
    }
    case 'company': {
      const [profile, documents, sources] = await Promise.all([
        supabase.from('company_profiles').select('details,revision').eq('organisation_id', org).maybeSingle(),
        supabase.from('company_documents').select('id,title,category,status').eq('organisation_id', org).order('created_at', { ascending: false }).limit(50),
        supabase.from('company_sources').select('id,label,url,status').eq('organisation_id', org).limit(30),
      ]);
      const failure = [profile, documents, sources].find(result => result.error);
      if (failure?.error) throw failure.error;
      return [
        { id: 'profile', title: viewer.organisationName, subtitle: profile.data ? `Company profile · revision ${profile.data.revision}` : 'Company profile', meta: 'Profile' },
        ...(documents.data || []).map(row => ({ id: row.id, title: row.title, subtitle: row.category, meta: `Document · ${row.status}` })),
        ...(sources.data || []).map(row => ({ id: row.id, title: row.label, subtitle: row.url, meta: `Source · ${row.status}` })),
      ];
    }
    case 'people': {
      const { data, error } = await supabase.from('organisation_memberships').select('id,user_id,role,status').eq('organisation_id', org).eq('status', 'active').limit(200);
      if (error) throw error;
      const people = data || [];
      const profiles = people.length ? await supabase.from('profiles').select('id,full_name').in('id', people.map(person => person.user_id)) : { data: [], error: null };
      if (profiles.error) throw profiles.error;
      return people.map(person => ({ id: person.id, title: profiles.data?.find(profile => profile.id === person.user_id)?.full_name || 'Team member', meta: person.role }));
    }
    case 'suggestions': {
      const { data, error } = await supabase.from('mission_suggestions').select('id,question,contribution,status,author_id,created_at').eq('organisation_id', org).order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return (data || []).map(row => ({ id: row.id, title: row.question, subtitle: row.contribution, meta: row.author_id === viewer.id ? `Yours · ${row.status}` : row.status }));
    }
    case 'concerns': {
      const { data, error } = await supabase.from('confidential_concerns').select('id,title,status,author_id,created_at').eq('organisation_id', org).order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return (data || []).map(row => ({ id: row.id, title: row.title, meta: row.author_id === viewer.id ? `Your report · ${row.status}` : row.status }));
    }
  }
}
