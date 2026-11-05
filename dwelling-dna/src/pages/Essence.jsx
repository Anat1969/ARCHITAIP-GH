import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useData } from '../store/data';
import { FAMILIES, LEVELS, familyOf, distinctOf } from '../data/reading';

// What a culture is, before any culture is read: the question every one of
// them answers, the three levels the answer is built on, and the four places
// a culture can locate its chaos. The criteria of the comparison come from here.

function exampleValue(entry, level, field) {
  if (level.id === 'spaces') return entry.spaces?.find((s) => s.id === field.key)?.caption ?? '';
  if (field.vector) return entry.vectors?.[field.key] ?? '';
  return entry[field.key] ?? '';
}

export default function Essence() {
  const { entries } = useData();
  const [params, setParams] = useSearchParams();
  const example = entries.cultures.find((c) => c.id === params.get('c')) ?? entries.cultures[0];
  const fam = familyOf(example);

  useEffect(() => { document.title = 'מהי תרבות | ארכיטייפ'; }, []);

  return (
    <div className="essence" dir="rtl">
      <header className="page-head">
        <span className="mono">01 / WHAT IS A CULTURE</span>
        <h1>תרבות היא תשובה לשאלה אחת: ממה מגינים?</h1>
        <p className="page-head__lede">
          כל תרבות מזהה <b>כאוס</b>, בונה כנגדו <b>סדר</b>, ונותנת לבית <b>תפקיד</b>.
          מהתשובה הזו נגזרים החומר, האור, הסף, קנה המידה והסיפור, ומהם שלושת המרחבים.
          <mark>כך כל תרבות נקראת באותם אחד עשר קריטריונים, ואפשר להשוות ביניהן.</mark>
        </p>
      </header>

      {/* ── The formula, filled with one culture ── */}
      <section className="formula" style={{ '--fc': fam.color }}>
        <div className="formula__pick" role="tablist" aria-label="תרבות לדוגמה">
          <span className="mono formula__pick-label">דוגמה</span>
          {entries.cultures.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={c.id === example.id}
              className={`pill ${c.id === example.id ? 'pill--on' : ''}`}
              style={{ '--pc': familyOf(c).color }}
              onClick={() => setParams({ c: c.id }, { replace: true })}
            >
              {c.name}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={example.id}
            className="formula__levels"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            {LEVELS.map((level) => (
              <div key={level.id} className={`level level--${level.id}`}>
                <div className="level__head">
                  <span className="mono">{level.n} / {level.en}</span>
                  <h2>{level.label}</h2>
                  <span className="level__q">{level.q}</span>
                </div>
                <ol className="level__fields">
                  {level.fields.map((f) => (
                    <li key={f.key} className="field">
                      <span className="field__label"><b>{f.label}</b> <span className="muted">{f.q}</span></span>
                      <span className="field__val">{exampleValue(example, level, f)}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        <div className="formula__foot">
          <span className="family-tag" style={{ '--pc': fam.color }}>{fam.label}</span>
          <span className="formula__distinct">{distinctOf(example)}</span>
          <Link to={`/c/${example.id}`} className="btn">לעמוד של {example.name}</Link>
        </div>
      </section>

      {/* ── Where the chaos lives ── */}
      <section className="families">
        <div className="section-head">
          <span className="mono">FOUR FAMILIES</span>
          <h2>השוני מתחיל במקום שבו נמצא הכאוס</h2>
          <p className="muted">קריאה היסטורית: אחת עשרה תרבויות, ארבעה מקומות שבהם הן מאתרות את הסכנה. המשפחה קובעת מה הבית צריך לעשות.</p>
        </div>
        <div className="families__grid">
          {FAMILIES.map((f) => {
            const members = entries.cultures.filter((c) => familyOf(c).id === f.id);
            return (
              <article key={f.id} className="family" style={{ '--pc': f.color }}>
                <span className="mono family__en">{f.en} / {String(members.length).padStart(2, '0')}</span>
                <h3>{f.label}</h3>
                <p className="family__rule">{f.rule} <b>{f.house}</b></p>
                <ul className="family__members">
                  {members.map((c) => (
                    <li key={c.id}>
                      <Link to={`/c/${c.id}`} className="family__member">
                        <span className="family__name">{c.name}</span>
                        <span className="family__chaos">{c.chaos}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── The museum layer ── */}
      <section className="museum">
        <figure className="museum__quote">
          <blockquote>
            &quot;כל בנייה וכל יצירה מקבלות את בריאת העולם כמודל.&quot;
          </blockquote>
          <figcaption>
            מירצ&apos;ה אליאדה (Mircea Eliade), <i>הקדוש והחולין</i> (The Sacred and the Profane), 1957
          </figcaption>
        </figure>
        <div className="museum__insight">
          <span className="mono">INSIGHT</span>
          <p><mark>בית הוא קוסמולוגיה בקנה מידה של גוף.</mark> מי שיודע ממה תרבות פוחדת, יודע איך היא תבנה קיר.</p>
        </div>
        <div className="museum__haiku" aria-label="הייקו">
          <span>סערה בחוץ</span>
          <span>לבנה אחת על לבנה</span>
          <span>השקט נבנה</span>
        </div>
        <Link to="/compare" className="btn btn--primary museum__cta">להשוואה בין התרבויות</Link>
      </section>
    </div>
  );
}
