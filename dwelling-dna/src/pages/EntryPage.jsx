import { useCallback, useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useData } from '../store/data';
import { useAuth } from '../store/auth';
import Editable from '../components/Editable';
import SpaceFrame from '../components/SpaceFrame';
import Lightbox from '../components/Lightbox';
import ExpertChat from '../components/ExpertChat';
import { VECTORS, pad2, spreadRows } from '../lib/dna';
import NotFound from './NotFound';

const LAST_READ = 'architaip:last';

export default function EntryPage({ kind }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { entries, get, images, updateContent, removeEntry, status } = useData();
  const { editing } = useAuth();
  const entry = get(id);

  const list = kind === 'fusion' ? entries.fusions : entries.cultures;
  const pos = list.findIndex((e) => e.id === id);
  const prev = pos > 0 ? list[pos - 1] : null;
  const next = pos >= 0 && pos < list.length - 1 ? list[pos + 1] : null;
  const base = kind === 'fusion' ? '/f/' : '/c/';

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
      if (e.key === 'ArrowLeft' && next) navigate(base + next.id);
      if (e.key === 'ArrowRight' && prev) navigate(base + prev.id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, navigate, base, openSlot]);

  if (!entry) {
    if (status === 'loading') return <div className="page-loading mono">LOADING</div>;
    return <NotFound />;
  }

  const img = images[entry.id] ?? {};
  const hero = img.prompt_0 || img.communal || img.private || img.threshold || null;
  const save = (field) => (val) => updateContent(entry.id, { [field]: val });
  const tone = {
    '--c1': entry.colors?.primary ?? '#888',
    '--c2': entry.colors?.secondary ?? '#333',
    '--c3': entry.colors?.accent ?? '#bbb',
  };
  const isFusion = entry.kind === 'fusion';
  const parents = isFusion ? (entry.lineage?.parents ?? []).map((pid, i) => ({
    id: pid,
    name: entry.lineage.parent_names?.[i] ?? pid,
    weight: entry.lineage.parent_weights?.[i] ?? 1 / (entry.lineage.parents.length || 1),
    entry: get(pid),
  })) : [];

  const fullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  };

  return (
    <article className="entry" style={tone} dir="rtl">
      {/* ── Opening: the name as image ── */}
      <header className="entry-hero">
        <div className="entry-hero__bg" style={{ background: entry.gradient }} />
        {hero && <div className="entry-hero__img" style={{ backgroundImage: `url("${hero}")` }} />}
        <div className="entry-hero__veil" />
        <div className="entry-hero__inner">
          <div className="entry-hero__meta mono">
            <span>{isFusion ? 'FUSION' : 'CULTURE'} {pad2(entry.index)} / {pad2(list.length)}</span>
            <span>{entry.archetype || (isFusion ? 'מיזוג' : '')}</span>
          </div>
          <motion.h1
            className="entry-hero__name"
            initial={{ opacity: 0, y: 30, letterSpacing: '0.08em' }}
            animate={{ opacity: 1, y: 0, letterSpacing: '-0.02em' }}
            transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
          >
            {entry.name}
          </motion.h1>
          <Editable as="blockquote" className="entry-hero__insight" value={entry.insight} onSave={save('insight')} multiline placeholder="תובנה" />
          <div className="entry-hero__tools no-print">
            <button type="button" className="bar-btn bar-btn--glass" onClick={fullscreen}>מצב הצגה</button>
            <button type="button" className="bar-btn bar-btn--glass" onClick={() => window.print()}>ייצוא PDF</button>
            {!isFusion && <Link className="bar-btn bar-btn--glass" to={`/lab?p=${entry.id}`}>למזג עם תרבות אחרת</Link>}
            {editing && (isFusion || entry.isCustom) && (
              <button
                type="button"
                className="bar-btn bar-btn--glass bar-btn--danger"
                onClick={async () => {
                  if (!window.confirm(`למחוק את "${entry.name}"? הפעולה אינה הפיכה.`)) return;
                  if (await removeEntry(entry)) navigate('/');
                }}
              >
                מחיקה
              </button>
            )}
          </div>
        </div>
      </header>

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

      {/* ── The transfer: tradition, DNA, projection ── */}
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

        <div className="dna-strip">
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

      {editing && <div className="entry-section no-print"><ExpertChat entry={entry} /></div>}

      {/* ── Turning the page ── */}
      <nav className="turn no-print" aria-label="מעבר בין עמודים">
        {prev ? (
          <Link to={base + prev.id} className="turn__link turn__link--prev" style={{ '--tc': prev.colors?.accent }}>
            <span className="mono">PREVIOUS {pad2(prev.index)}</span>
            <span className="turn__name">{prev.name}</span>
          </Link>
        ) : <span />}
        {next ? (
          <Link to={base + next.id} className="turn__link turn__link--next" style={{ '--tc': next.colors?.accent }}>
            <span className="mono">NEXT {pad2(next.index)}</span>
            <span className="turn__name">{next.name}</span>
          </Link>
        ) : (
          <Link to={kind === 'fusion' ? '/lab' : '/'} className="turn__link turn__link--next">
            <span className="mono">END</span>
            <span className="turn__name">{kind === 'fusion' ? 'למעבדה' : 'לאטלס'}</span>
          </Link>
        )}
      </nav>

      <AnimatePresence>
        {openItem && (
          <Lightbox item={openItem} imageUrl={img[openItem.slot]} entryId={entry.id} entryName={entry.name} onClose={() => setOpen(null)} onStep={step} />
        )}
      </AnimatePresence>
    </article>
  );
}
