'use client';

import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import SimpleAd from '../../ads/SimpleAdSSG';
import CodeEditor from '../../common/CodeEditor';
import { downloadAsFile } from '../../../utils/downloadUtils';

const MarkdownPreview = () => {
  const [input, setInput] = useState('');
  const [htmlOutput, setHtmlOutput] = useState('');

  // Configure marked options
  useEffect(() => {
    marked.setOptions({
      breaks: true,
      gfm: true, // GitHub Flavored Markdown
      headerIds: true,
      mangle: false,
      sanitize: false
    });
  }, []);

  // Convert markdown to HTML whenever input changes
  useEffect(() => {
    if (input.trim()) {
      try {
        const html = marked.parse(input);
        setHtmlOutput(html);
      } catch (error) {
        setHtmlOutput(`<div style="color: red;">Error parsing markdown: ${error.message}</div>`);
      }
    } else {
      setHtmlOutput('');
    }
  }, [input]);

  const handleClear = () => {
    setInput('');
  };

  const handleCopyHTML = async () => {
    try {
      await navigator.clipboard.writeText(htmlOutput);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = htmlOutput;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const handleDownloadHTML = () => {
    if (htmlOutput) {
      downloadAsFile(htmlOutput, 'markdown-output.html', 'text/html');
    }
  };

  const handleDownloadMarkdown = () => {
    if (input) {
      downloadAsFile(input, 'markdown-source.md', 'text/markdown');
    }
  };

  const loadSample = () => {
    const sampleMarkdown = `# Markdown Preview Tool

## Features

This is a **powerful** markdown preview tool that supports:

- **Bold** and *italic* text
- [Links](https://example.com)
- \`Inline code\`
- Lists (ordered and unordered)

### Code Blocks

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### Tables

| Feature | Supported |
|---------|-----------|
| Headers | ✓ |
| Lists | ✓ |
| Code | ✓ |
| Tables | ✓ |

### Blockquotes

> This is a blockquote.
> It can span multiple lines.

### Task Lists

- [x] Create markdown preview
- [x] Add syntax highlighting
- [ ] Add more features

---

**Try editing the markdown on the left to see the live preview!**
`;
    setInput(sampleMarkdown);
  };

  return (
    <div className="tool-container markdown-preview-tool">
      <div className="three-column-layout">
        {/* Input Column */}
        <div className="input-column">
          <div className="input-group">
            <div className="input-header">
              <label className="input-label">Markdown Input</label>
              {input && (
                <span className="language-indicator">
                  📊 {input.length} characters
                </span>
              )}
            </div>
            <CodeEditor
              value={input}
              onChange={setInput}
              language="markdown"
              placeholder="# Enter your markdown here...

## Supports GitHub Flavored Markdown

- Lists
- **Bold** and *italic*
- [Links](https://example.com)
- Code blocks
- Tables
- And more!"
              name="markdown-input-editor"
              height="calc(100vh - 16rem)"
            />
          </div>
        </div>

        {/* Action Column */}
        <div className="action-column">
          <div className="primary-actions">
            <div className="current-mode-info">
              <div className="mode-name">📝 Markdown Preview</div>
              <div className="mode-category">GitHub Flavored Markdown</div>
            </div>
          </div>

          <div className="secondary-actions">
            <button className="btn btn-outline" onClick={loadSample}>
              📄 Load Sample
            </button>
            <button className="btn btn-outline" onClick={handleClear}>
              🗑️ Clear
            </button>
            {htmlOutput && (
              <>
                <button className="btn btn-outline" onClick={handleCopyHTML}>
                  📋 Copy HTML
                </button>
                <button 
                  className="btn btn-outline" 
                  onClick={handleDownloadHTML}
                  title="Download as HTML file"
                >
                  💾 Download HTML
                </button>
                <button 
                  className="btn btn-outline" 
                  onClick={handleDownloadMarkdown}
                  title="Download as Markdown file"
                >
                  📥 Download MD
                </button>
              </>
            )}
          </div>
          
          <SimpleAd />
        </div>

        {/* Output Column - Preview */}
        <div className="output-column">
          <div className="input-group">
            <div className="input-header">
              <label className="input-label">HTML Preview</label>
              {htmlOutput && (
                <span className="language-indicator">
                  👁️ Live Preview
                </span>
              )}
            </div>
            <div 
              className="markdown-preview-output"
              dangerouslySetInnerHTML={{ __html: htmlOutput || '<p class="preview-placeholder">Preview will appear here...</p>' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownPreview;

