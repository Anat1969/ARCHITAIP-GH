import { useCallback, useEffect, useMemo } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useData } from '../store/data';
import { useAuth } from '../store/auth';
import Editable from '../components/Editable';
import SpaceFrame from '../components/SpaceFrame';
import Lightbox from '../components/Lightbox';
import ExpertChat from '../components/ExpertChat';
import { VECTORS, pad2, spreadRows } from '../lib/dna';
import NotFound from './NotFound';
import PrintSheet from '../components/PrintSheet';
import { familyOf, distinctOf } from '../data/reading';

const LAST_READ = 'architaip:last';

export default function EntryPage({ kind, chapter = 'dna' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { entries, get, images, updateContent, removeEntry, approveFusion, status } = useData();
  const { editing, isAdmin } = useAuth();
  const entry = get(id);

  const list = kind === 'fusion' ? entries.fusions : entries.cultures;
  const pos = list.findIndex((e) => e.id === id);
  const prev = pos > 0 ? list[pos - 1] : null;
  const next = pos >= 0 && pos < list.length - 1 ? list[pos + 1] : null;
  const base = kind === 'fusion' ? '/f/' : '/c/';
  const tail = chapter === 'spaces' ? '/spaces' : '';

  const rows = useMemo(() => (entry ? spreadRows(entry) : { ancestral: [], modern: [] }), [entry]);
  const flat = useMemo(() => [
    ...rows.ancestral.map((r) => ({ ...r, row: 'ancestral' })),
    ...rows.modern.map((r) => ({ ...r, row: 'modern' })),
  ], [rows]);
  const openSlot = params.get('space');
  const openItem = flat.find((f) => f.slot === openSlot) ?? null;

  const setOpen = useCallback((slot) => {
    setParams((p) => {
      const n = new URLSearchParams(p);
      if (slot) n.set('space', slot); else n.delete('space');
      return n;
    }, { replace: true });
  }, [setParams]);

  const step = useCallback((d) => {
    const i = flat.findIndex((f) => f.slot === openSlot);
    const n = flat[(i + d + flat.length) % flat.length];
    if (n) setOpen(n.slot);
  }, [flat, openSlot, setOpen]);

  useEffect(() => {
    if (entry && kind === 'culture') {
      try { localStorage.setItem(LAST_READ, entry.id); } catch { /* private mode */ }
    }
    document.title = entry ? `${entry.name} | ארכיטייפ` : 'ארכיטייפ';
  }, [entry, kind]);

  // Reading direction is right to left: the left arrow moves forward.
  useEffect(() => {
    const onKey = (e) => {
      if (openSlot || /INPUT|TEXTAREA/.test(document.activeElement?.tagName ?? '')) return;
      if (e.key === 'ArrowLeft' && next) navigate(base + next.id + tail);
      if (e.key === 'ArrowRight' && prev) navigate(base + prev.id + tail);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, navigate, base, tail, openSlot]);

  if (!entry) {
    if (status === 'loading') return <div className="page-loading mono">LOADING</div>;
    return <NotFound />;
  }
  // A space opens in the spaces chapter, so an old deep link still lands on it.
  if (chapter === 'dna' && openSlot) return <Navigate to={`${base}${entry.id}/spaces?space=${openSlot}`} replace />;

  const img = images[entry.id] ?? {};
  const hero = img.prompt_0 || img.communal || img.private || img.threshold || null;
  const save = (field) => (val) => updateContent(entry.id, { [field]: val });
  const tone = {
    '--c1': entry.colors?.primary ?? '#888',
    '--c2': entry.colors?.secondary ?? '#333',
    '--c3': entry.colors?.accent ?? '#bbb',
  };
  const isFusion = entry.kind === 'fusion';
  const fam = familyOf(entry);
  const siblings = isFusion ? [] : entries.cultures.filter((c) => c.id !== entry.id && familyOf(c).id === fam.id);
  const onSpaces = chapter === 'spaces';
  const parents = isFusion ? (entry.lineage?.parents ?? []).map((pid, i) => ({
    id: pid,
    name: entry.lineage.parent_names?.[i] ?? pid,
    weight: entry.lineage.parent_weights?.[i] ?? 1 / (entry.lineage.parents.length || 1),
    entry: get(pid),
  })) : [];

  // The PDF is named after the culture rather than the site.
  // Images on the sheet finish loading first, or the PDF shows empty frames.
  const printSheet = async () => {
    const imgs = [...document.querySelectorAll('.print-sheet img')];
    await Promise.race([
      Promise.all(imgs.map((im) => (im.complete ? null : new Promise((r) => { im.onload = r; im.onerror = r; })))),
      new Promise((r) => setTimeout(r, 4000)),
    ]);
    const title = document.title;
    document.title = `DWELLING_DNA_${entry.name}`;
    window.print();
    setTimeout(() => { document.title = title; }, 500);
  };

  const fullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  };

  return (
    <>
    <article className={`entry entry--${chapter}`} style={tone} dir="rtl">
      {/* ── Opening: the name as image ── */}
      <header className={`entry-hero ${onSpaces ? 'entry-hero--compact' : ''}`}>
        <div className="entry-hero__bg" style={{ background: entry.gradient }} />
        {hero && <div className="entry-hero__img" style={{ backgroundImage: `url("${hero}")` }} />}
        <div className="entry-hero__veil" />
        <div className="entry-hero__inner">
          <div className="entry-hero__meta mono">
            <span>{isFusion ? 'FUSION' : 'CULTURE'} {pad2(entry.index)} / {pad2(list.length)}</span>
            <span>{entry.archetype || (isFusion ? 'מיזוג' : '')}</span>
            {!isFusion && <span className="entry-hero__family" style={{ '--pc': fam.color }}>{fam.label}</span>}
          </div>
          <motion.h1
            className="entry-hero__name"
            initial={{ opacity: 0, y: 30, letterSpacing: '0.08em' }}
            animate={{ opacity: 1, y: 0, letterSpacing: '-0.02em' }}
            transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
          >
            {entry.name}
          </motion.h1>
          {!onSpaces && <Editable as="blockquote" className="entry-hero__insight" value={entry.insight} onSave={save('insight')} multiline placeholder="תובנה" />}
          <div className="entry-hero__tools no-print">
            <button type="button" className="bar-btn bar-btn--glass" onClick={fullscreen}>מצב הצגה</button>
            <button type="button" className="bar-btn bar-btn--glass" onClick={printSheet}>ייצוא PDF</button>
            {!isFusion && <Link className="bar-btn bar-btn--glass" to={`/lab?p=${entry.id}`}>למזג עם תרבות אחרת</Link>}
            {isAdmin && isFusion && entry.approved === false && (
              <button type="button" className="bar-btn bar-btn--glass bar-btn--approve" onClick={() => approveFusion(entry.id)}>אישור לפרסום</button>
            )}
            {editing && (isFusion || entry.isCustom) && (
              <button
                type="button"
                className="bar-btn bar-btn--glass bar-btn--danger"
                onClick={async () => {
                  if (!window.confirm(`למחוק את "${entry.name}"? הפעולה אינה הפיכה.`)) return;
                  if (await removeEntry(entry)) navigate('/cultures');
                }}
              >
                מחיקה
              </button>
            )}
          </div>
        </div>
      </header>

      {isFusion && entry.approved === false && (
        <p className="pending no-print" role="status">
          <b>ממתין לאישור.</b> {isAdmin
            ? 'מיזוג של קורא. הוא ייכנס לרשימה הציבורית אחרי שתאשרי אותו.'
            : 'המיזוג נשמר. כרגע רואים אותו רק את ומי שקיבל את הקישור, והוא ייכנס לרשימה אחרי אישור העורכת.'}
        </p>
      )}

      <nav className="chapters no-print" aria-label="פרקים">
        <Link to={base + entry.id} className={`chapter ${!onSpaces ? 'chapter--on' : ''}`} aria-current={!onSpaces ? 'page' : undefined}>
          <span className="mono">01</span> ה-DNA <span className="chapter__sub">מנגנון, וקטורים, טקסט</span>
        </Link>
        <Link to={`${base}${entry.id}/spaces`} className={`chapter ${onSpaces ? 'chapter--on' : ''}`} aria-current={onSpaces ? 'page' : undefined}>
          <span className="mono">02</span> {isFusion ? 'מרחבי המיזוג' : 'המרחבים'} <span className="chapter__sub">{isFusion ? 'שלושה מרחבים' : 'מסורת והקרנה קדימה'}</span>
        </Link>
        {!isFusion && <Link to={`/compare?h=${entry.id}`} className="chapter chapter--out">בטבלת ההשוואה</Link>}
      </nav>

      {!onSpaces && (<>
      {/* ── The mechanism: chaos, order, role ── */}
      <section className="entry-section mechanism">
        <div className="section-head">
          <span className="mono">01 MECHANISM</span>
          <h2>המנגנון</h2>
          <p className="muted">ממה התרבות מתגוננת, מה היא בונה כנגדו, ומה תפקיד הבית בתוך זה.</p>
        </div>
        <ol className="triad">
          {[['כאוס', 'CHAOS', 'chaos'], ['סדר', 'ORDER', 'order'], ['תפקיד', 'ROLE', 'role']].map(([he, en, f], i) => (
            <motion.li
              key={f}
              className="triad__node"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.12 }}
            >
              <span className="mono triad__en">{en}</span>
              <span className="triad__he">{he}</span>
              <span className="triad__val">{entry[f]}</span>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* ── Text ── */}
      <section className="entry-section reading">
        <div className="reading__main">
          <Editable as="p" className="reading__paragraph" value={entry.paragraph} onSave={save('paragraph')} multiline placeholder="תיאור תרבותי" />
          <Editable as="p" className="reading__post" value={entry.post} onSave={save('post')} placeholder="משפט קצר" />
        </div>
        {isFusion && (
          <aside className="lineage">
            <span className="mono">LINEAGE</span>
            {parents.map((p) => (
              <Link key={p.id} to={(p.entry?.kind === 'fusion' ? '/f/' : '/c/') + p.id} className="lineage__row" style={{ '--w': `${Math.round(p.weight * 100)}%`, '--pc': p.entry?.colors?.accent ?? '#999' }}>
                <span className="lineage__name">{p.name}</span>
                <span className="lineage__bar" />
                <span className="mono lineage__pct">{Math.round(p.weight * 100)}%</span>
              </Link>
            ))}
          </aside>
        )}
      </section>

      {/* ── Its place among the others ── */}
      {!isFusion && (
        <section className="entry-section kin" style={{ '--pc': fam.color }}>
          <div className="kin__main">
            <span className="mono">03 DISTINCT</span>
            <span className="family-tag" style={{ '--pc': fam.color }}>{fam.label}</span>
            <p className="kin__distinct">{distinctOf(entry)}</p>
            <p className="muted">{fam.rule} <b>{fam.house}</b></p>
          </div>
          {siblings.length > 0 && (
            <div className="kin__side">
              <span className="mono">באותה משפחה</span>
              {siblings.map((s) => (
                <Link key={s.id} to={`/c/${s.id}`} className="kin__sib">
                  <b>{s.name}</b>
                  <span>{s.chaos}, ולכן {s.role}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="entry-section">
        <div className="section-head">
          <span className="mono">04 DNA</span>
          <h2>חמשת הווקטורים</h2>
          <p className="muted">איך המנגנון הופך לחומר, לאור, לסף, לקנה מידה ולסיפור.</p>
        </div>
        <DnaStrip entry={entry} />
      </section>

      {editing && <div className="entry-section no-print"><ExpertChat entry={entry} /></div>}
      </>)}

      {onSpaces && (
      <section className="entry-section transfer">
        <div className="section-head">
          <span className="mono">02 TRANSFER</span>
          <h2>{isFusion ? 'מרחבי המיזוג' : 'מהמסורת אל העתיד'}</h2>
          <p className="muted">
            {isFusion
              ? 'שלושה מרחבים שנולדו מהמפגש.'
              : 'שלושה מרחבים במסורת, חמשת הווקטורים שעוברים הלאה, ואותם מרחבים בהקרנה קדימה.'}
          </p>
        </div>

        <div className="transfer__row">
          <div className="transfer__tag mono">{isFusion ? 'FUSION' : 'ANCESTRAL'}</div>
          <div className="frames">
            {rows.ancestral.map((r) => (
              <SpaceFrame key={r.slot} entryId={entry.id} {...r} imageUrl={img[r.slot]} tone="ancestral" onOpen={() => setOpen(r.slot)} />
            ))}
          </div>
        </div>

        <DnaStrip entry={entry} compact />

        {rows.modern.length > 0 && (
          <div className="transfer__row">
            <div className="transfer__tag mono">PROJECTION</div>
            <div className="frames">
              {rows.modern.map((r) => (
                <SpaceFrame key={r.slot} entryId={entry.id} {...r} imageUrl={img[r.slot]} tone="modern" onOpen={() => setOpen(r.slot)} />
              ))}
            </div>
          </div>
        )}

        {!isFusion && (entry.interpretation || editing) && (
          <div className="interpretation">
            <span className="mono">READING</span>
            <h3>פרשנות ה-DNA האדריכלי</h3>
            <Editable as="p" value={entry.interpretation} onSave={save('interpretation')} multiline placeholder="איך ה-DNA מתורגם לבית עכשווי" />
          </div>
        )}
      </section>
      )}

      {/* ── Turning the page ── */}
      <nav className="turn no-print" aria-label="מעבר בין עמודים">
        {prev ? (
          <Link to={base + prev.id + tail} className="turn__link turn__link--prev" style={{ '--tc': prev.colors?.accent }}>
            <span className="mono">PREVIOUS {pad2(prev.index)}</span>
            <span className="turn__name">{prev.name}</span>
          </Link>
        ) : <span />}
        {next ? (
          <Link to={base + next.id + tail} className="turn__link turn__link--next" style={{ '--tc': next.colors?.accent }}>
            <span className="mono">NEXT {pad2(next.index)}</span>
            <span className="turn__name">{next.name}</span>
          </Link>
        ) : (
          <Link to={kind === 'fusion' ? '/lab' : '/cultures'} className="turn__link turn__link--next">
            <span className="mono">END</span>
            <span className="turn__name">{kind === 'fusion' ? 'למעבדה' : 'לתוכן העניינים'}</span>
          </Link>
        )}
      </nav>

      <AnimatePresence>
        {onSpaces && openItem && (
          <Lightbox item={openItem} imageUrl={img[openItem.slot]} entryId={entry.id} entryName={entry.name} onClose={() => setOpen(null)} onStep={step} />
        )}
      </AnimatePresence>
    </article>
    <PrintSheet entry={entry} rows={rows} images={img} total={list.length} />
    </>
  );
}

function DnaStrip({ entry, compact = false }) {
  return (
    <div className={`dna-strip ${compact ? 'dna-strip--compact' : ''}`}>
      <div className="dna-strip__tag mono">DNA</div>
      <div className="dna-strip__cells">
        {VECTORS.map((v, i) => (
          <motion.div
            key={v.key}
            className="dna-cell"
            initial={{ opacity: 0, scaleY: 0.6 }}
            whileInView={{ opacity: 1, scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
          >
            <span className="mono dna-cell__en">{v.en}</span>
            <span className="dna-cell__he">{v.label}</span>
            <span className="dna-cell__val">{entry.vectors?.[v.key] ?? ''}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
