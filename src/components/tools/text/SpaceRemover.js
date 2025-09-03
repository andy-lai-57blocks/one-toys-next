'use client';

import React, { useState, useMemo } from 'react';
import SimpleAd from '../../ads/SimpleAdSSG';
import CodeEditor from '../../common/CodeEditor';

const SpaceRemover = () => {
  const [input, setInput] = useState('');
  const [selectedMode, setSelectedMode] = useState('removeAllWhitespace'); // Currently selected removal mode

  // Calculate all space removal variations in real-time
  const results = useMemo(() => {
    if (!input) {
      return {
        removeAll: '',
        removeLeading: '',
        removeTrailing: '',
        trim: '',
        removeExtra: '',
        removeLineBreaks: '',
        replaceWithUnderscore: '',
        replaceWithDash: '',
        keepLettersNumbers: '',
        removeAllWhitespace: ''
      };
    }

    return {
      // Remove all spaces
      removeAll: input.replace(/ /g, ''),
      
      // Remove leading spaces from each line
      removeLeading: input.replace(/^ +/gm, ''),
      
      // Remove trailing spaces from each line
      removeTrailing: input.replace(/ +$/gm, ''),
      
      // Trim leading and trailing spaces from each line
      trim: input.split('\n').map(line => line.trim()).join('\n'),
      
      // Remove extra spaces (multiple consecutive spaces become single)
      removeExtra: input.replace(/ +/g, ' '),
      
      // Remove line breaks and normalize spaces
      removeLineBreaks: input.replace(/\s+/g, ' ').trim(),
      
      // Replace spaces with underscores
      replaceWithUnderscore: input.replace(/ /g, '_'),
      
      // Replace spaces with dashes
      replaceWithDash: input.replace(/ /g, '-'),
      
      // Keep only letters, numbers, and single spaces
      keepLettersNumbers: input.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ +/g, ' ').trim(),
      
      // Remove all whitespace (spaces, tabs, newlines, etc.)
      removeAllWhitespace: input.replace(/\s/g, '')
    };
  }, [input]);

  const handleClear = () => {
    setInput('');
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const loadSampleText = () => {
    setInput('   Hello    World   \n\n  This  is   a  sample   text   \n   with   extra    spaces    ');
  };

  // Available space removal options
  const spaceTypes = [
    { 
      key: 'removeAllWhitespace', 
      label: 'Remove All Whitespace', 
      description: 'Remove spaces, tabs, line breaks, and all whitespace',
      category: 'Remove'
    },
    { 
      key: 'removeAll', 
      label: 'Remove All Spaces', 
      description: 'Remove every single space character',
      category: 'Remove'
    },
    { 
      key: 'removeLeading', 
      label: 'Remove Leading Spaces', 
      description: 'Remove spaces at the beginning of each line',
      category: 'Remove'
    },
    { 
      key: 'removeTrailing', 
      label: 'Remove Trailing Spaces', 
      description: 'Remove spaces at the end of each line',
      category: 'Remove'
    },
    { 
      key: 'trim', 
      label: 'Trim (Both Ends)', 
      description: 'Remove spaces from start and end of each line',
      category: 'Remove'
    },
    { 
      key: 'removeExtra', 
      label: 'Remove Extra Spaces', 
      description: 'Convert multiple consecutive spaces to single spaces',
      category: 'Normalize'
    },
    { 
      key: 'removeLineBreaks', 
      label: 'Remove Line Breaks', 
      description: 'Convert all text to single line with normalized spacing',
      category: 'Normalize'
    },
    { 
      key: 'replaceWithUnderscore', 
      label: 'Replace with Underscore', 
      description: 'Replace all spaces with underscore characters',
      category: 'Replace'
    },
    { 
      key: 'replaceWithDash', 
      label: 'Replace with Dash', 
      description: 'Replace all spaces with dash characters',
      category: 'Replace'
    }
  ];

  // Get current output based on selected mode
  const currentOutput = results[selectedMode] || '';

  // Get current mode info
  const currentModeInfo = spaceTypes.find(type => type.key === selectedMode);

  return (
    <div className="tool-container space-remover-tool">
      <div className="three-column-layout">
        {/* Input Column */}
        <div className="input-column">
          <div className="input-group">
            <div className="input-header">
              <label className="input-label">Input Text</label>
              {input && (
                <span className="language-indicator">
                  📊 Length: {input.length} characters
                </span>
              )}
            </div>
            <CodeEditor
              value={input}
              onChange={setInput}
              language="text"
              placeholder="Enter text with spaces to process..."
              name="space-remover-input-editor"
              height="calc(100vh - 16rem)"
            />
          </div>
        </div>

        {/* Action Column */}
        <div className="action-column">
          <div className="mode-selector">
            <label className="input-label">🚫 Space Removal Mode</label>
            <select 
              className="mode-select"
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
            >
              {spaceTypes.map(type => (
                <option key={type.key} value={type.key}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="primary-actions">
            <div className="current-mode-info">
              <div className="mode-name">{currentModeInfo?.label}</div>
              <div className="mode-category">Category: {currentModeInfo?.category}</div>
            </div>
          </div>

          <div className="secondary-actions">
            <button className="btn btn-outline" onClick={loadSampleText}>
              📄 Load Sample
            </button>
            <button className="btn btn-outline" onClick={handleClear}>
              🗑️ Clear
            </button>
            {currentOutput && (
              <button className="btn btn-outline" onClick={() => handleCopy(currentOutput)}>
                📋 Copy Result
              </button>
            )}
          </div>
          
          <SimpleAd />
        </div>

        {/* Output Column */}
        <div className="output-column">
          <div className="input-group">
            <div className="input-header">
              <label className="input-label">Processed Result</label>
              {currentOutput && (
                <span className="language-indicator">
                  📊 Length: {currentOutput.length} characters
                </span>
              )}
            </div>
            <CodeEditor
              value={currentOutput}
              onChange={() => {}} // Read-only
              language="text"
              readOnly={true}
              name="space-remover-output-editor"
              height="calc(100vh - 16rem)"
              showLineNumbers={true}
              placeholder="Processed text will appear here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpaceRemover;
