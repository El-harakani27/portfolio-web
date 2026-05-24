'use client';

import { useEffect, useRef } from 'react';

const SIZE = 40;   // real element size in px
const HALF = SIZE / 2;
const LERP = 0.1;  // position + scale smoothing (lower = smoother / more lag)

export default function GSAPCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    document.body.style.cursor = 'none';
    const styleEl = document.createElement('style');
    styleEl.textContent = '*, a, button, [role="button"] { cursor: none !important; }';
    document.head.appendChild(styleEl);

    let mx = -200, my = -200;   // target position
    let cx = -200, cy = -200;   // current lerped position
    let ts = 0.3,  cs = 0.3;   // target / current scale
    let hovering = false;
    let raf: number;

    const tick = () => {
      cx += (mx - cx) * LERP;
      cy += (my - cy) * LERP;
      cs += (ts - cs) * LERP;
      el.style.transform = `translate(${cx - HALF}px, ${cy - HALF}px) scale(${cs})`;
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      const over = !!(e.target as HTMLElement).closest('a, button, [role="button"]');
      if (over !== hovering) {
        hovering = over;
        ts = over ? 1.15 : 0.3;
      }
    };

    const onDown = () => { ts *= 0.65; };
    const onUp   = () => { ts = hovering ? 1.15 : 0.3; };

    raf = requestAnimationFrame(tick);
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.cursor = '';
      document.head.removeChild(styleEl);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: SIZE,
        height: SIZE,
        borderRadius: '50%',
        background: '#ffffff',
        mixBlendMode: 'difference',
        pointerEvents: 'none',
        zIndex: 9999,
        willChange: 'transform',
      }}
    />
  );
}