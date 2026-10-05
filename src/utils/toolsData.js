// Comprehensive tool data for global search
// Consolidates all tools from all categories

export const allTools = [
  // Code Tools - Security
  {
    path: '/code/jwt-decoder',
    title: 'JWT Decoder',
    description: 'Decode and verify JSON Web Tokens locally, with security checks',
    icon: '🎫',
    category: 'Security',
    section: 'Code',
    keywords: ['jwt', 'json web token', 'decode', 'decoder', 'verify', 'signature', 'token', 'exp', 'expiration', 'claims', 'auth', 'hs256', 'rs256', 'bearer']
  },

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
    path: '/code/json-fixer',
    title: 'JSON Fixer',
    description: 'Repair broken JSON locally: code fences, comments, trailing commas, single quotes',
    icon: '🩹',
    category: 'Formatting',
    section: 'Code',
    keywords: ['json', 'fix', 'fixer', 'repair', 'invalid json', 'broken json', 'trailing comma', 'comments', 'jsonc', 'json5', 'llm output', 'clean json']
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
    path: '/code/xml-escaper',
    title: 'XML Escaper/Unescaper',
    description: 'Escape and unescape XML special characters',
    icon: '📝',
    category: 'Encoding',
    section: 'Code',
    keywords: ['xml', 'escape', 'unescape', 'entities', 'special', 'characters', 'escaper', 'unescaper']
  },
  {
    path: '/code/json-escaper',
    title: 'JSON Escaper/Unescaper',
    description: 'Escape and unescape JSON special characters',
    icon: '🔤',
    category: 'Encoding',
    section: 'Code',
    keywords: ['json', 'escape', 'unescape', 'special', 'characters', 'escaper', 'unescaper', 'string']
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
  
  // Media Tools
  {
    path: '/media/image-compress',
    title: 'Image Compressor',
    description: 'Resize and re-encode JPEG, PNG and WebP images without uploading them',
    icon: '🖼️',
    category: 'Images',
    section: 'Media',
    keywords: ['image', 'compress', 'compressor', 'resize', 'shrink', 'reduce image size', 'jpeg', 'jpg', 'png', 'webp', 'optimize image', 'image optimizer', 'photo']
  },
  {
    path: '/media/hls',
    title: 'HLS Stream Player',
    description: 'Play and analyze HTTP Live Streaming (HLS) content',
    icon: '📺',
    category: 'Streaming',
    section: 'Media',
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
  
  // Text Tools - Preview
  {
    path: '/text/markdown',
    title: 'Markdown Preview',
    description: 'Preview and convert Markdown to HTML with live rendering',
    icon: '📝',
    category: 'Preview',
    section: 'Text',
    keywords: ['markdown', 'preview', 'md', 'html', 'convert', 'render', 'github', 'gfm', 'flavored']
  },
  
  // DateTime Tools - Scheduling
  {
    path: '/datetime/cron-parser',
    title: 'Cron Expression Parser',
    description: 'Explain a cron schedule in plain English and preview the next runs',
    icon: '⏲️',
    category: 'Scheduling',
    section: 'DateTime',
    keywords: ['cron', 'crontab', 'schedule', 'cron parser', 'cron expression', 'cron generator', 'next run', 'scheduler', 'timezone', 'dst']
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
  'xml-escaper': '/code/xml-escaper',
  'json-escaper': '/code/json-escaper',
  'gzip': '/code/gzip',
  
  // Code Tools - Generators
  'password': '/code/password',
  'uuid': '/code/uuid',
  'hls': '/media/hls',
  'image': '/media/image-compress',
  'compress': '/media/image-compress',
  'resize': '/media/image-compress',
  
  // DateTime Tools
  'timestamp': '/datetime/timestamp',
  'timezone': '/datetime/timezone',
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
  'markdown': '/text/markdown',
  'md': '/text/markdown',
  'text': '/text/case-converter',
  
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
export const generateSubdomainUrl = (path, baseDomain = 'one-toys.com') => {
  const subdomain = Object.keys(subdomainRoutes).find(key => 
    subdomainRoutes[key] === path
  );
  
  if (subdomain) {
    return `https://${subdomain}.${baseDomain}`;
  }
  
  return `https://${baseDomain}${path}`;
};

export default allTools;
