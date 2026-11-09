'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { ChevronUp, Lock } from 'lucide-react';
import { useNow } from '@/hooks/use-now';
import { useOS } from './store';

interface LockScreenProps {
  scale?: number;
}

/**
 * Android-style lock screen with gesture drag, scale-compensated physics,
 * pointer capture, and keyboard accessibility (Space, Enter, or ArrowUp to unlock).
 */
export function LockScreen({ scale = 1 }: LockScreenProps) {
  const unlock = useOS((s) => s.unlock);
  const now = useNow(10000);
  const [dy, setDy] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Auto-focus container for immediate keyboard interaction
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    startY.current = e.clientY;
    setDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const safeScale = scale > 0 ? scale : 1;
    // Divide by CSS scale to match 1:1 screen pixel units
    const delta = (e.clientY - startY.current) / safeScale;
    setDy(Math.min(0, delta));
  };

  const finishDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    if (dy < -70) {
      setDy(0);
      unlock();
    } else {
      setDy(0);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowUp') {
      e.preventDefault();
      unlock();
    }
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label="Lock screen. Swipe up or press Enter or Space to unlock."
      className="absolute inset-0 z-[45] flex flex-col justify-between overflow-hidden pt-16 pb-9 outline-none select-none"
      style={{
        transform: dragging ? `translateY(${dy}px)` : 'translateY(0)',
        transition: dragging ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.3, 1)',
        touchAction: 'none',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onKeyDown={onKeyDown}
    >
      <div className="px-7">
        <div className="text-[64px] font-extralight leading-none tracking-tight text-white tabular-nums [text-shadow:0_2px_18px_rgba(0,0,0,0.45)]">
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
        aria-label="Unlock phone"
        onClick={unlock}
        className="mx-auto flex flex-col items-center gap-1 text-white/85 hover:text-white transition cursor-pointer"
      >
        <ChevronUp className="wd-chev h-6 w-6" />
        <span className="text-[11.5px] tracking-wide">Swipe up or press Space to unlock</span>
      </button>
    </div>
  );
}
