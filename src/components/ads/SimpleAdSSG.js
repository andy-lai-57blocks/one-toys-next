'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ADSENSE_CLIENT, DEFAULT_AD_SLOT, isAdHostAllowed, isLocalDevHost } from '../../utils/adConfig';

const SimpleAdSSG = ({
  className = '',
  style = {},
  adSlot = DEFAULT_AD_SLOT,
  adClient = ADSENSE_CLIENT
}) => {
  // Extract width from style prop, default to '300px'
  const containerWidth = style.width || '300px';
  const insRef = useRef(null);

  // 'ssr' keeps the ad markup in the server HTML so it hydrates without a
  // layout shift; the effect below resolves the real host verdict.
  const [hostState, setHostState] = useState('ssr');

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

  useEffect(() => {
    if (hostState !== 'allowed') return;

    const ins = insRef.current;
    if (!ins || ins.dataset.adInitialized === '1') return;

    // Marked before pushing. The library is injected asynchronously, so a
    // remount could otherwise queue the same <ins> twice and AdSense drops the
    // duplicate with a console error.
    ins.dataset.adInitialized = '1';

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      // AdSense errors are usually non-critical
      console.warn('AdSense initialization:', error);
    }
  }, [hostState]);

  // Preview/staging hosts: the slot should not exist in the DOM at all.
  if (hostState === 'blocked') return null;

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
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          border: '2px dashed #dee2e6',
          borderRadius: '8px',
          color: '#6c757d',
          fontSize: '14px',
          ...style
        }}
      >
        🚫 AdSense (Development Mode)
      </div>
    );
  }

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
      <ins 
        ref={insRef}
        className="adsbygoogle"
        style={{ 
          display: 'block', 
          width: containerWidth, 
          maxWidth: '100%'
        }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default SimpleAdSSG;

