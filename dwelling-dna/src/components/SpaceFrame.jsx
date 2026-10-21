import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../store/auth';
import { useData } from '../store/data';
import { generateImage } from '../lib/falImage';
import { supabase } from '../lib/supabase';
import { copyText } from '../lib/clipboard';

/**
 * One space of a spread: an image, or the culture's own gradient until there
 * is one. Readers can enlarge it and copy its prompt; the editor can generate,
 * upload, link or clear it from the frame itself.
 */
export default function SpaceFrame({ entryId, slot, kind, caption, gradient, prompt, imageUrl, tone, onOpen }) {
  const { editing } = useAuth();
  const { setImage } = useData();
  const [busy, setBusy] = useState(null); // 'gen' | 'upload' | null
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [linking, setLinking] = useState(false);
  const fileRef = useRef(null);

  const run = async (what, fn) => {
    setBusy(what);
    setError('');
    try {
      const url = await fn();
      if (url) await setImage(entryId, slot, url);
    } catch (err) {
      setError(err.message || 'הפעולה נכשלה');
    } finally {
      setBusy(null);
    }
  };

  const generate = () => run('gen', () => generateImage(prompt, { cultureId: entryId, spaceId: slot }));

  const upload = (file) => run('upload', async () => {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
    const path = `${entryId}/${slot}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('architaip-media').upload(path, file, {
      cacheControl: '31536000', contentType: file.type || undefined,
    });
    if (upErr) throw new Error(upErr.message.includes('row-level') ? 'אין הרשאת העלאה' : upErr.message);
    return supabase.storage.from('architaip-media').getPublicUrl(path).data.publicUrl;
  });

  const copy = async () => {
    await copyText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <motion.figure
      className={`frame frame--${tone}`}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      <button
        type="button"
        className="frame__image"
        style={imageUrl ? { backgroundImage: `url("${imageUrl}")` } : { background: gradient }}
        onClick={() => onOpen?.()}
        aria-label={`הגדלת ${kind.label}`}
      >
        {!imageUrl && <span className="frame__empty mono">{kind.en || 'SPACE'}</span>}
        {busy && (
          <span className="frame__busy">
            <span className="frame__pulse" />
            {busy === 'gen' ? 'יוצר תמונה' : 'מעלה'}
          </span>
        )}
      </button>

      <figcaption className="frame__caption">
        <span className="mono frame__kind">{kind.en}</span>
        <span className="frame__label">{kind.label}</span>
        {caption && <span className="frame__text">{caption}</span>}
      </figcaption>

      <div className="frame__tools">
        <button type="button" className="chip" onClick={copy}>{copied ? 'הועתק' : 'העתקת פרומפט'}</button>
        {editing && (
          <>
            <button type="button" className="chip chip--strong" onClick={generate} disabled={!!busy}>יצירה</button>
            <button type="button" className="chip" onClick={() => fileRef.current?.click()} disabled={!!busy}>העלאה</button>
            <button type="button" className="chip" onClick={() => setLinking((v) => !v)} disabled={!!busy}>קישור</button>
            {imageUrl && <button type="button" className="chip chip--danger" onClick={() => setImage(entryId, slot, null)}>הסרה</button>}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) upload(f); }}
            />
          </>
        )}
      </div>

      {editing && linking && (
        <form
          className="frame__link"
          onSubmit={(e) => {
            e.preventDefault();
            const url = new FormData(e.currentTarget).get('url')?.toString().trim();
            setLinking(false);
            if (url) setImage(entryId, slot, url);
          }}
        >
          <input name="url" dir="ltr" placeholder="https://" defaultValue={imageUrl || ''} autoFocus />
          <button type="submit" className="chip chip--strong">שמירה</button>
        </form>
      )}
      {error && <p className="notice notice--error">{error}</p>}
    </motion.figure>
  );
}
