'use client';

import React, { useState, useEffect } from 'react';

const TimestampConverter = () => {
  const [timestamp, setTimestamp] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [results, setResults] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [copied, setCopied] = useState('');

  useEffect(() => {
    // Update current time every second
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Set initial values
    const now = Date.now();
    setTimestamp(Math.floor(now / 1000).toString());
    setDateTime(new Date(now).toISOString().slice(0, 16));

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timestamp) {
      convertFromTimestamp();
    }
  }, [timestamp, timezone]);

  useEffect(() => {
    if (dateTime) {
      convertFromDateTime();
    }
  }, [dateTime, timezone]);

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

      const results = {
        iso: date.toISOString(),
        local: date.toLocaleString('en-US', { timeZone: timezone }),
        utc: date.toUTCString(),
        unix: Math.floor(date.getTime() / 1000),
        unixMs: date.getTime(),
        formats: {
          'YYYY-MM-DD': date.toISOString().split('T')[0],
          'MM/DD/YYYY': new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(date),
          'DD/MM/YYYY': new Intl.DateTimeFormat('en-GB', { timeZone: timezone }).format(date),
          'Month DD, YYYY': date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            timeZone: timezone
          }),
          'Full DateTime': date.toLocaleString('en-US', { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: timezone
          }),
          'Time Only': date.toLocaleTimeString('en-US', { timeZone: timezone }),
          'Relative': getRelativeTime(date)
        }
      };

      setResults(results);
    } catch (error) {
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

      const results = {
        iso: date.toISOString(),
        local: date.toLocaleString('en-US', { timeZone: timezone }),
        utc: date.toUTCString(),
        unix: Math.floor(date.getTime() / 1000),
        unixMs: date.getTime(),
        formats: {
          'YYYY-MM-DD': date.toISOString().split('T')[0],
          'MM/DD/YYYY': new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(date),
          'DD/MM/YYYY': new Intl.DateTimeFormat('en-GB', { timeZone: timezone }).format(date),
          'Month DD, YYYY': date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            timeZone: timezone
          }),
          'Full DateTime': date.toLocaleString('en-US', { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: timezone
          }),
          'Time Only': date.toLocaleTimeString('en-US', { timeZone: timezone }),
          'Relative': getRelativeTime(date)
        }
      };

      setResults(results);
      setTimestamp(Math.floor(date.getTime() / 1000).toString());
    } catch (error) {
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

  const setCurrentTimestamp = () => {
    const now = Date.now();
    setTimestamp(Math.floor(now / 1000).toString());
    setDateTime(new Date(now).toISOString().slice(0, 16));
  };

  const copyToClipboard = (value, label) => {
    navigator.clipboard.writeText(value.toString()).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const commonTimestamps = [
    { label: 'Current Time', value: Math.floor(Date.now() / 1000) },
    { label: 'Unix Epoch (1970)', value: 0 },
    { label: '2000-01-01', value: 946684800 },
    { label: '2020-01-01', value: 1577836800 },
    { label: 'Tomorrow', value: Math.floor((Date.now() + 24 * 60 * 60 * 1000) / 1000) },
    { label: 'Next Week', value: Math.floor((Date.now() + 7 * 24 * 60 * 60 * 1000) / 1000) }
  ];

  return (
    <div className="tool-container">
        <div className="current-time-section">
          <h3>🕐 Current Time</h3>
          <div className="current-time-display">
            <div className="time-item">
              <span className="time-label">Current Timestamp:</span>
              <span className="time-value">{Math.floor(currentTime.getTime() / 1000)}</span>
            </div>
            <div className="time-item">
              <span className="time-label">Current Date:</span>
              <span className="time-value">{currentTime.toLocaleString()}</span>
            </div>
            <button className="btn btn-outline btn-small" onClick={setCurrentTimestamp}>
              📍 Use Current Time
            </button>
          </div>
        </div>

        <div className="input-section">
          <div className="input-group">
            <label className="input-label">Unix Timestamp (seconds or milliseconds)</label>
            <input
              type="text"
              className="text-input"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              placeholder="1234567890"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Date Time (ISO format)</label>
            <input
              type="datetime-local"
              className="text-input"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Timezone</label>
            <select
              className="text-input"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            >
              <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                Local ({Intl.DateTimeFormat().resolvedOptions().timeZone})
              </option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
              <option value="Asia/Shanghai">Shanghai</option>
              <option value="Asia/Kolkata">India</option>
            </select>
          </div>
        </div>

        <div className="common-timestamps">
          <h3>⚡ Quick Select</h3>
          <div className="button-group">
            {commonTimestamps.map((item) => (
              <button
                key={item.label}
                className="btn btn-outline btn-small"
                onClick={() => setTimestamp(item.value.toString())}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {results.error ? (
          <div className="error-section">
            <p className="error-text">❌ {results.error}</p>
          </div>
        ) : results.iso ? (
          <div className="results-section">
            <h3>📊 Conversion Results</h3>
            
            <div className="result-group">
              <h4>Standard Formats</h4>
              <div className="result-grid">
                <div className="result-item">
                  <span className="result-label">ISO 8601:</span>
                  <span className="result-value">{results.iso}</span>
                  <button 
                    className="btn btn-outline btn-small"
                    onClick={() => copyToClipboard(results.iso, 'ISO')}
                  >
                    {copied === 'ISO' ? '✓' : '📋'}
                  </button>
                </div>
                <div className="result-item">
                  <span className="result-label">Local Time:</span>
                  <span className="result-value">{results.local}</span>
                  <button 
                    className="btn btn-outline btn-small"
                    onClick={() => copyToClipboard(results.local, 'Local')}
                  >
                    {copied === 'Local' ? '✓' : '📋'}
                  </button>
                </div>
                <div className="result-item">
                  <span className="result-label">UTC:</span>
                  <span className="result-value">{results.utc}</span>
                  <button 
                    className="btn btn-outline btn-small"
                    onClick={() => copyToClipboard(results.utc, 'UTC')}
                  >
                    {copied === 'UTC' ? '✓' : '📋'}
                  </button>
                </div>
                <div className="result-item">
                  <span className="result-label">Unix (seconds):</span>
                  <span className="result-value">{results.unix}</span>
                  <button 
                    className="btn btn-outline btn-small"
                    onClick={() => copyToClipboard(results.unix, 'Unix')}
                  >
                    {copied === 'Unix' ? '✓' : '📋'}
                  </button>
                </div>
                <div className="result-item">
                  <span className="result-label">Unix (milliseconds):</span>
                  <span className="result-value">{results.unixMs}</span>
                  <button 
                    className="btn btn-outline btn-small"
                    onClick={() => copyToClipboard(results.unixMs, 'UnixMs')}
                  >
                    {copied === 'UnixMs' ? '✓' : '📋'}
                  </button>
                </div>
              </div>
            </div>

            <div className="result-group">
              <h4>Display Formats</h4>
              <div className="result-grid">
                {Object.entries(results.formats).map(([format, value]) => (
                  <div key={format} className="result-item">
                    <span className="result-label">{format}:</span>
                    <span className="result-value">{value}</span>
                    <button 
                      className="btn btn-outline btn-small"
                      onClick={() => copyToClipboard(value, format)}
                    >
                      {copied === format ? '✓' : '📋'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
    </div>
  );
};

export default TimestampConverter;
