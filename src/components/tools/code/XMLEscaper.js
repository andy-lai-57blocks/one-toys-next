'use client';

import React, { useState } from 'react';
import SimpleAd from '../../ads/SimpleAdSSG';
import CodeEditor from '../../common/CodeEditor';
import { useTheme } from '../../../contexts/ThemeContext';
import { downloadAsFile } from '../../../utils/downloadUtils';

const XMLEscaper = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('unescape');
  const { isDarkTheme } = useTheme();

  // XML escape function
  const escapeXML = (str) => {
    if (!str) return '';
    
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  // XML unescape function
  const unescapeXML = (str) => {
    if (!str) return '';
    
    return str
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&'); // This should be last to avoid double-unescaping
  };

  const handleEscape = () => {
    try {
      const escaped = escapeXML(input);
      setOutput(escaped);
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  const handleUnescape = () => {
    try {
      const unescaped = unescapeXML(input);
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
      downloadAsFile(output, 'xml-escaped.txt', 'text/plain');
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  const loadSample = () => {
    if (mode === 'escape') {
      setInput(`<bookstore>
  <book category="cooking">
    <title lang="en">Everyday Italian & Recipes</title>
    <author>Giada De Laurentiis</author>
    <description>A collection of "simple" & delicious recipes</description>
    <price>$30.00</price>
  </book>
</bookstore>`);
    } else {
      setInput(`&lt;bookstore&gt;
  &lt;book category=&quot;cooking&quot;&gt;
    &lt;title lang=&quot;en&quot;&gt;Everyday Italian &amp; Recipes&lt;/title&gt;
    &lt;author&gt;Giada De Laurentiis&lt;/author&gt;
    &lt;description&gt;A collection of &quot;simple&quot; &amp; delicious recipes&lt;/description&gt;
    &lt;price&gt;$30.00&lt;/price&gt;
  &lt;/book&gt;
&lt;/bookstore&gt;`);
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
              {mode === 'escape' ? 'Text/XML to Escape' : 'XML Entities to Unescape'}
            </label>
            <CodeEditor
              value={input}
              onChange={setInput}
              language="xml"
              placeholder={mode === 'escape' 
                ? 'Enter text or XML content with special characters to escape...' 
                : 'Enter XML entities to unescape (e.g., &lt;tag&gt;, &quot;text&quot;)...'}
              name="xml-input-editor"
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
              {mode === 'escape' ? '🔒 Escape XML' : '🔓 Unescape XML'}
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
              <button className="btn btn-outline" onClick={handleDownload}>
                💾 Download
              </button>
            )}
          </div>
          
          <SimpleAd adSlot="7259870550" />
        </div>

        {/* Output Column */}
        <div className="output-column">
          <div className="output-group">
            <label className="output-label">
              Result
            </label>
            <CodeEditor
              value={output}
              onChange={() => {}} // Read-only
              language="xml"
              placeholder="Escaped or unescaped text will appear here..."
              name="xml-output-editor"
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

export default XMLEscaper;
