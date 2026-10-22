import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  supabase, SUPABASE_URL, SUPABASE_ANON_KEY,
  captureEditorKeyFromUrl, edit, getEditorKey, setEditorKey,
} from '../lib/supabase';

// Reading is public. Editing belongs to the editor, recognised by her personal
// editor key (opened once per device) or by a Supabase session whose email is
// in architaip_admins. The server checks the same two things on every write,
// so the interface never offers an action the server would refuse.

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [adminFor, setAdminFor] = useState(null); // user id the admin check passed for
  const [keyOk, setKeyOk] = useState(false);
  const [checkingKey, setCheckingKey] = useState(() => !!getEditorKey() || /editor=/.test(window.location.hash));
  const [editMode, setEditMode] = useState(true);
  // The sign-in dialog belongs to the whole app: a frame that receives an image
  // before sign-in opens it with its own reason.
  const [loginReason, setLoginReason] = useState(null);

  const verifyKey = useCallback(async () => {
    if (!getEditorKey()) { setKeyOk(false); setCheckingKey(false); return false; }
    setCheckingKey(true);
    const { error } = await edit('check');
    // A wrong key is forgotten; a network failure keeps it for next time.
    if (error?.code === '42501') setEditorKey('');
    setKeyOk(!error);
    setCheckingKey(false);
    return !error;
  }, []);

  // A key that arrived in the link is stored and checked once on load.
  useEffect(() => {
    captureEditorKeyFromUrl();
    if (!getEditorKey()) return undefined;
    let cancelled = false;
    edit('check').then(({ error }) => {
      if (cancelled) return;
      if (error?.code === '42501') setEditorKey('');
      setKeyOk(!error);
      setCheckingKey(false);
    });
    return () => { cancelled = true; };
  }, []);

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

  const isAdmin = keyOk || (!!session && adminFor === session.user.id);

  const activateKey = useCallback(async (key) => {
    setEditorKey(key);
    return verifyKey();
  }, [verifyKey]);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.href },
    });
    return error;
  }, []);

  const signOut = useCallback(async () => {
    setEditorKey('');
    setKeyOk(false);
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(() => ({
    session, user: session?.user ?? null, isAdmin, checkingKey, editing: isAdmin && editMode,
    setEditMode, activateKey, signInWithGoogle, signOut,
    loginReason, openLogin: (reason = 'default') => setLoginReason(reason), closeLogin: () => setLoginReason(null),
  }), [session, isAdmin, checkingKey, editMode, activateKey, signInWithGoogle, signOut, loginReason]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Which sign-in providers the server has switched on. Google appears only
 *  when it is enabled, so the dialog never offers a button that fails. */
// eslint-disable-next-line react-refresh/only-export-components
export async function loadProviders() {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_ANON_KEY } });
    const data = await res.json();
    return { google: !!data?.external?.google };
  } catch {
    return { google: false };
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
