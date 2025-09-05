import { NextResponse } from 'next/server';

// Subdomain to route mapping
const subdomainRoutes = {
  // Code Tools - Formatting
  'json': '/code/json',
  'xml': '/code/xml',
  'vast': '/code/vast',
  
  // Code Tools - Encoding  
  'base64': '/code/base64',
  'url': '/code/url',
  'html': '/code/html',
  'gzip': '/code/gzip',
  
  // Code Tools - Generators
  'password': '/code/password',
  'uuid': '/code/uuid',
  'hls': '/code/hls',
  
  // DateTime Tools
  'timestamp': '/datetime/timestamp',
  'timezone': '/datetime/timezone',
  'countdown': '/datetime/countdown',
  'calculator': '/datetime/calculator',
  'format': '/datetime/format',
  'date': '/datetime/format',
  'time': '/datetime/timestamp',
  
  // Text Tools
  'case': '/text/case-converter',
  'converter': '/text/case-converter',
  'count': '/text/character-count',
  'counter': '/text/character-count',
  'lorem': '/text/lorem',
  'space': '/text/space-remover',
  'text': '/text/case-converter',
  
  // Info Tools
  'browser': '/info/browser',
  'system': '/info/system',
  'network': '/info/network',
  'codes': '/info/calling-codes',
  'calling': '/info/calling-codes',
  'services': '/info/public-services',
  'postcodes': '/info/postcodes',
  'zip': '/info/postcodes',
  'info': '/info/browser',
  
  // Popular aliases
  'encode': '/code/base64',
  'decode': '/code/base64',
  'compress': '/code/gzip',
  'decompress': '/code/gzip'
};

export function middleware(request) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host');
  
  // Skip if no hostname
  if (!hostname) {
    return NextResponse.next();
  }
  
  // Extract subdomain
  const hostParts = hostname.split('.');
  
  // Skip if not a subdomain (main domain or localhost)
  if (hostParts.length < 3 || hostname.startsWith('localhost') || hostname.startsWith('127.0.0.1')) {
    return NextResponse.next();
  }
  
  const subdomain = hostParts[0].toLowerCase();
  
  // Skip www subdomain
  if (subdomain === 'www') {
    return NextResponse.next();
  }
  
  // Check if subdomain matches a tool route
  const targetRoute = subdomainRoutes[subdomain];
  
  if (targetRoute) {
    // Rewrite to the target route
    url.pathname = targetRoute + url.pathname;
    return NextResponse.rewrite(url);
  }
  
  // Try partial matches for compound subdomains
  for (const [key, route] of Object.entries(subdomainRoutes)) {
    if (subdomain.includes(key) || key.includes(subdomain)) {
      url.pathname = route + url.pathname;
      return NextResponse.rewrite(url);
    }
  }
  
  // If no match found, redirect to main domain with search
  const mainDomain = hostParts.slice(1).join('.');
  const searchUrl = `https://${mainDomain}/search?q=${encodeURIComponent(subdomain)}`;
  return NextResponse.redirect(searchUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (robots.txt, sitemap.xml, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|ads.txt|manifest.json).*)',
  ],
};
