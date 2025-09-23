'use client';

import React, { useState } from 'react';
// Removed unused SyntaxHighlighter imports - now using CodeEditor
import SimpleAd from '../../ads/SimpleAdSSG';
import CodeEditor from '../../common/CodeEditor';
import { useTheme } from '../../../contexts/ThemeContext';
import { downloadAsFile } from '../../../utils/downloadUtils';
import { unescapeForJSON } from '../../../utils/unescapeUtils';

// Removed fallback themes - now using Ace Editor built-in themes

const JSONFormatter = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isValid, setIsValid] = useState(null);
  const [autoUnescape, setAutoUnescape] = useState(true);
  const { isDarkTheme } = useTheme();

  // Helper function to prepare input for processing with enhanced unescaping
  const prepareInput = (rawInput) => {
    if (!autoUnescape || !rawInput) return rawInput;
    
    return unescapeForJSON(rawInput);
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

  const handleDownload = () => {
    if (!output) return;
    
    // Generate filename based on operation
    let filename = 'formatted-json';
    if (output.includes('✅ Valid JSON') || output.includes('❌ Invalid JSON')) {
      filename = 'json-validation';
    }
    
    downloadAsFile(output, `${filename}-${new Date().toISOString().slice(0, 10)}.json`);
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
            <label className="input-label">
              JSON Input
            </label>
            <CodeEditor
              value={input}
              onChange={setInput}
              language="json"
              placeholder="Paste your JSON here (supports JSON escapes, HTML entities, URL encoding, Unicode, etc.)..."
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
              title={autoUnescape ? 'Disable auto-unescape (JSON, HTML, URL, Unicode)' : 'Enable auto-unescape (JSON, HTML, URL, Unicode)'}
            >
              {autoUnescape ? '🔓 Smart Unescape' : '🔒 Manual'}
            </button>

            <button className="btn btn-outline" onClick={handleClear}>
              🗑️ Clear
            </button>
            {output && (
              <button className="btn btn-outline" onClick={handleDownload}>
                💾 Download
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
