'use client';

import React, { useState, useEffect } from 'react';
import SimpleAd from '../../ads/SimpleAdSSG';
import CodeEditor from '../../common/CodeEditor';
import { downloadAsFile } from '../../../utils/downloadUtils';

const CaseConverter = () => {
  const [input, setInput] = useState('');
  const [selectedCase, setSelectedCase] = useState('lowercase');
  const [results, setResults] = useState({
    lowercase: '',
    uppercase: '',
    titleCase: '',
    camelCase: '',
    pascalCase: '',
    snakeCase: '',
    kebabCase: '',
    constantCase: ''
  });

  const toTitleCase = (str) => {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  };

  const toCamelCase = (str) => {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      )
      .replace(/\s+/g, '');
  };

  const toPascalCase = (str) => {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
      .replace(/\s+/g, '');
  };

  const toSnakeCase = (str) => {
    return str
      .replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map(word => word.toLowerCase())
      .join('_');
  };

  const toKebabCase = (str) => {
    return str
      .replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map(word => word.toLowerCase())
      .join('-');
  };

  const toConstantCase = (str) => {
    return str
      .replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map(word => word.toUpperCase())
      .join('_');
  };

  useEffect(() => {
    if (input.trim()) {
      setResults({
        lowercase: input.toLowerCase(),
        uppercase: input.toUpperCase(),
        titleCase: toTitleCase(input),
        camelCase: toCamelCase(input),
        pascalCase: toPascalCase(input),
        snakeCase: toSnakeCase(input),
        kebabCase: toKebabCase(input),
        constantCase: toConstantCase(input)
      });
    } else {
      setResults({
        lowercase: '',
        uppercase: '',
        titleCase: '',
        camelCase: '',
        pascalCase: '',
        snakeCase: '',
        kebabCase: '',
        constantCase: ''
      });
    }
  }, [input]);

  const handleClear = () => {
    setInput('');
  };

  const handleCopy = async () => {
    const outputText = results[selectedCase];
    try {
      await navigator.clipboard.writeText(outputText);
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = outputText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const handleDownload = () => {
    const outputText = results[selectedCase];
    const success = downloadAsFile(outputText);
    if (!success) {
      console.error('Failed to download file');
    }
  };

  const loadSampleText = () => {
    const samples = [
      'Hello World Example Text',
      'The Quick Brown Fox Jumps Over The Lazy Dog',
      'JavaScriptIsAwesome',
      'convert_this_snake_case',
      'Convert-This-Kebab-Case',
      'CONVERT_THIS_CONSTANT_CASE'
    ];
    const sampleIndex = Math.floor(Date.now() / 10000) % samples.length;
    setInput(samples[sampleIndex]);
  };

  const caseTypes = [
    { key: 'lowercase', label: 'lowercase', description: 'all lowercase letters' },
    { key: 'uppercase', label: 'UPPERCASE', description: 'all uppercase letters' },
    { key: 'titleCase', label: 'Title Case', description: 'first letter of each word capitalized' },
    { key: 'camelCase', label: 'camelCase', description: 'first word lowercase, subsequent words capitalized' },
    { key: 'pascalCase', label: 'PascalCase', description: 'all words capitalized, no spaces' },
    { key: 'snakeCase', label: 'snake_case', description: 'words separated by underscores' },
    { key: 'kebabCase', label: 'kebab-case', description: 'words separated by hyphens' },
    { key: 'constantCase', label: 'CONSTANT_CASE', description: 'uppercase with underscores' }
  ];

  const currentOutput = results[selectedCase] || '';
  const currentCaseInfo = caseTypes.find(type => type.key === selectedCase);

  return (
    <div className="tool-container case-converter-tool">
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
              placeholder="Enter text to convert between different cases..."
              name="case-converter-input-editor"
              height="calc(100vh - 16rem)"
            />
          </div>
        </div>

        {/* Action Column */}
        <div className="action-column">
          <div className="mode-selector">
            <label className="input-label">🔤 Case Conversion Type</label>
            <select 
              className="mode-select"
              value={selectedCase}
              onChange={(e) => setSelectedCase(e.target.value)}
            >
              {caseTypes.map(type => (
                <option key={type.key} value={type.key}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="primary-actions">
            <div className="current-mode-info">
              <div className="mode-name">{currentCaseInfo?.label}</div>
              <div className="mode-category">Example: {currentCaseInfo?.description}</div>
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
              <>
                <button className="btn btn-outline" onClick={handleCopy}>
                  📋 Copy Result
                </button>
                <button 
                  className="btn btn-outline" 
                  onClick={handleDownload}
                  title="Download converted text as file"
                >
                  📥 Download as TXT
                </button>
              </>
            )}
          </div>
          
          <SimpleAd />
        </div>

        {/* Output Column */}
        <div className="output-column">
          <div className="input-group">
            <div className="input-header">
              <label className="input-label">Converted Result</label>
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
              readOnly={false}
              name="case-converter-output-editor"
              height="calc(100vh - 16rem)"
              showLineNumbers={true}
              placeholder="Converted text will appear here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseConverter;
