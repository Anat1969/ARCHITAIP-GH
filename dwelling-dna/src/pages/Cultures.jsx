import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useData } from '../store/data';
import { useAuth } from '../store/auth';
import { pad2 } from '../lib/dna';
import { FAMILIES, OPEN_FAMILY, familyOf, distinctOf } from '../data/reading';
import CultureCreate from '../components/CultureCreate';

// The contents: every culture as a door, arranged by where it finds its chaos,
// and the fusions the lab has produced.

function coverImage(images, id) {
  const img = images[id] ?? {};
  return img.prompt_0 || img.communal || img.private || img.threshold || img.prompt_2 || null;
}

export default function Cultures() {
  const { entries, images } = useData();
  const { editing } = useAuth();
  const [adding, setAdding] = useState(false);

  useEffect(() => { document.title = 'תרבויות | ארכיטייפ'; }, []);

  const families = [...FAMILIES, OPEN_FAMILY]
    .map((f) => ({ family: f, items: entries.cultures.filter((c) => familyOf(c).id === f.id) }))
    .filter((g) => g.items.length);

  return (
    <div className="cultures-page" dir="rtl">
      <header className="page-head page-head--row">
        <div>
          <span className="mono">03 / CONTENTS</span>
          <h1><b>{entries.cultures.length}</b> תרבויות, ארבעה מקומות של כאוס</h1>
          <p className="page-head__lede">כל תרבות היא עמוד בשני פרקים: ה-DNA שלה, והמרחבים שנגזרים ממנו.</p>
        </div>
        <div className="row">
          <Link to="/compare" className="btn">לטבלת ההשוואה</Link>
          {editing && <button type="button" className="btn" onClick={() => setAdding(true)}>הוספת תרבות</button>}
        </div>
      </header>

      {families.map(({ family, items }) => (
        <section key={family.id} className="shelf" style={{ '--pc': family.color }}>
          <div className="shelf__head">
            <span className="family-tag" style={{ '--pc': family.color }}>{family.label}</span>
            <span className="muted">{family.rule} <b>{family.house}</b></span>
          </div>
          <div className="tiles">
            {items.map((c, i) => {
              const img = coverImage(images, c.id);
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: (i % 4) * 0.06 }}
                >
                  <Link to={`/c/${c.id}`} className="tile" style={{ '--c3': family.color, background: c.gradient }}>
                    {img && <span className="tile__img" style={{ backgroundImage: `url("${img}")` }} />}
                    <span className="tile__veil" />
                    <span className="mono tile__num">{pad2(c.index)}</span>
                    <span className="tile__name">{c.name}</span>
                    <span className="tile__arch">{c.archetype}</span>
                    <span className="tile__distinct">{distinctOf(c)}</span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      ))}

      <section className="shelf">
        <div className="section-head section-head--row">
          <div>
            <span className="mono">FUSIONS</span>
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
                <span className="mono">FUSION {pad2(f.index)}{f.approved === false ? ' / ממתין לאישור' : ''}</span>
                <span className="fusion-item__name">{f.name}</span>
                <span className="fusion-item__insight">{f.insight}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <AnimatePresence>{adding && <CultureCreate onClose={() => setAdding(false)} />}</AnimatePresence>
    </div>
  );
}
