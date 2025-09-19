'use client';

import React, { useState } from 'react';
import SimpleAd from '../../ads/SimpleAdSSG';
import CodeEditor from '../../common/CodeEditor';
import { downloadAsFile } from '../../../utils/downloadUtils';

const LoremGenerator = () => {
  const [output, setOutput] = useState('');
  const [type, setType] = useState('paragraphs');
  const [count, setCount] = useState(3);

  const loremWords = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'at', 'vero', 'eos',
    'accusamus', 'iusto', 'odio', 'dignissimos', 'ducimus', 'blanditiis',
    'praesentium', 'voluptatum', 'deleniti', 'atque', 'corrupti', 'quos', 'dolores',
    'quas', 'molestias', 'excepturi', 'occaecati', 'cupiditate', 'similique', 'eleifend',
    'tellus', 'integer', 'feugiat', 'scelerisque', 'varius', 'morbi', 'enim', 'nunc',
    'faucibus', 'vitae', 'aliquet', 'nec', 'ullamcorper', 'mattis', 'pellentesque',
    'habitant', 'tristique', 'senectus', 'netus', 'malesuada', 'fames', 'turpis',
    'egestas', 'maecenas', 'pharetra', 'convallis', 'posuere', 'morbi', 'leo'
  ];

  const generateSentence = () => {
    const sentenceLength = Math.floor(Math.random() * 15) + 5; // 5-20 words
    const sentence = [];
    
    for (let i = 0; i < sentenceLength; i++) {
      const word = loremWords[Math.floor(Math.random() * loremWords.length)];
      sentence.push(i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word);
    }
    
    return sentence.join(' ') + '.';
  };

  const generateParagraph = () => {
    const sentenceCount = Math.floor(Math.random() * 6) + 3; // 3-8 sentences
    const sentences = [];
    
    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(generateSentence());
    }
    
    return sentences.join(' ');
  };

  const generateWords = (wordCount) => {
    const words = [];
    for (let i = 0; i < wordCount; i++) {
      words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
    }
    return words.join(' ');
  };

  const generateLorem = () => {
    let result = '';
    
    switch (type) {
      case 'words':
        result = generateWords(count);
        break;
      case 'sentences':
        const sentences = [];
        for (let i = 0; i < count; i++) {
          sentences.push(generateSentence());
        }
        result = sentences.join(' ');
        break;
      case 'paragraphs':
        const paragraphs = [];
        for (let i = 0; i < count; i++) {
          paragraphs.push(generateParagraph());
        }
        result = paragraphs.join('\n\n');
        break;
    }
    
    setOutput(result);
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

  const handleClear = () => {
    setOutput('');
  };

  const getTypeDisplayName = () => {
    switch(type) {
      case 'words': return 'Words';
      case 'sentences': return 'Sentences';
      case 'paragraphs': return 'Paragraphs';
      default: return 'Paragraphs';
    }
  };

  const maxCount = type === 'words' ? 100 : type === 'sentences' ? 20 : 10;

  return (
    <div className="tool-container lorem-generator-tool">
      <div className="three-column-layout">
        {/* Input Column */}
        <div className="input-column">
          <div className="input-group">
            <div className="input-header">
              <label className="input-label">Lorem Ipsum Settings</label>
              <span className="language-indicator">
                🎲 Generate placeholder text
              </span>
            </div>
            <div className="settings-panel">
              <div className="setting-group">
                <label className="setting-label">📝 Generate Type</label>
                <div className="type-buttons">
                  <button
                    className={`type-btn ${type === 'words' ? 'active' : ''}`}
                    onClick={() => setType('words')}
                  >
                    Words
                  </button>
                  <button
                    className={`type-btn ${type === 'sentences' ? 'active' : ''}`}
                    onClick={() => setType('sentences')}
                  >
                    Sentences
                  </button>
                  <button
                    className={`type-btn ${type === 'paragraphs' ? 'active' : ''}`}
                    onClick={() => setType('paragraphs')}
                  >
                    Paragraphs
                  </button>
                </div>
              </div>

              <div className="setting-group">
                <label className="setting-label">
                  🔢 Number of {getTypeDisplayName()}: {count}
                </label>
                <input
                  type="range"
                  min="1"
                  max={maxCount}
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value))}
                  className="count-slider"
                />
                <div className="slider-labels">
                  <span>1</span>
                  <span>{maxCount}</span>
                </div>
              </div>

              <div className="preview-info">
                <div className="info-item">
                  <span className="info-label">Type:</span>
                  <span className="info-value">{getTypeDisplayName()}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Count:</span>
                  <span className="info-value">{count}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Max:</span>
                  <span className="info-value">{maxCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Column */}
        <div className="action-column">
          <div className="current-settings">
            <label className="input-label">⚙️ Current Settings</label>
            <div className="settings-display">
              <div className="setting-display-item">
                <span className="setting-icon">📝</span>
                <div className="setting-info">
                  <div className="setting-name">{getTypeDisplayName()}</div>
                  <div className="setting-desc">Generate {count} {type}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="primary-actions">
            <button className="btn btn-primary" onClick={generateLorem}>
              🎲 Generate Lorem Ipsum
            </button>
          </div>

          <div className="secondary-actions">
            <button className="btn btn-outline" onClick={handleClear}>
              🗑️ Clear
            </button>
            {output && (
              <>
                <button className="btn btn-outline" onClick={handleCopy}>
                  📋 Copy Text
                </button>
                <button 
                  className="btn btn-outline" 
                  onClick={handleDownload}
                  title="Download generated text as file"
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
              <label className="input-label">Generated Text</label>
              {output && (
                <span className="language-indicator">
                  📊 {output.length} characters
                </span>
              )}
            </div>
            <CodeEditor
              value={output || ''}
              onChange={() => {}} // Read-only
              language="text"
              readOnly={false}
              name="lorem-generator-output-editor"
              height="calc(100vh - 16rem)"
              showLineNumbers={false}
              placeholder="Generated Lorem Ipsum text will appear here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoremGenerator;
