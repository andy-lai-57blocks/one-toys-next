'use client';

import React, { useState, useEffect } from 'react';

const DateFormatter = () => {
  const [inputDate, setInputDate] = useState('');
  const [selectedTimezone, setSelectedTimezone] = useState('UTC'); // Start with UTC to prevent hydration mismatch
  const [customFormat, setCustomFormat] = useState('');
  const [results, setResults] = useState({});

  useEffect(() => {
    // Set user's timezone and initial date after hydration
    if (typeof window !== 'undefined') {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setSelectedTimezone(userTimezone);
      
      const now = new Date();
      setInputDate(now.toISOString().slice(0, 16));
    }
  }, []);

  useEffect(() => {
    if (inputDate) {
      formatDate();
    }
  }, [inputDate, selectedTimezone, customFormat]);

  const formatDate = () => {
    try {
      const date = new Date(inputDate);
      
      if (isNaN(date.getTime())) {
        setResults({ error: 'Invalid date format' });
        return;
      }

      const commonFormats = {
        'ISO 8601': date.toISOString(),
        'RFC 2822': date.toUTCString(),
        'Local String': date.toLocaleString('en-US', { timeZone: selectedTimezone }),
        'Date Only': date.toLocaleDateString('en-US', { timeZone: selectedTimezone }),
        'Time Only': date.toLocaleTimeString('en-US', { timeZone: selectedTimezone }),
        'Unix Timestamp': Math.floor(date.getTime() / 1000),
        'Unix Milliseconds': date.getTime(),
        'Year': date.getFullYear(),
        'Month (1-12)': date.getMonth() + 1,
        'Day': date.getDate(),
        'Hour (0-23)': date.getHours(),
        'Minute': date.getMinutes(),
        'Second': date.getSeconds()
      };

      const localeFormats = {
        'US Format': date.toLocaleDateString('en-US', { timeZone: selectedTimezone }),
        'UK Format': date.toLocaleDateString('en-GB', { timeZone: selectedTimezone }),
        'German Format': date.toLocaleDateString('de-DE', { timeZone: selectedTimezone }),
        'French Format': date.toLocaleDateString('fr-FR', { timeZone: selectedTimezone }),
        'Japanese Format': date.toLocaleDateString('ja-JP', { timeZone: selectedTimezone }),
        'Chinese Format': date.toLocaleDateString('zh-CN', { timeZone: selectedTimezone }),
        'Arabic Format': date.toLocaleDateString('ar-SA', { timeZone: selectedTimezone })
      };

      const businessFormats = {
        'Full Date': date.toLocaleDateString('en-US', { 
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: selectedTimezone
        }),
        'Short Date': date.toLocaleDateString('en-US', { 
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          timeZone: selectedTimezone
        }),
        'Month Year': date.toLocaleDateString('en-US', { 
          month: 'long',
          year: 'numeric',
          timeZone: selectedTimezone
        }),
        'Weekday Only': date.toLocaleDateString('en-US', { 
          weekday: 'long',
          timeZone: selectedTimezone
        }),
        'Time 12-hour': date.toLocaleTimeString('en-US', { 
          hour: 'numeric',
          minute: '2-digit',
          timeZone: selectedTimezone
        }),
        'Time 24-hour': date.toLocaleTimeString('en-US', { 
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: selectedTimezone
        }),
        'Full DateTime': date.toLocaleString('en-US', { 
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: selectedTimezone
        })
      };

      const technicalFormats = {
        'YYYY-MM-DD': date.toISOString().split('T')[0],
        'DD/MM/YYYY': date.toLocaleDateString('en-GB', { timeZone: selectedTimezone }),
        'MM/DD/YYYY': date.toLocaleDateString('en-US', { timeZone: selectedTimezone }),
        'DD-MM-YYYY': date.toLocaleDateString('en-GB', { timeZone: selectedTimezone }).replace(/\//g, '-'),
        'YYYY/MM/DD': `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`,
        'YY-MM-DD': `${String(date.getFullYear()).slice(-2)}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
        'HH:MM:SS': date.toLocaleTimeString('en-US', { hour12: false, timeZone: selectedTimezone }),
        'HH:MM': date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', timeZone: selectedTimezone })
      };

      let customResult = '';
      if (customFormat) {
        try {
          customResult = formatCustomDate(date, customFormat, selectedTimezone);
        } catch (error) {
          customResult = 'Invalid custom format';
        }
      }

      setResults({
        common: commonFormats,
        locale: localeFormats,
        business: businessFormats,
        technical: technicalFormats,
        custom: customResult
      });
    } catch (error) {
      setResults({ error: 'Invalid date format' });
    }
  };

  const formatCustomDate = (date, format, timezone) => {
    // Simple custom format implementation
    const tokens = {
      'YYYY': date.getFullYear(),
      'YY': String(date.getFullYear()).slice(-2),
      'MM': String(date.getMonth() + 1).padStart(2, '0'),
      'DD': String(date.getDate()).padStart(2, '0'),
      'HH': String(date.getHours()).padStart(2, '0'),
      'mm': String(date.getMinutes()).padStart(2, '0'),
      'ss': String(date.getSeconds()).padStart(2, '0'),
      'DDD': date.toLocaleDateString('en-US', { weekday: 'long', timeZone: timezone }),
      'MMM': date.toLocaleDateString('en-US', { month: 'short', timeZone: timezone }),
      'MMMM': date.toLocaleDateString('en-US', { month: 'long', timeZone: timezone })
    };

    let result = format;
    Object.entries(tokens).forEach(([token, value]) => {
      result = result.replace(new RegExp(token, 'g'), value);
    });

    return result;
  };

  const setCurrentDate = () => {
    const now = new Date();
    setInputDate(now.toISOString().slice(0, 16));
  };

  const [copied, setCopied] = useState('');
  const copyToClipboard = (value, label) => {
    navigator.clipboard.writeText(value.toString()).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const timezones = [
    { value: Intl.DateTimeFormat().resolvedOptions().timeZone, label: `Local (${Intl.DateTimeFormat().resolvedOptions().timeZone})` },
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
    { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { value: 'Asia/Kolkata', label: 'India (IST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' }
  ];

  const customFormats = [
    'YYYY-MM-DD HH:mm:ss',
    'DD/MM/YYYY HH:mm',
    'MMM DD, YYYY',
    'DDD, MMMM DD, YYYY',
    'YYYY/MM/DD',
    'DD-MM-YY HH:mm'
  ];

  const ResultSection = ({ title, data, icon }) => (
    <div className="result-group">
      <h4>
        <span className="result-icon">{icon}</span>
        {title}
      </h4>
      <div className="result-grid">
        {Object.entries(data).map(([format, value]) => (
          <div key={format} className="result-item">
            <span className="result-label">{format}:</span>
            <span className="result-value">{value}</span>
            <button 
              className="btn btn-outline btn-small"
              onClick={() => copyToClipboard(value, `${title}-${format}`)}
            >
              {copied === `${title}-${format}` ? '✓' : '📋'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="tool-container">
        <div className="input-section">
          <div className="input-group">
            <label className="input-label">Input Date & Time</label>
            <input
              type="datetime-local"
              className="text-input"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
            />
            <button className="btn btn-outline btn-small" onClick={setCurrentDate}>
              📍 Use Current Time
            </button>
          </div>

          <div className="input-group">
            <label className="input-label">Target Timezone</label>
            <select
              className="text-input"
              value={selectedTimezone}
              onChange={(e) => setSelectedTimezone(e.target.value)}
            >
              {timezones.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Custom Format (Optional)</label>
            <input
              type="text"
              className="text-input"
              value={customFormat}
              onChange={(e) => setCustomFormat(e.target.value)}
              placeholder="YYYY-MM-DD HH:mm:ss"
            />
            <div className="custom-format-buttons">
              {customFormats.map(format => (
                <button
                  key={format}
                  className="btn btn-outline btn-small"
                  onClick={() => setCustomFormat(format)}
                >
                  {format}
                </button>
              ))}
            </div>
            <div className="format-help">
              <p><strong>Format tokens:</strong> YYYY (year), MM (month), DD (day), HH (hour), mm (minute), ss (second), DDD (weekday), MMM (short month), MMMM (full month)</p>
            </div>
          </div>
        </div>

        {results.error ? (
          <div className="error-section">
            <p className="error-text">❌ {results.error}</p>
          </div>
        ) : results.common ? (
          <div className="results-section">
            <h3>📊 Formatted Results</h3>
            
            <ResultSection title="Common Formats" data={results.common} icon="⚡" />
            <ResultSection title="Locale Formats" data={results.locale} icon="🌍" />
            <ResultSection title="Business Formats" data={results.business} icon="💼" />
            <ResultSection title="Technical Formats" data={results.technical} icon="⚙️" />
            
            {customFormat && results.custom && (
              <div className="result-group">
                <h4>
                  <span className="result-icon">🎯</span>
                  Custom Format Result
                </h4>
                <div className="custom-result">
                  <div className="result-item large">
                    <span className="result-label">Format: {customFormat}</span>
                    <span className="result-value custom">{results.custom}</span>
                    <button 
                      className="btn btn-primary"
                      onClick={() => copyToClipboard(results.custom, 'Custom')}
                    >
                      {copied === 'Custom' ? '✓ Copied!' : '📋 Copy Result'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
    </div>
  );
};

export default DateFormatter;
