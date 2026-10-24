import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import baseCultures from '../data/cultures';
import { edit, supabase } from '../lib/supabase';
import { useAuth } from './auth';
import { allPending, deletePending, pendingKey, prepareImage, putPending, uploadImage } from '../lib/images';

// Every entry in the magazine - a built-in culture, one the editor added, or a
// fusion of several - is one shape here, so a page never has to ask which kind
// it is holding before reading it. Edited text and chosen images live in their
// own tables and are laid over the entry when it is read.

const SESSION_ID = 'default';
const DataContext = createContext(null);

function cultureFromRow(r) {
  return {
    id: r.id, index: r.index_order, name: r.name, archetype: r.archetype,
    chaos: r.chaos, order: r.order_concept, role: r.role, colors: r.colors,
    gradient: r.gradient, vectors: r.vectors ?? {}, insight: r.insight,
    paragraph: r.paragraph, post: r.post, spaces: r.spaces ?? [], prompts: r.prompts ?? [],
    isCustom: true,
  };
}

function cultureToRow(c) {
  return {
    id: c.id, index_order: c.index ?? null, name: c.name, archetype: c.archetype,
    chaos: c.chaos, order_concept: c.order, role: c.role, colors: c.colors,
    gradient: c.gradient, vectors: c.vectors, insight: c.insight, paragraph: c.paragraph,
    post: c.post, spaces: c.spaces, prompts: c.prompts, is_custom: true,
  };
}

function fusionFromRow(r) {
  return {
    id: r.id, name: r.name, name_custom: r.name_custom, lineage: r.lineage ?? {},
    chaos: r.chaos, order: r.order_concept, role: r.role, colors: r.colors,
    gradient: r.gradient, vectors: r.vectors ?? {}, insight: r.insight,
    paragraph: r.paragraph, post: r.post, spaces: r.spaces ?? [], prompts: r.prompts ?? [],
    created_at: r.created_at,
  };
}

function fusionToRow(f) {
  return {
    id: f.id, name: f.name, name_custom: f.name_custom, lineage: f.lineage,
    chaos: f.chaos, order_concept: f.order, role: f.role, colors: f.colors,
    gradient: f.gradient, vectors: f.vectors, insight: f.insight, paragraph: f.paragraph,
    post: f.post, spaces: f.spaces, prompts: f.prompts,
  };
}

function byId(rows, field) {
  return Object.fromEntries((rows ?? []).map((r) => [r.culture_id, r[field] ?? {}]));
}

export function DataProvider({ children }) {
  const [status, setStatus] = useState('loading'); // loading | ready | offline
  const [custom, setCustom] = useState([]);
  const [fusions, setFusions] = useState([]);
  const [content, setContent] = useState({});
  const [images, setImages] = useState({});
  // Images placed before sign-in: shown from this browser until uploaded.
  const [previews, setPreviews] = useState({}); // pendingKey -> object URL or link
  const [save, setSave] = useState({ state: 'idle', message: '' });
  const { isAdmin } = useAuth();
  // Writes read the latest overlay from refs, so two saves in a row on one
  // entry never overwrite each other with a stale copy.
  const contentRef = useRef({});
  const imagesRef = useRef({});

  useEffect(() => {
    let cancelled = false;
    // The magazine opens on its own content if the backend is slow or gone.
    const fallback = setTimeout(() => !cancelled && setStatus((s) => (s === 'loading' ? 'offline' : s)), 6000);

    (async () => {
      const [cc, ff, ct, im] = await Promise.all([
        supabase.from('architaip_cultures').select('*').eq('is_custom', true).order('created_at'),
        supabase.from('architaip_fusions').select('*').order('created_at'),
        supabase.from('architaip_culture_content').select('culture_id,content').eq('session_id', SESSION_ID),
        supabase.from('architaip_culture_images').select('culture_id,images').eq('session_id', SESSION_ID),
      ]);
      if (cancelled) return;
      const failed = [cc, ff, ct, im].some((r) => r.error);
      setCustom((cc.data ?? []).map(cultureFromRow));
      setFusions((ff.data ?? []).map(fusionFromRow));
      contentRef.current = byId(ct.data, 'content');
      imagesRef.current = byId(im.data, 'images');
      setContent(contentRef.current);
      setImages(imagesRef.current);
      setStatus(failed ? 'offline' : 'ready');
    })().catch(() => !cancelled && setStatus('offline'))
      .finally(() => clearTimeout(fallback));

    return () => { cancelled = true; clearTimeout(fallback); };
  }, []);

  const track = useCallback(async (promise, okMessage = 'נשמר') => {
    setSave({ state: 'saving', message: 'שומר' });
    const { error } = await promise;
    if (error) {
      console.error(error);
      setSave({ state: 'error', message: error.code === '42501' ? 'אין הרשאת עריכה' : 'השמירה נכשלה' });
      return false;
    }
    setSave({ state: 'saved', message: okMessage });
    setTimeout(() => setSave((s) => (s.state === 'saved' ? { state: 'idle', message: '' } : s)), 2200);
    return true;
  }, []);

  const entries = useMemo(() => {
    const cultures = [...baseCultures, ...custom].map((c, i) => ({
      ...c, ...(content[c.id] ?? {}), kind: 'culture', index: i + 1,
    }));
    const fused = fusions.map((f, i) => ({ ...f, ...(content[f.id] ?? {}), kind: 'fusion', index: i + 1 }));
    return { cultures, fusions: fused, all: [...cultures, ...fused] };
  }, [custom, fusions, content]);

  const get = useCallback((id) => entries.all.find((e) => e.id === id) ?? null, [entries]);

  const updateContent = useCallback((id, patch) => {
    const next = { ...(contentRef.current[id] ?? {}), ...patch };
    contentRef.current = { ...contentRef.current, [id]: next };
    setContent(contentRef.current);
    return track(edit('content', { id, content: next }));
  }, [track]);

  const setImage = useCallback((id, slot, url) => {
    const next = { ...(imagesRef.current[id] ?? {}), [slot]: url || null };
    imagesRef.current = { ...imagesRef.current, [id]: next };
    setImages(imagesRef.current);
    return track(edit('images', { id, images: next }), url ? 'התמונה נשמרה' : 'התמונה הוסרה');
  }, [track]);

  const clearPreview = useCallback((key) => {
    setPreviews((prev) => {
      if (!(key in prev)) return prev;
      const n = { ...prev };
      if (n[key]?.startsWith('blob:')) URL.revokeObjectURL(n[key]);
      delete n[key];
      return n;
    });
    deletePending(key);
  }, []);

  /**
   * Put an image into a frame. It shows at once; with the editor signed in it
   * is uploaded and saved, otherwise it waits in this browser and the sign-in
   * dialog opens. Returns 'saved' | 'pending' | 'failed'.
   */
  const attachImage = useCallback(async (id, slot, { file, url }) => {
    const key = pendingKey(id, slot);
    const blob = file ? await prepareImage(file) : null;
    const shown = blob ? URL.createObjectURL(blob) : url;
    setPreviews((prev) => ({ ...prev, [key]: shown }));

    if (!isAdmin) {
      // No dialog: the image stays in the frame and waits in this browser;
      // the top bar says so, and it uploads once the device is an editor.
      await putPending(key, blob ? { blob } : { url });
      setSave({ state: 'saving', message: 'התמונה שמורה בדפדפן. תעלה לשרת כשהמכשיר יזוהה כעורכת' });
      return 'pending';
    }
    try {
      setSave({ state: 'saving', message: 'מעלה תמונה' });
      const finalUrl = blob ? await uploadImage(id, slot, blob) : url;
      const ok = await setImage(id, slot, finalUrl);
      if (ok) clearPreview(key);
      return ok ? 'saved' : 'failed';
    } catch (err) {
      setSave({ state: 'error', message: err.message || 'ההעלאה נכשלה' });
      return 'failed';
    }
  }, [isAdmin, setImage, clearPreview]);

  // Images left from before sign-in come back as previews on load...
  useEffect(() => {
    let cancelled = false;
    allPending().then((items) => {
      if (cancelled || !items.length) return;
      setPreviews((prev) => {
        const n = { ...prev };
        for (const { key, value } of items) n[key] ??= value.blob ? URL.createObjectURL(value.blob) : value.url;
        return n;
      });
    });
    return () => { cancelled = true; };
  }, []);

  // ...and are uploaded the moment the editor is signed in.
  useEffect(() => {
    if (!isAdmin || status === 'loading') return undefined;
    let cancelled = false;
    (async () => {
      const items = await allPending();
      for (const { key, value } of items) {
        if (cancelled) return;
        const [id, slot] = String(key).split('::');
        try {
          setSave({ state: 'saving', message: 'מעלה תמונות שהמתינו' });
          const finalUrl = value.blob ? await uploadImage(id, slot, value.blob) : value.url;
          if (await setImage(id, slot, finalUrl)) clearPreview(key);
        } catch (err) {
          setSave({ state: 'error', message: err.message || 'ההעלאה נכשלה' });
        }
      }
    })();
    return () => { cancelled = true; };
  }, [isAdmin, status, setImage, clearPreview]);

  /** Saved images with this browser's waiting ones laid over them. */
  const shownImages = useMemo(() => {
    const keys = Object.keys(previews);
    if (!keys.length) return images;
    const out = { ...images };
    for (const key of keys) {
      const [id, slot] = key.split('::');
      out[id] = { ...(out[id] ?? {}), [slot]: previews[key] };
    }
    return out;
  }, [images, previews]);

  const removeImage = useCallback((id, slot) => {
    clearPreview(pendingKey(id, slot));
    if (imagesRef.current[id]?.[slot]) return setImage(id, slot, null);
    return Promise.resolve(true);
  }, [clearPreview, setImage]);

  const isPending = useCallback((id, slot) => pendingKey(id, slot) in previews, [previews]);

  const createCulture = useCallback(async (culture) => {
    const ok = await track(edit('culture', { row: cultureToRow(culture) }), 'התרבות נוספה');
    if (ok) setCustom((prev) => [...prev.filter((c) => c.id !== culture.id), { ...culture, isCustom: true }]);
    return ok;
  }, [track]);

  const createFusion = useCallback(async (fusion) => {
    const ok = await track(edit('fusion', { row: fusionToRow(fusion) }), 'המיזוג נשמר');
    if (ok) setFusions((prev) => [...prev, fusion]);
    return ok;
  }, [track]);

  const removeEntry = useCallback(async (entry) => {
    // The server removes the entry together with its text and image overlays.
    const ok = await track(edit('delete', { kind: entry.kind, id: entry.id }), 'נמחק');
    if (!ok) return false;
    if (entry.kind === 'fusion') setFusions((prev) => prev.filter((f) => f.id !== entry.id));
    else setCustom((prev) => prev.filter((c) => c.id !== entry.id));
    return true;
  }, [track]);

  const value = useMemo(() => ({
    status, entries, images: shownImages, get, save, isPending,
    updateContent, setImage, attachImage, removeImage, createCulture, createFusion, removeEntry,
  }), [status, entries, shownImages, get, save, isPending, updateContent, setImage, attachImage, removeImage, createCulture, createFusion, removeEntry]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  return useContext(DataContext);
}
