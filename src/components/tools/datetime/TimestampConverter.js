'use client';

import React, { useState, useEffect } from 'react';

const TimestampConverter = () => {
  const [activeTab, setActiveTab] = useState('timestamp'); // 'timestamp' or 'datetime'
  const [timestamp, setTimestamp] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [useUtc, setUseUtc] = useState(false);
  const [results, setResults] = useState({});
  const [copied, setCopied] = useState('');

  useEffect(() => {
    // Set initial values after hydration
    if (typeof window !== 'undefined') {
      const now = Date.now();
      setTimestamp(Math.floor(now / 1000).toString());
      setDateTime(new Date(now).toISOString().slice(0, 16));
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'timestamp' && timestamp) {
      convertFromTimestamp();
    }
  }, [timestamp, useUtc, activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeTab === 'datetime' && dateTime) {
      convertFromDateTime();
    }
  }, [dateTime, useUtc, activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const convertFromTimestamp = () => {
    try {
      const ts = parseInt(timestamp);
      if (isNaN(ts)) {
        setResults({ error: 'Invalid timestamp' });
        return;
      }

      // Handle both seconds and milliseconds
      const milliseconds = ts.toString().length === 10 ? ts * 1000 : ts;
      const date = new Date(milliseconds);

      if (date.getTime() !== milliseconds) {
        setResults({ error: 'Invalid timestamp' });
        return;
      }

      const timezone = useUtc ? 'UTC' : Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      const results = {
        unix: Math.floor(date.getTime() / 1000),
        iso: date.toISOString(),
        readable: date.toLocaleString('en-US', { 
          timeZone: timezone,
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        relative: getRelativeTime(date)
      };

      setResults(results);
    } catch {
      setResults({ error: 'Invalid timestamp format' });
    }
  };

  const convertFromDateTime = () => {
    try {
      const date = new Date(dateTime);
      
      if (isNaN(date.getTime())) {
        setResults({ error: 'Invalid date format' });
        return;
      }

      const timezone = useUtc ? 'UTC' : Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      const results = {
        unix: Math.floor(date.getTime() / 1000),
        iso: date.toISOString(),
        readable: date.toLocaleString('en-US', { 
          timeZone: timezone,
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        relative: getRelativeTime(date)
      };

      setResults(results);
      setTimestamp(Math.floor(date.getTime() / 1000).toString());
    } catch {
      setResults({ error: 'Invalid date format' });
    }
  };

  const getRelativeTime = (date) => {
    const now = Date.now();
    const diff = date.getTime() - now;
    const absDiff = Math.abs(diff);
    
    const minute = 60 * 1000;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;
    const month = day * 30;
    const year = day * 365;

    if (absDiff < minute) {
      return 'Just now';
    } else if (absDiff < hour) {
      const mins = Math.floor(absDiff / minute);
      return `${mins} minute${mins > 1 ? 's' : ''} ${diff > 0 ? 'from now' : 'ago'}`;
    } else if (absDiff < day) {
      const hours = Math.floor(absDiff / hour);
      return `${hours} hour${hours > 1 ? 's' : ''} ${diff > 0 ? 'from now' : 'ago'}`;
    } else if (absDiff < week) {
      const days = Math.floor(absDiff / day);
      return `${days} day${days > 1 ? 's' : ''} ${diff > 0 ? 'from now' : 'ago'}`;
    } else if (absDiff < month) {
      const weeks = Math.floor(absDiff / week);
      return `${weeks} week${weeks > 1 ? 's' : ''} ${diff > 0 ? 'from now' : 'ago'}`;
    } else if (absDiff < year) {
      const months = Math.floor(absDiff / month);
      return `${months} month${months > 1 ? 's' : ''} ${diff > 0 ? 'from now' : 'ago'}`;
    } else {
      const years = Math.floor(absDiff / year);
      return `${years} year${years > 1 ? 's' : ''} ${diff > 0 ? 'from now' : 'ago'}`;
    }
  };

  const copyToClipboard = (value, label) => {
    navigator.clipboard.writeText(value.toString()).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setResults({}); // Clear results when switching tabs
  };

  const setQuickTimestamp = (type) => {
    const now = new Date();
    let targetDate = new Date(now);

    switch (type) {
      case 'now':
        break;
      case '1h-ago':
        targetDate.setHours(now.getHours() - 1);
        break;
      case '1d-ago':
        targetDate.setDate(now.getDate() - 1);
        break;
      case '1w-ago':
        targetDate.setDate(now.getDate() - 7);
        break;
      case 'day-start':
        targetDate.setHours(0, 0, 0, 0);
        break;
      case 'day-end':
        targetDate.setHours(23, 59, 59, 999);
        break;
      default:
        break;
    }

    const timestampValue = Math.floor(targetDate.getTime() / 1000).toString();
    const datetimeValue = targetDate.toISOString().slice(0, 16);
    
    setTimestamp(timestampValue);
    setDateTime(datetimeValue);
    
    // Set the active tab based on what makes most sense
    if (activeTab === 'timestamp') {
      setTimestamp(timestampValue);
    } else {
      setDateTime(datetimeValue);
    }
  };

  return (
    <div className="tool-container">
      {/* 1. TIMEZONE PREFERENCE - FIRST */}
      <div className="timezone-toggle">
        <label className="toggle-label">🌍 Timezone:</label>
        <div className="toggle-buttons">
          <button
            className={`toggle-btn ${!useUtc ? 'active' : ''}`}
            onClick={() => setUseUtc(false)}
          >
            🏠 Local
          </button>
          <button
            className={`toggle-btn ${useUtc ? 'active' : ''}`}
            onClick={() => setUseUtc(true)}
          >
            🌐 UTC
          </button>
        </div>
      </div>

      {/* 2. TAB SELECTION - SECOND */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'timestamp' ? 'active' : ''}`}
          onClick={() => handleTabChange('timestamp')}
        >
          🔢 Unix Timestamp
        </button>
        <button 
          className={`tab-button ${activeTab === 'datetime' ? 'active' : ''}`}
          onClick={() => handleTabChange('datetime')}
        >
          📅 Human Date
        </button>
      </div>

      {/* 3. MANUAL INPUT AND QUICK SELECT - SIDE BY SIDE */}
      <div className="input-options-row">
        <div className="manual-input-section">
          <h3>✏️ Manual Input</h3>
          <p className="manual-input-hint">
            Enter {activeTab === 'timestamp' ? 'a timestamp' : 'date & time'} manually
          </p>
          {activeTab === 'timestamp' ? (
            <div className="input-group">
              <label className="input-label">Enter Unix Timestamp (seconds or milliseconds)</label>
              <input
                type="text"
                className="text-input"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                placeholder="1234567890"
              />
              <small className="input-hint">
                Example: 1234567890 (seconds) or 1234567890123 (milliseconds)
              </small>
            </div>
          ) : (
            <div className="input-group">
              <label className="input-label">Select Date & Time</label>
              <input
                type="datetime-local"
                className="text-input"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
              />
              <small className="input-hint">
                Choose a date and time to convert to timestamp
              </small>
            </div>
          )}
        </div>

        <div className="quick-select-section">
          <h3>⚡ Quick Select</h3>
          <p className="quick-select-hint">
            Or choose a common timestamp
          </p>
          <div className="button-group">
            <button className="btn btn-outline btn-small" onClick={() => setQuickTimestamp('now')}>
              Now
            </button>
            <button className="btn btn-outline btn-small" onClick={() => setQuickTimestamp('1h-ago')}>
              1h ago
            </button>
            <button className="btn btn-outline btn-small" onClick={() => setQuickTimestamp('1d-ago')}>
              Yesterday
            </button>
            <button className="btn btn-outline btn-small" onClick={() => setQuickTimestamp('1w-ago')}>
              1 week ago
            </button>
            <button className="btn btn-outline btn-small" onClick={() => setQuickTimestamp('day-start')}>
              Start of Day
            </button>
            <button className="btn btn-outline btn-small" onClick={() => setQuickTimestamp('day-end')}>
              End of Day
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {results.unix || results.error ? (
        <div className="results-section">
          <div className="input-group">
            <label className="input-label">
              Results
              {results.error && <span className="status-indicator invalid">❌ {results.error}</span>}
              {results.unix && <span className="status-indicator valid">✅ Valid</span>}
            </label>
            <div className="result-grid">
              <div className="result-item">
                <span className="result-label">Unix Timestamp:</span>
                <span className="result-value">{results.unix}</span>
                <button 
                  className="btn btn-outline btn-small"
                  onClick={() => copyToClipboard(results.unix, 'unix')}
                >
                  {copied === 'unix' ? '✓' : '📋'}
                </button>
              </div>
              <div className="result-item">
                <span className="result-label">ISO Format:</span>
                <span className="result-value">{results.iso}</span>
                <button 
                  className="btn btn-outline btn-small"
                  onClick={() => copyToClipboard(results.iso, 'iso')}
                >
                  {copied === 'iso' ? '✓' : '📋'}
                </button>
              </div>
              <div className="result-item">
                <span className="result-label">Readable Format:</span>
                <span className="result-value">{results.readable}</span>
                <button 
                  className="btn btn-outline btn-small"
                  onClick={() => copyToClipboard(results.readable, 'readable')}
                >
                  {copied === 'readable' ? '✓' : '📋'}
                </button>
              </div>
              <div className="result-item">
                <span className="result-label">Relative Time:</span>
                <span className="result-value">{results.relative}</span>
                <button 
                  className="btn btn-outline btn-small"
                  onClick={() => copyToClipboard(results.relative, 'relative')}
                >
                  {copied === 'relative' ? '✓' : '📋'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default TimestampConverter;
