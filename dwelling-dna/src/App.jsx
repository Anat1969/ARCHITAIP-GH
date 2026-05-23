import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import FlipBook from './components/FlipBook';
import Navigation from './components/Navigation';
import FusionModal from './components/FusionModal';
import CultureModal from './components/CultureModal';
import baseCultures from './data/cultures';
import {
  loadCustomCultures,
  saveCustomCulture,
  loadFusions,
  saveFusion,
  deleteFusion,
} from './hooks/useSupabaseStorage';
import { supabase } from './lib/supabase';
import './App.css';

const SESSION_ID = 'default';

function buildDefaultContent(c) {
  return { paragraph: c.paragraph, post: c.post };
}
function buildDefaultImages(c) {
  return Object.fromEntries((c.spaces ?? []).map((s) => [s.id, null]));
}
function buildFusionDefaultContent(f) {
  return { paragraph: f.paragraph, post: f.post, insight: f.insight };
}
function buildFusionDefaultImages(f) {
  return Object.fromEntries((f.spaces ?? []).map((s) => [s.id, null]));
}

async function upsertContent(cultureId, content) {
  await supabase.from('culture_content').upsert(
    { culture_id: cultureId, session_id: SESSION_ID, content, updated_at: new Date().toISOString() },
    { onConflict: 'culture_id,session_id' },
  );
}
async function upsertImages(cultureId, images) {
  await supabase.from('culture_images').upsert(
    { culture_id: cultureId, session_id: SESSION_ID, images, updated_at: new Date().toISOString() },
    { onConflict: 'culture_id,session_id' },
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const bookRef = useRef(null);
  const [fusionModal, setFusionModal] = useState(false);
  const [cultureModal, setCultureModal] = useState(false);
  const [ready, setReady] = useState(false);        // wait for Supabase before rendering FlipBook
  const [startPage, setStartPage] = useState(0);
  // flipKey forces a full FlipBook remount when culture/fusion count changes
  const [flipKey, setFlipKey] = useState(0);
  const pendingFlipRef = useRef(null);              // page to flip to after remount

  const [contentMap, setContentMap] = useState(() =>
    Object.fromEntries(baseCultures.map((c) => [c.id, buildDefaultContent(c)]))
  );
  const [imagesMap, setImagesMap] = useState(() =>
    Object.fromEntries(baseCultures.map((c) => [c.id, buildDefaultImages(c)]))
  );
  const [customCultures, setCustomCultures] = useState([]);
  const [fusions, setFusions] = useState([]);
  const [fusionContentMap, setFusionContentMap] = useState({});
  const [fusionImagesMap, setFusionImagesMap] = useState({});

  const allCultures = useMemo(() => [...baseCultures, ...customCultures], [customCultures]);
  const nC = allCultures.length;
  const nF = fusions.length;
  const TOTAL_PAGES = 8 + nC * 2 + nF * 2;
  const [currentPage, setCurrentPage] = useState(0);

  // ── Load all data from Supabase on mount ──────────────────────────────────
  useEffect(() => {
    async function loadAll() {
      const cultureIds = baseCultures.map(c => c.id);

      const [{ data: contentRows }, { data: imageRows }] = await Promise.all([
        supabase.from('culture_content').select('culture_id,content').in('culture_id', cultureIds).eq('session_id', SESSION_ID),
        supabase.from('culture_images').select('culture_id,images').in('culture_id', cultureIds).eq('session_id', SESSION_ID),
      ]);

      const loaded = {};
      const loadedImages = {};
      baseCultures.forEach((c) => {
        const row = contentRows?.find(r => r.culture_id === c.id);
        loaded[c.id] = row ? { ...buildDefaultContent(c), ...row.content } : buildDefaultContent(c);
        const imgRow = imageRows?.find(r => r.culture_id === c.id);
        loadedImages[c.id] = imgRow ? { ...buildDefaultImages(c), ...imgRow.images } : buildDefaultImages(c);
      });

      // Custom cultures
      const cc = await loadCustomCultures();
      if (cc.length) {
        const ccIds = cc.map(c => c.id);
        const [{ data: ccContent }, { data: ccImages }] = await Promise.all([
          supabase.from('culture_content').select('culture_id,content').in('culture_id', ccIds).eq('session_id', SESSION_ID),
          supabase.from('culture_images').select('culture_id,images').in('culture_id', ccIds).eq('session_id', SESSION_ID),
        ]);
        cc.forEach((c) => {
          const row = ccContent?.find(r => r.culture_id === c.id);
          loaded[c.id] = row ? { ...buildDefaultContent(c), ...row.content } : buildDefaultContent(c);
          const imgRow = ccImages?.find(r => r.culture_id === c.id);
          loadedImages[c.id] = imgRow ? { ...buildDefaultImages(c), ...imgRow.images } : buildDefaultImages(c);
        });
        setCustomCultures(cc);
      }

      setContentMap(loaded);
      setImagesMap(loadedImages);

      // Fusions
      const loadedFusions = await loadFusions();
      if (loadedFusions.length) {
        const fIds = loadedFusions.map(f => f.id);
        const [{ data: fContent }, { data: fImages }] = await Promise.all([
          supabase.from('culture_content').select('culture_id,content').in('culture_id', fIds).eq('session_id', SESSION_ID),
          supabase.from('culture_images').select('culture_id,images').in('culture_id', fIds).eq('session_id', SESSION_ID),
        ]);
        const fc = {};
        const fi = {};
        loadedFusions.forEach(f => {
          const row = fContent?.find(r => r.culture_id === f.id);
          fc[f.id] = row ? { ...buildFusionDefaultContent(f), ...row.content } : buildFusionDefaultContent(f);
          const imgRow = fImages?.find(r => r.culture_id === f.id);
          fi[f.id] = imgRow ? { ...buildFusionDefaultImages(f), ...imgRow.images } : buildFusionDefaultImages(f);
        });
        setFusions(loadedFusions);
        setFusionContentMap(fc);
        setFusionImagesMap(fi);
      }

      // Load last page from Supabase
      const { data: stateRow } = await supabase
        .from('app_state').select('last_page').eq('session_id', SESSION_ID).maybeSingle();
      if (stateRow) setStartPage(stateRow.last_page);

      setReady(true);
    }

    loadAll().catch(err => {
      console.error('loadAll failed:', err);
      setReady(true); // render anyway with defaults
    });
  }, []);

  // After FlipBook remounts (flipKey changes), navigate to pending page
  useEffect(() => {
    if (!ready || pendingFlipRef.current === null) return;
    const target = pendingFlipRef.current;
    pendingFlipRef.current = null;
    setTimeout(() => bookRef.current?.flip(target), 100);
  }, [flipKey, ready]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handlePageChange = useCallback((p) => {
    setCurrentPage(p);
    supabase.from('app_state').upsert(
      { session_id: SESSION_ID, last_page: p, updated_at: new Date().toISOString() },
      { onConflict: 'session_id' },
    );
  }, []);

  const handleContentChange = useCallback((cultureId, updates) => {
    setContentMap((prev) => {
      const next = { ...prev, [cultureId]: { ...prev[cultureId], ...updates } };
      upsertContent(cultureId, next[cultureId]);
      return next;
    });
  }, []);

  const handleImageChange = useCallback((cultureId, spaceId, url) => {
    setImagesMap((prev) => {
      const next = { ...prev, [cultureId]: { ...prev[cultureId], [spaceId]: url || null } };
      upsertImages(cultureId, next[cultureId]);
      return next;
    });
  }, []);

  const handleCustomCultureCreate = useCallback((newCulture) => {
    try {
      setCustomCultures(prev => {
        const withIndex = { ...newCulture, index: baseCultures.length + prev.length + 1 };
        const targetPage = 5 + (baseCultures.length + prev.length) * 2;
        saveCustomCulture(withIndex);
        setContentMap(cm => ({ ...cm, [withIndex.id]: buildDefaultContent(withIndex) }));
        setImagesMap(im => ({ ...im, [withIndex.id]: buildDefaultImages(withIndex) }));
        pendingFlipRef.current = targetPage;
        setFlipKey(k => k + 1); // remount FlipBook with new page count
        return [...prev, withIndex];
      });
    } catch (err) {
      console.error('handleCustomCultureCreate error:', err);
    }
    setCultureModal(false);
  }, []);

  const handleFusionCreate = useCallback((fusion) => {
    setFusions(prev => {
      const targetPage = 7 + allCultures.length * 2 + prev.length * 2;
      saveFusion(fusion);
      setFusionContentMap(fc => ({ ...fc, [fusion.id]: buildFusionDefaultContent(fusion) }));
      setFusionImagesMap(fi => ({ ...fi, [fusion.id]: buildFusionDefaultImages(fusion) }));
      pendingFlipRef.current = targetPage;
      setFlipKey(k => k + 1); // remount FlipBook with new page count
      return [...prev, fusion];
    });
    setFusionModal(false);
  }, [allCultures.length]);

  const handleFusionDelete = useCallback((fusionId) => {
    setFusions(prev => prev.filter(f => f.id !== fusionId));
    setFusionContentMap(prev => { const n = { ...prev }; delete n[fusionId]; return n; });
    setFusionImagesMap(prev => { const n = { ...prev }; delete n[fusionId]; return n; });
    deleteFusion(fusionId);
    supabase.from('culture_content').delete().eq('culture_id', fusionId).eq('session_id', SESSION_ID);
    supabase.from('culture_images').delete().eq('culture_id', fusionId).eq('session_id', SESSION_ID);
    setFlipKey(k => k + 1);
  }, []);

  const handleFusionContentChange = useCallback((fusionId, updates) => {
    setFusionContentMap(prev => {
      const next = { ...prev, [fusionId]: { ...prev[fusionId], ...updates } };
      upsertContent(fusionId, next[fusionId]);
      return next;
    });
  }, []);

  const handleFusionImageChange = useCallback((fusionId, spaceId, url) => {
    setFusionImagesMap(prev => {
      const next = { ...prev, [fusionId]: { ...prev[fusionId], [spaceId]: url || null } };
      upsertImages(fusionId, next[fusionId]);
      return next;
    });
  }, []);

  const handlePrev = useCallback(() => bookRef.current?.flipPrev(), []);
  const handleNext = useCallback(() => bookRef.current?.flipNext(), []);
  const handleGoTo = useCallback((page) => bookRef.current?.flip(page), []);

  if (!ready) {
    return (
      <div className="app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 18 }}>
        טוען...
      </div>
    );
  }

  return (
    <div className="app">
      <FlipBook
        key={flipKey}
        ref={bookRef}
        cultures={allCultures}
        contentMap={contentMap}
        imagesMap={imagesMap}
        onPageChange={handlePageChange}
        onContentChange={handleContentChange}
        onImageChange={handleImageChange}
        fusions={fusions}
        fusionContentMap={fusionContentMap}
        fusionImagesMap={fusionImagesMap}
        onFusionContentChange={handleFusionContentChange}
        onFusionImageChange={handleFusionImageChange}
        onFusionDelete={handleFusionDelete}
        onOpenCultureModal={() => setCultureModal(true)}
        onOpenFusionModal={() => setFusionModal(true)}
        startPage={startPage}
      />
      <Navigation
        currentPage={currentPage}
        totalPages={TOTAL_PAGES}
        onPrev={handlePrev}
        onNext={handleNext}
        onGoTo={handleGoTo}
      />
      {fusionModal && (
        <FusionModal
          cultures={allCultures}
          fusions={fusions}
          onClose={() => setFusionModal(false)}
          onCreate={handleFusionCreate}
        />
      )}
      {cultureModal && (
        <CultureModal
          onClose={() => setCultureModal(false)}
          onCreate={handleCustomCultureCreate}
        />
      )}
    </div>
  );
}
