import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { getViewer, type Viewer } from '../lib/viewer';
import { supabase } from '../lib/supabase';
import { unregisterPhoneNotificationToken } from '../lib/push';

type AuthState = {
  loading: boolean;
  user: User | null;
  viewer: Viewer | null;
  error: string | null;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    if (!supabase) {
      setUser(null);
      setViewer(null);
      setLoading(false);
      return;
    }
    try {
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError || !data.user) {
        setUser(null);
        setViewer(null);
        setError(null);
        return;
      }
      setUser(data.user);
      setViewer(data.user.email_confirmed_at ? await getViewer() : null);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load your workspace.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const initial = setTimeout(() => { void refresh(); }, 0);
    const subscription = supabase?.auth.onAuthStateChange(() => {
      // Do not call Supabase APIs synchronously from its auth callback.
      setTimeout(() => { void refresh(); }, 0);
    });
    return () => { clearTimeout(initial); subscription?.data.subscription.unsubscribe(); };
  }, []);

  async function signOut() {
    if (!supabase) return;
    try { await unregisterPhoneNotificationToken(); }
    catch { /* Signing out still invalidates the local session if the network is down. */ }
    const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' });
    if (signOutError) throw signOutError;
    setUser(null);
    setViewer(null);
  }

  const value = useMemo(() => ({ loading, user, viewer, error, refresh, signOut }), [loading, user, viewer, error]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('AuthProvider is missing.');
  return value;
}
