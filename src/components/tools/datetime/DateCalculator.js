'use client';

import React, { useState, useEffect } from 'react';
import SimpleAd from '../../ads/SimpleAdSSG';
import { openDatePicker } from '@/utils/dateInput';
import { wallInputValue } from '@/utils/timezone';

/**
 * Value for an <input type="date" | "datetime-local">.
 *
 * MUST be the LOCAL wall clock. `new Date().toISOString()` is UTC, and pouring
 * that into one of these inputs (which the browser reads back as local) put the
 * default start/end 8 hours out at GMT+8, and a whole day out for anyone east
 * of UTC during their evening. Same bug the timezone and date-format tools had;
 * wallInputValue is the shared fix.
 */
const dateInputValue = (date, withTime) =>
  (withTime ? wallInputValue(date) : wallInputValue(date).slice(0, 10));

/**
 * The other half of the same rule: a `date` input REJECTS a 16-character value
 * (it only accepts yyyy-MM-dd), so the stored value is trimmed to match the
 * input's type whenever the "include time" switch is off.
 */
const shownValue = (value, withTime) => (withTime ? value : value.slice(0, 10));

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
      
      setStartDate(dateInputValue(now, includeTime));
      setEndDate(dateInputValue(tomorrow, includeTime));
      setBaseDate(dateInputValue(now, includeTime));
    }
    /* Mount only. This used to depend on `includeTime`, so merely ticking the
       checkbox threw away whatever dates the user had entered. */
  }, []);

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
      humanReadable: formatDuration(start, end, includeTime)
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

  const plural = (n, unit) => `${n} ${unit}${n === 1 ? '' : 's'}`;

  /* Relative wording - "2 days ago" / "2 days from now". Only valid when one
     side of the comparison is NOW, which is why the difference mode must not
     use it (it used to, and read as "1 days from now"). */
  const formatRelative = (ms) => {
    const absMs = Math.abs(ms);
    const suffix = ms < 0 ? ' ago' : ' from now';

    if (absMs < 60000) return 'Less than a minute' + suffix;
    if (absMs < 3600000) return plural(Math.floor(absMs / 60000), 'minute') + suffix;
    if (absMs < 86400000) return plural(Math.floor(absMs / 3600000), 'hour') + suffix;
    if (absMs < 2592000000) return plural(Math.floor(absMs / 86400000), 'day') + suffix;
    if (absMs < 31536000000) return plural(Math.floor(absMs / 2592000000), 'month') + suffix;
    return plural(Math.floor(absMs / 31536000000), 'year') + suffix;
  };

  /**
   * Calendar breakdown of the gap between two instants, borrowed from the age
   * calculation below so both agree. Borrowing (not dividing) is what makes
   * 31 Jan -> 28 Feb read as days rather than a phantom 1.07 months.
   */
  const diffParts = (from, to) => {
    const a = from <= to ? from : to;
    const b = from <= to ? to : from;

    let years = b.getFullYear() - a.getFullYear();
    let months = b.getMonth() - a.getMonth();
    let days = b.getDate() - a.getDate();
    let hours = b.getHours() - a.getHours();
    let minutes = b.getMinutes() - a.getMinutes();

    if (minutes < 0) { minutes += 60; hours -= 1; }
    if (hours < 0) { hours += 24; days -= 1; }
    if (days < 0) {
      months -= 1;
      days += new Date(b.getFullYear(), b.getMonth(), 0).getDate();
    }
    if (months < 0) { years -= 1; months += 12; }

    return { years, months, days, hours, minutes };
  };

  /* The headline answer for the difference mode: "1 year, 2 months, 3 days".
     Hours and minutes only appear when the inputs actually carry a time - a
     date-only comparison should not report "0 hours, 0 minutes". */
  const formatDuration = (from, to, withTime) => {
    const p = diffParts(from, to);
    const chunks = [];
    if (p.years > 0) chunks.push(plural(p.years, 'year'));
    if (p.months > 0) chunks.push(plural(p.months, 'month'));
    if (p.days > 0) chunks.push(plural(p.days, 'day'));
    if (withTime) {
      if (p.hours > 0) chunks.push(plural(p.hours, 'hour'));
      if (p.minutes > 0) chunks.push(plural(p.minutes, 'minute'));
    }
    return chunks.length ? chunks.join(', ') : 'The same day';
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    return formatRelative(diff);
  };

  const setCurrentDate = (setter) => {
    const now = new Date();
    setter(dateInputValue(now, includeTime));
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
          <nav className="tab-navigation" aria-label="Calculation mode">
            <button
              type="button"
              className={`tab-button${operation === 'difference' ? ' active' : ''}`}
              onClick={() => setOperation('difference')}
            >
              Date Difference
            </button>
            <button
              type="button"
              className={`tab-button${operation === 'add' ? ' active' : ''}`}
              onClick={() => setOperation('add')}
            >
              Add / Subtract
            </button>
            <button
              type="button"
              className={`tab-button${operation === 'age' ? ' active' : ''}`}
              onClick={() => setOperation('age')}
            >
              Age
            </button>
          </nav>
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
            <div className="input-row">
              <div className="input-group">
                <label className="input-label" htmlFor="calc-start">
                  Start Date {includeTime ? '& Time' : ''}
                </label>
                <div className="input-with-action">
                  <input
                    id="calc-start"
                    type={includeTime ? 'datetime-local' : 'date'}
                    className="text-input"
                    value={shownValue(startDate, includeTime)}
                    onClick={openDatePicker}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-outline btn-small"
                    onClick={() => setCurrentDate(setStartDate)}
                  >
                    Now
                  </button>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="calc-end">
                  End Date {includeTime ? '& Time' : ''}
                </label>
                <div className="input-with-action">
                  <input
                    id="calc-end"
                    type={includeTime ? 'datetime-local' : 'date'}
                    className="text-input"
                    value={shownValue(endDate, includeTime)}
                    onClick={openDatePicker}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-outline btn-small"
                    onClick={() => setCurrentDate(setEndDate)}
                  >
                    Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {operation === 'add' && (
            <>
              <div className="input-group">
                <label className="input-label" htmlFor="calc-base">
                  Base Date {includeTime ? '& Time' : ''}
                </label>
                <div className="input-with-action">
                  <input
                    id="calc-base"
                    type={includeTime ? 'datetime-local' : 'date'}
                    className="text-input"
                    value={shownValue(baseDate, includeTime)}
                    onClick={openDatePicker}
                    onChange={(e) => setBaseDate(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-outline btn-small"
                    onClick={() => setCurrentDate(setBaseDate)}
                  >
                    Now
                  </button>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="calc-amount">
                  Amount to Add/Subtract
                </label>
                {/* Was stacked as two full-width controls: .input-row had no
                    stylesheet rule at all, so this div did nothing. */}
                <div className="input-row input-row--amount">
                  <input
                    id="calc-amount"
                    type="number"
                    className="text-input"
                    value={addValue}
                    onChange={(e) => setAddValue(e.target.value)}
                    placeholder="Enter number (negative to subtract)"
                  />
                  <select
                    className="text-input"
                    aria-label="Unit"
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
                value={shownValue(startDate, includeTime)}
                onClick={openDatePicker}
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
            {/* The answer first. It used to be the THIRD card on the page, below
                six rows that each in turn fully depended on it. */}
            {results.type === 'difference' && (
              <>
                <div className="calc-answer">
                  <p className="calc-answer-value">
                    {results.isNegative ? '−' : ''}{results.humanReadable}
                  </p>
                </div>

                <div className="result-grid calc-primary">
                  <div className="result-item">
                    <span className="result-label">Total days:</span>
                    <span className="result-value">{results.absolute.days.toLocaleString()}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Business days:</span>
                    <span className="result-value">{results.detailed.businessDays.toLocaleString()}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Weeks:</span>
                    <span className="result-value">{results.absolute.weeks.toLocaleString()}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Weekend days:</span>
                    <span className="result-value">{results.detailed.weekends.toLocaleString()}</span>
                  </div>
                </div>

                {/* Same duration, other units. Real data, but nobody reads all
                    of it - it is the reason the page was 1600px tall. */}
                <details className="calc-more">
                  <summary>Same duration in other units</summary>
                  <div className="result-item">
                    <span className="result-label">Years:</span>
                    <span className="result-value">{results.absolute.years.toLocaleString()}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Months:</span>
                    <span className="result-value">{results.absolute.months.toLocaleString()}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Hours:</span>
                    <span className="result-value">{results.absolute.hours.toLocaleString()}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Minutes:</span>
                    <span className="result-value">{results.absolute.minutes.toLocaleString()}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Whole weeks:</span>
                    <span className="result-value">{results.detailed.completeWeeks.toLocaleString()}</span>
                  </div>
                </details>
              </>
            )}

            {results.type === 'addition' && (
              <>
                <div className="calc-answer">
                  <p className="calc-answer-value">{results.formatted.local}</p>
                  {results.formatted.relative && (
                    <p className="calc-answer-note">{results.formatted.relative}</p>
                  )}
                  <button
                    type="button"
                    className="btn btn-outline btn-small calc-answer-copy"
                    onClick={() => copyToClipboard(results.formatted.iso, 'result')}
                  >
                    {copied === 'result' ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>

                <div className="result-grid calc-primary">
                  <div className="result-item">
                    <span className="result-label">ISO 8601:</span>
                    <span className="result-value">{results.formatted.iso}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Date only:</span>
                    <span className="result-value">{results.formatted.date}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Time only:</span>
                    <span className="result-value">{results.formatted.time}</span>
                  </div>
                </div>
              </>
            )}

            {results.type === 'age' && (
              <>
                <div className="calc-answer">
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
                  {/* Was three separate rows in its own card; it is one
                      sentence and belongs next to the age it qualifies. */}
                  <p className="calc-answer-note">
                    Next birthday {results.nextBirthday.date} - in {results.nextBirthday.daysUntil} days, turning {results.nextBirthday.ageOnNext}.
                  </p>
                </div>

                <details className="calc-more">
                  <summary>Same age in other units</summary>
                  <div className="result-item">
                    <span className="result-label">Total days:</span>
                    <span className="result-value">{results.approximate.days.toLocaleString()}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Total hours:</span>
                    <span className="result-value">{results.approximate.hours.toLocaleString()}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Total minutes:</span>
                    <span className="result-value">{results.approximate.minutes.toLocaleString()}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Total seconds:</span>
                    <span className="result-value">{results.approximate.seconds.toLocaleString()}</span>
                  </div>
                </details>
              </>
            )}
          </div>
        ) : null}

      <SimpleAd adSlot="8095900796" style={{ width: '100%', marginTop: '1.5rem' }} />
    </div>
  );
};

export default DateCalculator;
