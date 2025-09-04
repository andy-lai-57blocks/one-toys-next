'use client';

import React, { useState, useEffect } from 'react';

const DateCalculator = () => {
  const [operation, setOperation] = useState('difference');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [baseDate, setBaseDate] = useState('');
  const [addValue, setAddValue] = useState(1);
  const [addUnit, setAddUnit] = useState('days');
  const [includeTime, setIncludeTime] = useState(true);
  const [results, setResults] = useState({});

  useEffect(() => {
    // Only set initial dates on client-side to prevent hydration mismatch
    if (typeof window !== 'undefined') {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      setStartDate(now.toISOString().slice(0, includeTime ? 16 : 10));
      setEndDate(tomorrow.toISOString().slice(0, includeTime ? 16 : 10));
      setBaseDate(now.toISOString().slice(0, includeTime ? 16 : 10));
    }
  }, [includeTime]);

  useEffect(() => {
    calculateResults();
  }, [operation, startDate, endDate, baseDate, addValue, addUnit, includeTime]);

  const calculateResults = () => {
    try {
      if (operation === 'difference') {
        calculateDifference();
      } else if (operation === 'add') {
        calculateAddition();
      } else if (operation === 'age') {
        calculateAge();
      }
    } catch (error) {
      setResults({ error: 'Invalid date format or calculation error' });
    }
  };

  const calculateDifference = () => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setResults({ error: 'Invalid date format' });
      return;
    }

    const diff = end.getTime() - start.getTime();
    const absDiff = Math.abs(diff);
    const isNegative = diff < 0;

    const milliseconds = absDiff;
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = calculateMonthDifference(start, end);
    const years = Math.floor(Math.abs(months) / 12);

    const businessDays = calculateBusinessDays(start, end);
    const weekends = Math.floor(Math.abs(days - businessDays));

    setResults({
      type: 'difference',
      isNegative,
      absolute: {
        milliseconds,
        seconds,
        minutes,
        hours,
        days,
        weeks,
        months: Math.abs(months),
        years
      },
      detailed: {
        exactDays: days,
        businessDays: Math.abs(businessDays),
        weekends,
        completeWeeks: weeks,
        remainingDays: days % 7
      },
      formatted: {
        years: Math.floor(Math.abs(months) / 12),
        months: Math.abs(months) % 12,
        days: days % 30,
        hours: hours % 24,
        minutes: minutes % 60,
        seconds: seconds % 60
      },
      humanReadable: formatHumanReadable(diff)
    });
  };

  const calculateAddition = () => {
    if (!baseDate || !addValue) return;

    const base = new Date(baseDate);
    if (isNaN(base.getTime())) {
      setResults({ error: 'Invalid base date format' });
      return;
    }

    const result = new Date(base);
    const value = parseFloat(addValue);

    switch (addUnit) {
      case 'milliseconds':
        result.setMilliseconds(result.getMilliseconds() + value);
        break;
      case 'seconds':
        result.setSeconds(result.getSeconds() + value);
        break;
      case 'minutes':
        result.setMinutes(result.getMinutes() + value);
        break;
      case 'hours':
        result.setHours(result.getHours() + value);
        break;
      case 'days':
        result.setDate(result.getDate() + value);
        break;
      case 'weeks':
        result.setDate(result.getDate() + (value * 7));
        break;
      case 'months':
        result.setMonth(result.getMonth() + value);
        break;
      case 'years':
        result.setFullYear(result.getFullYear() + value);
        break;
      default:
        break;
    }

    const businessDaysToAdd = addUnit === 'businessDays' ? value : 0;
    let businessResult = new Date(base);
    if (businessDaysToAdd !== 0) {
      businessResult = addBusinessDays(base, businessDaysToAdd);
    }

    setResults({
      type: 'addition',
      original: base.toISOString(),
      result: addUnit === 'businessDays' ? businessResult.toISOString() : result.toISOString(),
      formatted: {
        iso: addUnit === 'businessDays' ? businessResult.toISOString() : result.toISOString(),
        local: addUnit === 'businessDays' ? businessResult.toLocaleString() : result.toLocaleString(),
        date: addUnit === 'businessDays' ? businessResult.toLocaleDateString() : result.toLocaleDateString(),
        time: addUnit === 'businessDays' ? businessResult.toLocaleTimeString() : result.toLocaleTimeString(),
        relative: getRelativeTime(addUnit === 'businessDays' ? businessResult : result)
      },
      operation: `${value >= 0 ? 'Add' : 'Subtract'} ${Math.abs(value)} ${addUnit}`
    });
  };

  const calculateAge = () => {
    if (!startDate) return;

    const birthDate = new Date(startDate);
    const now = new Date();

    if (isNaN(birthDate.getTime())) {
      setResults({ error: 'Invalid birth date format' });
      return;
    }

    const diff = now.getTime() - birthDate.getTime();
    if (diff < 0) {
      setResults({ error: 'Birth date cannot be in the future' });
      return;
    }

    const ageInMs = diff;
    const ageInDays = Math.floor(ageInMs / (1000 * 60 * 60 * 24));
    const ageInYears = Math.floor(ageInDays / 365.25);
    const ageInMonths = Math.floor(ageInDays / 30.44);

    // Calculate exact age
    let years = now.getFullYear() - birthDate.getFullYear();
    let months = now.getMonth() - birthDate.getMonth();
    let days = now.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    // Calculate next birthday
    const nextBirthday = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (nextBirthday < now) {
      nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
    }
    const daysToNextBirthday = Math.ceil((nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    setResults({
      type: 'age',
      exact: { years, months, days },
      approximate: {
        years: ageInYears,
        months: ageInMonths,
        days: ageInDays,
        hours: Math.floor(ageInMs / (1000 * 60 * 60)),
        minutes: Math.floor(ageInMs / (1000 * 60)),
        seconds: Math.floor(ageInMs / 1000)
      },
      nextBirthday: {
        date: nextBirthday.toLocaleDateString(),
        daysUntil: daysToNextBirthday,
        ageOnNext: years + 1
      },
      milestones: {
        decade: Math.floor(ageInYears / 10) * 10,
        century: ageInYears >= 100,
        halfCentury: ageInYears >= 50,
        quarterCentury: ageInYears >= 25
      }
    });
  };

  const calculateMonthDifference = (start, end) => {
    const months = (end.getFullYear() - start.getFullYear()) * 12;
    return months - start.getMonth() + end.getMonth();
  };

  const calculateBusinessDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    let count = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return start > end ? -count : count;
  };

  const addBusinessDays = (startDate, days) => {
    const result = new Date(startDate);
    let daysToAdd = Math.abs(days);
    const direction = days >= 0 ? 1 : -1;

    while (daysToAdd > 0) {
      result.setDate(result.getDate() + direction);
      const dayOfWeek = result.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not weekend
        daysToAdd--;
      }
    }

    return result;
  };

  const formatHumanReadable = (ms) => {
    const absMs = Math.abs(ms);
    const isNegative = ms < 0;
    const prefix = isNegative ? '' : '';
    const suffix = isNegative ? ' ago' : ' from now';

    if (absMs < 60000) return 'Less than a minute' + suffix;
    if (absMs < 3600000) return Math.floor(absMs / 60000) + ' minutes' + suffix;
    if (absMs < 86400000) return Math.floor(absMs / 3600000) + ' hours' + suffix;
    if (absMs < 2592000000) return Math.floor(absMs / 86400000) + ' days' + suffix;
    if (absMs < 31536000000) return Math.floor(absMs / 2592000000) + ' months' + suffix;
    return Math.floor(absMs / 31536000000) + ' years' + suffix;
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    return formatHumanReadable(diff);
  };

  const setCurrentDate = (setter) => {
    const now = new Date();
    setter(now.toISOString().slice(0, includeTime ? 16 : 10));
  };

  const [copied, setCopied] = useState('');
  const copyToClipboard = (value, label) => {
    navigator.clipboard.writeText(value.toString()).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  return (
    <div className="tool-container">
        <div className="operation-selector">
          <div className="button-group">
            <button 
              className={`btn ${operation === 'difference' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setOperation('difference')}
            >
              📊 Date Difference
            </button>
            <button 
              className={`btn ${operation === 'add' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setOperation('add')}
            >
              ➕ Add/Subtract Time
            </button>
            <button 
              className={`btn ${operation === 'age' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setOperation('age')}
            >
              🎂 Age Calculator
            </button>
          </div>
        </div>

        <div className="input-section">
          <div className="input-group">
            <label>
              <input
                type="checkbox"
                checked={includeTime}
                onChange={(e) => setIncludeTime(e.target.checked)}
              />
              Include time in calculations
            </label>
          </div>

          {operation === 'difference' && (
            <>
              <div className="input-group">
                <label className="input-label">Start Date {includeTime ? '& Time' : ''}</label>
                <input
                  type={includeTime ? 'datetime-local' : 'date'}
                  className="text-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <button className="btn btn-outline btn-small" onClick={() => setCurrentDate(setStartDate)}>
                  📍 Now
                </button>
              </div>
              <div className="input-group">
                <label className="input-label">End Date {includeTime ? '& Time' : ''}</label>
                <input
                  type={includeTime ? 'datetime-local' : 'date'}
                  className="text-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <button className="btn btn-outline btn-small" onClick={() => setCurrentDate(setEndDate)}>
                  📍 Now
                </button>
              </div>
            </>
          )}

          {operation === 'add' && (
            <>
              <div className="input-group">
                <label className="input-label">Base Date {includeTime ? '& Time' : ''}</label>
                <input
                  type={includeTime ? 'datetime-local' : 'date'}
                  className="text-input"
                  value={baseDate}
                  onChange={(e) => setBaseDate(e.target.value)}
                />
                <button className="btn btn-outline btn-small" onClick={() => setCurrentDate(setBaseDate)}>
                  📍 Now
                </button>
              </div>
              <div className="input-group">
                <label className="input-label">Amount to Add/Subtract</label>
                <div className="input-row">
                  <input
                    type="number"
                    className="text-input"
                    value={addValue}
                    onChange={(e) => setAddValue(e.target.value)}
                    placeholder="Enter number (negative to subtract)"
                  />
                  <select
                    className="text-input"
                    value={addUnit}
                    onChange={(e) => setAddUnit(e.target.value)}
                  >
                    <option value="milliseconds">Milliseconds</option>
                    <option value="seconds">Seconds</option>
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                    <option value="businessDays">Business Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {operation === 'age' && (
            <div className="input-group">
              <label className="input-label">Birth Date {includeTime ? '& Time' : ''}</label>
              <input
                type={includeTime ? 'datetime-local' : 'date'}
                className="text-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          )}
        </div>

        {results.error ? (
          <div className="error-section">
            <p className="error-text">❌ {results.error}</p>
          </div>
        ) : results.type ? (
          <div className="results-section">
            <h3>📊 Calculation Results</h3>

            {results.type === 'difference' && (
              <>
                <div className="result-group">
                  <h4>📏 Time Difference {results.isNegative && '(Negative)'}</h4>
                  <div className="result-grid">
                    <div className="result-item">
                      <span className="result-label">Years:</span>
                      <span className="result-value">{results.absolute.years.toLocaleString()}</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Months:</span>
                      <span className="result-value">{results.absolute.months.toLocaleString()}</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Weeks:</span>
                      <span className="result-value">{results.absolute.weeks.toLocaleString()}</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Days:</span>
                      <span className="result-value">{results.absolute.days.toLocaleString()}</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Hours:</span>
                      <span className="result-value">{results.absolute.hours.toLocaleString()}</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Minutes:</span>
                      <span className="result-value">{results.absolute.minutes.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="result-group">
                  <h4>💼 Business Days Analysis</h4>
                  <div className="result-grid">
                    <div className="result-item">
                      <span className="result-label">Business Days:</span>
                      <span className="result-value">{results.detailed.businessDays.toLocaleString()}</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Weekend Days:</span>
                      <span className="result-value">{results.detailed.weekends.toLocaleString()}</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Complete Weeks:</span>
                      <span className="result-value">{results.detailed.completeWeeks.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="result-group">
                  <h4>📝 Human Readable</h4>
                  <div className="human-readable-result">
                    <span className="result-value large">{results.humanReadable}</span>
                  </div>
                </div>
              </>
            )}

            {results.type === 'addition' && (
              <div className="result-group">
                <h4>📅 {results.operation} Result</h4>
                <div className="result-grid">
                  <div className="result-item">
                    <span className="result-label">Result Date:</span>
                    <span className="result-value">{results.formatted.local}</span>
                    <button 
                      className="btn btn-outline btn-small"
                      onClick={() => copyToClipboard(results.formatted.iso, 'result')}
                    >
                      {copied === 'result' ? '✓' : '📋'}
                    </button>
                  </div>
                  <div className="result-item">
                    <span className="result-label">ISO Format:</span>
                    <span className="result-value">{results.formatted.iso}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Date Only:</span>
                    <span className="result-value">{results.formatted.date}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Time Only:</span>
                    <span className="result-value">{results.formatted.time}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Relative:</span>
                    <span className="result-value">{results.formatted.relative}</span>
                  </div>
                </div>
              </div>
            )}

            {results.type === 'age' && (
              <>
                <div className="result-group">
                  <h4>🎂 Current Age</h4>
                  <div className="age-display">
                    <div className="age-main">
                      <span className="age-number">{results.exact.years}</span>
                      <span className="age-unit">years</span>
                      <span className="age-number">{results.exact.months}</span>
                      <span className="age-unit">months</span>
                      <span className="age-number">{results.exact.days}</span>
                      <span className="age-unit">days</span>
                    </div>
                  </div>
                </div>

                <div className="result-group">
                  <h4>📊 Age in Different Units</h4>
                  <div className="result-grid">
                    <div className="result-item">
                      <span className="result-label">Total Days:</span>
                      <span className="result-value">{results.approximate.days.toLocaleString()}</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Total Hours:</span>
                      <span className="result-value">{results.approximate.hours.toLocaleString()}</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Total Minutes:</span>
                      <span className="result-value">{results.approximate.minutes.toLocaleString()}</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Total Seconds:</span>
                      <span className="result-value">{results.approximate.seconds.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="result-group">
                  <h4>🎉 Next Birthday</h4>
                  <div className="result-grid">
                    <div className="result-item">
                      <span className="result-label">Date:</span>
                      <span className="result-value">{results.nextBirthday.date}</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Days Until:</span>
                      <span className="result-value">{results.nextBirthday.daysUntil}</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Age on Next Birthday:</span>
                      <span className="result-value">{results.nextBirthday.ageOnNext}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : null}
    </div>
  );
};

export default DateCalculator;
