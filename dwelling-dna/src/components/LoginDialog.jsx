import { useEffect, useState } from 'react';
import Dialog from './Dialog';
import { loadProviders, useAuth } from '../store/auth';
import { parseEditorKey } from '../lib/supabase';

// No email, no password. The editor opens her personal editor link once on
// each device, or pastes it here; from then on that device edits.
export default function LoginDialog({ reason, onClose }) {
  const { activateKey, signInWithGoogle } = useAuth();
  const [providers, setProviders] = useState(null);
  const [text, setText] = useState('');
  const [state, setState] = useState({ kind: 'idle', message: '' });

  useEffect(() => { loadProviders().then(setProviders); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const key = parseEditorKey(text);
    if (!key) { setState({ kind: 'error', message: 'זה לא נראה כמו קישור העורכת. הדביקי את הקישור המלא.' }); return; }
    setState({ kind: 'busy', message: 'בודק' });
    const ok = await activateKey(key);
    if (ok) onClose();
    else setState({ kind: 'error', message: 'הקישור לא מוכר לשרת, או שאין חיבור כרגע.' });
  };

  const google = async () => {
    setState({ kind: 'busy', message: 'מעביר ל-Google' });
    const error = await signInWithGoogle();
    if (error) setState({ kind: 'error', message: error.message });
  };

  return (
    <Dialog title="מצב עורכת" eyebrow="EDITOR ACCESS" onClose={onClose}>
      {reason === 'image' ? (
        <p className="notice notice--sent">התמונה כבר במסגרת ושמורה בדפדפן הזה. ברגע שהמכשיר יזוהה כמכשיר עורכת היא תעלה לשרת לבד.</p>
      ) : (
        <p className="muted">הקריאה פתוחה לכולם. עריכה, תמונות ומיזוגים שמורים לעורכת.</p>
      )}
      <p>
        אין כאן מייל ואין סיסמה. פתחי פעם אחת את <strong>קישור העורכת</strong> שלך בכל מכשיר,
        או הדביקי אותו כאן. מאותו רגע המכשיר הזה עורך.
      </p>
      <form onSubmit={submit} className="stack">
        <label className="field">
          <span className="field__label">קישור העורכת</span>
          <input dir="ltr" value={text} onChange={(e) => setText(e.target.value)} placeholder="https://architaip.vercel.app/#editor=..." autoFocus />
        </label>
        <button type="submit" className="btn btn--primary btn--block" disabled={state.kind === 'busy' || !text.trim()}>
          הפעלת מצב עורכת במכשיר הזה
        </button>
      </form>
      {providers?.google && (
        <>
          <div className="divider"><span className="mono">או</span></div>
          <button type="button" className="btn btn--block" onClick={google} disabled={state.kind === 'busy'}>כניסה עם Google</button>
        </>
      )}
      {state.message && <p className={`notice notice--${state.kind}`}>{state.message}</p>}
    </Dialog>
  );
}
