'use client';

import React, { useState } from 'react';
// Removed unused SyntaxHighlighter imports - now using CodeEditor
import SimpleAd from '../../ads/SimpleAdSSG';
import CodeEditor from '../../common/CodeEditor';
import { useTheme } from '../../../contexts/ThemeContext';

// Removed fallback themes - now using Ace Editor built-in themes

const JSONFormatter = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isValid, setIsValid] = useState(null);
  const [autoUnescape, setAutoUnescape] = useState(true);
  const { isDarkTheme } = useTheme();

  // Helper function to detect if input appears to be escaped JSON
  const isEscapedJSON = (str) => {
    if (!str || str.length < 2) return false;
    const trimmed = str.trim();
    
    // Check for common JSON escape patterns
    const hasEscapedQuotes = trimmed.includes('\\"');
    const hasEscapedSlashes = trimmed.includes('\\/');
    const hasEscapedNewlines = trimmed.includes('\\n') || trimmed.includes('\\r') || trimmed.includes('\\t');
    const hasEscapedBackslashes = trimmed.includes('\\\\');
    
    // If wrapped in quotes, check for escape patterns
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || 
        (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
      return hasEscapedQuotes || hasEscapedSlashes || hasEscapedNewlines || hasEscapedBackslashes;
    }
    
    // Even without outer quotes, check if content has escaped JSON patterns and looks like JSON
    if ((trimmed.startsWith('{\\"') || trimmed.startsWith('[\\"')) && 
        (hasEscapedQuotes || hasEscapedSlashes || hasEscapedNewlines)) {
      return true;
    }
    
    return false;
  };

  // Helper function to unescape JSON string
  const unescapeJSON = (str) => {
    try {
      let content = str.trim();
      
      // If wrapped in quotes, remove them first
      if ((content.startsWith('"') && content.endsWith('"')) ||
          (content.startsWith("'") && content.endsWith("'"))) {
        content = content.slice(1, -1);
      }
      
      // Use JSON.parse with a wrapper to handle most escape sequences properly
      try {
        return JSON.parse(`"${content}"`);
      } catch (e) {
        // If JSON.parse fails, do manual unescaping
        return content
          .replace(/\\"/g, '"')        // Escaped quotes
          .replace(/\\'/g, "'")        // Escaped single quotes
          .replace(/\\\//g, '/')       // Escaped forward slashes
          .replace(/\\\\/g, '\\')      // Escaped backslashes
          .replace(/\\n/g, '\n')       // Escaped newlines
          .replace(/\\r/g, '\r')       // Escaped carriage returns
          .replace(/\\t/g, '\t')       // Escaped tabs
          .replace(/\\f/g, '\f')       // Escaped form feeds
          .replace(/\\b/g, '\b');      // Escaped backspaces
      }
    } catch (error) {
      // If unescaping fails, return original string
      return str;
    }
  };

  // Helper function to prepare input for processing
  const prepareInput = (rawInput) => {
    if (!autoUnescape || !rawInput) return rawInput;
    
    if (isEscapedJSON(rawInput)) {
      return unescapeJSON(rawInput);
    }
    return rawInput;
  };


  const formatJSON = () => {
    try {
      const processedInput = prepareInput(input);
      const parsed = JSON.parse(processedInput);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setIsValid(true);
    } catch (error) {
      setOutput(`Error: ${error.message}`);
      setIsValid(false);
    }
  };

  const minifyJSON = () => {
    try {
      const processedInput = prepareInput(input);
      const parsed = JSON.parse(processedInput);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setIsValid(true);
    } catch (error) {
      setOutput(`Error: ${error.message}`);
      setIsValid(false);
    }
  };

  const validateJSON = () => {
    try {
      const processedInput = prepareInput(input);
      JSON.parse(processedInput);
      setOutput('✅ Valid JSON');
      setIsValid(true);
    } catch (error) {
      setOutput(`❌ Invalid JSON: ${error.message}`);
      setIsValid(false);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setIsValid(null);
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

  const loadSampleJSON = () => {
    const sampleJSON = {
      "name": "John Doe",
      "age": 30,
      "city": "New York",
      "hobbies": ["reading", "swimming", "coding"],
      "address": {
        "street": "123 Main St",
        "zipCode": "10001"
      },
      "isActive": true
    };
    setInput(JSON.stringify(sampleJSON));
  };

  return (
    <div className={`tool-container ${isDarkTheme ? 'dark-mode' : ''}`}>
      <div className="three-column-layout">
        {/* Input Column */}
        <div className="input-column">
          <div className="input-group">
            <label className="input-label">JSON Input</label>
            <CodeEditor
              value={input}
              onChange={setInput}
              language="json"
              placeholder="Paste your JSON here..."
              name="json-input-editor"
              height="calc(100vh - 16rem)"
              isDarkTheme={false}
            />
          </div>
        </div>

        {/* Action Column */}
        <div className="action-column">
          <div className="primary-actions">
            <button className="btn btn-primary" onClick={formatJSON}>
              ✨ Format
            </button>
            <button className="btn btn-outline" onClick={minifyJSON}>
              🗜️ Minify
            </button>
            <button className="btn btn-primary" onClick={validateJSON}>
              ✅ Validate
            </button>
          </div>

          <div className="secondary-actions">
            <button className="btn btn-outline" onClick={loadSampleJSON}>
              📄 Sample
            </button>
            <button 
              className="btn btn-outline" 
              onClick={() => setAutoUnescape(!autoUnescape)}
              title={autoUnescape ? 'Disable auto-unescape' : 'Enable auto-unescape'}
            >
              {autoUnescape ? '🔓 Auto-Unescape' : '🔒 Manual'}
            </button>

            <button className="btn btn-outline" onClick={handleClear}>
              🗑️ Clear
            </button>
            {output && (
              <button className="btn btn-outline" onClick={handleCopy}>
                📋 Copy Result
              </button>
            )}
          </div>
          
          <SimpleAd />
        </div>

        {/* Output Column */}
        <div className="output-column">
          <div className="input-group">
            <label className="input-label">
              Result
              {isValid === true && <span className="status-indicator valid">✅ Valid</span>}
              {isValid === false && <span className="status-indicator invalid">❌ Invalid</span>}
            </label>
            <CodeEditor
              value={output}
              onChange={() => {}} // Read-only
              language="json"
              readOnly={false}
              name="json-output-editor"
              height="calc(100vh - 16rem)"

              showLineNumbers={true}
              placeholder="Formatted JSON will appear here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JSONFormatter;
