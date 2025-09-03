'use client';

import React, { useState, useEffect } from 'react';

const TimezoneConverter = () => {
  const [inputTime, setInputTime] = useState('');
  const [inputTimezone, setInputTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [targetTimezones, setTargetTimezones] = useState(['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo']);
  const [results, setResults] = useState({});
  const [currentTimes, setCurrentTimes] = useState({});

  useEffect(() => {
    // Set initial time to current time
    const now = new Date();
    setInputTime(now.toISOString().slice(0, 16));
    
    // Update current times every second
    const interval = setInterval(() => {
      updateCurrentTimes();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (inputTime) {
      convertTimezone();
    }
    updateCurrentTimes();
  }, [inputTime, inputTimezone, targetTimezones]);

  const updateCurrentTimes = () => {
    const now = new Date();
    const times = {};
    
    allTimezones.forEach(tz => {
      times[tz.value] = {
        time: now.toLocaleString('en-US', { 
          timeZone: tz.value,
          hour12: false,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        time12: now.toLocaleString('en-US', { 
          timeZone: tz.value,
          hour12: true,
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit'
        }),
        date: now.toLocaleDateString('en-US', { 
          timeZone: tz.value,
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        }),
        offset: getTimezoneOffset(tz.value, now)
      };
    });
    
    setCurrentTimes(times);
  };

  const convertTimezone = () => {
    try {
      // Parse input time in the source timezone context
      const inputDate = new Date(inputTime);
      
      if (isNaN(inputDate.getTime())) {
        setResults({ error: 'Invalid date/time format' });
        return;
      }

      const conversions = {};
      
      targetTimezones.forEach(tz => {
        const converted = {
          timezone: tz,
          display: allTimezones.find(t => t.value === tz)?.label || tz,
          time24: inputDate.toLocaleString('en-US', { 
            timeZone: tz,
            hour12: false,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          time12: inputDate.toLocaleString('en-US', { 
            timeZone: tz,
            hour12: true,
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit'
          }),
          date: inputDate.toLocaleDateString('en-US', { 
            timeZone: tz,
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          dateShort: inputDate.toLocaleDateString('en-US', { 
            timeZone: tz,
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          offset: getTimezoneOffset(tz, inputDate),
          iso: convertToTimezone(inputDate, tz).toISOString(),
          relative: getRelativeTime(convertToTimezone(inputDate, tz))
        };
        
        conversions[tz] = converted;
      });

      setResults({ conversions });
    } catch (error) {
      setResults({ error: 'Timezone conversion failed' });
    }
  };

  const convertToTimezone = (date, timezone) => {
    // Create a new date object that represents the same instant in the target timezone
    return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  };

  const getTimezoneOffset = (timezone, date = new Date()) => {
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    const offset = (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
    const sign = offset >= 0 ? '+' : '-';
    const hours = Math.floor(Math.abs(offset));
    const minutes = Math.floor((Math.abs(offset) % 1) * 60);
    return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const absDiff = Math.abs(diff);
    
    if (absDiff < 60000) return 'Now';
    if (absDiff < 3600000) {
      const mins = Math.floor(absDiff / 60000);
      return `${mins} min ${diff > 0 ? 'from now' : 'ago'}`;
    }
    if (absDiff < 86400000) {
      const hours = Math.floor(absDiff / 3600000);
      return `${hours} hr ${diff > 0 ? 'from now' : 'ago'}`;
    }
    const days = Math.floor(absDiff / 86400000);
    return `${days} day${days > 1 ? 's' : ''} ${diff > 0 ? 'from now' : 'ago'}`;
  };

  const setCurrentTime = () => {
    const now = new Date();
    setInputTime(now.toISOString().slice(0, 16));
  };

  const addTargetTimezone = (timezone) => {
    if (!targetTimezones.includes(timezone)) {
      setTargetTimezones([...targetTimezones, timezone]);
    }
  };

  const removeTargetTimezone = (timezone) => {
    setTargetTimezones(targetTimezones.filter(tz => tz !== timezone));
  };

  const [copied, setCopied] = useState('');
  const copyToClipboard = (value, label) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const allTimezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (New York)' },
    { value: 'America/Chicago', label: 'Central Time (Chicago)' },
    { value: 'America/Denver', label: 'Mountain Time (Denver)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (Los Angeles)' },
    { value: 'America/Anchorage', label: 'Alaska Time (Anchorage)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (Honolulu)' },
    { value: 'America/Toronto', label: 'Eastern Time (Toronto)' },
    { value: 'America/Vancouver', label: 'Pacific Time (Vancouver)' },
    { value: 'America/Mexico_City', label: 'Central Time (Mexico City)' },
    { value: 'America/Sao_Paulo', label: 'Brazil Time (São Paulo)' },
    { value: 'America/Argentina/Buenos_Aires', label: 'Argentina Time (Buenos Aires)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (London)' },
    { value: 'Europe/Paris', label: 'Central European Time (Paris)' },
    { value: 'Europe/Berlin', label: 'Central European Time (Berlin)' },
    { value: 'Europe/Rome', label: 'Central European Time (Rome)' },
    { value: 'Europe/Madrid', label: 'Central European Time (Madrid)' },
    { value: 'Europe/Amsterdam', label: 'Central European Time (Amsterdam)' },
    { value: 'Europe/Stockholm', label: 'Central European Time (Stockholm)' },
    { value: 'Europe/Moscow', label: 'Moscow Time (Moscow)' },
    { value: 'Europe/Istanbul', label: 'Turkey Time (Istanbul)' },
    { value: 'Africa/Cairo', label: 'Eastern European Time (Cairo)' },
    { value: 'Africa/Johannesburg', label: 'South Africa Time (Johannesburg)' },
    { value: 'Asia/Dubai', label: 'Gulf Standard Time (Dubai)' },
    { value: 'Asia/Karachi', label: 'Pakistan Standard Time (Karachi)' },
    { value: 'Asia/Kolkata', label: 'India Standard Time (Mumbai)' },
    { value: 'Asia/Bangkok', label: 'Indochina Time (Bangkok)' },
    { value: 'Asia/Shanghai', label: 'China Standard Time (Shanghai)' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (Tokyo)' },
    { value: 'Asia/Seoul', label: 'Korea Standard Time (Seoul)' },
    { value: 'Asia/Singapore', label: 'Singapore Standard Time' },
    { value: 'Asia/Hong_Kong', label: 'Hong Kong Time' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (Sydney)' },
    { value: 'Australia/Melbourne', label: 'Australian Eastern Time (Melbourne)' },
    { value: 'Australia/Perth', label: 'Australian Western Time (Perth)' },
    { value: 'Pacific/Auckland', label: 'New Zealand Time (Auckland)' },
    { value: 'Pacific/Fiji', label: 'Fiji Time' }
  ];

  const popularTimezones = [
    'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 
    'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney'
  ];

  return (
    <div className="tool-container">
        {/* Current World Clock */}
        <div className="world-clock-section">
          <h3>🕐 Current Time Around the World</h3>
          <div className="world-clock-grid">
            {popularTimezones.map(tz => {
              const tzInfo = allTimezones.find(t => t.value === tz);
              const currentTime = currentTimes[tz];
              return (
                <div key={tz} className="world-clock-item">
                  <div className="clock-city">{tzInfo?.label.split(' (')[1]?.replace(')', '') || tz}</div>
                  <div className="clock-time">{currentTime?.time12 || '...'}</div>
                  <div className="clock-date">{currentTime?.date || '...'}</div>
                  <div className="clock-offset">{currentTime?.offset || '...'}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="input-section">
          <div className="input-group">
            <label className="input-label">Date & Time to Convert</label>
            <input
              type="datetime-local"
              className="text-input"
              value={inputTime}
              onChange={(e) => setInputTime(e.target.value)}
            />
            <button className="btn btn-outline btn-small" onClick={setCurrentTime}>
              📍 Current Time
            </button>
          </div>

          <div className="input-group">
            <label className="input-label">Source Timezone (Optional - defaults to local)</label>
            <select
              className="text-input"
              value={inputTimezone}
              onChange={(e) => setInputTimezone(e.target.value)}
            >
              {allTimezones.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Target Timezones</label>
            <div className="timezone-selector">
              <select
                className="text-input"
                onChange={(e) => addTargetTimezone(e.target.value)}
                value=""
              >
                <option value="">Add timezone...</option>
                {allTimezones.filter(tz => !targetTimezones.includes(tz.value)).map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>
            
            <div className="selected-timezones">
              {targetTimezones.map(tz => {
                const tzInfo = allTimezones.find(t => t.value === tz);
                return (
                  <div key={tz} className="timezone-tag">
                    <span>{tzInfo?.label || tz}</span>
                    <button 
                      className="remove-timezone"
                      onClick={() => removeTargetTimezone(tz)}
                      title="Remove timezone"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {results.error ? (
          <div className="error-section">
            <p className="error-text">❌ {results.error}</p>
          </div>
        ) : results.conversions ? (
          <div className="results-section">
            <h3>🔄 Timezone Conversion Results</h3>
            
            <div className="conversion-results">
              {Object.entries(results.conversions).map(([tz, data]) => (
                <div key={tz} className="conversion-item">
                  <div className="conversion-header">
                    <h4>{data.display}</h4>
                    <span className="timezone-offset">{data.offset}</span>
                  </div>
                  
                  <div className="conversion-content">
                    <div className="time-display">
                      <div className="time-main">{data.time12}</div>
                      <div className="time-24">{data.time24}</div>
                    </div>
                    
                    <div className="date-display">
                      <div className="date-full">{data.date}</div>
                      <div className="date-short">{data.dateShort}</div>
                    </div>
                    
                    <div className="conversion-actions">
                      <button 
                        className="btn btn-outline btn-small"
                        onClick={() => copyToClipboard(data.time24, `${tz}-time24`)}
                      >
                        {copied === `${tz}-time24` ? '✓' : '📋'} 24h
                      </button>
                      <button 
                        className="btn btn-outline btn-small"
                        onClick={() => copyToClipboard(data.time12, `${tz}-time12`)}
                      >
                        {copied === `${tz}-time12` ? '✓' : '📋'} 12h
                      </button>
                      <button 
                        className="btn btn-outline btn-small"
                        onClick={() => copyToClipboard(data.iso, `${tz}-iso`)}
                      >
                        {copied === `${tz}-iso` ? '✓' : '📋'} ISO
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="timezone-info">
          <h3>ℹ️ Timezone Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Your Current Timezone:</span>
              <span className="info-value">{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Current UTC Offset:</span>
              <span className="info-value">{getTimezoneOffset(Intl.DateTimeFormat().resolvedOptions().timeZone)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Daylight Saving:</span>
              <span className="info-value">{isDaylightSaving() ? 'Active' : 'Not Active'}</span>
            </div>
          </div>
        </div>
    </div>
  );

  function isDaylightSaving() {
    const now = new Date();
    const january = new Date(now.getFullYear(), 0, 1);
    const july = new Date(now.getFullYear(), 6, 1);
    return Math.max(january.getTimezoneOffset(), july.getTimezoneOffset()) !== now.getTimezoneOffset();
  }
};

export default TimezoneConverter;
