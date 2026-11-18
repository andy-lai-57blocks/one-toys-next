'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * Escape hatch for networks that only give you a raw HTML/JS tag: Adsterra,
 * PropellerAds, Monetag, Adcash, a hand-sold sponsor banner, ...
 *
 * The tag lives in a real same-origin page under public/ads/ and is loaded with
 * `src`, not `srcDoc`. A srcdoc frame without `allow-same-origin` has an opaque
 * origin, so document.cookie and localStorage throw — and Adsterra's loader
 * swallows that error and renders nothing at all, leaving a silently blank
 * slot. The `sandbox` attribute below still keeps the creative away from our
 * DOM, storage and cookies via its own origin's limits, and `allow-same-origin`
 * is required for the tag to run.
 *
 * Snippets that are pure markup (a sponsor <a><img></a>) can still be passed as
 * `html`; only the ones with a `src` get the iframe treatment.
 *
 * Creatives come in fixed sizes (the Adsterra leaderboard is 728x90) while the
 * slot is only as wide as its container, so the iframe is scaled down to fit
 * rather than clipped. Pass `scaleToFit: false` in the snippet config to keep
 * the native size.
 */
export default function SnippetSlot({ snippet, active }) {
  const nativeWidth = Number(snippet?.width) || 0;
  const nativeHeight = Number(snippet?.height) || 250;
  const scaleToFit = snippet?.scaleToFit !== false && nativeWidth > 0;

  const wrapperRef = useRef(null);
  const [availableWidth, setAvailableWidth] = useState(0);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || !scaleToFit) return undefined;

    const observer = new ResizeObserver((entries) => {
      setAvailableWidth(entries[0].contentRect.width);
    });
    observer.observe(wrapper);

    return () => observer.disconnect();
  }, [scaleToFit]);

  const scale = !scaleToFit || !availableWidth ? 1 : Math.min(1, availableWidth / nativeWidth);
  const reservedHeight = Math.round(nativeHeight * scale);

  // `src` tags run as their own document; inline snippets are wrapped in the
  // same shell so both paths render identically.
  const src = snippet?.src;
  const srcDoc = src
    ? undefined
    : `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <base target="_blank">
    <style>html,body{margin:0;padding:0;overflow:hidden;background:transparent;text-align:center}</style>
  </head>
  <body>${snippet?.html || ''}</body>
</html>`;

  // The space is reserved during SSR but the creative is only mounted once the
  // host gate passes, so preview hosts never issue the network's request.
  return (
    <div ref={wrapperRef} style={{ height: reservedHeight, overflow: 'hidden' }}>
      {active && (
        <iframe
          title="Advertisement"
          {...(src ? { src } : { srcDoc })}
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
          scrolling="no"
          style={{
            display: 'block',
            width: nativeWidth || '100%',
            height: nativeHeight,
            border: 0,
            transform: scale === 1 ? undefined : `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        />
      )}
    </div>
  );
}
