'use client';

import React, { useEffect, useRef } from 'react';
import { ADSENSE_CLIENT, ADSENSE_SCRIPT_SRC, getFillTimeoutMs } from '../../../utils/adConfig';
import { loadScript } from '../../../utils/scriptLoader';
import { useAdFillWatch } from '../../../hooks/useAdFillWatch';

// AdSense marks the <ins> once it has decided, so no guessing is needed here.
const evaluate = (element) => {
  const status = element.dataset.adStatus;
  if (status === 'filled') return 'filled';
  if (status === 'unfilled') return 'empty';
  return 'pending';
};

export default function AdSenseSlot({ slot, client = ADSENSE_CLIENT, width, active, onEmpty }) {
  const insRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;

    const ins = insRef.current;
    if (!ins || ins.dataset.adInitialized === '1') return undefined;

    // Marked before pushing: the library loads asynchronously, so a remount could
    // otherwise queue the same <ins> twice and AdSense drops the duplicate.
    ins.dataset.adInitialized = '1';

    let cancelled = false;
    loadScript(ADSENSE_SCRIPT_SRC).then((loaded) => {
      if (cancelled || !loaded) return;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        // AdSense errors are usually non-critical
        console.warn('AdSense initialization:', error);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [active]);

  useAdFillWatch(insRef, {
    enabled: active,
    evaluate,
    timeoutMs: getFillTimeoutMs(),
    onEmpty,
  });

  return (
    <ins
      ref={insRef}
      className="adsbygoogle"
      style={{
        display: 'block',
        width,
        maxWidth: '100%',
      }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
