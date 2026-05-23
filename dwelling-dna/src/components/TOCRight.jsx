import { forwardRef } from 'react';

// Page 1 (odd → RIGHT): Chapter A — cultures list
const TOCRight = forwardRef(function TOCRight(
  { cultures, onGoTo, onOpenCultureModal },
  ref
) {
  const culturePageNum = (i) => 5 + i * 2;

  return (
    <div className="page toc-page toc-page--right" ref={ref} dir="rtl">
      <div className="toc-page__inner">
        <div className="toc-page__header">
          <span className="toc-page__eyebrow">מגזין ארכיטקטורה תרבותית</span>
          <h1 className="toc-page__title">ארכיטייפ</h1>
          <p className="toc-page__sub">תוכן העניינים</p>
        </div>

        <div className="toc-page__chapter">
          <span className="toc-page__chapter-label">פרק א — תרבויות</span>
          <div className="toc-page__items">
            {cultures.map((c, i) => (
              <button
                key={c.id}
                className="toc-page__item"
                style={{ '--toc-accent': c.colors.accent }}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); setTimeout(() => onGoTo?.(culturePageNum(i)), 50); }}
              >
                <span className="toc-page__item-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="toc-page__item-name">{c.name}</span>
                <span className="toc-page__item-arch">{c.archetype}</span>
                <span className="toc-page__item-page">{culturePageNum(i)}</span>
              </button>
            ))}
          </div>
          <button className="toc-page__add-btn" onClick={(e) => { e.stopPropagation(); onOpenCultureModal?.(); }}>
            ＋ הוסף תרבות
          </button>
        </div>
      </div>
    </div>
  );
});

export default TOCRight;
