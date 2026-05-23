import { useState, useEffect, useCallback } from 'react';

const PREFIX = 'dwelling-dna';

function getKey(type, id) {
  return id ? `${PREFIX}:${type}:${id}` : `${PREFIX}:${type}`;
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage quota exceeded — silent fail
  }
}

export function useLastPage(defaultPage = 0) {
  const key = getKey('lastPage');
  const [page, setPageState] = useState(() => load(key, defaultPage));

  const setPage = useCallback((p) => {
    setPageState(p);
    save(key, p);
  }, [key]);

  return [page, setPage];
}

export function useCultureContent(cultureId, defaults) {
  const key = getKey('content', cultureId);
  const [content, setContentState] = useState(() => load(key, defaults));

  // Sync defaults into state when cultureId changes
  useEffect(() => {
    const stored = load(key, null);
    setContentState(stored !== null ? { ...defaults, ...stored } : defaults);
  }, [cultureId]); // eslint-disable-line

  const setContent = useCallback((updater) => {
    setContentState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      save(key, next);
      return next;
    });
  }, [key]);

  return [content, setContent];
}

export function useCultureImages(cultureId, defaults) {
  const key = getKey('images', cultureId);
  const [images, setImagesState] = useState(() => load(key, defaults));

  useEffect(() => {
    const stored = load(key, null);
    setImagesState(stored !== null ? { ...defaults, ...stored } : defaults);
  }, [cultureId]); // eslint-disable-line

  const setImages = useCallback((updater) => {
    setImagesState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      save(key, next);
      return next;
    });
  }, [key]);

  return [images, setImages];
}
