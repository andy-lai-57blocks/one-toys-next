/**
 * Comprehensive unescaping utilities for various encoding scenarios
 * Supports JSON, XML, HTML, URL, Unicode, Hexadecimal, and more
 */

/**
 * Detects if a string contains JSON-style escape sequences
 */
export const hasJSONEscapes = (str) => {
  if (!str || typeof str !== 'string') return false;
  
  return /\\["\\/bfnrtv]|\\u[0-9a-fA-F]{4}|\\x[0-9a-fA-F]{2}/.test(str);
};

/**
 * Detects if a string contains HTML/XML entities
 */
export const hasHTMLEntities = (str) => {
  if (!str || typeof str !== 'string') return false;
  
  return /&(?:[a-zA-Z][a-zA-Z0-9]*|#(?:\d+|x[0-9a-fA-F]+));/.test(str);
};

/**
 * Detects if a string is URL encoded
 */
export const hasURLEncoding = (str) => {
  if (!str || typeof str !== 'string') return false;
  
  return /%[0-9a-fA-F]{2}/.test(str);
};

/**
 * Detects if a string contains Unicode escape sequences
 */
export const hasUnicodeEscapes = (str) => {
  if (!str || typeof str !== 'string') return false;
  
  return /\\u[0-9a-fA-F]{4}|\\U[0-9a-fA-F]{8}/.test(str);
};

/**
 * Detects if a string is Base64 encoded (basic heuristic)
 */
export const looksLikeBase64 = (str) => {
  if (!str || typeof str !== 'string' || str.length < 4) return false;
  
  // Base64 pattern: groups of 4 characters from base64 alphabet, optional padding
  const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
  const hasValidLength = str.length % 4 === 0;
  
  return base64Pattern.test(str) && hasValidLength && str.length > 20;
};

/**
 * Comprehensive JSON unescaping with enhanced support for malformed JSON
 */
export const unescapeJSON = (str) => {
  if (!str || typeof str !== 'string') return str;
  
  try {
    let content = str.trim();
    
    // Handle wrapped quotes
    if ((content.startsWith('"') && content.endsWith('"')) ||
        (content.startsWith("'") && content.endsWith("'"))) {
      content = content.slice(1, -1);
    }
    
    // Pre-process to fix common malformed JSON escape sequences
    content = content
      // Fix invalid escapes that cause JSON.parse to fail
      .replace(/\\&/g, '&')           // Invalid escaped ampersands (common in URLs)
      .replace(/\\%/g, '%')           // Invalid escaped percent signs
      .replace(/\\#/g, '#')           // Invalid escaped hash symbols
      .replace(/\\=/g, '=')           // Invalid escaped equals signs
      .replace(/\\@/g, '@')           // Invalid escaped at symbols
      .replace(/\\!/g, '!')           // Invalid escaped exclamation marks
      .replace(/\\\?/g, '?')          // Invalid escaped question marks
      .replace(/\\;/g, ';')           // Invalid escaped semicolons
      .replace(/\\:/g, ':')           // Invalid escaped colons (sometimes over-escaped)
      .replace(/\\,/g, ',')           // Invalid escaped commas
      .replace(/\\\|/g, '|')          // Invalid escaped pipes
      .replace(/\\\$/g, '$');         // Invalid escaped dollar signs
    
    // Try JSON.parse first for proper handling
    try {
      return JSON.parse(`"${content}"`);
    } catch {
      // Manual unescaping with comprehensive support
      return content
        // Standard JSON escapes
        .replace(/\\"/g, '"')           // Escaped quotes
        .replace(/\\'/g, "'")           // Escaped single quotes
        .replace(/\\\//g, '/')          // Escaped forward slashes
        .replace(/\\\\/g, '\\')         // Escaped backslashes
        .replace(/\\n/g, '\n')          // Newlines
        .replace(/\\r/g, '\r')          // Carriage returns
        .replace(/\\t/g, '\t')          // Tabs
        .replace(/\\f/g, '\f')          // Form feeds
        .replace(/\\b/g, '\b')          // Backspaces
        .replace(/\\v/g, '\v')          // Vertical tabs
        .replace(/\\0/g, '\0')          // Null characters
        
        // Unicode escapes (\uXXXX)
        .replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => 
          String.fromCharCode(parseInt(hex, 16)))
        
        // Extended Unicode escapes (\UXXXXXXXX) - JavaScript doesn't support natively
        .replace(/\\U([0-9a-fA-F]{8})/g, (match, hex) => {
          const codePoint = parseInt(hex, 16);
          return codePoint > 0xFFFF 
            ? String.fromCodePoint(codePoint)
            : String.fromCharCode(codePoint);
        })
        
        // Hexadecimal escapes (\xXX)
        .replace(/\\x([0-9a-fA-F]{2})/g, (match, hex) => 
          String.fromCharCode(parseInt(hex, 16)))
        
        // Octal escapes (\oXX or \XXX) - limited support
        .replace(/\\([0-7]{1,3})/g, (match, octal) => 
          String.fromCharCode(parseInt(octal, 8)));
    }
  } catch {
    return str;
  }
};

/**
 * Comprehensive HTML/XML entity unescaping
 */
export const unescapeHTML = (str) => {
  if (!str || typeof str !== 'string') return str;
  
  // HTML entities map (extended)
  const htmlEntities = {
    '&amp;': '&',     '&lt;': '<',      '&gt;': '>',
    '&quot;': '"',    '&apos;': "'",    '&nbsp;': '\u00A0',
    '&copy;': '\u00A9',    '&reg;': '\u00AE',     '&trade;': '\u2122',
    '&hellip;': '\u2026',  '&mdash;': '\u2014',   '&ndash;': '\u2013',
    '&lsquo;': '\u2018',   '&rsquo;': '\u2019',   '&ldquo;': '\u201C',
    '&rdquo;': '\u201D',   '&bull;': '\u2022',    '&euro;': '\u20AC',
    '&pound;': '\u00A3',   '&yen;': '\u00A5',     '&cent;': '\u00A2'
  };
  
  return str
    // Named entities
    .replace(/&([a-zA-Z][a-zA-Z0-9]*);/g, (match, entity) => 
      htmlEntities[match] || match)
    
    // Numeric entities (decimal)
    .replace(/&#(\d+);/g, (match, num) => 
      String.fromCharCode(parseInt(num, 10)))
    
    // Numeric entities (hexadecimal)
    .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => 
      String.fromCharCode(parseInt(hex, 16)));
};

/**
 * URL decoding with enhanced support
 */
export const unescapeURL = (str) => {
  if (!str || typeof str !== 'string') return str;
  
  try {
    // Use built-in decodeURIComponent but with error handling
    return decodeURIComponent(str);
  } catch {
    // Manual URL decoding for malformed URLs
    return str.replace(/%([0-9a-fA-F]{2})/g, (match, hex) => 
      String.fromCharCode(parseInt(hex, 16)));
  }
};

/**
 * Base64 decoding
 */
export const unescapeBase64 = (str) => {
  if (!str || typeof str !== 'string') return str;
  
  try {
    // Use built-in atob but with error handling
    return atob(str);
  } catch {
    return str; // Return original if not valid Base64
  }
};

/**
 * Detects what type of escaping a string might have
 */
export const detectEscapeType = (str) => {
  if (!str || typeof str !== 'string') return [];
  
  const types = [];
  
  if (hasJSONEscapes(str)) types.push('json');
  if (hasHTMLEntities(str)) types.push('html');
  if (hasURLEncoding(str)) types.push('url');
  if (hasUnicodeEscapes(str)) types.push('unicode');
  if (looksLikeBase64(str)) types.push('base64');
  
  return types;
};

/**
 * Smart comprehensive unescaping that tries multiple methods
 */
export const smartUnescape = (str) => {
  if (!str || typeof str !== 'string') return str;
  
  const escapeTypes = detectEscapeType(str);
  let result = str;
  
  // Apply unescaping in order of likelihood and compatibility
  if (escapeTypes.includes('json')) {
    result = unescapeJSON(result);
  }
  
  if (escapeTypes.includes('html')) {
    result = unescapeHTML(result);
  }
  
  if (escapeTypes.includes('url')) {
    result = unescapeURL(result);
  }
  
  if (escapeTypes.includes('base64') && result === str) {
    // Only try Base64 if nothing else worked
    const base64Result = unescapeBase64(result);
    if (base64Result !== result) {
      result = base64Result;
    }
  }
  
  return result;
};

/**
 * Pre-process malformed JSON to fix invalid escape sequences
 */
export const fixMalformedJSON = (str) => {
  if (!str || typeof str !== 'string') return str;
  
  // Fix invalid JSON escape sequences that cause parsing to fail
  return str
    // Fix invalid single-character escapes (most common)
    .replace(/\\&/g, '&')           // Invalid escaped ampersands
    .replace(/\\%/g, '%')           // Invalid escaped percent signs  
    .replace(/\\#/g, '#')           // Invalid escaped hash symbols
    .replace(/\\=/g, '=')           // Invalid escaped equals signs
    .replace(/\\@/g, '@')           // Invalid escaped at symbols
    .replace(/\\!/g, '!')           // Invalid escaped exclamation marks
    .replace(/\\\?/g, '?')          // Invalid escaped question marks
    .replace(/\\;/g, ';')           // Invalid escaped semicolons
    .replace(/\\:/g, ':')           // Invalid escaped colons  
    .replace(/\\,/g, ',')           // Invalid escaped commas
    .replace(/\\\|/g, '|')          // Invalid escaped pipes
    .replace(/\\\$/g, '$')          // Invalid escaped dollar signs
    .replace(/\\</g, '<')           // Invalid escaped less-than
    .replace(/\\>/g, '>')           // Invalid escaped greater-than
    .replace(/\\\+/g, '+')          // Invalid escaped plus signs
    .replace(/\\-/g, '-')           // Invalid escaped minus signs
    .replace(/\\\*/g, '*')          // Invalid escaped asterisks
    .replace(/\\\(/g, '(')          // Invalid escaped parentheses
    .replace(/\\\)/g, ')')          // Invalid escaped parentheses
    .replace(/\\\[/g, '[')          // Invalid escaped brackets
    .replace(/\\\]/g, ']')          // Invalid escaped brackets
    .replace(/\\\{/g, '{')          // Invalid escaped braces (unless part of valid JSON)
    .replace(/\\\}/g, '}')          // Invalid escaped braces (unless part of valid JSON)
    .replace(/\\\~/g, '~')          // Invalid escaped tildes
    .replace(/\\\^/g, '^')          // Invalid escaped carets
    .replace(/\\`/g, '`')           // Invalid escaped backticks
    // Keep valid JSON escapes: \", \\, \/, \b, \f, \n, \r, \t, \uXXXX
    ;
};

/**
 * Specific unescapers for different formats
 */
export const unescapeForJSON = (str) => {
  if (!str) return str;
  
  // First fix malformed JSON escape sequences
  let result = fixMalformedJSON(str);
  
  // Then apply normal JSON unescaping
  result = unescapeJSON(result);
  
  // Finally handle any HTML entities
  if (hasHTMLEntities(result)) {
    result = unescapeHTML(result);
  }
  
  return result;
};

export const unescapeForXML = (str) => {
  if (!str) return str;
  
  // For XML, prioritize HTML entities, then JSON escaping
  let result = unescapeHTML(str);
  if (hasJSONEscapes(result)) {
    result = unescapeJSON(result);
  }
  
  return result;
};

export const unescapeForVAST = (str) => {
  if (!str) return str;
  
  // VAST can have multiple layers of escaping
  let result = str;
  
  // Try JSON unescaping first (common in VAST URLs)
  if (hasJSONEscapes(result)) {
    result = unescapeJSON(result);
  }
  
  // Then HTML entities (XML-based format)
  if (hasHTMLEntities(result)) {
    result = unescapeHTML(result);
  }
  
  // Finally URL decoding (for tracking URLs)
  if (hasURLEncoding(result)) {
    result = unescapeURL(result);
  }
  
  return result;
};

/**
 * Get escape type information for display
 */
export const getEscapeInfo = (str) => {
  if (!str || typeof str !== 'string') {
    return { types: [], description: 'No escaping detected' };
  }
  
  const types = detectEscapeType(str);
  
  if (types.length === 0) {
    return { types: [], description: 'No escaping detected' };
  }
  
  const descriptions = {
    json: 'JSON escape sequences (\\n, \\", \\u0000)',
    html: 'HTML/XML entities (&amp;, &lt;, &#123;)',
    url: 'URL encoding (%20, %3A)',
    unicode: 'Unicode escapes (\\u0000, \\U00000000)',
    base64: 'Base64 encoding'
  };
  
  const typeNames = types.map(type => descriptions[type]).join(', ');
  
  return {
    types,
    description: `Detected: ${typeNames}`,
    count: types.length
  };
};
