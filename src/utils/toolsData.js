// Comprehensive tool data for global search
// Consolidates all tools from all categories

export const allTools = [
  // Code Tools - Formatting
  {
    path: '/code/json',
    title: 'JSON Formatter',
    description: 'Format, validate and minify JSON',
    icon: '📋',
    category: 'Formatting',
    section: 'Code',
    keywords: ['json', 'format', 'validate', 'minify', 'pretty', 'formatter', 'javascript', 'object', 'notation']
  },
  {
    path: '/code/xml',
    title: 'XML Formatter',
    description: 'Format, validate and minify XML',
    icon: '📄',
    category: 'Formatting',
    section: 'Code',
    keywords: ['xml', 'format', 'validate', 'minify', 'pretty', 'formatter', 'markup', 'extensible']
  },
  {
    path: '/code/vast',
    title: 'VAST Formatter',
    description: 'Format, validate and analyze VAST XML for video ads',
    icon: '📺',
    category: 'Formatting',
    section: 'Code',
    keywords: ['vast', 'video', 'ads', 'xml', 'format', 'validate', 'advertising', 'tag', 'media']
  },
  
  // Code Tools - Encoding
  {
    path: '/code/base64',
    title: 'Base64 Encoder/Decoder',
    description: 'Encode and decode Base64 strings',
    icon: '🔐',
    category: 'Encoding',
    section: 'Code',
    keywords: ['base64', 'encode', 'decode', 'encoder', 'decoder', 'base', '64', 'encoding', 'decoding']
  },
  {
    path: '/code/url',
    title: 'URL Encoder/Decoder',
    description: 'Encode and decode URL strings',
    icon: '🌐',
    category: 'Encoding',
    section: 'Code',
    keywords: ['url', 'encode', 'decode', 'encoder', 'decoder', 'uri', 'percent', 'encoding', 'web']
  },
  {
    path: '/code/html',
    title: 'HTML Encoder/Decoder',
    description: 'Encode and decode HTML entities',
    icon: '🏷️',
    category: 'Encoding',
    section: 'Code',
    keywords: ['html', 'encode', 'decode', 'encoder', 'decoder', 'entities', 'escape', 'unescape']
  },
  {
    path: '/code/gzip',
    title: 'Gzip Compression',
    description: 'Simple text compression and decompression with gzip',
    icon: '🗜️',
    category: 'Encoding',
    section: 'Code',
    keywords: ['gzip', 'compress', 'decompress', 'compression', 'zip', 'archive', 'deflate']
  },
  
  // Code Tools - Media
  {
    path: '/code/hls',
    title: 'HLS Stream Player',
    description: 'Play and analyze HTTP Live Streaming (HLS) content',
    icon: '📺',
    category: 'Media',
    section: 'Code',
    keywords: ['hls', 'stream', 'player', 'video', 'http', 'live', 'streaming', 'm3u8', 'media']
  },
  
  // Code Tools - Generators
  {
    path: '/code/uuid',
    title: 'UUID Generator',
    description: 'Generate UUID v1, v4, and Nil UUIDs',
    icon: '🆔',
    category: 'Generators',
    section: 'Code',
    keywords: ['uuid', 'generate', 'generator', 'unique', 'identifier', 'guid', 'v1', 'v4', 'nil']
  },
  {
    path: '/code/password',
    title: 'Password Generator',
    description: 'Generate secure passwords with custom options',
    icon: '🔑',
    category: 'Generators',
    section: 'Code',
    keywords: ['password', 'generate', 'generator', 'secure', 'random', 'strong', 'security']
  },
  
  // Text Tools - Processing
  {
    path: '/text/space-remover',
    title: 'Space Remover',
    description: 'Remove, replace, or normalize spaces and whitespace in text',
    icon: '🚫',
    category: 'Processing',
    section: 'Text',
    keywords: ['space', 'remove', 'whitespace', 'trim', 'normalize', 'clean', 'text', 'processing']
  },
  
  // Text Tools - Conversion
  {
    path: '/text/case-converter',
    title: 'Case Converter',
    description: 'Convert text between different case formats',
    icon: '🔤',
    category: 'Conversion',
    section: 'Text',
    keywords: ['case', 'convert', 'converter', 'uppercase', 'lowercase', 'title', 'camel', 'snake', 'kebab']
  },
  
  // Text Tools - Analysis
  {
    path: '/text/character-count',
    title: 'Character Count Tool',
    description: 'Analyze text with detailed character, word, and readability statistics',
    icon: '📊',
    category: 'Analysis',
    section: 'Text',
    keywords: ['character', 'count', 'word', 'analysis', 'statistics', 'readability', 'length', 'analyze']
  },
  
  // Text Tools - Generation
  {
    path: '/text/lorem',
    title: 'Lorem Ipsum Generator',
    description: 'Generate placeholder text for designs and layouts',
    icon: '📝',
    category: 'Generation',
    section: 'Text',
    keywords: ['lorem', 'ipsum', 'generate', 'generator', 'placeholder', 'text', 'dummy', 'content']
  },
  
  // DateTime Tools - Conversion
  {
    path: '/datetime/timestamp',
    title: 'Timestamp Converter',
    description: 'Convert between timestamps and human-readable dates',
    icon: '⏰',
    category: 'Conversion',
    section: 'DateTime',
    keywords: ['timestamp', 'convert', 'converter', 'unix', 'epoch', 'date', 'time', 'seconds']
  },
  {
    path: '/datetime/timezone',
    title: 'Timezone Converter',
    description: 'Convert time between different timezones',
    icon: '🌍',
    category: 'Conversion',
    section: 'DateTime',
    keywords: ['timezone', 'convert', 'converter', 'time', 'zone', 'utc', 'gmt', 'regional']
  },
  
  // DateTime Tools - Formatting
  {
    path: '/datetime/format',
    title: 'Date Formatter',
    description: 'Format dates in various formats and timezones',
    icon: '📅',
    category: 'Formatting',
    section: 'DateTime',
    keywords: ['date', 'format', 'formatter', 'time', 'formatting', 'custom', 'display']
  },
  
  // DateTime Tools - Calculation
  {
    path: '/datetime/calculator',
    title: 'Date Calculator',
    description: 'Calculate date differences and add/subtract time',
    icon: '🧮',
    category: 'Calculation',
    section: 'DateTime',
    keywords: ['date', 'calculate', 'calculator', 'difference', 'add', 'subtract', 'duration', 'time']
  },
  
  // DateTime Tools - Tracking
  {
    path: '/datetime/countdown',
    title: 'Countdown Tool',
    description: 'Track important dates with live countdowns',
    icon: '⏰',
    category: 'Tracking',
    section: 'DateTime',
    keywords: ['countdown', 'timer', 'track', 'countdown', 'event', 'live', 'dates', 'tracking']
  },
  
  // Info Tools - System
  {
    path: '/info/system',
    title: 'System Information',
    description: 'View browser and system information',
    icon: '💻',
    category: 'System',
    section: 'Info',
    keywords: ['system', 'information', 'browser', 'device', 'specs', 'hardware', 'software']
  },
  
  // Info Tools - Network
  {
    path: '/info/network',
    title: 'Network Information',
    description: 'Check IP address and network details',
    icon: '🌐',
    category: 'Network',
    section: 'Info',
    keywords: ['network', 'ip', 'address', 'internet', 'connection', 'details', 'networking']
  },
  
  // Info Tools - Browser
  {
    path: '/info/browser',
    title: 'Browser Information',
    description: 'View browser capabilities and features',
    icon: '🌍',
    category: 'Browser',
    section: 'Info',
    keywords: ['browser', 'information', 'capabilities', 'features', 'user', 'agent', 'detection']
  },
  
  // Info Tools - Lookup
  {
    path: '/info/calling-codes',
    title: 'International Calling Codes',
    description: 'Search and lookup country calling codes worldwide',
    icon: '📞',
    category: 'Lookup',
    section: 'Info',
    keywords: ['calling', 'codes', 'international', 'country', 'phone', 'telephone', 'dialing']
  },
  {
    path: '/info/public-services',
    title: 'Public Service Numbers',
    description: 'Find government, emergency, and public service phone numbers',
    icon: '🏛️',
    category: 'Lookup',
    section: 'Info',
    keywords: ['public', 'service', 'numbers', 'government', 'emergency', 'phone', 'official']
  },
  {
    path: '/info/postcodes',
    title: 'Postal Code Lookup',
    description: 'Search postal codes, ZIP codes, and postcodes worldwide',
    icon: '📮',
    category: 'Lookup',
    section: 'Info',
    keywords: ['postal', 'code', 'postcode', 'zip', 'lookup', 'search', 'address', 'location']
  }
];

// Helper function to search tools
export const searchTools = (query) => {
  if (!query || query.trim().length < 1) return [];
  
  const searchTerm = query.toLowerCase().trim();
  
  return allTools.filter(tool => {
    // Search in title (highest priority)
    if (tool.title.toLowerCase().includes(searchTerm)) return true;
    
    // Search in description (medium priority)
    if (tool.description.toLowerCase().includes(searchTerm)) return true;
    
    // Search in keywords (lower priority)
    if (tool.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))) return true;
    
    // Search in category (lower priority)
    if (tool.category.toLowerCase().includes(searchTerm)) return true;
    
    // Search in section (lowest priority)
    if (tool.section.toLowerCase().includes(searchTerm)) return true;
    
    return false;
  }).sort((a, b) => {
    // Sort by relevance: title matches first, then description, then keywords
    const aTitle = a.title.toLowerCase().includes(searchTerm);
    const bTitle = b.title.toLowerCase().includes(searchTerm);
    
    if (aTitle && !bTitle) return -1;
    if (!aTitle && bTitle) return 1;
    
    const aDesc = a.description.toLowerCase().includes(searchTerm);
    const bDesc = b.description.toLowerCase().includes(searchTerm);
    
    if (aDesc && !bDesc) return -1;
    if (!aDesc && bDesc) return 1;
    
    return 0;
  });
};

// Helper function to get autocomplete suggestions
export const getAutocompleteSuggestions = (query) => {
  if (!query || query.trim().length < 1) return [];
  
  const searchTerm = query.toLowerCase().trim();
  const suggestions = new Set();
  
  allTools.forEach(tool => {
    // Add tool title if it matches
    if (tool.title.toLowerCase().includes(searchTerm)) {
      suggestions.add(tool.title);
    }
    
    // Add matching keywords
    tool.keywords.forEach(keyword => {
      if (keyword.toLowerCase().includes(searchTerm) && keyword.length <= 25) {
        suggestions.add(keyword);
      }
    });
    
    // Add category if it matches
    if (tool.category.toLowerCase().includes(searchTerm)) {
      suggestions.add(tool.category);
    }
  });
  
  return Array.from(suggestions).slice(0, 8); // Limit to 8 suggestions
};

// Subdomain to route mapping for client-side routing
export const subdomainRoutes = {
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

// Get route from subdomain
export const getRouteFromSubdomain = (subdomain) => {
  if (!subdomain || subdomain === 'www') {
    return null;
  }
  
  // Direct mapping
  if (subdomainRoutes[subdomain.toLowerCase()]) {
    return subdomainRoutes[subdomain.toLowerCase()];
  }
  
  // Try to find partial matches for compound subdomains
  const lowerSubdomain = subdomain.toLowerCase();
  for (const [key, route] of Object.entries(subdomainRoutes)) {
    if (lowerSubdomain.includes(key) || key.includes(lowerSubdomain)) {
      return route;
    }
  }
  
  return null;
};

// Generate subdomain URL for a tool
export const generateSubdomainUrl = (path, baseDomain = 'one-top.com') => {
  const subdomain = Object.keys(subdomainRoutes).find(key => 
    subdomainRoutes[key] === path
  );
  
  if (subdomain) {
    return `https://${subdomain}.${baseDomain}`;
  }
  
  return `https://${baseDomain}${path}`;
};

export default allTools;
