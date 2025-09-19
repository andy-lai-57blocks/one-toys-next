'use client';

import React, { useState } from 'react';
import { downloadAsFile, getDownloadInfo } from '../../../utils/downloadUtils';
import SimpleAd from '../../ads/SimpleAdSSG';
import CodeEditor from '../../common/CodeEditor';
import { useTheme } from '../../../contexts/ThemeContext';

// Removed fallback themes - now using Ace Editor built-in themes

const HTMLTool = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('decode'); // 'encode' or 'decode'
  const { isDarkTheme } = useTheme();

  const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };

  const reverseHtmlEntities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#39;': "'",
    '&#x2F;': '/',
    '&#47;': '/'
  };

  const handleEncode = () => {
    try {
      let encoded = input;
      Object.keys(htmlEntities).forEach(char => {
        encoded = encoded.replace(new RegExp(char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), htmlEntities[char]);
      });
      setOutput(encoded);
    } catch (error) {
      setOutput('Error: Unable to encode the input text');
    }
  };

  const handleDecode = () => {
    try {
      let decoded = input;
      Object.keys(reverseHtmlEntities).forEach(entity => {
        decoded = decoded.replace(new RegExp(entity, 'g'), reverseHtmlEntities[entity]);
      });
      setOutput(decoded);
    } catch (error) {
      setOutput('Error: Unable to decode the input text');
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

  const loadSampleHTML = () => {
    const sampleHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sample HTML Document</title>
    <style>
        body { font-family: Arial, sans-serif; }
        .highlight { background-color: yellow; }
    </style>
</head>
<body>
    <header>
        <h1>Welcome to Our Website</h1>
        <nav>
            <a href="#home">Home</a> | 
            <a href="#about">About</a> | 
            <a href="#contact">Contact</a>
        </nav>
    </header>
    
    <main>
        <section id="home">
            <h2>Home Section</h2>
            <p>This is a <em>sample</em> paragraph with <strong>bold text</strong> and <span class="highlight">highlighted text</span>.</p>
            <ul>
                <li>First item</li>
                <li>Second item</li>
                <li>Third item</li>
            </ul>
        </section>
        
        <section id="about">
            <h2>About Us</h2>
            <p>We are a company that specializes in web development & design.</p>
            <img src="sample.jpg" alt="Sample Image" width="300" height="200">
        </section>
    </main>
    
    <footer>
        <p>&copy; 2024 Our Website. All rights reserved.</p>
    </footer>
</body>
</html>`;
    setInput(sampleHTML);
  };

  return (
    <div className={`tool-container ${isDarkTheme ? 'dark-mode' : ''}`}>
      <div className="three-column-layout">
        {/* Input Column */}
        <div className="input-column">
          <div className="input-group">
            <label className="input-label">
              {mode === 'encode' ? 'HTML/Text to Encode' : 'HTML Entities to Decode'}
            </label>
            <CodeEditor
              value={input}
              onChange={setInput}
              language="html"
              placeholder={mode === 'encode' ? 'Enter HTML or text to encode...' : 'Enter HTML entities to decode...'}
              name="html-input-editor"
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
            <button className="btn btn-outline" onClick={loadSampleHTML}>
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
            <label className="input-label">
              {mode === 'encode' ? 'Encoded Result' : 'Decoded Result'}
            </label>
            <CodeEditor
              value={output}
              onChange={() => {}} // Read-only
              language={mode === 'decode' ? 'html' : 'text'}
              readOnly={false}
              name="html-output-editor"
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

export default HTMLTool;
