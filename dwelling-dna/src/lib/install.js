import { useEffect, useState } from 'react';

// Chrome offers installation once per page load, through an event that must be
// caught early and replayed on a click. It is held at module level so a
// component that mounts late still sees it.
let deferred = null;
const listeners = new Set();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e;
    listeners.forEach((fn) => fn());
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    listeners.forEach((fn) => fn());
  });
}

export function useInstallPrompt() {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force((n) => n + 1);
    listeners.add(fn);
    return () => listeners.delete(fn);
  }, []);

  return {
    canInstall: !!deferred,
    install: async () => {
      if (!deferred) return;
      deferred.prompt();
      await deferred.userChoice.catch(() => null);
      deferred = null;
      listeners.forEach((fn) => fn());
    },
  };
}
