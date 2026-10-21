import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useData } from '../store/data';
import { useAuth } from '../store/auth';
import { VECTORS, pad2 } from '../lib/dna';
import CultureCreate from '../components/CultureCreate';

const BASE = import.meta.env.BASE_URL;

function coverImage(images, id) {
  const img = images[id] ?? {};
  return img.prompt_0 || img.communal || img.private || img.threshold || img.prompt_2 || null;
}

export default function Home() {
  const { entries, images, status } = useData();
  const { editing } = useAuth();
  const [params, setParams] = useSearchParams();
  const [adding, setAdding] = useState(false);
  const vector = VECTORS.find((v) => v.key === params.get('v')) ?? VECTORS[0];
  const first = entries.cultures[0];

  useEffect(() => { document.title = 'ארכיטייפ | DWELLING DNA'; }, []);

  return (
    <div className="home" dir="rtl">
      {/* ── Cover ── */}
      <section className="cover">
        <video className="cover__video" src={`${BASE}cover-video.mp4`} autoPlay muted loop playsInline poster={`${BASE}cover.png`} />
        <div className="cover__veil" />
        <div className="cover__inner">
          <motion.div className="mono cover__eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            מגזין ארכיטקטורה תרבותית / DWELLING DNA
          </motion.div>
          <motion.h1
            className="cover__title"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.2, 0.7, 0.2, 1] }}
          >
            ארכיטייפ
          </motion.h1>
          <motion.p className="cover__lede" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.8 }}>
            כל תרבות היא תשובה לשאלה אחת: ממה צריך להגן, ומה בונים כנגדו.
            המגזין קורא {entries.cultures.length} תרבויות דרך חמישה וקטורים ומקרין אותן אל הבית של המאה הבאה.
          </motion.p>
          <div className="cover__cta">
            {first && <Link to={`/c/${first.id}`} className="btn btn--light">פתיחת המגזין</Link>}
            <Link to="/lab" className="btn btn--glass">מעבדת המיזוג</Link>
          </div>
          <dl className="cover__stats mono">
            <div><dt>CULTURES</dt><dd>{pad2(entries.cultures.length)}</dd></div>
            <div><dt>VECTORS</dt><dd>05</dd></div>
            <div><dt>SPACES</dt><dd>03</dd></div>
            <div><dt>FUSIONS</dt><dd>{pad2(entries.fusions.length)}</dd></div>
          </dl>
        </div>
      </section>

      {status === 'offline' && (
        <p className="notice notice--error home__offline">השרת לא זמין כרגע. המגזין מוצג מהתוכן המובנה, ושינויים לא יישמרו.</p>
      )}

      {/* ── Contents ── */}
      <section className="block">
        <div className="section-head section-head--row">
          <div>
            <span className="mono">A / CONTENTS</span>
            <h2>תרבויות</h2>
          </div>
          {editing && <button type="button" className="btn" onClick={() => setAdding(true)}>הוספת תרבות</button>}
        </div>
        <div className="tiles">
          {entries.cultures.map((c, i) => {
            const img = coverImage(images, c.id);
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: (i % 4) * 0.06 }}
              >
                <Link to={`/c/${c.id}`} className="tile" style={{ '--c3': c.colors?.accent, background: c.gradient }}>
                  {img && <span className="tile__img" style={{ backgroundImage: `url("${img}")` }} />}
                  <span className="tile__veil" />
                  <span className="mono tile__num">{pad2(c.index)}</span>
                  <span className="tile__name">{c.name}</span>
                  <span className="tile__arch">{c.archetype}</span>
                  <span className="tile__triad mono">{c.chaos} / {c.order}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Atlas: one vector across every culture ── */}
      <section className="block atlas">
        <div className="section-head">
          <span className="mono">B / ATLAS</span>
          <h2>קריאה רוחבית</h2>
          <p className="muted">וקטור אחד, כל התרבויות. כך רואים מה משותף ומה ייחודי, בלי לעבור עמוד עמוד.</p>
        </div>
        <div className="atlas__tabs" role="tablist">
          {VECTORS.map((v) => (
            <button
              key={v.key}
              type="button"
              role="tab"
              aria-selected={v.key === vector.key}
              className={`atlas__tab ${v.key === vector.key ? 'atlas__tab--on' : ''}`}
              onClick={() => setParams({ v: v.key }, { replace: true })}
            >
              <span className="mono">{v.en}</span>
              <span>{v.label}</span>
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.ol
            key={vector.key}
            className="atlas__rows"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {entries.all.map((c) => (
              <li key={c.id}>
                <Link to={(c.kind === 'fusion' ? '/f/' : '/c/') + c.id} className="atlas__row" style={{ '--c3': c.colors?.accent }}>
                  <span className="atlas__swatch" />
                  <span className="atlas__name">{c.name}</span>
                  <span className="atlas__val">{c.vectors?.[vector.key] || '—'}</span>
                </Link>
              </li>
            ))}
          </motion.ol>
        </AnimatePresence>
      </section>

      {/* ── Fusions ── */}
      <section className="block">
        <div className="section-head section-head--row">
          <div>
            <span className="mono">C / FUSIONS</span>
            <h2>מיזוגים</h2>
          </div>
          <Link to="/lab" className="btn">למעבדה</Link>
        </div>
        {entries.fusions.length === 0 ? (
          <p className="muted">עדיין אין מיזוגים. במעבדה אפשר להשוות בין תרבויות, וליצור מהן מיזוג חדש.</p>
        ) : (
          <div className="fusion-list">
            {entries.fusions.map((f) => (
              <Link key={f.id} to={`/f/${f.id}`} className="fusion-item" style={{ background: f.gradient }}>
                <span className="mono">FUSION {pad2(f.index)}</span>
                <span className="fusion-item__name">{f.name}</span>
                <span className="fusion-item__insight">{f.insight}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <footer className="colophon">
        <p>כל מרחב הוא שאלה. כל תרבות, תשובה שונה. המרחב שלך מספר מי אתה.</p>
        <span className="mono">ARCHITAIP / DWELLING DNA</span>
      </footer>

      <AnimatePresence>{adding && <CultureCreate onClose={() => setAdding(false)} />}</AnimatePresence>
    </div>
  );
}
