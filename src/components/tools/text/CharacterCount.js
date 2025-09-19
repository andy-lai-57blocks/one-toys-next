'use client';

import React, { useState, useMemo } from 'react';
import SimpleAd from '../../ads/SimpleAdSSG';
import CodeEditor from '../../common/CodeEditor';
import { downloadAsFile } from '../../../utils/downloadUtils';

const CharacterCount = () => {
  const [input, setInput] = useState('');

  // Calculate statistics in real-time using useMemo
  const stats = useMemo(() => {
    if (!input) {
      return {
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        paragraphs: 0,
        readingTime: 0
      };
    }

    const characters = input.length;
    const charactersNoSpaces = input.replace(/\s/g, '').length;
    const words = input.trim() ? input.trim().split(/\s+/).length : 0;
    const paragraphs = input.trim() ? input.split(/\n\s*\n/).filter(p => p.trim()).length : 0;
    const readingTime = Math.max(1, Math.ceil(words / 200)); // At least 1 minute

    return {
      characters,
      charactersNoSpaces,
      words,
      paragraphs,
      readingTime
    };
  }, [input]);

  const handleClear = () => {
    setInput('');
  };

  const handleCopy = async () => {
    const statsText = getFormattedStats();
    try {
      await navigator.clipboard.writeText(statsText);
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = statsText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const handleDownload = () => {
    const statsText = getFormattedStats();
    const success = downloadAsFile(statsText);
    if (!success) {
      console.error('Failed to download file');
    }
  };

  const getFormattedStats = () => {
    if (!input) return 'No text to analyze...';
    
    return `TEXT ANALYSIS REPORT
${'='.repeat(50)}

📊 CHARACTER STATISTICS
${'-'.repeat(25)}
Total Characters: ${stats.characters.toLocaleString()}
Characters (no spaces): ${stats.charactersNoSpaces.toLocaleString()}
Spaces: ${(stats.characters - stats.charactersNoSpaces).toLocaleString()}

📝 WORD & PARAGRAPH STATISTICS  
${'-'.repeat(35)}
Total Words: ${stats.words.toLocaleString()}
Paragraphs: ${stats.paragraphs.toLocaleString()}
Average Words per Paragraph: ${stats.paragraphs > 0 ? Math.round(stats.words / stats.paragraphs) : 0}

⏱️  READING TIME
${'-'.repeat(15)}
Estimated Reading Time: ${stats.readingTime} minute${stats.readingTime !== 1 ? 's' : ''}
(Based on 200 words per minute)

📈 TEXT DENSITY
${'-'.repeat(15)}
Average Characters per Word: ${stats.words > 0 ? Math.round(stats.charactersNoSpaces / stats.words) : 0}
Average Words per Line: ${input.split('\n').length > 0 ? Math.round(stats.words / input.split('\n').length) : 0}

Generated on: ${new Date().toLocaleString()}`;
  };

  const loadSampleText = () => {
    const samples = [
      `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
      
      `The quick brown fox jumps over the lazy dog. This sentence contains every letter in the English alphabet.

Writing is an art form that has existed for thousands of years. From ancient cave paintings to modern digital text, humans have always found ways to communicate through written symbols.

In today's world, text analysis has become increasingly important for content creators, writers, and digital marketers who need to understand the characteristics of their written content.`,

      `function calculateStatistics(text) {
  const characters = text.length;
  const words = text.trim().split(/\\s+/).length;
  const paragraphs = text.split(/\\n\\s*\\n/).length;
  
  return {
    characters,
    words, 
    paragraphs,
    readingTime: Math.ceil(words / 200)
  };
}

// This is a sample code snippet for text analysis
const myText = "Hello, world!";
const stats = calculateStatistics(myText);
console.log(stats);`
    ];
    
    const sampleIndex = Math.floor(Date.now() / 10000) % samples.length;
    setInput(samples[sampleIndex]);
  };

  const formattedStats = getFormattedStats();

  return (
    <div className="tool-container character-count-tool">
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
              placeholder="Type or paste your text here for analysis..."
              name="character-count-input-editor"
              height="calc(100vh - 16rem)"
            />
          </div>
        </div>

        {/* Action Column */}
        <div className="action-column">
          <div className="stats-display">
            <label className="input-label">📊 Text Statistics</label>
            <div className="main-stat">
              <div className="stat-number">{stats.characters.toLocaleString()}</div>
              <div className="stat-name">Characters</div>
            </div>
            <div className="secondary-stats">
              <div className="stat-item-simple">
                <span className="stat-value">{stats.words.toLocaleString()}</span>
                <span className="stat-label">Words</span>
              </div>
              <div className="stat-item-simple">
                <span className="stat-value">{stats.charactersNoSpaces.toLocaleString()}</span>
                <span className="stat-label">No spaces</span>
              </div>
              <div className="stat-item-simple">
                <span className="stat-value">{stats.paragraphs.toLocaleString()}</span>
                <span className="stat-label">Paragraphs</span>
              </div>
              {stats.words > 0 && (
                <div className="stat-item-simple reading-time">
                  <span className="stat-value">{stats.readingTime} min</span>
                  <span className="stat-label">Reading time</span>
                </div>
              )}
            </div>
          </div>

          <div className="secondary-actions">
            <button className="btn btn-outline" onClick={loadSampleText}>
              📄 Load Sample
            </button>
            <button className="btn btn-outline" onClick={handleClear} disabled={!input}>
              🗑️ Clear
            </button>
            {input && (
              <>
                <button className="btn btn-outline" onClick={handleCopy}>
                  📋 Copy Report
                </button>
                <button 
                  className="btn btn-outline" 
                  onClick={handleDownload}
                  title="Download analysis report as text file"
                >
                  📥 Download Report
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
              <label className="input-label">Analysis Report</label>
              {input && (
                <span className="language-indicator">
                  📈 {stats.words} words analyzed
                </span>
              )}
            </div>
            <CodeEditor
              value={formattedStats}
              onChange={() => {}} // Read-only
              language="text"
              readOnly={false}
              name="character-count-output-editor"
              height="calc(100vh - 16rem)"
              showLineNumbers={false}
              placeholder="Text analysis report will appear here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCount;
