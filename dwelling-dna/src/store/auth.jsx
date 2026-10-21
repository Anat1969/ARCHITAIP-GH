import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase';

// Reading is public. Editing belongs to whoever is listed in architaip_admins -
// the same list the database policies and the AI functions check, so the
// interface never offers an action the server would refuse.

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [adminFor, setAdminFor] = useState(null); // user id the admin check passed for
  const [editMode, setEditMode] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const uid = session?.user?.id;
    if (!uid) return undefined;
    let cancelled = false;
    supabase.rpc('architaip_is_admin').then(({ data }) => {
      if (!cancelled) setAdminFor(data ? uid : null);
    });
    return () => { cancelled = true; };
  }, [session]);

  const isAdmin = !!session && adminFor === session.user.id;

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.href },
    });
    return error;
  }, []);

  const signInWithEmail = useCallback(async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.href, shouldCreateUser: false },
    });
    return error;
  }, []);

  const verifyCode = useCallback(async (email, token) => {
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
    return error;
  }, []);

  const signOut = useCallback(() => supabase.auth.signOut(), []);

  const value = useMemo(() => ({
    session, user: session?.user ?? null, isAdmin, editing: isAdmin && editMode,
    setEditMode, signInWithGoogle, signInWithEmail, verifyCode, signOut,
  }), [session, isAdmin, editMode, signInWithGoogle, signInWithEmail, verifyCode, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Which sign-in providers the server has switched on. Google appears only
 *  when it is enabled, so the dialog never offers a button that fails. */
// eslint-disable-next-line react-refresh/only-export-components
export async function loadProviders() {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_ANON_KEY } });
    const data = await res.json();
    return { google: !!data?.external?.google, email: data?.external?.email !== false };
  } catch {
    return { google: false, email: true };
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
