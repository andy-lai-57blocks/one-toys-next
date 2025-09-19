'use client';

import React, { useState, useEffect, useMemo } from 'react';
import SimpleAd from '../../ads/SimpleAdSSG';
import CodeEditor from '../../common/CodeEditor';
import { downloadAsFile } from '../../../utils/downloadUtils';

const PasswordGenerator = () => {
  const [password, setPassword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [passwordHistory, setPasswordHistory] = useState([]);
  const [options, setOptions] = useState({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false,
    excludeSimilar: false,
    autoGenerate: false
  });

  const characters = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    similar: 'il1Lo0O'
  };

  const generatePassword = async () => {
    setIsGenerating(true);
    
    let charset = '';
    if (options.uppercase) charset += characters.uppercase;
    if (options.lowercase) charset += characters.lowercase;
    if (options.numbers) charset += characters.numbers;
    if (options.symbols) charset += characters.symbols;

    if (!charset) {
      setPassword('Please select at least one character type');
      setIsGenerating(false);
      return;
    }

    if (options.excludeSimilar) {
      charset = charset.split('').filter(char => !characters.similar.includes(char)).join('');
    }

    try {
      // Use cryptographically secure random generation
      const result = generateSecurePassword(charset, options.length);
      setPassword(result);
      
      // Add to history (keep last 10)
      setPasswordHistory(prev => [result, ...prev.slice(0, 9)]);
    } catch (error) {
      console.error('Password generation failed:', error);
      setPassword('Error generating secure password');
    }
    
    setIsGenerating(false);
  };

  const generateSecurePassword = (charset, length) => {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const array = new Uint32Array(length);
      window.crypto.getRandomValues(array);
      return Array.from(array, num => charset[num % charset.length]).join('');
    } else {
      // Fallback for environments without crypto API
      let result = '';
      for (let i = 0; i < length; i++) {
        result += charset.charAt(Math.floor(Math.random() * charset.length));
      }
      return result;
    }
  };

  const handleCopy = async () => {
    const fullReport = getPasswordReport();
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

  const handleCopyPassword = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = password;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const handleDownload = () => {
    const fullReport = getPasswordReport();
    const success = downloadAsFile(fullReport);
    if (!success) {
      console.error('Failed to download file');
    }
  };

  const handleClear = () => {
    setPassword('');
  };

  const getPasswordReport = () => {
    if (!password) return 'No password generated...';
    
    const strength = getPasswordStrength();
    const charTypes = getActiveCharacterTypes();
    
    return `PASSWORD GENERATION REPORT
${'='.repeat(50)}

🔐 GENERATED PASSWORD
${'-'.repeat(25)}
${password}

📊 PASSWORD ANALYSIS
${'-'.repeat(20)}
Length: ${password.length} characters
Strength: ${strength.text}
Character Types Used: ${charTypes.join(', ')}

⚙️ GENERATION SETTINGS
${'-'.repeat(25)}
Password Length: ${options.length}
Include Uppercase: ${options.uppercase ? 'Yes' : 'No'}
Include Lowercase: ${options.lowercase ? 'Yes' : 'No'}
Include Numbers: ${options.numbers ? 'Yes' : 'No'}
Include Symbols: ${options.symbols ? 'Yes' : 'No'}
Exclude Similar Characters: ${options.excludeSimilar ? 'Yes' : 'No'}

🔒 SECURITY RECOMMENDATIONS
${'-'.repeat(30)}
• Use unique passwords for each account
• Store passwords securely in a password manager
• Enable two-factor authentication when possible
• Regularly update passwords for sensitive accounts

Generated on: ${new Date().toLocaleString()}`;
  };

  const getActiveCharacterTypes = () => {
    const types = [];
    if (options.uppercase) types.push('Uppercase (A-Z)');
    if (options.lowercase) types.push('Lowercase (a-z)');
    if (options.numbers) types.push('Numbers (0-9)');
    if (options.symbols) types.push('Symbols (!@#$%...)');
    return types.length > 0 ? types : ['None selected'];
  };

  const updateOption = (key, value) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getPasswordStrength = () => {
    if (password.length < 8) return { text: 'Weak', className: 'strength-weak' };
    if (password.length < 12) return { text: 'Fair', className: 'strength-fair' };
    if (password.length < 16) return { text: 'Good', className: 'strength-good' };
    return { text: 'Strong', className: 'strength-strong' };
  };

  const strength = password ? getPasswordStrength() : null;
  const fullReport = getPasswordReport();

  return (
    <div className="tool-container password-generator-tool">
      <div className="three-column-layout">
        {/* Input Column */}
        <div className="input-column">
          <div className="input-group">
            <div className="input-header">
              <label className="input-label">Password Settings</label>
              <span className="language-indicator">
                🔐 Generate secure passwords
              </span>
            </div>
            <div className="settings-panel">
              <div className="setting-group">
                <label className="setting-label">🔢 Password Length: {options.length}</label>
                <input
                  type="range"
                  min="4"
                  max="128"
                  value={options.length}
                  onChange={(e) => updateOption('length', parseInt(e.target.value))}
                  className="length-slider"
                />
                <div className="slider-labels">
                  <span>4</span>
                  <span>128</span>
                </div>
              </div>

              <div className="setting-group">
                <label className="setting-label">📝 Character Types</label>
                <div className="checkbox-group">
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={options.uppercase}
                      onChange={(e) => updateOption('uppercase', e.target.checked)}
                    />
                    <span>Uppercase (A-Z)</span>
                  </label>
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={options.lowercase}
                      onChange={(e) => updateOption('lowercase', e.target.checked)}
                    />
                    <span>Lowercase (a-z)</span>
                  </label>
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={options.numbers}
                      onChange={(e) => updateOption('numbers', e.target.checked)}
                    />
                    <span>Numbers (0-9)</span>
                  </label>
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={options.symbols}
                      onChange={(e) => updateOption('symbols', e.target.checked)}
                    />
                    <span>Symbols (!@#$%...)</span>
                  </label>
                </div>
              </div>

              <div className="setting-group">
                <label className="checkbox-item exclude-similar">
                  <input
                    type="checkbox"
                    checked={options.excludeSimilar}
                    onChange={(e) => updateOption('excludeSimilar', e.target.checked)}
                  />
                  <span>🚫 Exclude similar characters (i, l, 1, L, o, 0, O)</span>
                </label>
              </div>

              <div className="preview-info">
                <div className="info-item">
                  <span className="info-label">Length:</span>
                  <span className="info-value">{options.length}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Types:</span>
                  <span className="info-value">{getActiveCharacterTypes().length}</span>
                </div>
                {strength && (
                  <div className="info-item">
                    <span className="info-label">Strength:</span>
                    <span className={`info-value ${strength.className}`}>{strength.text}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Column */}
        <div className="action-column">
          <div className="primary-actions">
            <button className="btn btn-primary" onClick={generatePassword}>
              🎲 Generate Password
            </button>
          </div>

          <div className="secondary-actions">
            <button className="btn btn-outline" onClick={handleClear}>
              🗑️ Clear
            </button>
            {password && (
              <>
                <button className="btn btn-outline" onClick={handleCopy}>
                  📋 Copy Report
                </button>
                <button 
                  className="btn btn-outline" 
                  onClick={handleDownload}
                  title="Download password report as file"
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
              <label className="input-label">Generated Password</label>
              {password && (
                <span className="language-indicator">
                  🔐 {password.length} chars • {strength?.text}
                </span>
              )}
            </div>
            <CodeEditor
              value={fullReport}
              onChange={() => {}} // Read-only
              language="text"
              readOnly={false}
              name="password-generator-output-editor"
              height="calc(100vh - 16rem)"
              showLineNumbers={false}
              placeholder="Generated password and security report will appear here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordGenerator;
