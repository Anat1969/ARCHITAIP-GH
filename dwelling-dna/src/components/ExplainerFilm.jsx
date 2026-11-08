import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { EXPLAINER, EXPLAINER_AUDIO } from '../data/explainer';

const BASE = import.meta.env.BASE_URL;

// The explainer film: a narrated sequence of the magazine's own frames.
// Each scene plays its narration, then turns to the next. If the audio cannot
// load, the scene holds for the time its line takes to read, so the film
// still plays (silently, with the line as subtitle).
export default function ExplainerFilm({ onClose }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const audio = useRef(null);
  const mutedRef = useRef(false);
  const scene = EXPLAINER[i];
  const last = i === EXPLAINER.length - 1;

  const next = useCallback(() => {
    if (last) { setPlaying(false); return; }
    setI((n) => n + 1);
  }, [last]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') { e.preventDefault(); setPlaying((p) => !p); }
      if (e.key === 'ArrowLeft') next();
      if (e.key === 'ArrowRight') setI((n) => Math.max(0, n - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, next]);

  // Play this scene's narration; fall back to a reading-time timer.
  useEffect(() => {
    if (!playing) { audio.current?.pause(); return undefined; }
    const el = new Audio(EXPLAINER_AUDIO(scene.id));
    el.muted = mutedRef.current;
    audio.current = el;
    let timer = null;
    const fallback = () => { timer = setTimeout(next, Math.max(3500, scene.line.length * 70)); };
    el.addEventListener('ended', () => setTimeout(next, 450));
    el.addEventListener('error', fallback);
    el.play().catch(fallback);
    return () => { el.pause(); el.src = ''; clearTimeout(timer); };
  }, [i, playing, scene, next]);

  useEffect(() => {
    mutedRef.current = muted;
    if (audio.current) audio.current.muted = muted;
  }, [muted]);

  const restart = () => { setI(0); setPlaying(true); };

  return createPortal(
    <motion.div className="film" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} dir="rtl"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="film__box" role="dialog" aria-modal="true" aria-label="סרטון הסבר: ארכיטייפ">
        <div className="film__stage">
          <AnimatePresence mode="sync">
            <motion.div key={scene.id} className="film__frame"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }}>
              <img src={`${BASE}explainer/${scene.frame}.jpg`} alt="" className="film__img" />
              <span className="film__veil" />
              <motion.div className="film__text"
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}>
                <span className="mono film__n">{String(i + 1).padStart(2, '0')} / {String(EXPLAINER.length).padStart(2, '0')}</span>
                <h2 className="film__head">{scene.head}</h2>
                <p className="film__line">{scene.line}</p>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="film__bar">
          <div className="film__dots" aria-label="סצנות">
            {EXPLAINER.map((s, n) => (
              <button key={s.id} type="button" className={`film__dot ${n === i ? 'film__dot--on' : ''} ${n < i ? 'film__dot--past' : ''}`}
                aria-label={`סצנה ${n + 1}`} onClick={() => { setI(n); setPlaying(true); }} />
            ))}
          </div>
          <div className="film__controls">
            {last && !playing
              ? <button type="button" className="bar-btn" onClick={restart}>מההתחלה</button>
              : <button type="button" className="bar-btn" onClick={() => setPlaying((p) => !p)}>{playing ? 'השהיה' : 'המשך'}</button>}
            <button type="button" className="bar-btn bar-btn--quiet" onClick={() => setMuted((m) => !m)} aria-pressed={muted}>{muted ? 'הפעלת קול' : 'השתקה'}</button>
            <button type="button" className="bar-btn bar-btn--quiet" onClick={onClose}>סגירה</button>
          </div>
        </div>
      </div>
    </motion.div>,
    document.body,
  );
}
