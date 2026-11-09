'use client';

import { useCallback, useRef } from 'react';

/**
 * Long-press helper for launcher icons (desktop mouse + touch).
 * Also fires on right-click (contextmenu) for discoverability.
 */
export function useLongPress(cb: () => void, ms = 480) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fired = useRef(false);

  const clear = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  return {
    onPointerDown: () => {
      fired.current = false;
      clear();
      timer.current = setTimeout(() => {
        fired.current = true;
        cb();
      }, ms);
    },
    onPointerUp: clear,
    onPointerLeave: clear,
    onPointerMove: (e: React.PointerEvent) => {
      // Cancel if the pointer drifts (scroll intent)
      if (e.movementX ** 2 + e.movementY ** 2 > 40) clear();
    },
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault();
      clear();
      cb();
    },
  };
}
