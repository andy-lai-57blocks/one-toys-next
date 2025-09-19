'use client';

import React, { useState } from 'react';
import { downloadAsFile, getDownloadInfo } from '../../../utils/downloadUtils';
import SimpleAd from '../../ads/SimpleAdSSG';
import CodeEditor from '../../common/CodeEditor';


// Removed fallback themes - now using Ace Editor built-in themes

const Base64Tool = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('decode'); // 'encode' or 'decode'

  // Enhanced auto-detect language based on content
  const detectLanguage = (content) => {
    if (!content || !content.trim()) return 'text';
    
    const trimmed = content.trim();
    const lines = trimmed.split('\n');
    const firstLine = lines[0] || '';
    const contentLower = trimmed.toLowerCase();
    
    // Shebang detection
    if (firstLine.startsWith('#!')) {
      if (firstLine.includes('bash') || firstLine.includes('sh')) return 'sh';
      if (firstLine.includes('python')) return 'python';
      if (firstLine.includes('node')) return 'javascript';
      if (firstLine.includes('php')) return 'php';
      if (firstLine.includes('ruby')) return 'ruby';
    }
    
    // JSON detection (more robust)
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
        (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        JSON.parse(trimmed);
        return 'json';
      } catch (e) {
        // Could be JavaScript object literal
        if (trimmed.includes('function') || trimmed.includes('=>')) return 'javascript';
      }
    }
    
    // XML/HTML detection (more specific)
    if (trimmed.startsWith('<') && trimmed.includes('>')) {
      if (trimmed.includes('<!DOCTYPE html') || trimmed.includes('<html') || 
          trimmed.includes('<head>') || trimmed.includes('<body>')) return 'html';
      if (trimmed.includes('<?xml') || trimmed.includes('<root>') || 
          trimmed.includes('<xml>')) return 'xml';
      return 'xml'; // Default for other XML-like content
    }
    
    // CSS detection
    if (trimmed.includes('{') && trimmed.includes('}') && 
        (trimmed.includes('color:') || trimmed.includes('margin:') || 
         trimmed.includes('padding:') || trimmed.includes('font-') ||
         contentLower.includes('background') || contentLower.includes('border'))) {
      return 'css';
    }
    
    // YAML detection (improved)
    if (trimmed.includes(':') && 
        (trimmed.includes('\n') || trimmed.includes('- ')) &&
        !trimmed.includes('{') && !trimmed.includes('(')) {
      return 'yaml';
    }
    
    // SQL detection (case insensitive)
    if (contentLower.includes('select ') || contentLower.includes('insert ') || 
        contentLower.includes('update ') || contentLower.includes('delete ') ||
        contentLower.includes('create table') || contentLower.includes('alter table') ||
        contentLower.includes('drop table')) {
      return 'sql';
    }
    
    // Programming language patterns (order matters for accuracy)
    
    // TypeScript (check before JavaScript)
    if (trimmed.includes('interface ') || trimmed.includes('type ') ||
        trimmed.includes(': string') || trimmed.includes(': number') ||
        trimmed.includes(': boolean') || trimmed.includes('extends ') ||
        trimmed.includes('implements ')) return 'typescript';
    
    // JavaScript
    if (trimmed.includes('function ') || trimmed.includes('=>') || 
        trimmed.includes('console.log') || trimmed.includes('document.') ||
        trimmed.includes('window.') || trimmed.includes('var ') ||
        trimmed.includes('let ') || trimmed.includes('const ')) return 'javascript';
    
    // Python
    if (trimmed.includes('def ') || (trimmed.includes('import ') && trimmed.includes('from ')) ||
        trimmed.includes('print(') || trimmed.includes('if __name__') ||
        trimmed.includes('class ') && trimmed.includes(':')) return 'python';
    
    // Java
    if (trimmed.includes('public class ') || trimmed.includes('System.out.println') ||
        trimmed.includes('public static void main') || trimmed.includes('package ') ||
        trimmed.includes('import java.')) return 'java';
    
    // C/C++
    if (trimmed.includes('#include') || trimmed.includes('int main(') ||
        trimmed.includes('printf(') || trimmed.includes('cout <<') ||
        trimmed.includes('std::')) return 'c_cpp';
    
    // PHP
    if (trimmed.includes('<?php') || (trimmed.includes('$') && 
        (trimmed.includes('echo ') || trimmed.includes('function ')))) return 'php';
    
    // Ruby  
    if ((trimmed.includes('def ') && (trimmed.includes('end') || trimmed.includes('puts'))) ||
        trimmed.includes('class ') && trimmed.includes('end') ||
        trimmed.includes('require ')) return 'ruby';
    
    // Shell/Bash
    if (trimmed.includes('#!/bin/bash') || trimmed.includes('#!/bin/sh') ||
        trimmed.includes('echo ') || trimmed.includes('export ') ||
        (trimmed.includes('$') && trimmed.includes('='))) return 'sh';
    
    // Markdown
    if (trimmed.includes('# ') || trimmed.includes('## ') || 
        trimmed.includes('```') || trimmed.includes('![') ||
        trimmed.includes('[') && trimmed.includes('](')) return 'markdown';
    
    return 'text';
  };

  // Get language display name for UI
  const getLanguageDisplayName = (langCode) => {
    const languageNames = {
      'text': 'Plain Text',
      'json': 'JSON',
      'xml': 'XML',
      'yaml': 'YAML',
      'html': 'HTML',
      'css': 'CSS',
      'javascript': 'JavaScript',
      'typescript': 'TypeScript',
      'python': 'Python',
      'java': 'Java',
      'c_cpp': 'C/C++',
      'php': 'PHP',
      'ruby': 'Ruby',
      'sql': 'SQL',
      'markdown': 'Markdown',
      'sh': 'Shell/Bash'
    };
    return languageNames[langCode] || 'Plain Text';
  };

  // Content formatting functions
  const formatJSON = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return jsonString;
    }
  };

  const formatHTML = (htmlString) => {
    // Simple HTML formatting - add proper indentation
    let formatted = htmlString;
    let indent = 0;
    const tab = '  ';
    
    formatted = formatted.replace(/></g, '>\n<');
    
    const lines = formatted.split('\n');
    const formattedLines = lines.map(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return '';
      
      if (trimmedLine.match(/<\/\w+>/)) {
        indent = Math.max(0, indent - 1);
      }
      
      const result = tab.repeat(indent) + trimmedLine;
      
      if (trimmedLine.match(/<\w+(?:\s[^>]*)?>/) && !trimmedLine.match(/<\/\w+>/)) {
        if (!trimmedLine.match(/\/>/)) {
          indent++;
        }
      }
      
      return result;
    });
    
    return formattedLines.join('\n');
  };

  const handleEncode = () => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(input)));
      setOutput(encoded);
    } catch (error) {
      setOutput('Error: Unable to encode the input text');
    }
  };

  const handleDecode = () => {
    try {
      const decoded = decodeURIComponent(escape(atob(input)));
      const detectedLang = detectLanguage(decoded);
      
      let formattedOutput = decoded;
      if (detectedLang === 'json') {
        formattedOutput = formatJSON(decoded);
      } else if (detectedLang === 'html') {
        formattedOutput = formatHTML(decoded);
      }
      
      setOutput(formattedOutput);
    } catch (error) {
      setOutput('Error: Invalid Base64 input');
    }
  };

  const handleConvert = () => {
    if (mode === 'encode') {
      handleEncode();
    } else {
      handleDecode();
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      // You could add a toast notification here
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = output;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const handleDownload = () => {
    const success = downloadAsFile(output);
    if (!success) {
      console.error('Failed to download file');
    }
  };

  const loadSample = () => {
    if (mode === 'encode') {
      // Rotate through different sample types to showcase different languages
      const samples = [
        '{\n  "name": "Sample Data",\n  "version": "1.0.0",\n  "description": "This is sample JSON for Base64 encoding",\n  "data": {\n    "items": ["apple", "banana", "cherry"],\n    "count": 3,\n    "active": true\n  }\n}',
        'function greetUser(name) {\n  const message = `Hello, $\{name}!`;\n  console.log(message);\n  return message;\n}\n\n// Sample usage\ngreetUser("World");\ngreetUser("Developer");',
        'def greet_user(name):\n    """Greet a user with their name"""\n    message = f"Hello, {name}!"\n    print(message)\n    return message\n\n# Sample usage\ngreet_user("World")\ngreet_user("Developer")',
        '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Sample HTML</title>\n</head>\n<body>\n  <h1>Hello World!</h1>\n  <p>This is sample HTML content for Base64 encoding.</p>\n</body>\n</html>',
        '/* Sample CSS for Base64 encoding */\n.container {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 20px;\n}\n\n.card {\n  background: white;\n  border-radius: 8px;\n  box-shadow: 0 2px 4px rgba(0,0,0,0.1);\n  padding: 16px;\n}'
      ];
      
      // Use current timestamp to rotate samples
      const sampleIndex = Math.floor(Date.now() / 10000) % samples.length;
      setInput(samples[sampleIndex]);
    } else {
      // For decode mode, provide pre-encoded samples that will showcase different languages
      const encodedSamples = [
        'ewogICJuYW1lIjogIkpvaG4gRG9lIiwKICAiZW1haWwiOiAiam9obkBleGFtcGxlLmNvbSIsCiAgImFnZSI6IDMwLAogICJpc0FjdGl2ZSI6IHRydWUsCiAgImhvYmJpZXMiOiBbInJlYWRpbmciLCAiY29kaW5nIiwgInRyYXZlbGluZyJdCn0=', // JSON
        'ZnVuY3Rpb24gaGVsbG9Xb3JsZCgpIHsKICBjb25zb2xlLmxvZygiSGVsbG8sIFdvcmxkISIpOwogIHJldHVybiAiSGVsbG8sIFdvcmxkISI7Cn0KCi8vIENhbGwgdGhlIGZ1bmN0aW9uCmhlbGxvV29ybGQoKTs=', // JavaScript
        'ZGVmIGhlbGxvX3dvcmxkKCk6CiAgICBwcmludCgiSGVsbG8sIFdvcmxkISIpCiAgICByZXR1cm4gIkhlbGxvLCBXb3JsZCEiCgojIENhbGwgdGhlIGZ1bmN0aW9uCmhlbGxvX3dvcmxkKCk=', // Python
        'PCFET0NUWVBFIGh0bWw+CjxodG1sIGxhbmc9ImVuIj4KPGhlYWQ+CiAgPG1ldGEgY2hhcnNldD0iVVRGLTgiPgogIDx0aXRsZT5TYW1wbGUgUGFnZTwvdGl0bGU+CjwvaGVhZD4KPGJvZHk+CiAgPGgxPkhlbGxvLCBXb3JsZCE8L2gxPgogIDxwPlRoaXMgaXMgYSBzYW1wbGUgSFRNTCBkb2N1bWVudC48L3A+CjwvYm9keT4KPC9odG1sPg==', // HTML
        'LyogU2FtcGxlIENTUyBmb3IgQmFzZTY0IGRlY29kaW5nICovCi5jb250YWluZXIgewogIG1heC13aWR0aDogMTIwMHB4OwogIG1hcmdpbjogMCBhdXRvOwogIHBhZGRpbmc6IDIwcHg7Cn0KCi5jYXJkIHsKICBiYWNrZ3JvdW5kOiB3aGl0ZTsKICBib3JkZXItcmFkaXVzOiA4cHg7CiAgYm94LXNoYWRvdzogMCAycHggNHB4IHJnYmEoMCwwLDAsMC4xKTsKICBwYWRkaW5nOiAxNnB4Owp9' // CSS
      ];
      
      // Use current timestamp to rotate encoded samples
      const sampleIndex = Math.floor(Date.now() / 10000) % encodedSamples.length;
      setInput(encodedSamples[sampleIndex]);
    }
  };

  return (
    <div className="tool-container">
      <div className="three-column-layout">
        {/* Input Column */}
        <div className="input-column">
          <div className="input-group">
            <div className="input-header">
              <label className="input-label">
                {mode === 'encode' ? 'Text to Encode' : 'Base64 to Decode'}
              </label>
              {mode === 'encode' && input && (
                <span className="language-indicator">
                  🎯 Detected: {getLanguageDisplayName(detectLanguage(input))}
                </span>
              )}
            </div>
            <CodeEditor
              value={input}
              onChange={setInput}
              language={mode === 'encode' ? detectLanguage(input) : 'text'}
              placeholder={mode === 'encode' ? 'Enter code or text to encode...' : 'Enter Base64 to decode...'}
              name="base64-input-editor"
              height="calc(100vh - 16rem)"
            />
          </div>
        </div>

        {/* Action Column */}
        <div className="action-column">
          <div className="mode-toggle">
            <div className="tab-group">
              <button
                className={`tab-btn ${mode === 'encode' ? 'active' : ''}`}
                onClick={() => setMode('encode')}
              >
                Encode
              </button>
              <button
                className={`tab-btn ${mode === 'decode' ? 'active' : ''}`}
                onClick={() => setMode('decode')}
              >
                Decode
              </button>
            </div>
          </div>

          <div className="primary-actions">
            <button className="btn btn-primary" onClick={handleConvert}>
              {mode === 'encode' ? '🔒 Encode' : '🔓 Decode'}
            </button>
          </div>

          <div className="secondary-actions">
            <button className="btn btn-outline" onClick={loadSample}>
              📄 Sample
            </button>
            <button className="btn btn-outline" onClick={handleClear}>
              🗑️ Clear
            </button>

            {output && (
              <>
                <button className="btn btn-outline" onClick={handleCopy}>
                  📋 Copy
                </button>
                {mode === 'decode' && (
                  <button 
                    className="btn btn-outline" 
                    onClick={handleDownload}
                    title={getDownloadInfo(output).description}
                  >
                    📥 Download as {getDownloadInfo(output).type}
                  </button>
                )}
              </>
            )}
          </div>
          
          <SimpleAd />
        </div>

        {/* Output Column */}
        <div className="output-column">
          <div className="input-group">
            <div className="input-header">
              <label className="input-label">
                {mode === 'encode' ? 'Encoded Result' : 'Decoded Result'}
              </label>
              {mode === 'decode' && output && (
                <span className="language-indicator">
                  🎯 Detected: {getLanguageDisplayName(detectLanguage(output))}
                </span>
              )}
            </div>
            <CodeEditor
              value={output}
              onChange={() => {}} // Read-only
              language={mode === 'decode' ? detectLanguage(output) : 'text'}
              readOnly={false}
              name="base64-output-editor"
              height="calc(100vh - 16rem)"
              showLineNumbers={true}
              placeholder="Result will appear here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Base64Tool;
