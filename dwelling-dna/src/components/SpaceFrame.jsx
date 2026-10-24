import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../store/auth';
import { useData } from '../store/data';
import { generateImage } from '../lib/falImage';
import { copyText } from '../lib/clipboard';
import { useImageDrop } from '../lib/useImageDrop';

/**
 * One space of a spread. Wherever there is a prompt there is a frame that
 * takes an image: drop a file or an image from another tab, paste with Ctrl+V,
 * or click to choose a file. That never waits for sign-in - the image shows
 * at once and is saved as soon as the editor is signed in.
 */
export default function SpaceFrame({ entryId, slot, kind, caption, gradient, prompt, imageUrl, tone, onOpen }) {
  const { isAdmin } = useAuth();
  const { attachImage, removeImage, setImage, isPending } = useData();
  const [busy, setBusy] = useState(null); // 'gen' | 'upload' | null
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [linking, setLinking] = useState(false);
  const fileRef = useRef(null);
  const pending = isPending(entryId, slot);

  const place = async (got) => {
    setBusy('upload');
    setError('');
    const result = await attachImage(entryId, slot, got);
    if (result === 'failed') setError('ההעלאה נכשלה. נסי שוב.');
    setBusy(null);
  };
  const drop = useImageDrop(place);

  const generate = async () => {
    if (!isAdmin) { setError('יצירה ב-AI פועלת במכשיר שזוהה כעורכת.'); return; }
    setBusy('gen');
    setError('');
    try {
      await setImage(entryId, slot, await generateImage(prompt, { cultureId: entryId, spaceId: slot }));
    } catch (err) {
      setError(err.message || 'היצירה נכשלה');
    } finally {
      setBusy(null);
    }
  };

  const copy = async () => {
    await copyText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const pick = () => fileRef.current?.click();

  return (
    <motion.figure
      className={`frame frame--${tone}${drop.over ? ' frame--over' : ''}`}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      {...drop.props}
    >
      <button
        type="button"
        className="frame__image"
        style={imageUrl ? { backgroundImage: `url("${imageUrl}")` } : { background: gradient }}
        onClick={() => (imageUrl ? onOpen?.() : pick())}
        aria-label={imageUrl ? `הגדלת ${kind.label}` : `הוספת תמונה ל${kind.label}`}
      >
        {!imageUrl && !busy && (
          <span className="frame__drop">
            <span className="frame__drop-title">גררי תמונה לכאן</span>
            <span className="frame__drop-sub">או הדביקי (Ctrl+V), או לחצי לבחירת קובץ</span>
          </span>
        )}
        {drop.over && <span className="frame__over">שחררי כאן</span>}
        {pending && !busy && <span className="frame__badge mono">ממתין לשמירה</span>}
        {busy && (
          <span className="frame__busy">
            <span className="frame__pulse" />
            {busy === 'gen' ? 'יוצר תמונה' : 'מכניס תמונה'}
          </span>
        )}
      </button>

      <figcaption className="frame__caption">
        <span className="mono frame__kind">{kind.en}</span>
        <span className="frame__label">{kind.label}</span>
        {caption && <span className="frame__text">{caption}</span>}
      </figcaption>

      <div className="frame__tools">
        <button type="button" className="chip chip--strong" onClick={pick} disabled={!!busy}>{imageUrl ? 'החלפת תמונה' : 'העלאת תמונה'}</button>
        <button type="button" className="chip" onClick={() => onOpen?.()}>הגדלה</button>
        <button type="button" className="chip" onClick={copy}>{copied ? 'הועתק' : 'העתקת פרומפט'}</button>
        <button type="button" className="chip" onClick={() => setLinking((v) => !v)} disabled={!!busy}>קישור</button>
        <button type="button" className="chip" onClick={generate} disabled={!!busy}>יצירה ב-AI</button>
        {imageUrl && <button type="button" className="chip chip--danger" onClick={() => removeImage(entryId, slot)}>הסרה</button>}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) place({ file: f }); }}
        />
      </div>

      {linking && (
        <form
          className="frame__link"
          onSubmit={(e) => {
            e.preventDefault();
            const url = new FormData(e.currentTarget).get('url')?.toString().trim();
            setLinking(false);
            if (url) place({ url });
          }}
        >
          <input name="url" dir="ltr" placeholder="https:// קישור לתמונה" autoFocus />
          <button type="submit" className="chip chip--strong">הכנסה</button>
        </form>
      )}
      {error && <p className="notice notice--error">{error}</p>}
    </motion.figure>
  );
}
