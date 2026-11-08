/**
 * Ad delivery configuration.
 *
 * Three rules drive this file:
 *
 * 1. Ad slots are decoupled from ad networks. Every tool page keeps the slot it
 *    already has (<SimpleAd adSlot="..."/>) and this module decides which
 *    network fills it — so swapping AdSense for another platform, or routing a
 *    single slot elsewhere, is a config change rather than a change in 30
 *    components.
 * 2. AdSense is only ever loaded on an explicit host allow-list. Preview
 *    deployments (*.vercel.app), branch aliases and local development render the
 *    same pages, so without this gate they request ads and generate impressions
 *    that never belong to a real visitor — a classic "invalid traffic" signal
 *    that gets accounts actioned.
 * 3. The <head> loader and <SimpleAdSSG/> both read this module, so the two gate
 *    decisions can never drift apart.
 *
 * Build-time overrides (set in Vercel project env):
 *   NEXT_PUBLIC_ADS_ENABLED=false        kill switch, disables ads everywhere
 *   NEXT_PUBLIC_ADS_HOSTS=a.com,b.com    extra hosts on top of PRODUCTION_HOSTS
 *   NEXT_PUBLIC_AD_PROVIDERS=adsense,ethicalads
 *                                        fill order; first one that fills wins.
 *                                        Defaults to "adsense" only.
 *   NEXT_PUBLIC_ETHICALADS_PUBLISHER=... EthicalAds publisher id
 *   NEXT_PUBLIC_CARBON_SERVE=...         Carbon Ads "serve" id
 *   NEXT_PUBLIC_CARBON_PLACEMENT=...     Carbon Ads placement id
 *   NEXT_PUBLIC_AD_FILL_TIMEOUT_MS=4000  how long to wait before trying the
 *                                        next network in the chain
 */

export const ADSENSE_CLIENT = 'ca-pub-8806399994474387';

export const ADSENSE_SCRIPT_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;

export const ETHICALADS_SCRIPT_SRC = 'https://media.ethicalads.io/media/client/ethicalads.min.js';

export const DEFAULT_AD_SLOT = '1681486325';

const DEFAULT_FILL_TIMEOUT_MS = 4000;

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
 *
 * This is only a head start: <AdSenseSlot/> loads the same script itself if the
 * preload was skipped.
 */
export function getAdLoaderScript() {
  const config = JSON.stringify({
    enabled: adsEnabled(),
    hosts: getAdHosts(),
    src: ADSENSE_SCRIPT_SRC,
    preloadAdsense: isAdsenseInUse(),
  });

  return `(function(){try{var c=${config};if(!c.enabled||!c.preloadAdsense)return;var h=(location.hostname||'').toLowerCase().replace(/\\.$/,'');if(c.hosts.indexOf(h)===-1)return;if(document.querySelector('script[data-adsense-loader]'))return;var s=document.createElement('script');s.async=true;s.crossOrigin='anonymous';s.setAttribute('data-adsense-loader','1');s.src=c.src;document.head.appendChild(s);}catch(e){}})();`;
}

/* -------------------------------------------------------------------------- */
/* Ad networks                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * "snippet" is the escape hatch for every network that hands you a raw HTML/JS
 * tag (Adsterra, PropellerAds, Monetag, Adcash, a direct sponsor banner, ...).
 * Its tag is rendered inside an isolated iframe, so document.write based
 * snippets cannot blow away the page.
 *
 * `width` / `height` are the creative's native size; the slot scales it down to
 * fit narrower containers instead of clipping it. Pass `scaleToFit: false` to
 * render at native size with the overflow hidden.
 */
export const ADSTERRA_BANNER = {
  width: 728,
  height: 90,
  html: `<script>
  atOptions = {
    'key' : '31a6fa105aec634f785b2b08520fd3e5',
    'format' : 'iframe',
    'height' : 90,
    'width' : 728,
    'params' : {}
  };
</script>
<script src="https://bauval.org/22/31a6fa105aec634f785b2b08520fd3e5"></script>`,
};

export const CODE_ADSTERRA_BANNER = {
  width: 300,
  height: 250,
  html: `<script>
  atOptions = {
    'key' : 'f992eac809efe5968cc2a199b7af994f',
    'format' : 'iframe',
    'height' : 250,
    'width' : 300,
    'params' : {}
  };
</script>
<script src="https://bauval.org/22/f992eac809efe5968cc2a199b7af994f"></script>`,
};

/**
 * Per-slot raw creatives, keyed by the adSlot id already passed by the tool
 * components. Which slots actually use them is decided by PATH_CHAINS below.
 */
const SLOT_SNIPPETS = {
  '8095900796': ADSTERRA_BANNER,
  '1681486325': ADSTERRA_BANNER,
};

const PATH_SNIPPETS = {
  '/code': CODE_ADSTERRA_BANNER,
  '/text': CODE_ADSTERRA_BANNER,
};

/**
 * Per-route network chains. Matched on the pathname prefix so categories can
 * use their own Adsterra creative without relying on shared slot ids.
 *
 * AdSense still goes first: Adsterra only takes the space when AdSense returns
 * no fill (account on hold, no inventory, request blocked).
 */
const PATH_CHAINS = {
  '/code': ['adsense', 'snippet'],
  '/datetime': ['adsense', 'snippet'],
  '/media': ['adsense', 'snippet'],
  '/text': ['adsense', 'snippet'],
};

/**
 * Per-slot network override. Anything not listed falls back to
 * NEXT_PUBLIC_AD_PROVIDERS. Use it to send a single slot to a different network,
 * e.g. keeping AdSense on most pages while an affiliate banner fills the
 * compressor slot.
 */
const SLOT_CHAINS = {};

const PROVIDER_ALIASES = {
  adsense: 'adsense',
  google: 'adsense',
  ethicalads: 'ethicalads',
  'ethical-ads': 'ethicalads',
  ethical: 'ethicalads',
  carbon: 'carbon',
  carbonads: 'carbon',
  snippet: 'snippet',
  custom: 'snippet',
  html: 'snippet',
  direct: 'snippet',
};

export const AD_PROVIDER_LABELS = {
  adsense: 'AdSense',
  ethicalads: 'EthicalAds',
  carbon: 'Carbon Ads',
  snippet: 'Direct / other network',
};

export function getEthicalAdsPublisher() {
  return String(process.env.NEXT_PUBLIC_ETHICALADS_PUBLISHER || '').trim();
}

export function getCarbonConfig() {
  return {
    serve: String(process.env.NEXT_PUBLIC_CARBON_SERVE || '').trim(),
    placement: String(process.env.NEXT_PUBLIC_CARBON_PLACEMENT || '').trim(),
  };
}

export function getSlotSnippet(slot, pathname) {
  const path = Object.keys(PATH_SNIPPETS)
    .sort((a, b) => b.length - a.length)
    .find((prefix) => matchesPath(pathname, prefix));

  if (path) return PATH_SNIPPETS[path];
  return SLOT_SNIPPETS[slot] || null;
}

export function getFillTimeoutMs() {
  const parsed = Number.parseInt(process.env.NEXT_PUBLIC_AD_FILL_TIMEOUT_MS || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_FILL_TIMEOUT_MS;
}

function normalizeProviderName(name) {
  return PROVIDER_ALIASES[String(name || '').trim().toLowerCase()] || '';
}

export function getProviderOrder() {
  const configured = String(process.env.NEXT_PUBLIC_AD_PROVIDERS || '')
    .split(',')
    .map(normalizeProviderName)
    .filter(Boolean);

  return configured.length ? [...new Set(configured)] : ['adsense'];
}

export function isProviderConfigured(name, slot, pathname) {
  switch (name) {
    case 'adsense':
      return Boolean(ADSENSE_CLIENT);
    case 'ethicalads':
      return Boolean(getEthicalAdsPublisher());
    case 'carbon': {
      const { serve, placement } = getCarbonConfig();
      return Boolean(serve && placement);
    }
    case 'snippet':
      return Boolean(getSlotSnippet(slot, pathname));
    default:
      return false;
  }
}

function matchesPath(pathname, prefix) {
  if (!pathname) return false;
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function getPathChain(pathname) {
  const match = Object.keys(PATH_CHAINS)
    .sort((a, b) => b.length - a.length)
    .find((prefix) => matchesPath(pathname, prefix));

  return match ? PATH_CHAINS[match] : null;
}

/**
 * Networks that can fill this slot, in order. Unconfigured networks are dropped
 * rather than rendered blank, so the chain degrades to whatever the site
 * actually has credentials for.
 */
export function getSlotProviders(slot, pathname) {
  const chain = getPathChain(pathname) || SLOT_CHAINS[slot] || getProviderOrder();

  return chain
    .map(normalizeProviderName)
    .filter((name, index, list) => name && list.indexOf(name) === index)
    .filter((name) => isProviderConfigured(name, slot, pathname));
}

function isAdsenseInUse() {
  if (getProviderOrder().includes('adsense')) return true;

  return [...Object.values(SLOT_CHAINS), ...Object.values(PATH_CHAINS)].some((chain) =>
    chain.map(normalizeProviderName).includes('adsense')
  );
}
