import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { askClaude } from '../lib/claude';

const EXPERT_SYSTEM = `אתה מומחה מולטי-דיסציפלינרי באנתרופולוגיה, ארכיאולוגיה וארכיטקטורה.
התפקיד: לתרגם תרבות לשפה מרחבית דרך עדויות ממשיות.
אורך: משפט אחד עד שלושה משפטים קצרים.
טון: חד וברור, מעוגן בעדות כשיש. עונה על "למה", לא רק על "מה".
אם אינך בטוח, אמור זאת בקצרה. עברית בלבד.`;

const STARTERS = [
  'מה הסף אומר על היחס לזר?',
  'איך האור מעצב כאן את הטקס היומיומי?',
  'איזה עיקרון מכאן שווה להביא לבית עכשווי?',
];

export default function ExpertChat({ entry }) {
  const [question, setQuestion] = useState('');
  const [log, setLog] = useState([]);
  const [busy, setBusy] = useState(false);

  const ask = async (q = question) => {
    const text = q.trim();
    if (!text || busy) return;
    setBusy(true);
    setQuestion('');
    setLog((l) => [...l, { q: text, a: null }]);
    let answer;
    try {
      answer = await askClaude({
        model: 'claude-haiku-4-5',
        maxTokens: 2048,
        system: `${EXPERT_SYSTEM}\n\nהקשר: "${entry.name}". ארכיטייפ: ${entry.archetype ?? ''}. כאוס: ${entry.chaos}. סדר: ${entry.order}. תפקיד: ${entry.role}.`,
        prompt: text,
      });
    } catch (err) {
      answer = err.message || 'שגיאה בחיבור למומחה.';
    }
    setLog((l) => l.map((item, i) => (i === l.length - 1 ? { ...item, a: answer } : item)));
    setBusy(false);
  };

  return (
    <section className="expert" dir="rtl">
      <div className="section-head">
        <span className="mono">EXPERT</span>
        <h3>שאלה למומחה</h3>
      </div>
      <div className="expert__log">
        <AnimatePresence initial={false}>
          {log.map((item, i) => (
            <motion.div key={i} className="expert__turn" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <p className="expert__q">{item.q}</p>
              <p className="expert__a">{item.a ?? <span className="muted">חושב</span>}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {log.length === 0 && (
        <div className="row row--wrap">
          {STARTERS.map((s) => (
            <button key={s} type="button" className="chip" onClick={() => ask(s)}>{s}</button>
          ))}
        </div>
      )}
      <form className="expert__form" onSubmit={(e) => { e.preventDefault(); ask(); }}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(); } }}
          placeholder={`שאלה על ${entry.name}`}
          rows={2}
          disabled={busy}
        />
        <button type="submit" className="btn btn--primary" disabled={busy || !question.trim()}>{busy ? 'שואל' : 'שאלה'}</button>
      </form>
    </section>
  );
}
