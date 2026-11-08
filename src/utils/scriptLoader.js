const pending = new Map();

/**
 * Injects a third-party script once per page and resolves when it settles.
 * Ad networks each need their own library, and several slots can share one, so
 * every request is deduplicated by URL.
 */
export function loadScript(src, attrs = {}) {
  if (typeof window === 'undefined' || !src) return Promise.resolve(false);
  if (pending.has(src)) return pending.get(src);

  const promise = new Promise((resolve) => {
    const existing = Array.from(document.scripts).find((script) => script.src === src);

    if (existing) {
      if (existing.dataset.scriptLoaded === '1') {
        resolve(true);
        return;
      }
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    Object.entries(attrs).forEach(([name, value]) => script.setAttribute(name, value));
    script.addEventListener('load', () => {
      script.dataset.scriptLoaded = '1';
      resolve(true);
    });
    script.addEventListener('error', () => resolve(false));

    document.head.appendChild(script);
  });

  pending.set(src, promise);
  return promise;
}
