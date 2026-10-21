import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';

// Dialogs open beneath the top bar, never over it: the way home is always visible.
export default function Dialog({ title, eyebrow, onClose, children, wide = false, busy = false }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !busy) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, busy]);

  // Portalled out of the page: the page-turn transform would otherwise
  // become the containing block and pin this overlay to the page, not the window.
  return createPortal(
    <motion.div
      className="dialog"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}
    >
      <motion.div
        className={`dialog__box ${wide ? 'dialog__box--wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        dir="rtl"
        initial={{ y: 24, rotateX: 6, opacity: 0 }}
        animate={{ y: 0, rotateX: 0, opacity: 1 }}
        exit={{ y: 16, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      >
        <div className="dialog__head">
          <div>
            {eyebrow && <div className="mono dialog__eyebrow">{eyebrow}</div>}
            <h2 className="dialog__title">{title}</h2>
          </div>
          <button type="button" className="bar-btn bar-btn--quiet" onClick={onClose} disabled={busy}>סגירה</button>
        </div>
        <div className="dialog__body">{children}</div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
