import { useState, useCallback } from 'react';

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

function merge(key, defaults) {
  const stored = load(key, null);
  return stored !== null ? { ...defaults, ...stored } : defaults;
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

/**
 * Keyed state backed by localStorage. When the key changes (a different
 * culture), the state is re-derived during render instead of inside an effect —
 * that avoids the extra render pass a setState-in-useEffect causes.
 */
function useKeyedStorage(key, defaults) {
  const [state, setState] = useState(() => ({ key, value: merge(key, defaults) }));

  if (state.key !== key) {
    setState({ key, value: merge(key, defaults) });
  }

  const update = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === 'function' ? updater(prev.value) : { ...prev.value, ...updater };
      save(prev.key, next);
      return { key: prev.key, value: next };
    });
  }, []);

  return [state.value, update];
}

export function useCultureContent(cultureId, defaults) {
  return useKeyedStorage(getKey('content', cultureId), defaults);
}

export function useCultureImages(cultureId, defaults) {
  return useKeyedStorage(getKey('images', cultureId), defaults);
}
