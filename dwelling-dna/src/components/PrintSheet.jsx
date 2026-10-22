import { VECTORS, pad2 } from '../lib/dna';

/**
 * The printed deliverable: one culture on one A4 sheet.
 *
 * The screen page is a long scroll with animation and tools; printed, it was
 * cut across pages. This is a separate composition with fixed millimetre
 * measures, real <img> elements (browsers drop background images when
 * printing) and clamped text, so it always fits a single sheet whatever the
 * content length. It is hidden on screen and is the only thing printed.
 */
function Cell({ item, src, fallback }) {
  return (
    <figure className="ps-cell">
      <div className="ps-img" style={{ background: item.gradient || fallback }}>
        {src && <img src={src} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
      </div>
      <figcaption>
        <span className="ps-mono">{item.kind.en}</span>
        <span className="ps-cell-label">{item.kind.label}</span>
        {item.caption && <span className="ps-cell-text">{item.caption}</span>}
      </figcaption>
    </figure>
  );
}

export default function PrintSheet({ entry, rows, images, total }) {
  const isFusion = entry.kind === 'fusion';
  const lineage = isFusion ? (entry.lineage?.parent_names ?? []).join(' × ') : '';

  return (
    <section
      className="print-sheet"
      dir="rtl"
      style={{ '--c1': entry.colors?.primary, '--c2': entry.colors?.secondary, '--c3': entry.colors?.accent }}
    >
      <header className="ps-head" style={{ background: entry.gradient }}>
        <div className="ps-head-veil" />
        <div className="ps-head-in">
          <div className="ps-mono ps-meta">
            <span>ARCHITAIP / DWELLING DNA</span>
            <span>{isFusion ? 'FUSION' : 'CULTURE'} {pad2(entry.index)} / {pad2(total)}</span>
          </div>
          <h1 className="ps-name">{entry.name}</h1>
          <div className="ps-arch">{entry.archetype || lineage}</div>
          {entry.insight && <blockquote className="ps-insight">{entry.insight}</blockquote>}
        </div>
      </header>

      <div className="ps-triad">
        {[['כאוס', 'CHAOS', 'chaos'], ['סדר', 'ORDER', 'order'], ['תפקיד', 'ROLE', 'role']].map(([he, en, f]) => (
          <div key={f} className="ps-triad-node">
            <span className="ps-mono">{en} / {he}</span>
            <span className="ps-triad-val">{entry[f]}</span>
          </div>
        ))}
      </div>

      {entry.paragraph && <p className="ps-paragraph">{entry.paragraph}</p>}

      <div className="ps-row-label ps-mono">{isFusion ? 'FUSION SPACES' : 'ANCESTRAL'}</div>
      <div className="ps-row">{rows.ancestral.map((r) => <Cell key={r.slot} item={r} src={images[r.slot]} fallback={entry.gradient} />)}</div>

      <div className="ps-dna">
        {VECTORS.map((v) => (
          <div key={v.key} className="ps-dna-cell">
            <span className="ps-mono">{v.en}</span>
            <span className="ps-dna-he">{v.label}</span>
            <span className="ps-dna-val">{entry.vectors?.[v.key] ?? ''}</span>
          </div>
        ))}
      </div>

      {rows.modern.length > 0 && (
        <>
          <div className="ps-row-label ps-mono">PROJECTION</div>
          <div className="ps-row">{rows.modern.map((r) => <Cell key={r.slot} item={r} src={images[r.slot]} fallback={entry.gradient} />)}</div>
        </>
      )}

      {entry.interpretation && (
        <div className="ps-reading">
          <span className="ps-mono">READING / פרשנות ה-DNA האדריכלי</span>
          <p>{entry.interpretation}</p>
        </div>
      )}

      <footer className="ps-foot ps-mono">
        <span>{entry.post}</span>
        <span>architaip.vercel.app</span>
      </footer>
    </section>
  );
}
