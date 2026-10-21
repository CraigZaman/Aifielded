import { supabase } from './supabase';

export type Role = 'owner' | 'manager' | 'hr' | 'participant' | 'consultant';
export type Viewer = {
  id: string;
  email: string;
  name: string;
  organisationId: string;
  organisationName: string;
  role: Role;
};

export async function getViewer(): Promise<Viewer | null> {
  if (!supabase) return null;
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user?.email_confirmed_at) return null;
  const { data: membership, error: membershipError } = await supabase
    .from('organisation_memberships')
    .select('role, organisation_id, organisations!organisation_memberships_organisation_id_fkey(name)')
    .eq('user_id', auth.user.id)
    .eq('status', 'active')
    .maybeSingle();
  if (membershipError) throw membershipError;
  if (!membership) return null;
  const { data: profile, error: profileError } = await supabase.from('profiles').select('full_name').eq('id', auth.user.id).maybeSingle();
  if (profileError) throw profileError;
  const organisation = membership.organisations as unknown as { name: string } | null;
  if (!organisation) throw new Error('Your workspace could not be loaded.');
  return {
    id: auth.user.id,
    email: auth.user.email || '',
    name: profile?.full_name || auth.user.user_metadata?.full_name || 'Member',
    organisationId: membership.organisation_id,
    organisationName: organisation.name,
    role: membership.role as Role,
  };
}

export const canManage = (role: Role) => role !== 'participant';
export const canManagePeople = (role: Role) => role === 'owner' || role === 'manager' || role === 'hr';
