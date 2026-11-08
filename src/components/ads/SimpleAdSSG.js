'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AD_PROVIDER_LABELS,
  DEFAULT_AD_SLOT,
  getSlotProviders,
  getSlotSnippet,
  isAdHostAllowed,
  isLocalDevHost,
} from '../../utils/adConfig';
import AdSenseSlot from './providers/AdSenseSlot';
import CarbonSlot from './providers/CarbonSlot';
import EthicalAdsSlot from './providers/EthicalAdsSlot';
import SnippetSlot from './providers/SnippetSlot';

const PROVIDER_COMPONENTS = {
  adsense: AdSenseSlot,
  ethicalads: EthicalAdsSlot,
  carbon: CarbonSlot,
  snippet: SnippetSlot,
};

/**
 * One ad slot, whichever network can fill it.
 *
 * Call sites keep passing only `adSlot` / `style` / `className`; which network
 * answers is decided in src/utils/adConfig.js. If the first network reports no
 * fill (or stays silent past the fill timeout) the next one in the chain takes
 * the same space, so a slot never goes to waste when a platform has no
 * inventory — or, as now, the account is on hold.
 */
const SimpleAdSSG = ({
  className = '',
  style = {},
  adSlot = DEFAULT_AD_SLOT,
  adClient,
}) => {
  // Extract width from style prop, default to '300px'
  const containerWidth = style.width || '300px';

  const providers = useMemo(() => getSlotProviders(adSlot), [adSlot]);
  const snippet = useMemo(() => getSlotSnippet(adSlot), [adSlot]);

  // 'ssr' keeps the ad markup in the server HTML so it hydrates without a
  // layout shift; the effect below resolves the real host verdict.
  const [hostState, setHostState] = useState('ssr');
  const [attempt, setAttempt] = useState(0);

  // Only allow-listed hosts serve ads, so preview deployments and tunnel hosts
  // never request them (invalid-traffic protection).
  useEffect(() => {
    const hostname = window.location.hostname || '';
    if (isAdHostAllowed(hostname)) {
      setHostState('allowed');
    } else {
      setHostState(isLocalDevHost(hostname) ? 'dev' : 'blocked');
    }
  }, []);

  const handleEmpty = useCallback(() => setAttempt((current) => current + 1), []);

  // Preview/staging hosts: the slot should not exist in the DOM at all.
  if (hostState === 'blocked') return null;

  const providerName = providers[attempt];

  // Development placeholder
  if (hostState === 'dev') {
    return (
      <div
        className={`ad-placeholder ${className}`}
        style={{
          width: containerWidth,
          height: '250px',
          maxWidth: '100%',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          backgroundColor: '#f8f9fa',
          border: '2px dashed #dee2e6',
          borderRadius: '8px',
          color: '#6c757d',
          fontSize: '14px',
          ...style
        }}
      >
        <span>🚫 Ads disabled (development mode)</span>
        <span style={{ fontSize: '12px' }}>
          {providers.length
            ? `Slot ${adSlot}: ${providers.map((name) => AD_PROVIDER_LABELS[name] || name).join(' → ')}`
            : `Slot ${adSlot}: no network configured`}
        </span>
      </div>
    );
  }

  if (!providerName) return null;

  const ProviderComponent = PROVIDER_COMPONENTS[providerName];

  return (
    <div
      className={`ad-container ${className}`}
      style={{
        width: containerWidth,
        maxWidth: '100%',
        margin: '0 auto',
        ...style
      }}
    >
      <ProviderComponent
        key={`${providerName}-${attempt}`}
        slot={adSlot}
        client={adClient}
        width={containerWidth}
        active={hostState === 'allowed'}
        onEmpty={handleEmpty}
        snippet={snippet}
      />
    </div>
  );
};

export default SimpleAdSSG;

