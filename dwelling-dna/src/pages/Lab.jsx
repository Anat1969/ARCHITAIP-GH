import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useData } from '../store/data';
import { useAuth } from '../store/auth';
import { FUSION_MODES, VECTORS } from '../lib/dna';
import { generateFusion } from '../lib/generate';

// The lab is a comparison first and a generator second: setting two or more
// cultures side by side, vector by vector, is already the insight a lecture
// needs. Turning that comparison into a fusion is one more step, for the editor.

const MAX = 4;

export default function Lab() {
  const { entries, get, createFusion } = useData();
  const { editing, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [mode, setMode] = useState('equal');
  const [weights, setWeights] = useState({});
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState(null);

  useEffect(() => { document.title = 'מעבדת מיזוג | ארכיטייפ'; }, []);

  const ids = useMemo(() => (params.get('p') ?? '').split(',').filter(Boolean).slice(0, MAX), [params]);
  const picked = ids.map(get).filter(Boolean);

  const toggle = (id) => {
    const next = ids.includes(id) ? ids.filter((x) => x !== id) : ids.length < MAX ? [...ids, id] : ids;
    setParams(next.length ? { p: next.join(',') } : {}, { replace: true });
    setDraft(null);
  };

  const weightOf = (id) => {
    if (mode === 'equal' || !(id in weights)) {
      if (mode === 'dominant') return id === ids[0] ? 0.6 : 0.4 / Math.max(ids.length - 1, 1);
      return 1 / Math.max(ids.length, 1);
    }
    return weights[id];
  };
  const normalized = () => {
    const raw = picked.map((p) => weightOf(p.id));
    const sum = raw.reduce((a, b) => a + b, 0) || 1;
    return raw.map((w) => Math.round((w / sum) * 100) / 100);
  };

  const run = async () => {
    setBusy(true);
    setError('');
    try {
      setDraft(await generateFusion(picked, mode, normalized(), name));
    } catch (err) {
      setError(err.message || 'המיזוג נכשל');
    } finally {
      setBusy(false);
    }
  };

  const approve = async () => {
    setBusy(true);
    const ok = await createFusion(draft);
    setBusy(false);
    if (ok) navigate(`/f/${draft.id}`);
    else setError('השמירה נכשלה. ודאי שאת מחוברת כעורכת.');
  };

  return (
    <div className="lab" dir="rtl">
      <header className="lab__head">
        <span className="mono">LAB / COMPARE AND FUSE</span>
        <h1>מעבדת מיזוג</h1>
        <p className="muted">בחרי שתיים עד ארבע תרבויות. ההשוואה מופיעה מיד, וקטור מול וקטור.</p>
      </header>

      <div className="picker">
        {entries.all.map((e) => {
          const on = ids.includes(e.id);
          return (
            <button
              key={e.id}
              type="button"
              className={`pick ${on ? 'pick--on' : ''}`}
              style={{ '--c3': e.colors?.accent }}
              onClick={() => toggle(e.id)}
              aria-pressed={on}
            >
              <span className="pick__dot" />
              <span>{e.name}</span>
              {on && <span className="mono pick__n">{ids.indexOf(e.id) + 1}</span>}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {picked.length < 2 ? (
          <motion.p key="hint" className="lab__hint muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {picked.length === 1 ? `נבחרה ${picked[0].name}. בחרי עוד אחת לפחות.` : 'עוד לא נבחרו תרבויות.'}
          </motion.p>
        ) : (
          <motion.div key="cmp" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="compare" style={{ '--cols': picked.length }}>
              <div className="compare__row compare__row--head">
                <span />
                {picked.map((p) => (
                  <span key={p.id} className="compare__name" style={{ '--c3': p.colors?.accent, background: p.gradient }}>{p.name}</span>
                ))}
              </div>
              {[['chaos', 'כאוס', 'CHAOS'], ['order', 'סדר', 'ORDER'], ['role', 'תפקיד', 'ROLE']].map(([k, he, en]) => (
                <div key={k} className="compare__row compare__row--triad">
                  <span className="compare__key"><span className="mono">{en}</span>{he}</span>
                  {picked.map((p) => <span key={p.id} className="compare__cell">{p[k]}</span>)}
                </div>
              ))}
              {VECTORS.map((v) => (
                <div key={v.key} className="compare__row">
                  <span className="compare__key"><span className="mono">{v.en}</span>{v.label}</span>
                  {picked.map((p) => <span key={p.id} className="compare__cell">{p.vectors?.[v.key]}</span>)}
                </div>
              ))}
            </div>

            <section className="fuse">
              <div className="section-head">
                <span className="mono">FUSE</span>
                <h2>מהשוואה למיזוג</h2>
              </div>
              {!isAdmin ? (
                <p className="muted">יצירת מיזוג חדש שמורה לעורכת המחוברת.</p>
              ) : !editing ? (
                <p className="muted">עברי למצב עריכה בסרגל העליון כדי ליצור מיזוג.</p>
              ) : (
                <div className="stack">
                  <div className="modes" role="radiogroup">
                    {FUSION_MODES.map((m) => (
                      <button key={m.id} type="button" role="radio" aria-checked={mode === m.id} className={`mode ${mode === m.id ? 'mode--on' : ''}`} onClick={() => setMode(m.id)}>
                        <span>{m.label}</span>
                        <span className="muted">{m.hint}</span>
                      </button>
                    ))}
                  </div>
                  {mode === 'weighted' && (
                    <div className="weights">
                      {picked.map((p) => (
                        <label key={p.id} className="weight">
                          <span>{p.name}</span>
                          <input type="range" min="5" max="100" step="5" value={Math.round(weightOf(p.id) * 100)} onChange={(e) => setWeights((w) => ({ ...w, [p.id]: Number(e.target.value) / 100 }))} />
                          <span className="mono">{Math.round(normalized()[picked.indexOf(p)] * 100)}%</span>
                        </label>
                      ))}
                    </div>
                  )}
                  <label className="field">
                    <span className="field__label">שם למיזוג (לא חובה)</span>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder={picked.map((p) => p.name).join(' × ')} />
                  </label>
                  {error && <p className="notice notice--error">{error}</p>}
                  {!draft ? (
                    <>
                      <button type="button" className="btn btn--primary" onClick={run} disabled={busy}>
                        {busy ? 'Claude ממזג' : `יצירת מיזוג: ${picked.map((p) => p.name).join(' × ')}`}
                      </button>
                      {busy && <div className="progress"><span /></div>}
                    </>
                  ) : (
                    <motion.div className="draft-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="draft" style={{ background: draft.gradient }}>
                        <span className="mono">DRAFT</span>
                        <h3>{draft.name}</h3>
                        <blockquote>{draft.insight}</blockquote>
                      </div>
                      <p>{draft.paragraph}</p>
                      <dl className="draft__triad">
                        <div><dt>כאוס</dt><dd>{draft.chaos}</dd></div>
                        <div><dt>סדר</dt><dd>{draft.order}</dd></div>
                        <div><dt>תפקיד</dt><dd>{draft.role}</dd></div>
                      </dl>
                      <div className="row">
                        <button type="button" className="btn btn--primary" onClick={approve} disabled={busy}>אישור ופתיחת המיזוג</button>
                        <button type="button" className="btn" onClick={run} disabled={busy}>{busy ? 'ממזג שוב' : 'ניסוח מחדש'}</button>
                        <button type="button" className="btn btn--quiet" onClick={() => setDraft(null)} disabled={busy}>ביטול</button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
