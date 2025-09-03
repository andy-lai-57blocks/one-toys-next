'use client';

import React, { useState } from 'react';
import SimpleAd from '../../ads/SimpleAdSSG';
import CodeEditor from '../../common/CodeEditor';
import { downloadAsFile } from '../../../utils/downloadUtils';

const UUIDGenerator = () => {
  const [uuids, setUuids] = useState([]);
  const [count, setCount] = useState(1);
  const [version, setVersion] = useState('v4');

  const generateUUID = () => {
    if (version === 'v4') {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    } else {
      // Simple v1-like UUID with timestamp
      const timestamp = Date.now().toString(16);
      const random = Math.random().toString(16).substring(2, 15);
      return `${timestamp.substring(0, 8)}-${timestamp.substring(8)}-1xxx-yxxx-${random}`.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  };

  const handleGenerate = () => {
    const newUuids = [];
    for (let i = 0; i < count; i++) {
      newUuids.push(generateUUID());
    }
    setUuids(newUuids);
  };

  const handleCopy = async (uuid) => {
    try {
      await navigator.clipboard.writeText(uuid);
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = uuid;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const handleCopyAll = async () => {
    const fullReport = getUUIDReport();
    try {
      await navigator.clipboard.writeText(fullReport);
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = fullReport;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const handleDownload = () => {
    const fullReport = getUUIDReport();
    const success = downloadAsFile(fullReport);
    if (!success) {
      console.error('Failed to download file');
    }
  };

  const handleClear = () => {
    setUuids([]);
  };

  const getUUIDReport = () => {
    if (uuids.length === 0) return 'No UUIDs generated...';
    
    return `UUID GENERATION REPORT
${'='.repeat(50)}

🆔 GENERATED UUIDS
${'-'.repeat(20)}
${uuids.join('\n')}

📊 UUID ANALYSIS
${'-'.repeat(17)}
Total Generated: ${uuids.length}
UUID Version: ${version.toUpperCase()} (${version === 'v4' ? 'Random' : 'Timestamp-based'})
Format: Standard RFC 4122

⚙️ GENERATION SETTINGS
${'-'.repeat(25)}
UUID Version: ${version.toUpperCase()}
Number Generated: ${uuids.length}
Generation Type: ${version === 'v4' ? 'Cryptographically secure random' : 'Timestamp-based with random elements'}

📝 UUID INFORMATION
${'-'.repeat(20)}
• UUID Structure: 8-4-4-4-12 hexadecimal digits
• Total Length: 36 characters (including hyphens)
• Uniqueness: ${version === 'v4' ? 'Extremely high probability of uniqueness' : 'Guaranteed uniqueness within same timestamp'}
• Use Cases: ${getUseCases()}

💡 USAGE RECOMMENDATIONS
${'-'.repeat(28)}
• Use Version 4 for general-purpose unique identifiers
• Version 1 includes timestamp information but may reveal generation time
• Store UUIDs as strings or binary depending on your database
• UUIDs are case-insensitive but lowercase is conventional

Generated on: ${new Date().toLocaleString()}`;
  };

  const getUseCases = () => {
    return version === 'v4' 
      ? 'Database primary keys, session IDs, API tokens, distributed systems'
      : 'Ordered identifiers, event tracking, time-series data';
  };

  const fullReport = getUUIDReport();

  return (
    <div className="tool-container uuid-generator-tool">
      <div className="three-column-layout">
        {/* Input Column */}
        <div className="input-column">
          <div className="input-group">
            <div className="input-header">
              <label className="input-label">UUID Settings</label>
              <span className="language-indicator">
                🆔 Generate unique identifiers
              </span>
            </div>
            <div className="settings-panel">
              <div className="setting-group">
                <label className="setting-label">📋 UUID Version</label>
                <div className="version-buttons">
                  <button
                    className={`version-btn ${version === 'v4' ? 'active' : ''}`}
                    onClick={() => setVersion('v4')}
                  >
                    <div className="version-info">
                      <span className="version-name">Version 4</span>
                      <span className="version-desc">Random</span>
                    </div>
                  </button>
                  <button
                    className={`version-btn ${version === 'v1' ? 'active' : ''}`}
                    onClick={() => setVersion('v1')}
                  >
                    <div className="version-info">
                      <span className="version-name">Version 1</span>
                      <span className="version-desc">Timestamp</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="setting-group">
                <label className="setting-label">🔢 Number of UUIDs: {count}</label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value))}
                  className="count-slider"
                />
                <div className="slider-labels">
                  <span>1</span>
                  <span>50</span>
                </div>
              </div>

              <div className="preview-info">
                <div className="info-item">
                  <span className="info-label">Version:</span>
                  <span className="info-value">{version.toUpperCase()}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Count:</span>
                  <span className="info-value">{count}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Type:</span>
                  <span className="info-value">{version === 'v4' ? 'Random' : 'Timestamp'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Column */}
        <div className="action-column">
          <div className="primary-actions">
            <button className="btn btn-primary" onClick={handleGenerate}>
              🎲 Generate UUID{count > 1 ? 's' : ''}
            </button>
          </div>

          <div className="secondary-actions">
            <button className="btn btn-outline" onClick={handleClear}>
              🗑️ Clear
            </button>
            {uuids.length > 0 && (
              <>
                <button className="btn btn-outline" onClick={handleCopyAll}>
                  📋 Copy Report
                </button>
                <button 
                  className="btn btn-outline" 
                  onClick={handleDownload}
                  title="Download UUID report as file"
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
              <label className="input-label">Generated UUIDs</label>
              {uuids.length > 0 && (
                <span className="language-indicator">
                  🆔 {uuids.length} UUID{uuids.length > 1 ? 's' : ''} • {version.toUpperCase()}
                </span>
              )}
            </div>
            <CodeEditor
              value={fullReport}
              onChange={() => {}} // Read-only
              language="text"
              readOnly={true}
              name="uuid-generator-output-editor"
              height="calc(100vh - 16rem)"
              showLineNumbers={false}
              placeholder="Generated UUIDs and information report will appear here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UUIDGenerator;
