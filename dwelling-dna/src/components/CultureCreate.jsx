import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dialog from './Dialog';
import { useData } from '../store/data';
import { generateCulture } from '../lib/generate';
import { VECTORS } from '../lib/dna';

// Adding a culture is two steps: the model drafts the whole profile, and the
// editor reads it before it enters the magazine - approve or try again.
export default function CultureCreate({ onClose }) {
  const { createCulture, updateContent } = useData();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', period: '', region: '', description: '' });
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const run = async () => {
    if (!form.name.trim()) return;
    setBusy(true);
    setError('');
    try {
      setDraft(await generateCulture(form));
    } catch (err) {
      setError(err.message || 'היצירה נכשלה');
    } finally {
      setBusy(false);
    }
  };

  const approve = async () => {
    setBusy(true);
    const ok = await createCulture(draft);
    if (ok && draft.interpretation) await updateContent(draft.id, { interpretation: draft.interpretation });
    setBusy(false);
    if (ok) { onClose(); navigate(`/c/${draft.id}`); }
    else setError('השמירה נכשלה. ודאי שאת מחוברת כעורכת.');
  };

  return (
    <Dialog title={draft ? draft.name : 'הוספת תרבות'} eyebrow={draft ? 'DRAFT / REVIEW' : 'NEW CULTURE'} onClose={onClose} busy={busy} wide={!!draft}>
      {!draft ? (
        <form className="stack" onSubmit={(e) => { e.preventDefault(); run(); }}>
          <label className="field"><span className="field__label">שם התרבות</span><input value={form.name} onChange={set('name')} placeholder="למשל: הנבטים" autoFocus /></label>
          <div className="grid-2">
            <label className="field"><span className="field__label">תקופה</span><input value={form.period} onChange={set('period')} placeholder="המאה ה-4 לפנה״ס" /></label>
            <label className="field"><span className="field__label">אזור</span><input value={form.region} onChange={set('region')} placeholder="פטרה, ירדן" /></label>
          </div>
          <label className="field"><span className="field__label">כיוון או הערות</span><textarea value={form.description} onChange={set('description')} rows={3} placeholder="מה חשוב לך להדגיש" /></label>
          {error && <p className="notice notice--error">{error}</p>}
          <button type="submit" className="btn btn--primary btn--block" disabled={busy || !form.name.trim()}>
            {busy ? 'Claude בונה את הפרופיל' : 'בניית הפרופיל'}
          </button>
          {busy && <div className="progress"><span /></div>}
        </form>
      ) : (
        <div className="stack">
          <div className="draft" style={{ '--c1': draft.colors.primary, '--c3': draft.colors.accent, background: draft.gradient }}>
            <span className="mono">{draft.archetype}</span>
            <blockquote>{draft.insight}</blockquote>
          </div>
          <p>{draft.paragraph}</p>
          <dl className="draft__triad">
            <div><dt>כאוס</dt><dd>{draft.chaos}</dd></div>
            <div><dt>סדר</dt><dd>{draft.order}</dd></div>
            <div><dt>תפקיד</dt><dd>{draft.role}</dd></div>
          </dl>
          <dl className="draft__vectors">
            {VECTORS.map((v) => <div key={v.key}><dt>{v.label}</dt><dd>{draft.vectors[v.key]}</dd></div>)}
          </dl>
          {error && <p className="notice notice--error">{error}</p>}
          <div className="row">
            <button type="button" className="btn btn--primary" onClick={approve} disabled={busy}>אישור והוספה למגזין</button>
            <button type="button" className="btn" onClick={run} disabled={busy}>{busy ? 'בונה שוב' : 'ניסוח מחדש'}</button>
            <button type="button" className="btn btn--quiet" onClick={() => setDraft(null)} disabled={busy}>חזרה לטופס</button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
