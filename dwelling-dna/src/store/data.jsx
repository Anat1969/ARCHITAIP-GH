import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import baseCultures from '../data/cultures';
import { edit, supabase } from '../lib/supabase';
import { fusionCall } from '../lib/fusion';
import { useAuth } from './auth';
import { allPending, deletePending, pendingKey, prepareImage, putPending, submitImage, uploadImage } from '../lib/images';

// Every entry in the magazine - a built-in culture, one the editor added, or a
// fusion of several - is one shape here, so a page never has to ask which kind
// it is holding before reading it. Edited text and chosen images live in their
// own tables and are laid over the entry when it is read.

const SESSION_ID = 'default';
const MINE = 'architaip:my-fusions';
const MY_IMAGES = 'architaip:my-images'; // pendingKey -> url, a reader's images awaiting approval
const readMyImages = () => { try { return JSON.parse(localStorage.getItem(MY_IMAGES) || '{}'); } catch { return {}; } };
const writeMyImages = (v) => { try { localStorage.setItem(MY_IMAGES, JSON.stringify(v)); } catch { /* private mode */ } };
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
    created_at: r.created_at, approved: r.approved !== false,
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
  // A reader's images on the server, waiting for approval: shown to them.
  const [review, setReview] = useState(readMyImages);
  // Images readers submitted, for the editor's queue.
  const [submissions, setSubmissions] = useState([]);
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
      // A reader's image the editor already approved is part of the magazine now.
      setReview((prev) => {
        const n = Object.fromEntries(Object.entries(prev).filter(([key, url]) => {
          const [id, slot] = key.split('::');
          return imagesRef.current[id]?.[slot] !== url;
        }));
        writeMyImages(n);
        return n;
      });
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

  // Fusions this browser made: shown to their maker before the editor approves.
  const [mine, setMine] = useState(() => {
    try { return JSON.parse(localStorage.getItem(MINE) || '[]'); } catch { return []; }
  });
  const addMine = useCallback((id) => setMine((prev) => {
    const next = [...new Set([...prev, id])];
    try { localStorage.setItem(MINE, JSON.stringify(next)); } catch { /* private mode */ }
    return next;
  }), []);

  const entries = useMemo(() => {
    const cultures = [...baseCultures, ...custom].map((c, i) => ({
      ...c, ...(content[c.id] ?? {}), kind: 'culture', index: i + 1,
    }));
    const fused = fusions.map((f, i) => ({ ...f, ...(content[f.id] ?? {}), kind: 'fusion', index: i + 1, mine: mine.includes(f.id) }));
    // Lists show approved fusions, plus the reader's own and, for the editor,
    // the ones waiting. A direct link opens any fusion.
    const listed = fused.filter((f) => f.approved !== false || f.mine || isAdmin);
    return { cultures, fusions: listed, all: [...cultures, ...listed], every: [...cultures, ...fused] };
  }, [custom, fusions, content, mine, isAdmin]);

  const get = useCallback((id) => entries.every.find((e) => e.id === id) ?? null, [entries]);

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
      // Straight to the server, from any browser. It shows here at once and
      // joins the public magazine when the editor approves it.
      if (!blob) {
        setSave({ state: 'error', message: 'אפשר להוסיף כאן קובץ תמונה' });
        return 'failed';
      }
      try {
        setSave({ state: 'saving', message: 'מעלה תמונה' });
        const res = await submitImage(id, slot, blob);
        setReview((prev) => { const n = { ...prev, [key]: res.url }; writeMyImages(n); return n; });
        clearPreview(key);
        setSave({ state: 'saved', message: 'התמונה נשמרה בשרת וממתינה לאישור' });
        return 'review';
      } catch {
        // No connection: keep it in this browser and send it when back online.
        await putPending(key, { blob });
        setSave({ state: 'error', message: 'אין חיבור. התמונה שמורה בדפדפן ותעלה כשהחיבור יחזור' });
        return 'pending';
      }
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

  // ...and are sent as soon as there is a connection: the editor's straight
  // into the magazine, a reader's to the approval queue.
  useEffect(() => {
    if (status === 'loading') return undefined;
    if (!isAdmin) {
      let stop = false;
      (async () => {
        for (const { key, value } of await allPending()) {
          if (stop || !value.blob) continue;
          const [id, slot] = String(key).split('::');
          try {
            const res = await submitImage(id, slot, value.blob);
            setReview((prev) => { const n = { ...prev, [key]: res.url }; writeMyImages(n); return n; });
            clearPreview(key);
            setSave({ state: 'saved', message: 'התמונה נשמרה בשרת וממתינה לאישור' });
          } catch { /* still offline: try again next visit */ }
        }
      })();
      return () => { stop = true; };
    }
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
    const layers = { ...review, ...previews };
    const keys = Object.keys(layers);
    if (!keys.length) return images;
    const out = { ...images };
    for (const key of Object.keys(review)) {
      const [id, slot] = key.split('::');
      out[id] = { ...(out[id] ?? {}), [slot]: review[key] };
    }
    for (const key of Object.keys(previews)) {
      const [id, slot] = key.split('::');
      out[id] = { ...(out[id] ?? {}), [slot]: previews[key] };
    }
    return out;
  }, [images, previews, review]);

  const removeImage = useCallback((id, slot) => {
    clearPreview(pendingKey(id, slot));
    if (imagesRef.current[id]?.[slot]) return setImage(id, slot, null);
    return Promise.resolve(true);
  }, [clearPreview, setImage]);

  // 'local' waits in this browser, 'review' waits on the server for approval.
  const isPending = useCallback((id, slot) => {
    const key = pendingKey(id, slot);
    if (key in previews) return 'local';
    if (review[key] && images[id]?.[slot] !== review[key]) return 'review';
    return false;
  }, [previews, review, images]);

  // The editor's queue of images readers submitted.
  useEffect(() => {
    if (!isAdmin) return undefined;
    let cancelled = false;
    supabase.from('architaip_image_submissions').select('*').eq('status', 'pending').order('created_at')
      .then(({ data }) => { if (!cancelled) setSubmissions(data ?? []); });
    return () => { cancelled = true; };
  }, [isAdmin]);

  const decideImage = useCallback(async (sub, approve) => {
    const saving = fusionCall(approve ? 'approve_image' : 'reject_image', { id: sub.id })
      .then(() => ({ data: { ok: true }, error: null }))
      .catch((err) => ({ data: null, error: { code: 'image', message: err.message } }));
    const ok = await track(saving, approve ? 'התמונה פורסמה' : 'התמונה נדחתה');
    if (!ok) return false;
    setSubmissions((prev) => prev.filter((x) => x.id !== sub.id));
    if (approve) {
      const next = { ...(imagesRef.current[sub.culture_id] ?? {}), [sub.slot]: sub.url };
      imagesRef.current = { ...imagesRef.current, [sub.culture_id]: next };
      setImages(imagesRef.current);
    }
    return true;
  }, [track]);

  const createCulture = useCallback(async (culture) => {
    const ok = await track(edit('culture', { row: cultureToRow(culture) }), 'התרבות נוספה');
    if (ok) setCustom((prev) => [...prev.filter((c) => c.id !== culture.id), { ...culture, isCustom: true }]);
    return ok;
  }, [track]);

  // Open to every reader: the public fusion function saves the draft only if
  // its text carries the historian's signed token.
  const createFusion = useCallback(async (fusion) => {
    const { token, ...entry } = fusion;
    const saving = fusionCall('save', { token, row: fusionToRow(entry) })
      .then(() => ({ data: { ok: true }, error: null }))
      .catch((err) => ({ data: null, error: { code: 'save', message: err.message } }));
    const ok = await track(saving, isAdmin ? 'המיזוג פורסם' : 'המיזוג נשמר וממתין לאישור');
    if (ok) {
      addMine(entry.id);
      setFusions((prev) => [...prev, { ...entry, approved: isAdmin }]);
    }
    return ok;
  }, [track, isAdmin, addMine]);

  const approveFusion = useCallback(async (id, approved = true) => {
    const saving = fusionCall('approve', { id, approved })
      .then(() => ({ data: { ok: true }, error: null }))
      .catch((err) => ({ data: null, error: { code: 'approve', message: err.message } }));
    const ok = await track(saving, approved ? 'המיזוג פורסם' : 'המיזוג הוחזר להמתנה');
    if (ok) setFusions((prev) => prev.map((f) => (f.id === id ? { ...f, approved } : f)));
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
    updateContent, setImage, attachImage, removeImage, createCulture, createFusion, approveFusion, removeEntry,
    submissions, decideImage,
  }), [status, entries, shownImages, get, save, isPending, updateContent, setImage, attachImage, removeImage, createCulture, createFusion, approveFusion, removeEntry, submissions, decideImage]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  return useContext(DataContext);
}
