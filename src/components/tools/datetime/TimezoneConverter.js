'use client';

import React, { useState, useEffect, useMemo } from 'react';
import SimpleAd from '../../ads/SimpleAdSSG';
import {
  formatter,
  OPT,
  pad,
  partsOf,
  zoneOffsetMinutes,
  wallToInstant,
  wallInputValue,
  wallInputValueIn,
  parseWallInput,
  time24,
  zoneName
} from '@/utils/timezone';

// Shared timezone maths lives in `@/utils/timezone` - the Date Formatter uses it
// too, and the `hour12: false` detail there is easy to get wrong twice.

/** Whole-day difference between the calendar dates of two zones. */
function dayDifference(instant, fromZone, toZone) {
  const dayNumber = (timeZone) => {
    const p = partsOf(instant, timeZone, OPT.ymd);
    return Math.round(Date.UTC(+p.year, +p.month - 1, +p.day) / 86400000);
  };
  return dayNumber(toZone) - dayNumber(fromZone);
}

/** What part of their day it is, and whether it is a reasonable time to call. */
function describeHours(instant, timeZone) {
  const hour = +partsOf(instant, timeZone, OPT.hour).hour % 24;
  const weekday = formatter(timeZone, OPT.weekday).format(instant);
  const weekend = weekday === 'Sat' || weekday === 'Sun';
  const working = hour >= 9 && hour < 18 && !weekend;

  let icon = '🌙';
  let label = 'Night';
  if (hour >= 5 && hour < 9) {
    icon = '🌅';
    label = 'Early morning';
  } else if (hour >= 9 && hour < 12) {
    icon = '☀️';
    label = 'Morning';
  } else if (hour >= 12 && hour < 18) {
    icon = '💼';
    label = 'Afternoon';
  } else if (hour >= 18 && hour < 22) {
    icon = '🌆';
    label = 'Evening';
  }
  if (weekend && hour >= 9 && hour < 18) {
    icon = '🏖️';
    label = 'Weekend';
  }

  return { icon, label, working };
}

function formatOffset(minutes) {
  const sign = minutes < 0 ? '−' : '+';
  const abs = Math.abs(minutes);
  return `UTC${sign}${Math.floor(abs / 60)}${abs % 60 ? `:${pad(abs % 60)}` : ''}`;
}

function formatDelta(minutes) {
  if (minutes === 0) return 'same time';
  const abs = Math.abs(minutes);
  return `${minutes > 0 ? '+' : '−'}${Math.floor(abs / 60)}${abs % 60 ? `:${pad(abs % 60)}` : ''}h`;
}

const DAY_LABELS = { '-1': 'Yesterday', 0: 'Today', 1: 'Tomorrow' };
const dayLabel = (days) =>
  DAY_LABELS[days] !== undefined ? DAY_LABELS[days] : days > 0 ? `+${days} days` : `${days} days`;

// One flat list, grouped by region for the pickers. City names are the label
// because that is what people search for; the abbreviation is computed per
// instant rather than hardcoded, so it is never wrong for the season.
const ZONES = [
  { v: 'Pacific/Honolulu', c: 'Honolulu', r: 'Americas' },
  { v: 'America/Anchorage', c: 'Anchorage', r: 'Americas' },
  { v: 'America/Los_Angeles', c: 'Los Angeles', r: 'Americas' },
  { v: 'America/Vancouver', c: 'Vancouver', r: 'Americas' },
  { v: 'America/Denver', c: 'Denver', r: 'Americas' },
  { v: 'America/Chicago', c: 'Chicago', r: 'Americas' },
  { v: 'America/Mexico_City', c: 'Mexico City', r: 'Americas' },
  { v: 'America/New_York', c: 'New York', r: 'Americas' },
  { v: 'America/Toronto', c: 'Toronto', r: 'Americas' },
  { v: 'America/Bogota', c: 'Bogotá', r: 'Americas' },
  { v: 'America/Lima', c: 'Lima', r: 'Americas' },
  { v: 'America/Santiago', c: 'Santiago', r: 'Americas' },
  { v: 'America/Sao_Paulo', c: 'São Paulo', r: 'Americas' },
  { v: 'America/Argentina/Buenos_Aires', c: 'Buenos Aires', r: 'Americas' },
  { v: 'UTC', c: 'UTC', r: 'Europe & Africa' },
  { v: 'Europe/London', c: 'London', r: 'Europe & Africa' },
  { v: 'Europe/Dublin', c: 'Dublin', r: 'Europe & Africa' },
  { v: 'Europe/Lisbon', c: 'Lisbon', r: 'Europe & Africa' },
  { v: 'Europe/Paris', c: 'Paris', r: 'Europe & Africa' },
  { v: 'Europe/Berlin', c: 'Berlin', r: 'Europe & Africa' },
  { v: 'Europe/Madrid', c: 'Madrid', r: 'Europe & Africa' },
  { v: 'Europe/Rome', c: 'Rome', r: 'Europe & Africa' },
  { v: 'Europe/Amsterdam', c: 'Amsterdam', r: 'Europe & Africa' },
  { v: 'Europe/Stockholm', c: 'Stockholm', r: 'Europe & Africa' },
  { v: 'Europe/Warsaw', c: 'Warsaw', r: 'Europe & Africa' },
  { v: 'Europe/Athens', c: 'Athens', r: 'Europe & Africa' },
  { v: 'Europe/Istanbul', c: 'Istanbul', r: 'Europe & Africa' },
  { v: 'Europe/Moscow', c: 'Moscow', r: 'Europe & Africa' },
  { v: 'Africa/Casablanca', c: 'Casablanca', r: 'Europe & Africa' },
  { v: 'Africa/Lagos', c: 'Lagos', r: 'Europe & Africa' },
  { v: 'Africa/Cairo', c: 'Cairo', r: 'Europe & Africa' },
  { v: 'Africa/Nairobi', c: 'Nairobi', r: 'Europe & Africa' },
  { v: 'Africa/Johannesburg', c: 'Johannesburg', r: 'Europe & Africa' },
  { v: 'Asia/Jerusalem', c: 'Jerusalem', r: 'Asia' },
  { v: 'Asia/Riyadh', c: 'Riyadh', r: 'Asia' },
  { v: 'Asia/Tehran', c: 'Tehran', r: 'Asia' },
  { v: 'Asia/Dubai', c: 'Dubai', r: 'Asia' },
  { v: 'Asia/Karachi', c: 'Karachi', r: 'Asia' },
  { v: 'Asia/Kolkata', c: 'Kolkata', r: 'Asia' },
  { v: 'Asia/Colombo', c: 'Colombo', r: 'Asia' },
  { v: 'Asia/Kathmandu', c: 'Kathmandu', r: 'Asia' },
  { v: 'Asia/Dhaka', c: 'Dhaka', r: 'Asia' },
  { v: 'Asia/Yangon', c: 'Yangon', r: 'Asia' },
  { v: 'Asia/Bangkok', c: 'Bangkok', r: 'Asia' },
  { v: 'Asia/Ho_Chi_Minh', c: 'Ho Chi Minh City', r: 'Asia' },
  { v: 'Asia/Jakarta', c: 'Jakarta', r: 'Asia' },
  { v: 'Asia/Kuala_Lumpur', c: 'Kuala Lumpur', r: 'Asia' },
  { v: 'Asia/Singapore', c: 'Singapore', r: 'Asia' },
  { v: 'Asia/Manila', c: 'Manila', r: 'Asia' },
  { v: 'Asia/Hong_Kong', c: 'Hong Kong', r: 'Asia' },
  { v: 'Asia/Taipei', c: 'Taipei', r: 'Asia' },
  { v: 'Asia/Shanghai', c: 'Shanghai', r: 'Asia' },
  { v: 'Asia/Seoul', c: 'Seoul', r: 'Asia' },
  { v: 'Asia/Tokyo', c: 'Tokyo', r: 'Asia' },
  { v: 'Asia/Almaty', c: 'Almaty', r: 'Asia' },
  { v: 'Australia/Perth', c: 'Perth', r: 'Oceania' },
  { v: 'Australia/Adelaide', c: 'Adelaide', r: 'Oceania' },
  { v: 'Australia/Brisbane', c: 'Brisbane', r: 'Oceania' },
  { v: 'Australia/Sydney', c: 'Sydney', r: 'Oceania' },
  { v: 'Australia/Melbourne', c: 'Melbourne', r: 'Oceania' },
  { v: 'Pacific/Auckland', c: 'Auckland', r: 'Oceania' },
  { v: 'Pacific/Fiji', c: 'Fiji', r: 'Oceania' }
];

const REGIONS = ['Americas', 'Europe & Africa', 'Asia', 'Oceania'];

const DEFAULT_TARGETS = ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];

// ---------------------------------------------------------------------------
// The page is ONE list. The first row is the reference zone (the source), the
// rest are targets, so there is no separate "added timezones" area and no
// duplicate world-clock grid. Defaulting to "Now" makes that list a live world
// clock, which is why the old one could be removed rather than kept alongside.
// ---------------------------------------------------------------------------

const TimezoneConverter = () => {
  const [mounted, setMounted] = useState(false);
  const [isNow, setIsNow] = useState(true);
  const [wall, setWall] = useState('');
  const [now, setNow] = useState(null);
  const [sourceZone, setSourceZone] = useState('UTC');
  const [userZone, setUserZone] = useState('UTC');
  const [targets, setTargets] = useState(DEFAULT_TARGETS);
  const [copied, setCopied] = useState('');

  // Hydration-safe: the browser's zone, the current time and the input value
  // can only be resolved on the client, so the first paint shows a skeleton.
  useEffect(() => {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const start = new Date();
    setUserZone(zone);
    setSourceZone(zone);
    setTargets(DEFAULT_TARGETS.filter((tz) => tz !== zone));
    setWall(wallInputValue(start));
    setNow(start);
    setMounted(true);
  }, []);

  // Only tick in "Now" mode; a fixed time does not need re-rendering.
  useEffect(() => {
    if (!isNow) return undefined;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [isNow]);

  const instant = useMemo(() => {
    if (!now) return null;
    if (isNow) return now;
    const parsed = parseWallInput(wall);
    return parsed ? wallToInstant(parsed, sourceZone) : null;
  }, [now, isNow, wall, sourceZone]);

  const rows = useMemo(() => {
    if (!instant) return [];
    const zones = [sourceZone, ...targets.filter((tz) => tz !== sourceZone)];
    const referenceOffset = zoneOffsetMinutes(instant, sourceZone);

    return zones.map((tz, index) => {
      const meta = ZONES.find((z) => z.v === tz);
      const offset = zoneOffsetMinutes(instant, tz);
      const deltaDays = dayDifference(instant, sourceZone, tz);
      const hours = describeHours(instant, tz);
      const isSource = index === 0;

      return {
        tz,
        city: meta ? meta.c : tz,
        isSource,
        isUser: tz === userZone,
        offset: formatOffset(offset),
        zoneName: zoneName(instant, tz) || formatOffset(offset),
        delta: formatDelta(offset - referenceOffset),
        time24: time24(instant, tz),
        time12: formatter(tz, OPT.time12).format(instant),
        date: formatter(tz, OPT.dateFull).format(instant),
        dayLabel: dayLabel(deltaDays),
        dayTone: deltaDays < 0 ? 'before' : deltaDays > 0 ? 'after' : 'same',
        hourIcon: hours.icon,
        hourLabel: hours.label,
        working: hours.working,
        iso: instant.toISOString(),
        copyText: `${formatter(tz, OPT.dateFull).format(instant)} ${time24(instant, tz)} (${tz})`
      };
    });
  }, [instant, sourceZone, targets, userZone]);

  const wallValue = isNow && now ? wallInputValueIn(now, sourceZone) : wall;

  const changeSource = (tz) => {
    setSourceZone(tz);
    setTargets((prev) => prev.filter((t) => t !== tz));
  };

  const addTarget = (tz) => {
    if (!tz) return;
    setTargets((prev) => (prev.includes(tz) || tz === sourceZone ? prev : [...prev, tz]));
  };

  const removeTarget = (tz) => setTargets((prev) => prev.filter((t) => t !== tz));

  const goNow = () => {
    const fresh = new Date();
    setNow(fresh);
    setIsNow(true);
    setWall(wallInputValueIn(fresh, sourceZone));
  };

  const editWall = (value) => {
    setIsNow(false);
    setWall(value);
  };

  const copy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(''), 1600);
    });
  };

  const regionOptions = (zone) => ZONES.filter((z) => z.r === zone);
  const addableIn = (region) =>
    ZONES.filter((z) => z.r === region && z.v !== sourceZone && !targets.includes(z.v));

  return (
    <div className="tool-container tz-converter">
      <div className="tz-controls">
        <div className="input-group">
          <label className="input-label" htmlFor="tz-at">Convert</label>
          <div className="tz-time-input">
            <input
              id="tz-at"
              type="datetime-local"
              className="text-input"
              value={wallValue}
              onChange={(event) => editWall(event.target.value)}
            />
            <button
              type="button"
              className={`btn btn-outline btn-small${isNow ? ' is-active' : ''}`}
              aria-pressed={isNow}
              onClick={goNow}
            >
              Now
            </button>
          </div>
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="tz-from">in timezone</label>
          <select
            id="tz-from"
            className="text-input"
            value={sourceZone}
            onChange={(event) => changeSource(event.target.value)}
          >
            {REGIONS.map((region) => (
              <optgroup key={region} label={region}>
                {regionOptions(region).map((zone) => (
                  <option key={zone.v} value={zone.v}>{zone.c}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {!mounted ? (
        <div className="tz-skeleton" aria-hidden="true" />
      ) : rows.length === 0 ? (
        <p className="tz-empty">Enter a valid date and time to convert.</p>
      ) : (
        <div className="tz-rows">
          {rows.map((row) => (
            <div key={row.tz} className={`tz-row${row.isSource ? ' tz-row-source' : ''}`}>
              <div className="tz-zone">
                <div className="tz-city">
                  {row.city}
                  {row.isUser && <span className="tz-you">you</span>}
                </div>
                <div className="tz-meta">
                  <span className="tz-abbr" title={row.offset}>{row.zoneName}</span>
                  {!row.isSource && <span className="tz-delta">{row.delta}</span>}
                  {row.isSource && !row.isUser && <span className="tz-delta">reference</span>}
                </div>
              </div>

              <div className="tz-time">
                <span className="tz-clock">{row.time24}</span>
                <span className="tz-clock-12">{row.time12}</span>
              </div>

              <div className="tz-date">
                <span className="tz-date-text">{row.date}</span>
                {!row.isSource && (
                  <span className={`tz-day tz-day-${row.dayTone}`}>{row.dayLabel}</span>
                )}
              </div>

              <span className={`tz-slot${row.working ? ' tz-slot-ok' : ''}`}>
                {row.working ? '💼 Working hours' : `${row.hourIcon} ${row.hourLabel}`}
              </span>

              <div className="tz-actions">
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Copy ${row.city} time`}
                  onClick={() => copy(row.copyText, `${row.tz}-copy`)}
                >
                  {copied === `${row.tz}-copy` ? '✓' : '📋'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-small"
                  title="Copy ISO 8601"
                  aria-label={`Copy ${row.city} ISO 8601 timestamp`}
                  onClick={() => copy(row.iso, `${row.tz}-iso`)}
                >
                  {copied === `${row.tz}-iso` ? '✓' : 'ISO'}
                </button>
                {!row.isSource && (
                  <button
                    type="button"
                    className="icon-btn"
                    title={`Remove ${row.city}`}
                    aria-label={`Remove ${row.city}`}
                    onClick={() => removeTarget(row.tz)}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="tz-add">
        <label className="input-label" htmlFor="tz-add">Add a timezone</label>
        <select
          id="tz-add"
          className="text-input"
          value=""
          onChange={(event) => addTarget(event.target.value)}
        >
          <option value="">Choose a city…</option>
          {REGIONS.map((region) => {
            const zones = addableIn(region);
            if (zones.length === 0) return null;
            return (
              <optgroup key={region} label={region}>
                {zones.map((zone) => (
                  <option key={zone.v} value={zone.v}>{zone.c}</option>
                ))}
              </optgroup>
            );
          })}
        </select>
      </div>

      <SimpleAd adSlot="8095900796" style={{ width: '100%', marginTop: '1.5rem' }} />
    </div>
  );
};

export default TimezoneConverter;
