'use client';

import React, { useEffect, useRef } from 'react';
import { getCarbonConfig, getFillTimeoutMs } from '../../../utils/adConfig';
import { useAdFillWatch } from '../../../hooks/useAdFillWatch';

let carbonRequested = false;

// Carbon injects its own #carbonads block next to the script tag.
const evaluate = () => {
  const unit = document.getElementById('carbonads');
  return unit && unit.querySelector('a') ? 'filled' : 'pending';
};

export default function CarbonSlot({ active, onEmpty }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;

    // Carbon allows one unit per page, so a second slot falls through to the
    // next network instead of requesting a duplicate.
    if (carbonRequested) {
      onEmpty?.();
      return undefined;
    }

    const { serve, placement } = getCarbonConfig();
    const container = containerRef.current;
    if (!serve || !placement || !container) return undefined;

    carbonRequested = true;

    const script = document.createElement('script');
    script.id = '_carbonads_js';
    script.async = true;
    script.src = `https://cdn.carbonads.com/carbon.js?serve=${encodeURIComponent(serve)}&placement=${encodeURIComponent(placement)}`;
    container.appendChild(script);

    return undefined;
  }, [active, onEmpty]);

  useAdFillWatch(containerRef, {
    enabled: active,
    evaluate,
    timeoutMs: getFillTimeoutMs(),
    onEmpty,
  });

  return <div ref={containerRef} />;
}
