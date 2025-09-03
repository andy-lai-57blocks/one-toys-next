// Smart download utility for detecting file types and downloading content

/**
 * Detects file type based on content
 * @param {string} content - The content to analyze
 * @returns {Object} - Object containing mimeType, extension, and detected type
 */
export const detectFileType = (content) => {
  if (!content || typeof content !== 'string') {
    return { mimeType: 'text/plain', extension: 'txt', type: 'text' };
  }

  const trimmedContent = content.trim();
  
  // HTML detection
  if (trimmedContent.toLowerCase().includes('<!doctype html') || 
      trimmedContent.toLowerCase().startsWith('<html') ||
      trimmedContent.toLowerCase().startsWith('<div') || // Content starting with <div
      (trimmedContent.includes('<') && trimmedContent.includes('>') && 
       (trimmedContent.includes('<head>') || trimmedContent.includes('<body>') || trimmedContent.includes('<div>') || trimmedContent.includes('<html>')))) {
    return { mimeType: 'text/html', extension: 'html', type: 'HTML' };
  }

  // JSON detection
  try {
    JSON.parse(trimmedContent);
    if ((trimmedContent.startsWith('{') && trimmedContent.endsWith('}')) ||
        (trimmedContent.startsWith('[') && trimmedContent.endsWith(']'))) {
      return { mimeType: 'application/json', extension: 'json', type: 'JSON' };
    }
  } catch (e) {
    // Not JSON, continue checking
  }

  // XML detection
  if (trimmedContent.startsWith('<?xml') || 
      (trimmedContent.startsWith('<') && trimmedContent.includes('xmlns') && trimmedContent.endsWith('>'))) {
    return { mimeType: 'text/xml', extension: 'xml', type: 'XML' };
  }



  // CSS detection - treat as HTML for better browser compatibility
  if (trimmedContent.startsWith('/*') || // CSS comments
      trimmedContent.startsWith('@import') || trimmedContent.startsWith('@charset') || 
      trimmedContent.startsWith('@media') || trimmedContent.startsWith('@keyframes') ||
      /^[a-zA-Z.#*:_-]+.*{/.test(trimmedContent) || // CSS selector patterns
      /^\s*[a-zA-Z-]+\s*:\s*[^;]+;/.test(trimmedContent)) { // CSS property: value;
    return { mimeType: 'text/html', extension: 'html', type: 'HTML' };
  }

  // JavaScript detection - treat as HTML for better browser compatibility  
  if (trimmedContent.startsWith('//') || trimmedContent.startsWith('/*') || // JS comments
      trimmedContent.startsWith('import ') || trimmedContent.startsWith('export ') ||
      trimmedContent.startsWith('const ') || trimmedContent.startsWith('let ') || 
      trimmedContent.startsWith('var ') || trimmedContent.startsWith('function ') ||
      trimmedContent.startsWith('(function') || trimmedContent.startsWith('(() =>') ||
      trimmedContent.startsWith('"use strict"') || trimmedContent.startsWith("'use strict'") ||
      /^\s*class\s+\w+/.test(trimmedContent) || // class declarations
      /^\s*\w+\s*=\s*\(.*\)\s*=>/.test(trimmedContent)) { // arrow functions
    return { mimeType: 'text/html', extension: 'html', type: 'HTML' };
  }

  // SVG detection - must start with SVG tag
  if (trimmedContent.startsWith('<svg') && trimmedContent.includes('xmlns="http://www.w3.org/2000/svg"')) {
    return { mimeType: 'image/svg+xml', extension: 'svg', type: 'SVG' };
  }

  // Markdown detection - look for markdown-specific patterns at the beginning
  if (trimmedContent.startsWith('#') || trimmedContent.startsWith('## ') || // Headers
      trimmedContent.startsWith('---') || // YAML frontmatter
      trimmedContent.startsWith('# ') || // H1 header
      trimmedContent.startsWith('* ') || trimmedContent.startsWith('- ') || // Lists
      trimmedContent.startsWith('1. ') || // Numbered lists
      trimmedContent.startsWith('> ') || // Blockquotes
      trimmedContent.startsWith('```') || // Code blocks
      /^\*\*.*\*\*/.test(trimmedContent) || // Bold text at start
      /^_.*_/.test(trimmedContent)) { // Italic text at start
    return { mimeType: 'text/markdown', extension: 'md', type: 'Markdown' };
  }

  // Default to plain text
  return { mimeType: 'text/plain', extension: 'txt', type: 'Text' };
};

/**
 * Generates a filename based on content type and timestamp
 * @param {string} type - The detected file type
 * @param {string} extension - The file extension
 * @returns {string} - Generated filename
 */
export const generateFilename = (type, extension) => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
  const prefix = type.toLowerCase().replace(/\s+/g, '-');
  return `${prefix}-${timestamp}.${extension}`;
};

/**
 * Downloads content as a file
 * @param {string} content - The content to download
 * @param {string} filename - Optional custom filename
 * @param {string} mimeType - Optional custom MIME type
 */
export const downloadAsFile = (content, filename = null, mimeType = null) => {
  if (!content) {
    console.warn('No content to download');
    return false;
  }

  let fileInfo;
  if (filename && mimeType) {
    // Use provided filename and mimeType
    fileInfo = { mimeType, extension: filename.split('.').pop(), type: 'File' };
  } else {
    // Auto-detect file type
    fileInfo = detectFileType(content);
    filename = filename || generateFilename(fileInfo.type, fileInfo.extension);
  }

  try {
    // Create blob with detected MIME type
    const blob = new Blob([content], { type: fileInfo.mimeType });
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Download failed:', error);
    return false;
  }
};

/**
 * Gets user-friendly description for download
 * @param {string} content - The content to analyze
 * @returns {Object} - Object with type description and suggested action
 */
export const getDownloadInfo = (content) => {
  const fileInfo = detectFileType(content);
  
  const descriptions = {
    'HTML': 'Save as HTML file for viewing in browser',
    'JSON': 'Save as JSON file for data processing',
    'XML': 'Save as XML file for structured data',
    'SVG': 'Save as SVG file for vector graphics',
    'Markdown': 'Save as Markdown file for documentation',
    'Text': 'Save as text file'
  };

  return {
    type: fileInfo.type,
    extension: fileInfo.extension,
    description: descriptions[fileInfo.type] || 'Save as file',
    filename: generateFilename(fileInfo.type, fileInfo.extension)
  };
};
