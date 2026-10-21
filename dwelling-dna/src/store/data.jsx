import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import baseCultures from '../data/cultures';
import { supabase } from '../lib/supabase';

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
  const [save, setSave] = useState({ state: 'idle', message: '' });

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
      setContent(byId(ct.data, 'content'));
      setImages(byId(im.data, 'images'));
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
    const next = { ...(content[id] ?? {}), ...patch };
    setContent((prev) => ({ ...prev, [id]: next }));
    return track(supabase.from('architaip_culture_content').upsert(
      { culture_id: id, session_id: SESSION_ID, content: next, updated_at: new Date().toISOString() },
      { onConflict: 'culture_id,session_id' },
    ));
  }, [track, content]);

  const setImage = useCallback((id, slot, url) => {
    const next = { ...(images[id] ?? {}), [slot]: url || null };
    setImages((prev) => ({ ...prev, [id]: next }));
    return track(supabase.from('architaip_culture_images').upsert(
      { culture_id: id, session_id: SESSION_ID, images: next, updated_at: new Date().toISOString() },
      { onConflict: 'culture_id,session_id' },
    ), url ? 'התמונה נשמרה' : 'התמונה הוסרה');
  }, [track, images]);

  const createCulture = useCallback(async (culture) => {
    const ok = await track(supabase.from('architaip_cultures').upsert(cultureToRow(culture)), 'התרבות נוספה');
    if (ok) setCustom((prev) => [...prev.filter((c) => c.id !== culture.id), { ...culture, isCustom: true }]);
    return ok;
  }, [track]);

  const createFusion = useCallback(async (fusion) => {
    const ok = await track(supabase.from('architaip_fusions').upsert(fusionToRow(fusion)), 'המיזוג נשמר');
    if (ok) setFusions((prev) => [...prev, fusion]);
    return ok;
  }, [track]);

  const removeEntry = useCallback(async (entry) => {
    const table = entry.kind === 'fusion' ? 'architaip_fusions' : 'architaip_cultures';
    const ok = await track(supabase.from(table).delete().eq('id', entry.id), 'נמחק');
    if (!ok) return false;
    // Overlays go with the entry they belong to.
    await Promise.all([
      supabase.from('architaip_culture_content').delete().eq('culture_id', entry.id),
      supabase.from('architaip_culture_images').delete().eq('culture_id', entry.id),
    ]);
    if (entry.kind === 'fusion') setFusions((prev) => prev.filter((f) => f.id !== entry.id));
    else setCustom((prev) => prev.filter((c) => c.id !== entry.id));
    return true;
  }, [track]);

  const value = useMemo(() => ({
    status, entries, images, get, save,
    updateContent, setImage, createCulture, createFusion, removeEntry,
  }), [status, entries, images, get, save, updateContent, setImage, createCulture, createFusion, removeEntry]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  return useContext(DataContext);
}
