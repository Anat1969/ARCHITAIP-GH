import { useState } from 'react';
import Dialog from './Dialog';
import { useAuth } from '../store/auth';

export default function LoginDialog({ onClose }) {
  const { signInWithGoogle, signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [state, setState] = useState({ kind: 'idle', message: '' });

  const google = async () => {
    setState({ kind: 'busy', message: 'מעביר ל-Google' });
    const error = await signInWithGoogle();
    if (error) {
      const off = /provider is not enabled|unsupported provider/i.test(error.message);
      setState({
        kind: 'error',
        message: off ? 'כניסה עם Google עדיין לא הופעלה בשרת. אפשר להיכנס עם קישור במייל.' : error.message,
      });
    }
  };

  const magic = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setState({ kind: 'busy', message: 'שולח קישור' });
    const error = await signInWithEmail(email.trim());
    setState(error
      ? { kind: 'error', message: /signups not allowed|not found/i.test(error.message) ? 'הכתובת אינה רשומה כעורכת.' : error.message }
      : { kind: 'sent', message: 'נשלח קישור כניסה. פתחי אותו מהמייל באותו דפדפן.' });
  };

  return (
    <Dialog title="כניסת עורכת" eyebrow="EDITOR ACCESS" onClose={onClose}>
      <p className="muted">הקריאה פתוחה לכולם. עריכה, יצירת תמונות ומיזוגים שמורים לעורכת.</p>
      <button type="button" className="btn btn--primary btn--block" onClick={google} disabled={state.kind === 'busy'}>
        כניסה עם Google
      </button>
      <div className="divider"><span className="mono">או</span></div>
      <form onSubmit={magic} className="stack">
        <label className="field">
          <span className="field__label">מייל</span>
          <input type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
        </label>
        <button type="submit" className="btn btn--block" disabled={state.kind === 'busy' || !email.trim()}>
          שליחת קישור כניסה
        </button>
      </form>
      {state.message && <p className={`notice notice--${state.kind}`}>{state.message}</p>}
    </Dialog>
  );
}
