'use client';

import { useEffect, useState } from 'react';

/**
 * Returns a live Date instance updating at the requested interval.
 * Isolates timer re-renders to only the components displaying the clock.
 */
export function useNow(intervalMs: number = 10000): Date {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const timer = setInterval(tick, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}

