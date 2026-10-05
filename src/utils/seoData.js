// SEO metadata for all pages and tools
export const seoData = {
  // Home page
  '/': {
    title: 'One Toys - Comprehensive Platform | Data Processing & Productivity Tools',
    description: 'Browser-based tools for code, text and dates, all running locally. Encoding, decoding, formatting, generation and text processing. Fast, private, and free.',
    keywords: 'base64 encoder, base64 decoder, base64 encode decode online, url encoder, url decoder, html encoder, html decoder, json formatter, json validator, json pretty, xml formatter, xml validator, xml pretty, gzip compression, password generator, uuid generator, lorem ipsum generator, text case converter, character counter, space remover, remove spaces from text, timestamp converter, unix timestamp, date formatter, date calculator, timezone converter, HLS player, m3u8 player, VAST validator, ad tag validator, text processing tools, developer tools, online tools, free web tools, productivity tools',
    type: 'website'
  },

  // Category pages
  '/code': {
    title: 'Code Tools - Encoders, Decoders & Formatters | One Toys',
    description: 'Professional code tools for developers. Base64, URL, HTML encoding/decoding, JSON/XML formatting, Gzip compression, UUID generation, and password creation. Free online developer tools.',
    keywords: 'base64 encoder, base64 decoder, url encoder, url decoder, html encoder, html decoder, json formatter, json validator, xml formatter, xml validator, gzip compression, gzip decompression, vast formatter, hls play',
    type: 'website'
  },

  '/text': {
    title: 'Text Tools - Processing & Analysis | One Toys',
    description: 'Powerful text processing tools. Case converter, character counter, Lorem Ipsum generator. Transform, analyze, and generate text content efficiently. Free online text utilities.',
    keywords: 'text tools, case converter, character counter, lorem ipsum generator, text processing, text analysis, string manipulation, text transformation',
    type: 'website'
  },

  '/datetime': {
    title: 'DateTime Tools - Time & Date Utilities | One Toys',
    description: 'Comprehensive date and time tools. Timestamp converter, date formatter, date calculator, timezone converter, and cron expression parser. Handle all your time-related tasks efficiently.',
    keywords: 'datetime tools, timestamp converter, unix timestamp, date formatter, date calculator, timezone converter, cron parser, world clock, time tools',
    type: 'website'
  },

  '/media': {
    title: 'Media Tools - Image Compressor & HLS Player | One Toys',
    description: 'Compress and resize images, and play or inspect HLS streams, entirely in your browser. Nothing you open is uploaded, so your files never leave your device.',
    keywords: 'media tools, image compressor, compress image, image optimizer, hls player, m3u8 player, http live streaming, video streaming tools',
    type: 'website'
  },

  // Code Tools
  '/code/jwt-decoder': {
    title: 'JWT Decoder — Decode & Verify JSON Web Tokens | One Toys',
    description: 'Decode JSON Web Tokens locally and see the header, payload, claims and expiry in plain English. Get security warnings (alg=none, missing exp, long lifetimes) and verify HS256/RS256 signatures in your browser. Your token is never uploaded.',
    keywords: 'jwt decoder, decode jwt, jwt parser, jwt viewer, json web token decoder, verify jwt signature, jwt expiration checker, check jwt online, jwt claims, jwks, hs256, rs256',
    type: 'tool'
  },

  '/code/base64': {
    title: 'Base64 Encoder/Decoder Online - Free Tool | One Toys',
    description: 'Free online Base64 encoder and decoder. Convert text to Base64 and decode Base64 strings instantly. Supports file download, syntax highlighting. No registration required.',
    keywords: 'base64 encoder, base64 decoder, encode base64, decode base64, base64 online, base64 converter, base64 tool, free base64',
    type: 'tool'
  },

  '/code/json': {
    title: 'JSON Formatter & Validator - Pretty Print JSON | One Toys',
    description: 'Professional JSON formatter and validator with syntax highlighting. Pretty print, minify, and validate JSON data. Dark/light mode support. Free online JSON tool.',
    keywords: 'json formatter, json validator, json pretty print, json minify, json beautifier, json parser, validate json, format json',
    type: 'tool'
  },

  '/code/json-fixer': {
    title: 'JSON Fixer — Repair Broken JSON Locally | One Toys',
    description: 'Fix invalid JSON instantly: strip code fences, remove comments and trailing commas, convert single quotes, and recover JSON from surrounding prose. Runs entirely in your browser — nothing is uploaded.',
    keywords: 'json fixer, fix json, repair json, invalid json, broken json, json comments, trailing comma, jsonc, ndjson, fix llm json output, clean up json',
    type: 'tool'
  },

  '/code/url': {
    title: 'URL Encoder/Decoder Online - Free Tool | One Toys',
    description: 'Free URL encoder and decoder tool. Encode URLs for safe transmission and decode URL-encoded strings. Supports file download and batch processing.',
    keywords: 'url encoder, url decoder, url encode online, url decode, percent encoding, uri encoder, uri decoder, url escaping',
    type: 'tool'
  },

  '/code/html': {
    title: 'HTML Encoder/Decoder - Entity Converter | One Toys',
    description: 'HTML entity encoder and decoder with syntax highlighting. Convert HTML entities, escape/unescape HTML characters. Perfect for web developers.',
    keywords: 'html encoder, html decoder, html entities, html escape, html unescape, entity encoder, html character encoder',
    type: 'tool'
  },

  '/code/xml': {
    title: 'XML Formatter & Validator - Pretty Print XML | One Toys',
    description: 'Professional XML formatter and validator. Pretty print, minify XML data with syntax highlighting. Validate XML structure. Free online XML tool.',
    keywords: 'xml formatter, xml validator, xml pretty print, xml minify, xml beautifier, format xml, validate xml',
    type: 'tool'
  },

  '/code/gzip': {
    title: 'Gzip Compression Tool - Compress & Decompress | One Toys',
    description: 'Free Gzip compression and decompression tool. Compress text data to reduce size, decompress gzipped content. Base64 encoding support.',
    keywords: 'gzip compression, gzip decompression, compress text, decompress gzip, text compression, file compression, gzip tool',
    type: 'tool'
  },

  '/media/hls': {
    title: 'HLS Stream Player & Analyzer - HTTP Live Streaming | One Toys',
    description: 'Professional HLS stream player and analyzer. Play HTTP Live Streaming content, analyze stream quality, view adaptive bitrate levels. Supports live and on-demand streams.',
    keywords: 'hls play, hls player, http live streaming, hls stream analyzer, m3u8 player, adaptive streaming, live streaming, video streaming, hls tool',
    type: 'tool'
  },

  '/media/image-compress': {
    title: 'Image Compressor - Shrink JPEG, PNG & WebP Locally | One Toys',
    description: 'Compress and resize images in your browser. Choose the quality and output format, see the exact size saving, then download. Your images are never uploaded to a server.',
    keywords: 'image compressor, compress image, image compression online, reduce image size, resize image, jpeg compressor, webp converter, compress png, shrink photo, image optimizer',
    type: 'tool'
  },

  '/code/vast': {
    title: 'VAST Formatter - Format Video Ad XML | One Toys',
    description: 'Professional VAST (Video Ad Serving Template) formatter and validator. Pretty print, minify, and validate VAST XML for video advertising. Supports VAST 2.0, 3.0, and 4.0.',
    keywords: 'vast formatter, vast validator, video ad xml, vast xml formatter, video advertising, ad serving template, vast pretty print, format vast',
    type: 'tool'
  },

  '/code/uuid': {
    title: 'UUID Generator - Version 4 & Version 1 | One Toys',
    description: 'Generate unique UUIDs (Universally Unique Identifiers) online. Support for UUID v4 (random) and UUID v1 (timestamp). Bulk generation available.',
    keywords: 'uuid generator, generate uuid, uuid v4, uuid v1, unique id generator, guid generator, universally unique identifier',
    type: 'tool'
  },

  '/code/password': {
    title: 'Password Generator - Strong & Secure Passwords | One Toys',
    description: 'Generate strong, secure passwords online. Customizable length, character sets (uppercase, lowercase, numbers, symbols). Bulk password generation.',
    keywords: 'password generator, strong password, secure password, random password, generate password, password creator, secure password generator',
    type: 'tool'
  },

  // Text Tools
  '/text/case-converter': {
    title: 'Case Converter - Text Transformation Tool | One Toys',
    description: 'Convert text between different cases: uppercase, lowercase, title case, camelCase, snake_case, kebab-case, and more. Free online case converter.',
    keywords: 'case converter, text case, uppercase, lowercase, title case, camelCase, snake_case, kebab-case, text transformation',
    type: 'tool'
  },

  '/text/character-count': {
    title: 'Character Counter - Text Analysis Tool | One Toys',
    description: 'Count characters, words, paragraphs, and lines in your text. Real-time text analysis with detailed statistics. Perfect for writers and content creators.',
    keywords: 'character counter, word counter, text counter, character count, word count, text statistics, text analysis',
    type: 'tool'
  },

  '/text/lorem': {
    title: 'Lorem Ipsum Generator - Placeholder Text | One Toys',
    description: 'Generate Lorem Ipsum placeholder text for design and development. Customizable paragraphs, words, and sentences. Classic and modern variants.',
    keywords: 'lorem ipsum generator, placeholder text, dummy text, lorem ipsum, sample text, filler text, placeholder content',
    type: 'tool'
  },

  '/text/markdown': {
    title: 'Markdown Preview - Live MD to HTML Converter | One Toys',
    description: 'Free online Markdown preview and converter. Live rendering with GitHub Flavored Markdown support. Convert Markdown to HTML instantly with syntax highlighting.',
    keywords: 'markdown preview, markdown to html, md preview, markdown converter, github flavored markdown, gfm, markdown editor, live preview, markdown renderer',
    type: 'tool'
  },

  '/text/space-remover': {
    title: 'Space Remover - Remove Extra Spaces from Text | One Toys',
    description: 'Remove, replace, or normalize spaces and whitespace in text. Clean up extra spaces, tabs, and line breaks efficiently.',
    keywords: 'space remover, remove spaces, whitespace remover, trim spaces, normalize spaces, clean text, text processing',
    type: 'tool'
  },

  // DateTime Tools
  '/datetime/cron-parser': {
    title: 'Cron Expression Parser — Explain & Preview Schedules | One Toys',
    description: 'Parse any cron expression into plain English and see the next 10 run times in your own time zone, with correct daylight-saving handling. Supports 5-field crontab and 6-field schedules with seconds. Runs entirely in your browser.',
    keywords: 'cron parser, cron expression, crontab generator, cron schedule, cron next run, cron explained, cron translator, crontab syntax, cron timezone, cron dst',
    type: 'tool'
  },

  '/datetime/timestamp': {
    title: 'Timestamp Converter - Unix Timestamp Tool | One Toys',
    description: 'Convert Unix timestamps to human-readable dates and vice versa. Support for milliseconds, different timezones, and multiple date formats.',
    keywords: 'timestamp converter, unix timestamp, epoch converter, timestamp to date, date to timestamp, unix time converter',
    type: 'tool'
  },

  '/datetime/format': {
    title: 'Date Formatter - Format Dates & Times | One Toys',
    description: 'Format dates and times in various formats. ISO 8601, locale-specific formats, custom patterns. Perfect for developers and data processing.',
    keywords: 'date formatter, time formatter, date format, time format, iso 8601, date formatting, custom date format',
    type: 'tool'
  },

  '/datetime/calculator': {
    title: 'Date Calculator - Add/Subtract Dates | One Toys',
    description: 'Calculate dates by adding or subtracting time periods. Find differences between dates, add days/months/years, and perform date arithmetic.',
    keywords: 'date calculator, date arithmetic, add days, subtract days, date difference, calculate dates, date math',
    type: 'tool'
  },

  '/datetime/timezone': {
    title: 'Timezone Converter - World Clock | One Toys',
    description: 'Convert time between different timezones. World clock with major cities, timezone abbreviations, and daylight saving time support.',
    keywords: 'timezone converter, world clock, time zones, timezone conversion, world time, international time, timezone tool',
    type: 'tool'
  }
};

// Get SEO data for a specific path
export const getSEOData = (path) => {
  // Remove trailing slash and query parameters
  const cleanPath = path.replace(/\/$/, '') || '/';
  return seoData[cleanPath] || seoData['/'];
};

// Generate breadcrumb data
export const getBreadcrumbs = (path) => {
  const segments = path.split('/').filter(Boolean);
  const breadcrumbs = [{ label: 'Home', path: '/' }];

  if (segments.length > 0) {
    const category = segments[0];
    const categoryLabels = {
      'code': 'Code Tools',
      'text': 'Text Tools', 
      'datetime': 'DateTime Tools',
      'media': 'Media Tools'
    };

    if (categoryLabels[category]) {
      breadcrumbs.push({
        label: categoryLabels[category],
        path: `/${category}`
      });

      if (segments.length > 1) {
        const tool = segments[1];
        const seoInfo = getSEOData(path);
        const toolName = seoInfo.title.split(' - ')[0] || tool;
        breadcrumbs.push({
          label: toolName,
          path: path
        });
      }
    }
  }

  return breadcrumbs;
};
