import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { copyText } from '../lib/clipboard';

export default function Lightbox({ item, imageUrl, entryName, onClose, onStep }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onStep(1);
      if (e.key === 'ArrowRight') onStep(-1);
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose, onStep]);

  // Portalled out of the page: the page-turn transform would otherwise
  // become the containing block and pin this overlay to the page, not the window.
  return createPortal(
    <motion.div
      className="lightbox"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      dir="rtl"
    >
      <motion.div
        key={item.slot}
        className="lightbox__stage"
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
      >
        <div
          className="lightbox__image"
          style={imageUrl ? { backgroundImage: `url("${imageUrl}")` } : { background: item.gradient }}
        />
        <aside className="lightbox__side">
          <div className="mono muted">{entryName} / {item.row === 'modern' ? 'PROJECTION' : 'ANCESTRAL'} / {item.kind.en}</div>
          <h3 className="lightbox__title">{item.kind.label}</h3>
          {item.caption && <p className="lightbox__caption">{item.caption}</p>}
          <div className="mono lightbox__prompt" dir="ltr">{item.prompt}</div>
          <div className="row">
            <button type="button" className="btn" onClick={async () => { await copyText(item.prompt); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
              {copied ? 'הועתק' : 'העתקת פרומפט'}
            </button>
            <button type="button" className="btn btn--quiet" onClick={() => onStep(-1)}>הקודם</button>
            <button type="button" className="btn btn--quiet" onClick={() => onStep(1)}>הבא</button>
            <button type="button" className="btn btn--quiet" onClick={onClose}>סגירה</button>
          </div>
        </aside>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
