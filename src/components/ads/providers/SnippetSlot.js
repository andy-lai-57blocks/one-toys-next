'use client';

import React from 'react';

/**
 * Escape hatch for networks that only give you a raw HTML/JS tag: Adsterra,
 * PropellerAds, Monetag, Adcash, a hand-sold sponsor banner, ...
 *
 * The tag runs inside a `srcdoc` iframe so document.write based snippets are
 * harmless to the page. `allow-same-origin` is deliberately omitted: the
 * creative gets scripts and popups but no access to our document or storage.
 *
 * There is nothing to measure here, so the slot is treated as filled as soon as
 * it renders; `height` in the slot config reserves the space.
 */
export default function SnippetSlot({ snippet, active }) {
  const height = Number(snippet?.height) || 250;

  const document = `<!doctype html>
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
    <div style={{ minHeight: height }}>
      {active && (
        <iframe
          title="Advertisement"
          srcDoc={document}
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
          scrolling="no"
          style={{
            width: '100%',
            height,
            border: 0,
            display: 'block',
          }}
        />
      )}
    </div>
  );
}
