import { useState, useEffect } from 'react';

const STORAGE_KEY = 'dwelling-dna:typography';

const defaults = {
  scale: 1,
  lineHeight: 1.7,
  bodyWeight: 400,
  headingWeight: 700,
  fontDisplay: "'Noto Serif Hebrew', serif",
};

function load() {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; }
  catch { return defaults; }
}

function apply(settings) {
  const r = document.documentElement.style;
  r.setProperty('--ty-scale', settings.scale);
  r.setProperty('--ty-line-height', settings.lineHeight);
  r.setProperty('--ty-body-weight', settings.bodyWeight);
  r.setProperty('--ty-heading-weight', settings.headingWeight);
  r.setProperty('--font-display', settings.fontDisplay);
}

export default function TypographyPanel() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(load);

  useEffect(() => {
    apply(settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const set = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));

  const reset = () => setSettings(defaults);

  return (
    <>
      <button
        className="ty-toggle"
        onClick={() => setOpen(o => !o)}
        title="עריכת טיפוגרפיה"
      >
        Aa
      </button>

      {open && (
        <div className="ty-panel" dir="rtl" onMouseDown={(e) => e.stopPropagation()}>
          <div className="ty-panel__header">
            <span className="ty-panel__title">טיפוגרפיה</span>
            <button className="ty-panel__close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="ty-panel__row">
            <label className="ty-panel__label">גודל טקסט</label>
            <div className="ty-panel__control">
              <span className="ty-panel__hint">א</span>
              <input
                type="range" min="0.75" max="1.4" step="0.05"
                value={settings.scale}
                onChange={(e) => set('scale', parseFloat(e.target.value))}
                onMouseDown={(e) => e.stopPropagation()}
              />
              <span className="ty-panel__hint ty-panel__hint--lg">א</span>
            </div>
            <span className="ty-panel__val">{Math.round(settings.scale * 100)}%</span>
          </div>

          <div className="ty-panel__row">
            <label className="ty-panel__label">מרווח שורות</label>
            <div className="ty-panel__control">
              <span className="ty-panel__hint">≡</span>
              <input
                type="range" min="1.2" max="2.2" step="0.1"
                value={settings.lineHeight}
                onChange={(e) => set('lineHeight', parseFloat(e.target.value))}
                onMouseDown={(e) => e.stopPropagation()}
              />
              <span className="ty-panel__hint">≡</span>
            </div>
            <span className="ty-panel__val">{settings.lineHeight.toFixed(1)}</span>
          </div>

          <div className="ty-panel__row">
            <label className="ty-panel__label">משקל גוף</label>
            <div className="ty-panel__toggles">
              {[300, 400, 500, 700].map(w => (
                <button
                  key={w}
                  className={`ty-panel__w-btn${settings.bodyWeight === w ? ' ty-panel__w-btn--active' : ''}`}
                  style={{ fontWeight: w }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => set('bodyWeight', w)}
                >
                  {w === 300 ? 'דק' : w === 400 ? 'רגיל' : w === 500 ? 'בינוני' : 'עבה'}
                </button>
              ))}
            </div>
          </div>

          <div className="ty-panel__row">
            <label className="ty-panel__label">פונט כותרות</label>
            <div className="ty-panel__toggles">
              <button
                className={`ty-panel__w-btn${settings.fontDisplay.includes('Noto') ? ' ty-panel__w-btn--active' : ''}`}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => set('fontDisplay', "'Noto Serif Hebrew', serif")}
                style={{ fontFamily: "'Noto Serif Hebrew', serif" }}
              >
                Serif
              </button>
              <button
                className={`ty-panel__w-btn${settings.fontDisplay.includes('Rubik') ? ' ty-panel__w-btn--active' : ''}`}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => set('fontDisplay', "'Rubik', sans-serif")}
                style={{ fontFamily: "'Rubik', sans-serif" }}
              >
                Sans
              </button>
            </div>
          </div>

          <button
            className="ty-panel__reset"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={reset}
          >
            איפוס ברירת מחדל
          </button>
        </div>
      )}
    </>
  );
}
