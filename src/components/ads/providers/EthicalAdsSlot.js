'use client';

import React, { useEffect, useRef } from 'react';
import { ETHICALADS_SCRIPT_SRC, getEthicalAdsPublisher, getFillTimeoutMs } from '../../../utils/adConfig';
import { loadScript } from '../../../utils/scriptLoader';
import { useAdFillWatch } from '../../../hooks/useAdFillWatch';

// The client replaces the empty placement with the creative markup.
const evaluate = (element) =>
  element.querySelector('img, a') || element.offsetHeight > 0 ? 'filled' : 'pending';

export default function EthicalAdsSlot({ active, onEmpty }) {
  const placementRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    loadScript(ETHICALADS_SCRIPT_SRC);
  }, [active]);

  useAdFillWatch(placementRef, {
    enabled: active,
    evaluate,
    timeoutMs: getFillTimeoutMs(),
    onEmpty,
  });

  return (
    <div
      ref={placementRef}
      data-ea-publisher={getEthicalAdsPublisher()}
      data-ea-type="image"
      className="horizontal"
    />
  );
}
