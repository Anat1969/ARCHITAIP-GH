import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useData } from '../store/data';
import { useAuth } from '../store/auth';

// The editor's queue: every fusion a reader saved, side by side, approved or
// removed in one click. Opened from the A&I menu; readers see a short note.
export default function Pending() {
  const { entries, approveFusion, removeEntry } = useData();
  const { isAdmin } = useAuth();
  const waiting = entries.fusions.filter((f) => f.approved === false);

  useEffect(() => { document.title = 'ממתינים לאישור | ארכיטייפ'; }, []);

  if (!isAdmin) {
    return (
      <div className="empty-page" dir="rtl">
        <h1>ממתינים לאישור</h1>
        <p className="muted">העמוד הזה שמור לעורכת. מיזוג שיצרת מופיע אצלך ברשימת התרבויות.</p>
        <Link to="/cultures" className="btn">לתוכן העניינים</Link>
      </div>
    );
  }

  return (
    <div className="pending-page" dir="rtl">
      <header className="page-head">
        <span className="mono">QUEUE / PENDING</span>
        <h1>{waiting.length ? <><b>{waiting.length}</b> מיזוגים של קוראים ממתינים לך</> : 'אין מיזוגים שממתינים'}</h1>
        <p className="page-head__lede">אישור מכניס את המיזוג לרשימה הציבורית. מחיקה מסירה אותו לגמרי.</p>
      </header>
      <ul className="queue">
        <AnimatePresence initial={false}>
          {waiting.map((f) => (
            <motion.li key={f.id} className="queue__item" layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -30 }}>
              <span className="queue__swatch" style={{ background: f.gradient }} />
              <div className="queue__body">
                <Link to={`/f/${f.id}`} className="queue__name">{f.name}</Link>
                <span className="queue__lineage">{(f.lineage?.parent_names ?? []).join(' × ')}</span>
                {f.insight && <p className="queue__insight">{f.insight}</p>}
                <span className="queue__triad"><b>כאוס</b> {f.chaos} · <b>סדר</b> {f.order} · <b>תפקיד</b> {f.role}</span>
              </div>
              <div className="queue__actions">
                <button type="button" className="btn btn--primary" onClick={() => approveFusion(f.id)}>אישור לפרסום</button>
                <button
                  type="button"
                  className="btn btn--quiet"
                  onClick={() => { if (window.confirm(`למחוק את "${f.name}"? הפעולה אינה הפיכה.`)) removeEntry(f); }}
                >
                  מחיקה
                </button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
