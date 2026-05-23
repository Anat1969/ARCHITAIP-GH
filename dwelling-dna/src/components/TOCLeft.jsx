import { forwardRef } from 'react';

// Page 2 (even → LEFT): Chapter B — fusions list
const TOCLeft = forwardRef(function TOCLeft(
  { cultures, fusions, onGoTo, onOpenFusionModal },
  ref
) {
  const nCultures = cultures.length;
  const fusionPageNum = (i) => 7 + nCultures * 2 + i * 2;

  return (
    <div className="page toc-page toc-page--left" ref={ref} dir="rtl">
      <div className="toc-page__inner">
        <div className="toc-page__chapter toc-page__chapter--b">
          <span className="toc-page__chapter-label">פרק ב — מיזוגים</span>
          <div className="toc-page__items">
            {fusions && fusions.length > 0 ? (
              fusions.map((f, i) => (
                <button
                  key={f.id}
                  className="toc-page__item"
                  style={{ '--toc-accent': f.colors.accent }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); setTimeout(() => onGoTo?.(fusionPageNum(i)), 50); }}
                >
                  <span className="toc-page__item-num">×</span>
                  <span className="toc-page__item-name">{f.name}</span>
                  <span className="toc-page__item-arch">FUSION</span>
                  <span className="toc-page__item-page">{fusionPageNum(i)}</span>
                </button>
              ))
            ) : (
              <p className="toc-page__empty">לא נוצרו מיזוגים עדיין</p>
            )}
          </div>
          <button
            className="toc-page__add-btn toc-page__add-btn--fusion"
            onClick={(e) => { e.stopPropagation(); onOpenFusionModal?.(); }}
          >
            ＋ הוסף מיזוג
          </button>
        </div>
      </div>
    </div>
  );
});

export default TOCLeft;
