import { useEffect, useRef, useState } from 'react';
import { extractImage } from './images';

// The frame the pointer or focus is on. A paste anywhere on the page goes to
// it, so Ctrl+V works without first clicking into a field.
let armed = null;
// While an always-on target (the open lightbox) exists, frames behind it stand down.
let overlays = 0;

/**
 * Drag-and-drop and paste for any element that holds an image.
 * `onImage` receives { file } or { url }.
 */
export function useImageDrop(onImage, { always = false } = {}) {
  const [over, setOver] = useState(false);
  const id = useRef(Symbol('frame'));
  const handler = useRef(onImage);
  useEffect(() => { handler.current = onImage; });

  useEffect(() => {
    const me = id.current;
    const onPaste = (e) => {
      if (e.defaultPrevented || (!always && (overlays > 0 || armed !== me))) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const got = extractImage(e.clipboardData);
      if (!got) return;
      e.preventDefault();
      handler.current(got);
    };
    // An always-on target (the open lightbox) listens first and claims the paste.
    window.addEventListener('paste', onPaste, always);
    if (always) overlays += 1;
    return () => {
      if (always) overlays -= 1;
      window.removeEventListener('paste', onPaste, always);
      if (armed === me) armed = null;
    };
  }, [always]);

  const arm = () => { armed = id.current; };
  const disarm = () => { if (armed === id.current) armed = null; };

  return {
    over,
    props: {
      onPointerEnter: arm,
      onFocus: arm,
      onPointerLeave: disarm,
      onDragEnter: (e) => { e.preventDefault(); setOver(true); },
      onDragOver: (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; if (!over) setOver(true); },
      onDragLeave: (e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOver(false); },
      onDrop: (e) => {
        e.preventDefault();
        setOver(false);
        const got = extractImage(e.dataTransfer);
        if (got) handler.current(got);
      },
    },
  };
}
