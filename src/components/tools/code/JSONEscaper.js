'use client';

import React, { useState } from 'react';
import SimpleAd from '../../ads/SimpleAdSSG';
import CodeEditor from '../../common/CodeEditor';
import { useTheme } from '../../../contexts/ThemeContext';
import { downloadAsFile } from '../../../utils/downloadUtils';

const JSONEscaper = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('unescape');
  const { isDarkTheme } = useTheme();

  // JSON escape function
  const escapeJSON = (str) => {
    if (!str) return '';
    
    return JSON.stringify(str).slice(1, -1); // Use native JSON.stringify and remove surrounding quotes
  };

  // JSON unescape function
  const unescapeJSON = (str) => {
    if (!str) return '';
    
    try {
      // Try to parse as a JSON string (with quotes)
      if (str.startsWith('"') && str.endsWith('"')) {
        return JSON.parse(str);
      }
      
      // Otherwise, wrap in quotes and parse
      return JSON.parse('"' + str + '"');
    } catch (error) {
      // If JSON.parse fails, do manual unescaping
      // Unescape in the correct order: unicode first, then specific escapes, then backslash last
      return str
        .replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\b/g, '\b')
        .replace(/\\f/g, '\f')
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/\\\//g, '/')
        .replace(/\\\\/g, '\\');  // Backslash must be last
    }
  };

  const handleEscape = () => {
    try {
      const escaped = escapeJSON(input);
      setOutput(escaped);
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  const handleUnescape = () => {
    try {
      const unescaped = unescapeJSON(input);
      setOutput(unescaped);
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  const handleConvert = () => {
    if (mode === 'escape') {
      handleEscape();
    } else {
      handleUnescape();
    }
  };

  const handleDownload = () => {
    if (output) {
      downloadAsFile(output, 'json-escaped.txt', 'text/plain');
    }
  };

  // Remove every carriage return / line break together with the whitespace around it,
  // then strip any leading or trailing whitespace that remains.
  const flattenToSingleLine = (str) =>
    str.replace(/[^\S\r\n]*(?:\r\n|\r|\n)+[^\S\r\n]*/g, ' ').trim();

  // Escape mode: flatten the source, then escape it.
  // Unescape mode: flatten the restored result.
  const handleRemoveLineBreaks = () => {
    if (mode === 'escape') {
      if (!input) return;
      setOutput(escapeJSON(flattenToSingleLine(input)));
    } else {
      if (!output) return;
      setOutput(flattenToSingleLine(output));
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  const loadSample = () => {
    // A small, valid JSON document: the most common thing you want to embed as an escaped string.
    const jsonSample = `{
  "name": "One Toys",
  "description": "Escape \\"quotes\\", backslashes \\\\, tabs \\t and newlines \\n",
  "symbols": "→ ♥ ★ ☆ < > &",
  "tags": ["json", "escape", "text"]
}`;

    if (mode === 'escape') {
      setInput(jsonSample);
    } else {
      setInput(escapeJSON(jsonSample));
    }
    setOutput('');
  };

  return (
    <div className={`tool-container ${isDarkTheme ? 'dark-mode' : ''}`}>
      <div className="three-column-layout">
        {/* Input Column */}
        <div className="input-column">
          <div className="input-group">
            <label className="input-label">
              {mode === 'escape' ? 'Text to Escape' : 'JSON Escaped Text to Unescape'}
            </label>
            <CodeEditor
              value={input}
              onChange={setInput}
              language="json"
              placeholder={mode === 'escape' 
                ? 'Enter text with special characters to escape for JSON...' 
                : 'Enter JSON escaped text to unescape (e.g., \\"Hello\\", \\n, \\t)...'}
              name="json-input-editor"
              height="calc(100vh - 16rem)"
              isDarkTheme={false}
            />
          </div>
        </div>

        {/* Action Column */}
        <div className="action-column">
          <div className="mode-toggle">
            <div className="tab-group">
              <button
                className={`tab-btn ${mode === 'escape' ? 'active' : ''}`}
                onClick={() => setMode('escape')}
              >
                Escape
              </button>
              <button
                className={`tab-btn ${mode === 'unescape' ? 'active' : ''}`}
                onClick={() => setMode('unescape')}
              >
                Unescape
              </button>
            </div>
          </div>

          <div className="primary-actions">
            <button className="btn btn-primary" onClick={handleConvert}>
              {mode === 'escape' ? '🔒 Escape JSON' : '🔓 Unescape JSON'}
            </button>
          </div>

          <div className="secondary-actions">
            <button className="btn btn-outline" onClick={loadSample}>
              📄 Sample
            </button>
            <button className="btn btn-outline" onClick={handleClear}>
              🗑️ Clear
            </button>
            {(mode === 'escape' ? input : output) && (
              <button className="btn btn-outline" onClick={handleRemoveLineBreaks}>
                ⏎ Remove Line Breaks
              </button>
            )}
            {output && (
              <button className="btn btn-outline" onClick={handleDownload}>
                💾 Download
              </button>
            )}
          </div>
          
          <SimpleAd adSlot="7259870550" />
        </div>

        {/* Output Column */}
        <div className="output-column">
          <div className="input-group">
            <label className="input-label">
              Result
            </label>
            <CodeEditor
              value={output}
              onChange={() => {}} // Read-only
              language="json"
              placeholder="Escaped or unescaped text will appear here..."
              name="json-output-editor"
              height="calc(100vh - 16rem)"
              isDarkTheme={false}
              readOnly={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JSONEscaper;
