import { useEffect, useState } from 'react';
import Dialog from './Dialog';
import { loadProviders, useAuth } from '../store/auth';

export default function LoginDialog({ onClose }) {
  const { signInWithGoogle, signInWithEmail, verifyCode } = useAuth();
  const [providers, setProviders] = useState(null);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [state, setState] = useState({ kind: 'idle', message: '' });

  useEffect(() => { loadProviders().then(setProviders); }, []);

  const google = async () => {
    setState({ kind: 'busy', message: 'מעביר ל-Google' });
    const error = await signInWithGoogle();
    if (error) setState({ kind: 'error', message: error.message });
  };

  const send = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setState({ kind: 'busy', message: 'שולח' });
    const error = await signInWithEmail(email.trim());
    if (error) {
      setState({ kind: 'error', message: /signups not allowed|not found/i.test(error.message) ? 'הכתובת אינה רשומה כעורכת.' : error.message });
      return;
    }
    setSent(true);
    setState({ kind: 'sent', message: 'נשלח מייל. אפשר ללחוץ על הקישור בו, או להקליד כאן את הקוד שמופיע בו.' });
  };

  const verify = async (e) => {
    e.preventDefault();
    setState({ kind: 'busy', message: 'בודק' });
    const error = await verifyCode(email.trim(), code.trim());
    if (error) setState({ kind: 'error', message: 'הקוד שגוי או שפג תוקפו.' });
    else onClose();
  };

  return (
    <Dialog title="כניסת עורכת" eyebrow="EDITOR ACCESS" onClose={onClose}>
      <p className="muted">הקריאה פתוחה לכולם. עריכה, יצירת תמונות ומיזוגים שמורים לעורכת.</p>
      {providers?.google && (
        <>
          <button type="button" className="btn btn--primary btn--block" onClick={google} disabled={state.kind === 'busy'}>
            כניסה עם Google
          </button>
          <div className="divider"><span className="mono">או</span></div>
        </>
      )}
      {!sent ? (
        <form onSubmit={send} className="stack">
          <label className="field">
            <span className="field__label">מייל</span>
            <input type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" autoFocus />
          </label>
          <button type="submit" className={`btn btn--block ${providers?.google ? '' : 'btn--primary'}`} disabled={state.kind === 'busy' || !email.trim()}>
            שליחת קישור כניסה למייל
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="stack">
          <label className="field">
            <span className="field__label">קוד מהמייל</span>
            <input inputMode="numeric" dir="ltr" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} placeholder="123456" autoFocus />
          </label>
          <button type="submit" className="btn btn--primary btn--block" disabled={state.kind === 'busy' || code.length < 6}>כניסה</button>
          <button type="button" className="btn btn--quiet" onClick={() => { setSent(false); setCode(''); setState({ kind: 'idle', message: '' }); }}>שליחה מחדש</button>
        </form>
      )}
      {state.message && <p className={`notice notice--${state.kind}`}>{state.message}</p>}
    </Dialog>
  );
}
