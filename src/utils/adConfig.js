/**
 * Ad delivery configuration.
 *
 * Two rules drive this file:
 *
 * 1. AdSense is only ever loaded on an explicit host allow-list. Preview
 *    deployments (*.vercel.app), branch aliases and local development render the
 *    same pages, so without this gate they request ads and generate impressions
 *    that never belong to a real visitor — a classic "invalid traffic" signal
 *    that gets accounts actioned.
 * 2. The <head> loader and <SimpleAdSSG/> both read this module, so the two gate
 *    decisions can never drift apart.
 *
 * Build-time overrides (set in Vercel project env):
 *   NEXT_PUBLIC_ADS_ENABLED=false      kill switch, disables ads everywhere
 *   NEXT_PUBLIC_ADS_HOSTS=a.com,b.com  extra hosts on top of PRODUCTION_HOSTS
 */

export const ADSENSE_CLIENT = 'ca-pub-8806399994474387';

export const ADSENSE_SCRIPT_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;

export const DEFAULT_AD_SLOT = '1681486325';

const PRODUCTION_HOSTS = ['one-toys.com', 'www.one-toys.com'];

// Belt-and-braces: even if a preview host is added to the allow-list by mistake,
// these still never serve ads.
const BLOCKED_HOST_PATTERNS = [
  /^localhost$/,
  /\.localhost$/,
  /\.local$/,
  /\.internal$/,
  /\.vercel\.app$/,
  /\.now\.sh$/,
  /^\d{1,3}(\.\d{1,3}){3}$/, // IPv4 literal
  /^\[.*\]$/, // bracketed IPv6 literal
];

function normalizeHost(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^[a-z][a-z0-9+.-]*:\/\//, '') // scheme
    .replace(/[/?#].*$/, '') // path / query / hash
    .replace(/:\d+$/, '') // port
    .replace(/\.$/, ''); // trailing root dot
}

export function adsEnabled() {
  return process.env.NEXT_PUBLIC_ADS_ENABLED !== 'false';
}

export function getAdHosts() {
  const extra = String(process.env.NEXT_PUBLIC_ADS_HOSTS || '').split(',');
  const hosts = [...PRODUCTION_HOSTS, ...extra].map(normalizeHost).filter(Boolean);
  return [...new Set(hosts)];
}

export function isLocalDevHost(hostname) {
  const host = normalizeHost(hostname);
  return host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '[::1]' || host.endsWith('.local');
}

export function isAdHostAllowed(hostname) {
  if (!adsEnabled()) return false;

  const host = normalizeHost(hostname);
  if (!host) return false;
  if (BLOCKED_HOST_PATTERNS.some((pattern) => pattern.test(host))) return false;

  return getAdHosts().includes(host);
}

/**
 * Inline bootstrap for <head>. Runs before paint, so on the production host the
 * AdSense library starts downloading as early as a static <script> tag would,
 * while every other host never issues the request at all.
 */
export function getAdLoaderScript() {
  const config = JSON.stringify({
    enabled: adsEnabled(),
    hosts: getAdHosts(),
    src: ADSENSE_SCRIPT_SRC,
  });

  return `(function(){try{var c=${config};if(!c.enabled)return;var h=(location.hostname||'').toLowerCase().replace(/\\.$/,'');if(c.hosts.indexOf(h)===-1)return;if(document.querySelector('script[data-adsense-loader]'))return;var s=document.createElement('script');s.async=true;s.crossOrigin='anonymous';s.setAttribute('data-adsense-loader','1');s.src=c.src;document.head.appendChild(s);}catch(e){}})();`;
}
