import { useRef, useState } from 'react';

const DRAG_THRESHOLD = 30; // px — past this, the gesture is a drag, not a click

/**
 * A folded page corner that turns the page.
 *
 * react-pageflip's built-in mouse handling reserves a square the size of a
 * fifth of the page diagonal in each corner and treats every press there as a
 * page-turn gesture — including presses on buttons and text fields. The library
 * handling is switched off; this is the flip affordance in its place: a small
 * corner with nothing else underneath it.
 *
 * A plain click (mouse, keyboard, assistive tech) turns the page through the
 * click handler. Dragging inwards from the corner turns it on release, and
 * suppresses the click that follows so one gesture never flips twice.
 */
export default function PageCorner({ side, onFlip, disabled }) {
  const [lifted, setLifted] = useState(false);
  const start = useRef(null);
  const handledByDrag = useRef(false);

  const handlePointerDown = (e) => {
    if (disabled) return;
    start.current = { x: e.clientX, y: e.clientY };
    handledByDrag.current = false;
    setLifted(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerUp = (e) => {
    setLifted(false);
    const from = start.current;
    start.current = null;
    if (disabled || !from) return;

    const dx = e.clientX - from.x;
    const dragged = Math.hypot(dx, e.clientY - from.y) >= DRAG_THRESHOLD;
    if (!dragged) return; // the click handler takes it from here

    handledByDrag.current = true;
    const inwards = side === 'next' ? dx > 0 : dx < 0;
    if (inwards) onFlip?.();
  };

  const handleClick = () => {
    if (disabled) return;
    if (handledByDrag.current) {
      handledByDrag.current = false;
      return;
    }
    onFlip?.();
  };

  return (
    <button
      type="button"
      className={`page-corner page-corner--${side}${lifted ? ' page-corner--lifted' : ''}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => { start.current = null; setLifted(false); }}
      onClick={handleClick}
      disabled={disabled}
      aria-label={side === 'next' ? 'לעמוד הבא' : 'לעמוד הקודם'}
      title={side === 'next' ? 'לעמוד הבא' : 'לעמוד הקודם'}
    >
      <span className="page-corner__fold" />
    </button>
  );
}
