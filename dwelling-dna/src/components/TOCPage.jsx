import { forwardRef } from 'react';

const TOCPage = forwardRef(function TOCPage({ cultures, fusions, onGoTo }, ref) {
  // With TOC as page 1, cultures start at page 2
  const culturePageNum = (i) => 2 + i * 2;
  const fusionPageNum  = (i) => 2 + cultures.length * 2 + i * 2;

  return (
    <div className="page toc-page" ref={ref} dir="rtl">
      <div className="toc-page__inner">
        <div className="toc-page__header">
          <span className="toc-page__eyebrow">מגזין ארכיטקטורה תרבותית</span>
          <h1 className="toc-page__title">ארכיטייפ</h1>
          <p className="toc-page__sub">תוכן העניינים</p>
        </div>

        <div className="toc-page__section">
          <span className="toc-page__section-label">תרבויות</span>
          {cultures.map((c, i) => (
            <button
              key={c.id}
              className="toc-page__item"
              style={{ '--toc-accent': c.colors.accent }}
              onClick={() => onGoTo?.(culturePageNum(i))}
            >
              <span className="toc-page__item-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="toc-page__item-name">{c.name}</span>
              <span className="toc-page__item-arch">{c.archetype}</span>
              <span className="toc-page__item-page">{culturePageNum(i) + 1}</span>
            </button>
          ))}
        </div>

        {fusions && fusions.length > 0 && (
          <div className="toc-page__section">
            <span className="toc-page__section-label">מיזוגים</span>
            {fusions.map((f, i) => (
              <button
                key={f.id}
                className="toc-page__item"
                style={{ '--toc-accent': f.colors.accent }}
                onClick={() => onGoTo?.(fusionPageNum(i))}
              >
                <span className="toc-page__item-num">×</span>
                <span className="toc-page__item-name">{f.name}</span>
                <span className="toc-page__item-arch">FUSION</span>
                <span className="toc-page__item-page">{fusionPageNum(i) + 1}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default TOCPage;
