'use client';

import { useEffect, useRef } from 'react';

/**
 * Polls a slot container until the network says something, then reports once.
 *
 * Every network answers at a different moment and some never answer at all (no
 * fill, account on hold, blocked request), so a slot cannot wait forever: after
 * `timeoutMs` the slot is handed to the next network in the chain instead of
 * staying empty.
 *
 * `evaluate` must be stable (module scope) — it is compared by reference.
 */
export function useAdFillWatch(ref, { enabled, evaluate, timeoutMs, onFilled, onEmpty }) {
  const handlers = useRef({ onFilled, onEmpty });
  handlers.current = { onFilled, onEmpty };

  useEffect(() => {
    if (!enabled) return undefined;

    let settled = false;
    const startedAt = Date.now();

    const timer = setInterval(() => {
      if (settled) return;

      const element = ref.current;
      const verdict = element ? evaluate(element) : 'pending';

      if (verdict === 'filled') {
        settled = true;
        clearInterval(timer);
        handlers.current.onFilled?.();
        return;
      }

      if (verdict === 'empty' || Date.now() - startedAt >= timeoutMs) {
        settled = true;
        clearInterval(timer);
        handlers.current.onEmpty?.();
      }
    }, 250);

    return () => {
      settled = true;
      clearInterval(timer);
    };
  }, [enabled, evaluate, timeoutMs, ref]);
}
