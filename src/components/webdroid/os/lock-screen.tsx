'use client';

import { useRef, useState } from 'react';
import { ChevronUp, Lock } from 'lucide-react';
import { useOS } from './store';

/** Android lock screen — swipe up (drag or click the chevron) to unlock. */
export function LockScreen() {
  const unlock = useOS((s) => s.unlock);
  const [dy, setDy] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);

  const onDown = (e: React.PointerEvent) => {
    startY.current = e.clientY;
    setDragging(true);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDy(Math.min(0, e.clientY - startY.current));
  };
  const onUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (dy < -80) {
      setDy(0);
      unlock();
    } else {
      setDy(0);
    }
  };

  const now = new Date();

  return (
    <div
      className="absolute inset-0 z-[45] flex flex-col justify-between overflow-hidden pt-16 pb-9"
      style={{
        transform: dragging ? `translateY(${dy}px)` : 'translateY(0)',
        transition: dragging ? 'none' : 'transform .25s ease-out',
        touchAction: 'none',
      }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
    >
      <div className="px-7">
        <div className="text-[64px] font-extralight leading-none tracking-tight text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.45)]">
          {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="mt-2.5 text-[13.5px] text-white/85">
          {now.toLocaleDateString([], {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </div>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-black/30 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white/70 backdrop-blur">
          <Lock className="h-3 w-3" /> WebDroid OS
        </div>
      </div>
      <button
        type="button"
        aria-label="Unlock"
        onClick={unlock}
        className="mx-auto flex flex-col items-center gap-1 text-white/85"
      >
        <ChevronUp className="wd-chev h-6 w-6" />
        <span className="text-[11.5px] tracking-wide">Swipe up to unlock</span>
      </button>
    </div>
  );
}
