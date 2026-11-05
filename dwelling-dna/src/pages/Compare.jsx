import { Fragment, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useData } from '../store/data';
import { FAMILIES, FUSION_FAMILY, OPEN_FAMILY, LEVELS, FIELD_INSIGHTS, SPACE_FIELDS, familyOf, fieldValue, spaceOf } from '../data/reading';

// The comparison: every culture read on the same criteria, and every criterion
// of the same level side by side. Cultures can sit in rows or in columns; a
// band chooses the level; a column header puts one criterion in focus.

const DISTINCT = { key: 'distinct', label: 'מה מייחד', en: 'DISTINCT', q: 'מול כל האחרות' };
const MECH = LEVELS[0];
const DNA = LEVELS[1];

const BANDS = [
  { id: 'mech', label: 'מנגנון', hint: 'כאוס, סדר, תפקיד', groups: [MECH, { id: 'distinct', label: 'ייחוד', en: 'DISTINCT', fields: [DISTINCT] }] },
  { id: 'dna', label: 'DNA', hint: 'חמשת הווקטורים', groups: [DNA] },
  { id: 'spaces', label: 'מרחבים', hint: 'אותו מרחב, אותו קנה מידה', groups: [
    { id: 'ancestral', label: 'במסורת', en: 'TRADITION', fields: SPACE_FIELDS.filter((f) => f.space === 'ancestral') },
    { id: 'modern', label: 'בהקרנה קדימה', en: 'PROJECTION', fields: SPACE_FIELDS.filter((f) => f.space === 'modern') },
  ] },
  { id: 'all', label: 'הכול', hint: 'תשעה קריטריונים וייחוד', groups: [MECH, DNA, { id: 'distinct', label: 'ייחוד', en: 'DISTINCT', fields: [DISTINCT] }] },
];

const FAMILY_ORDER = [...FAMILIES, FUSION_FAMILY, OPEN_FAMILY];
const linkOf = (e) => (e.kind === 'fusion' ? '/f/' : '/c/') + e.id;

export default function Compare() {
  const { entries, images } = useData();
  const [params, setParams] = useSearchParams();
  const band = BANDS.find((b) => b.id === params.get('b')) ?? BANDS[0];
  const transposed = params.get('o') === 'cols';
  const grouped = params.get('g') !== '0';
  const focus = params.get('f');
  const mark = params.get('h');
  const picked = (params.get('p') ?? '').split(',').filter(Boolean);

  const scroller = useRef(null);

  useEffect(() => { document.title = 'השוואה | ארכיטייפ'; }, []);

  // The criterion in focus slides into view inside the table, and the marked
  // culture does too, so a link from a culture page lands on its own row.
  useEffect(() => {
    // Waits for the page turn to settle, so the measurements are not skewed.
    const t = setTimeout(() => {
      const box = scroller.current;
      const el = box?.querySelector(focus ? `[data-field="${focus}"]` : '.is-mark');
      if (!box || !el) return;
      const b = box.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      if (!transposed || !focus) box.scrollLeft += (r.left + r.width / 2) - (b.left + b.width / 2);
      if (!focus || transposed) box.scrollTop += r.top - b.top - 130;
    }, 520);
    return () => clearTimeout(t);
  }, [focus, mark, transposed, band.id]);

  const set = (key, value) => setParams((p) => {
    const n = new URLSearchParams(p);
    if (value == null || value === '') n.delete(key); else n.set(key, value);
    return n;
  }, { replace: true });

  const togglePick = (id) => {
    const next = picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id];
    set('p', next.join(','));
  };

  const list = entries.all.filter((e) => !picked.length || picked.includes(e.id));
  const shown = grouped ? FAMILY_ORDER.flatMap((f) => list.filter((e) => familyOf(e).id === f.id)) : list;
  const groups = grouped
    ? FAMILY_ORDER.map((f) => ({ family: f, items: shown.filter((e) => familyOf(e).id === f.id) })).filter((g) => g.items.length)
    : [{ family: null, items: shown }];

  const fields = band.groups.flatMap((g) => g.fields);
  const cellClass = (field) => {
    if (!focus) return '';
    return field.key === focus ? 'is-focus' : 'is-dim';
  };
  const toggleFocus = (key) => set('f', focus === key ? null : key);
  const clamp = band.id === 'all' ? 'cmp--clamp' : '';
  const insight = focus ? FIELD_INSIGHTS[focus] : null;
  const proof = (e) => (insight?.ids.includes(e.id) ? 'is-proof' : '');

  // One cell: text for a criterion, a picture at one scale for a space.
  const cell = (e, f) => {
    if (!f.space) return <span>{fieldValue(e, f) || '—'}</span>;
    const sp = spaceOf(e, f);
    const img = images[e.id]?.[f.slot];
    const base = (e.kind === 'fusion' ? '/f/' : '/c/') + e.id;
    return (
      <Link to={`${base}/spaces?space=${f.slot}`} className="cmp-space">
        <span className="cmp-space__img" style={{ background: img ? `center / cover no-repeat url("${img}")` : sp.gradient }} />
        <span className="cmp-space__cap">{sp.caption || '—'}</span>
      </Link>
    );
  };
  const title = (e, f) => (f.space ? spaceOf(e, f).caption : fieldValue(e, f));

  return (
    <div className="compare-page" dir="rtl">
      <header className="page-head page-head--row">
        <div>
          <span className="mono">02 / COMPARISON</span>
          <h1><b>{shown.length}</b> תשובות לאותה שאלה</h1>
          <p className="page-head__lede">
            {transposed ? 'טור הוא תרבות. שורה היא קריטריון.' : 'שורה היא תרבות. טור הוא קריטריון.'}
            {' '}קריטריונים באותו מעמד יושבים זה ליד זה.
            {' '}<mark>לחיצה על כותרת מדגישה קריטריון אחד בכל התרבויות.</mark>
          </p>
        </div>
        <div className="cmp-controls">
          <div className="seg" role="tablist" aria-label="רמה">
            {BANDS.map((b) => (
              <button key={b.id} type="button" role="tab" aria-selected={b.id === band.id} className={`seg__btn ${b.id === band.id ? 'seg__btn--on' : ''}`} onClick={() => setParams((p) => { const n = new URLSearchParams(p); n.set('b', b.id); n.delete('f'); return n; }, { replace: true })}>
                <b>{b.label}</b>
                <span>{b.hint}</span>
              </button>
            ))}
          </div>
          <div className="seg seg--small">
            <button type="button" className={`seg__btn ${!transposed ? 'seg__btn--on' : ''}`} aria-pressed={!transposed} onClick={() => set('o', null)}>תרבויות בשורות</button>
            <button type="button" className={`seg__btn ${transposed ? 'seg__btn--on' : ''}`} aria-pressed={transposed} onClick={() => set('o', 'cols')}>תרבויות בטורים</button>
            <button type="button" className={`seg__btn ${grouped ? 'seg__btn--on' : ''}`} aria-pressed={grouped} onClick={() => set('g', grouped ? '0' : null)}>לפי משפחה</button>
          </div>
        </div>
      </header>

      <div className="cmp-filter" aria-label="בחירת תרבויות">
        <button type="button" className={`pill pill--all ${!picked.length ? 'pill--on' : ''}`} onClick={() => set('p', null)}>כל התרבויות</button>
        {entries.all.map((e) => (
          <button key={e.id} type="button" className={`pill ${picked.includes(e.id) ? 'pill--on' : ''}`} style={{ '--pc': familyOf(e).color }} aria-pressed={picked.includes(e.id)} onClick={() => togglePick(e.id)}>
            {e.name}
          </button>
        ))}
      </div>

      <div className="cmp-legend">
        {FAMILY_ORDER.filter((f) => entries.all.some((e) => familyOf(e).id === f.id)).map((f) => (
          <span key={f.id} className="family-tag" style={{ '--pc': f.color }} title={f.rule}>{f.label}</span>
        ))}
        <Link to="/dna" className="cmp-legend__how">איך נקבעו הקריטריונים</Link>
      </div>

      {insight && (
        <div className="cmp-insight" role="status">
          <span className="mono">INSIGHT / {fields.find((f) => f.key === focus)?.label}</span>
          <p><mark>{insight.text}</mark></p>
          {insight.ids.length > 0 && <span className="cmp-insight__proof">התאים המודגשים בטבלה הם ההוכחה.</span>}
          <button type="button" className="cmp-insight__close" onClick={() => set('f', null)}>ביטול ההדגשה</button>
        </div>
      )}

      <div className="cmp-scroll" ref={scroller}>
        {!transposed ? (
          <table className={`cmp ${clamp} ${focus ? 'cmp--focus' : ''}`}>
            <thead>
              <tr className="cmp__bands">
                <th className="cmp__corner" rowSpan={2}><span className="mono">CULTURE</span></th>
                {band.groups.map((g) => (
                  <th key={g.id} colSpan={g.fields.length} className={`cmp__band cmp__band--${g.id}`}>
                    <span className="mono">{g.en}</span> {g.label}
                  </th>
                ))}
              </tr>
              <tr>
                {fields.map((f) => (
                  <th key={f.key} className={`cmp__col ${cellClass(f)}`} data-field={f.key}>
                    <button type="button" onClick={() => toggleFocus(f.key)} aria-pressed={focus === f.key}>
                      <b>{f.label}</b>
                      <span>{f.q}</span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groups.map(({ family, items }) => (
                <Fragment key={family?.id ?? 'all'}>
                  {family && (
                    <tr className="cmp__group" style={{ '--pc': family.color }}>
                      <th colSpan={fields.length + 1} scope="colgroup">
                        <b>{family.label}</b> <span>{family.rule} {family.house}</span>
                      </th>
                    </tr>
                  )}
                  {items.map((e) => (
                    <tr key={e.id} className={`cmp__row ${mark === e.id ? 'is-mark' : ''}`} style={{ '--pc': familyOf(e).color }}>
                      <th scope="row" className="cmp__name">
                        <Link to={linkOf(e)}>
                          <span className="cmp__name-he">{e.name}</span>
                          <span className="cmp__arch">{e.archetype || 'מיזוג'}</span>
                        </Link>
                      </th>
                      {fields.map((f) => (
                        <td key={f.key} className={`cmp__cell cmp__cell--${f.key} ${f.space ? 'cmp__cell--space' : ''} ${cellClass(f)} ${f.key === focus ? proof(e) : ''}`} title={title(e, f)}>
                          {cell(e, f)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        ) : (
          <table className={`cmp cmp--t ${clamp} ${focus ? 'cmp--focus' : ''}`}>
            <thead>
              <tr>
                <th className="cmp__corner"><span className="mono">CRITERION</span></th>
                {shown.map((e) => (
                  <th key={e.id} scope="col" className={`cmp__head ${mark === e.id ? 'is-mark' : ''}`} style={{ '--pc': familyOf(e).color }}>
                    <Link to={linkOf(e)}>
                      <span className="cmp__name-he">{e.name}</span>
                      <span className="cmp__arch">{familyOf(e).label}</span>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {band.groups.map((g) => (
                <Fragment key={g.id}>
                  <tr className="cmp__group cmp__group--level">
                    <th colSpan={shown.length + 1} scope="colgroup"><span className="mono">{g.en}</span> <b>{g.label}</b></th>
                  </tr>
                  {g.fields.map((f) => (
                    <tr key={f.key} className={`cmp__row ${cellClass(f)}`} data-field={f.key}>
                      <th scope="row" className="cmp__col">
                        <button type="button" onClick={() => toggleFocus(f.key)} aria-pressed={focus === f.key}>
                          <b>{f.label}</b>
                          <span>{f.q}</span>
                        </button>
                      </th>
                      {shown.map((e) => (
                        <td key={e.id} className={`cmp__cell cmp__cell--${f.key} ${f.space ? 'cmp__cell--space' : ''} ${f.key === focus ? proof(e) : ''}`} style={{ '--pc': familyOf(e).color }} title={title(e, f)}>
                          {cell(e, f)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="cmp-note muted">
        המשפחות והשורה &quot;מה מייחד&quot; הן קריאה פרשנית של המגזין. שאר התאים לקוחים מהעמוד של כל תרבות.
        {' '}<Link to="/lab">במעבדה אפשר למזג בין תרבויות.</Link>
      </p>
    </div>
  );
}
