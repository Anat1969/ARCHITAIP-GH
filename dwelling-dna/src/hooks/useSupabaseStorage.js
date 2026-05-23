import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

// Stable anonymous session id persisted in localStorage
function getSessionId() {
  const key = 'dwelling-dna:session';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

const SESSION_ID = getSessionId();

// ─────────────────────────────────────────
// Last page
// ─────────────────────────────────────────
export function useLastPage(defaultPage = 0) {
  const [page, setPageState] = useState(defaultPage);
  const loaded = useRef(false);

  useEffect(() => {
    supabase
      .from('app_state')
      .select('last_page')
      .eq('session_id', SESSION_ID)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setPageState(data.last_page);
        loaded.current = true;
      });
  }, []);

  const setPage = useCallback((p) => {
    setPageState(p);
    supabase.from('app_state').upsert(
      { session_id: SESSION_ID, last_page: p, updated_at: new Date().toISOString() },
      { onConflict: 'session_id' },
    );
  }, []);

  return [page, setPage];
}

// ─────────────────────────────────────────
// Culture content edits
// ─────────────────────────────────────────
export function useCultureContent(cultureId, defaults) {
  const [content, setContentState] = useState(defaults);

  useEffect(() => {
    if (!cultureId) return;
    supabase
      .from('culture_content')
      .select('content')
      .eq('culture_id', cultureId)
      .eq('session_id', SESSION_ID)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setContentState(data ? { ...defaults, ...data.content } : defaults);
      });
  }, [cultureId]); // eslint-disable-line

  const setContent = useCallback((updater) => {
    setContentState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      supabase.from('culture_content').upsert(
        {
          culture_id: cultureId,
          session_id: SESSION_ID,
          content: next,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'culture_id,session_id' },
      );
      return next;
    });
  }, [cultureId]);

  return [content, setContent];
}

// ─────────────────────────────────────────
// Culture images
// ─────────────────────────────────────────
export function useCultureImages(cultureId, defaults) {
  const [images, setImagesState] = useState(defaults);

  useEffect(() => {
    if (!cultureId) return;
    supabase
      .from('culture_images')
      .select('images')
      .eq('culture_id', cultureId)
      .eq('session_id', SESSION_ID)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setImagesState(data ? { ...defaults, ...data.images } : defaults);
      });
  }, [cultureId]); // eslint-disable-line

  const setImages = useCallback((updater) => {
    setImagesState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      supabase.from('culture_images').upsert(
        {
          culture_id: cultureId,
          session_id: SESSION_ID,
          images: next,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'culture_id,session_id' },
      );
      return next;
    });
  }, [cultureId]);

  return [images, setImages];
}

// ─────────────────────────────────────────
// Custom cultures
// ─────────────────────────────────────────
export async function saveCustomCulture(culture) {
  const { error } = await supabase.from('cultures').upsert({
    ...cultureToRow(culture),
    is_custom: true,
  });
  if (error) console.error('saveCustomCulture:', error);
}

export async function loadCustomCultures() {
  const { data, error } = await supabase
    .from('cultures')
    .select('*')
    .eq('is_custom', true)
    .order('created_at', { ascending: true });
  if (error) { console.error('loadCustomCultures:', error); return []; }
  return (data ?? []).map(rowToCulture);
}

export async function deleteCustomCulture(id) {
  const { error } = await supabase.from('cultures').delete().eq('id', id);
  if (error) console.error('deleteCustomCulture:', error);
}

// ─────────────────────────────────────────
// Fusions
// ─────────────────────────────────────────
export async function saveFusion(fusion) {
  const { error } = await supabase.from('fusions').upsert(fusionToRow(fusion));
  if (error) console.error('saveFusion:', error);
}

export async function loadFusions() {
  const { data, error } = await supabase
    .from('fusions')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) { console.error('loadFusions:', error); return []; }
  return (data ?? []).map(rowToFusion);
}

export async function deleteFusion(id) {
  const { error } = await supabase.from('fusions').delete().eq('id', id);
  if (error) console.error('deleteFusion:', error);
}

// ─────────────────────────────────────────
// Helpers: row ↔ object mapping
// ─────────────────────────────────────────
function cultureToRow(c) {
  return {
    id: c.id,
    index_order: c.index ?? null,
    name: c.name,
    archetype: c.archetype,
    chaos: c.chaos,
    order_concept: c.order,
    role: c.role,
    colors: c.colors,
    gradient: c.gradient,
    vectors: c.vectors,
    insight: c.insight,
    paragraph: c.paragraph,
    post: c.post,
    spaces: c.spaces,
    prompts: c.prompts,
    is_custom: c.isCustom ?? false,
  };
}

function rowToCulture(r) {
  return {
    id: r.id,
    index: r.index_order,
    name: r.name,
    archetype: r.archetype,
    chaos: r.chaos,
    order: r.order_concept,
    role: r.role,
    colors: r.colors,
    gradient: r.gradient,
    vectors: r.vectors,
    insight: r.insight,
    paragraph: r.paragraph,
    post: r.post,
    spaces: r.spaces,
    prompts: r.prompts,
    isCustom: r.is_custom,
  };
}

function fusionToRow(f) {
  return {
    id: f.id,
    name: f.name,
    name_custom: f.name_custom,
    lineage: f.lineage,
    chaos: f.chaos,
    order_concept: f.order,
    role: f.role,
    colors: f.colors,
    gradient: f.gradient,
    vectors: f.vectors,
    insight: f.insight,
    paragraph: f.paragraph,
    post: f.post,
    spaces: f.spaces,
    prompts: f.prompts,
    created_at: f.created_at ? new Date(f.created_at).toISOString() : new Date().toISOString(),
  };
}

function rowToFusion(r) {
  return {
    id: r.id,
    name: r.name,
    name_custom: r.name_custom,
    lineage: r.lineage,
    chaos: r.chaos,
    order: r.order_concept,
    role: r.role,
    colors: r.colors,
    gradient: r.gradient,
    vectors: r.vectors,
    insight: r.insight,
    paragraph: r.paragraph,
    post: r.post,
    spaces: r.spaces,
    prompts: r.prompts,
    created_at: r.created_at ? new Date(r.created_at).getTime() : Date.now(),
  };
}
