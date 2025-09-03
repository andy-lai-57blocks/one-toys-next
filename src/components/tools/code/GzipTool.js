'use client';

import React, { useState } from 'react';
import * as pako from 'pako';
import { downloadAsFile, getDownloadInfo } from '../../../utils/downloadUtils';
import SimpleAd from '../../ads/SimpleAdSSG';
import CodeEditor from '../../common/CodeEditor';

const GzipTool = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('decompress'); // 'compress' or 'decompress'

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

  const handleCompress = () => {
    try {
      if (!input.trim()) {
        setOutput('');
        return;
      }
      // Compress the input string and encode as base64
      const compressed = pako.gzip(input);
      const result = btoa(String.fromCharCode.apply(null, compressed));
      setOutput(result);
    } catch (error) {
      setOutput('Error: Unable to compress the input text');
    }
  };

  const handleDecompress = () => {
    try {
      if (!input.trim()) {
        setOutput('');
        return;
      }
      // Decompress from base64
      const binaryString = atob(input);
      const compressed = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        compressed[i] = binaryString.charCodeAt(i);
      }
      const decompressed = pako.ungzip(compressed, { to: 'string' });
      setOutput(decompressed);
    } catch (error) {
      setOutput('Error: Unable to decompress the input data');
    }
  };

  const handleConvert = () => {
    if (mode === 'compress') {
      handleCompress();
    } else {
      handleDecompress();
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch (error) {
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
    if (mode === 'compress') {
      // Rotate through different sample types to showcase different languages
      const samples = [
        '{\n  "name": "Sample Data",\n  "version": "1.0.0",\n  "description": "This is sample JSON for compression",\n  "data": {\n    "items": ["apple", "banana", "cherry"],\n    "count": 3,\n    "active": true\n  }\n}',
        'function greetUser(name) {\n  const message = `Hello, ${name}!`;\n  console.log(message);\n  return message;\n}\n\n// Sample usage\ngreetUser("World");\ngreetUser("Developer");',
        'def greet_user(name):\n    """Greet a user with their name"""\n    message = f"Hello, {name}!"\n    print(message)\n    return message\n\n# Sample usage\ngreet_user("World")\ngreet_user("Developer")',
        '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Sample HTML</title>\n</head>\n<body>\n  <h1>Hello World!</h1>\n  <p>This is sample HTML content for compression.</p>\n</body>\n</html>',
        '/* Sample CSS for compression */\n.container {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 20px;\n}\n\n.card {\n  background: white;\n  border-radius: 8px;\n  box-shadow: 0 2px 4px rgba(0,0,0,0.1);\n  padding: 16px;\n}'
      ];
      
      // Use current timestamp to rotate samples
      const sampleIndex = Math.floor(Date.now() / 10000) % samples.length;
      setInput(samples[sampleIndex]);
    } else {
      setInput('H4sIAAAAAAAA/ytJLS4BAAx+f9gNAAAA'); // "Hello World!" compressed
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
                {mode === 'compress' ? 'Text to Compress' : 'Gzip Data to Decompress'}
              </label>
              {mode === 'compress' && input && (
                <span className="language-indicator">
                  🎯 Detected: {getLanguageDisplayName(detectLanguage(input))}
                </span>
              )}
            </div>
            <CodeEditor
              value={input}
              onChange={setInput}
              language={mode === 'compress' ? detectLanguage(input) : 'text'}
              placeholder={mode === 'compress' ? 'Enter code or text to compress...' : 'Paste base64 compressed data here...'}
              name="gzip-input-editor"
              height="calc(100vh - 16rem)"
            />
          </div>
        </div>

        {/* Action Column */}
        <div className="action-column">
          <div className="mode-toggle">
            <div className="tab-group">
              <button
                className={`tab-btn ${mode === 'compress' ? 'active' : ''}`}
                onClick={() => setMode('compress')}
              >
                Compress
              </button>
              <button
                className={`tab-btn ${mode === 'decompress' ? 'active' : ''}`}
                onClick={() => setMode('decompress')}
              >
                Decompress
              </button>
            </div>
          </div>



          <div className="primary-actions">
            <button className="btn btn-primary" onClick={handleConvert}>
              {mode === 'compress' ? '🗜️ Compress' : '📂 Decompress'}
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
                {mode === 'decompress' && (
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
                {mode === 'compress' ? 'Compressed Result' : 'Decompressed Result'}
              </label>
              {mode === 'decompress' && output && (
                <span className="language-indicator">
                  🎯 Detected: {getLanguageDisplayName(detectLanguage(output))}
                </span>
              )}
            </div>
            <CodeEditor
              value={output}
              onChange={() => {}} // Read-only
              language={mode === 'decompress' ? detectLanguage(output) : 'text'}
              readOnly={true}
              name="gzip-output-editor"
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

export default GzipTool;
