import { forwardRef } from 'react';

const CHAPTER_META = {
  cultures: {
    num: 'א',
    name: 'תרבויות',
    sub: 'ארכיטייפים של מרחב ותרבות',
    bgRight: 'linear-gradient(135deg, #fafaf8 0%, #f0ede8 100%)',
    bgLeft: 'linear-gradient(145deg, #C19A6B 0%, #6B4A2A 30%, #4A3728 60%, #2A1F14 100%)',
    accent: '#D4A843',
  },
  fusions: {
    num: 'ב',
    name: 'מיזוגים',
    sub: 'מפגשים בין ארכיטייפים',
    bgRight: 'linear-gradient(135deg, #fafaf8 0%, #eeeef5 100%)',
    bgLeft: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #533483 100%)',
    accent: '#7c5cbf',
  },
};

const ChapterSpread = forwardRef(function ChapterSpread(
  { side, chapter },
  ref
) {
  const meta = CHAPTER_META[chapter] || CHAPTER_META.cultures;
  const isRight = side === 'right';

  if (isRight) {
    return (
      <div
        className="page chapter-spread chapter-spread--right"
        ref={ref}
        dir="rtl"
        style={{ background: meta.bgRight }}
      >
        <div className="chapter-spread__content">
          <span className="chapter-spread__eyebrow" style={{ color: meta.accent }}>
            פרק {meta.num}
          </span>
          <h2 className="chapter-spread__title">{meta.name}</h2>
          <p className="chapter-spread__sub">{meta.sub}</p>
          <div className="chapter-spread__line" style={{ background: meta.accent }} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="page chapter-spread chapter-spread--left"
      ref={ref}
      style={{ background: meta.bgLeft }}
    >
      <div className="chapter-spread__left-content">
        <span className="chapter-spread__left-label" style={{ color: 'rgba(255,255,255,0.15)' }}>
          {meta.name}
        </span>
      </div>
    </div>
  );
});

export default ChapterSpread;
