'use client';

import React, { useState, useEffect, useMemo } from 'react';
import SimpleAd from '../../ads/SimpleAdSSG';
import {
  formatter,
  numericParts,
  parseWallInput,
  wallToInstant,
  wallInputValueIn,
  zoneName
} from '@/utils/timezone';

// Target zones with the labels people actually recognise. The Timezone
// Converter is the tool for global coverage; this page only needs the zones a
// date-formatting job is normally reported in.
const ZONES = [
  ['UTC', 'UTC'],
  ['America/Los_Angeles', 'Los Angeles (PT)'],
  ['America/Denver', 'Denver (MT)'],
  ['America/Chicago', 'Chicago (CT)'],
  ['America/New_York', 'New York (ET)'],
  ['America/Sao_Paulo', 'São Paulo'],
  ['Europe/London', 'London (GMT/BST)'],
  ['Europe/Paris', 'Paris (CET)'],
  ['Europe/Berlin', 'Berlin (CET)'],
  ['Europe/Moscow', 'Moscow'],
  ['Asia/Dubai', 'Dubai'],
  ['Asia/Kolkata', 'Kolkata (IST)'],
  ['Asia/Shanghai', 'Shanghai (CST)'],
  ['Asia/Tokyo', 'Tokyo (JST)'],
  ['Asia/Singapore', 'Singapore'],
  ['Australia/Sydney', 'Sydney (AET)'],
  ['Pacific/Auckland', 'Auckland']
];

const PRESETS = [
  'YYYY-MM-DD HH:mm:ss',
  'DD/MM/YYYY HH:mm',
  'MMM DD, YYYY',
  'DDD, MMMM DD, YYYY'
];

const pad2 = (n) => String(n).padStart(2, '0');

/**
 * Replace format tokens with the value of `instant` AS READ IN `zone`.
 *
 * Longest tokens are substituted first, otherwise `MM` would eat the first two
 * characters of `MMMM` and `YY` the last two of `YYYY`.
 */
function formatCustom(instant, zone, pattern) {
  const p = numericParts(instant, zone);
  const tokens = [
    ['MMMM', formatter(zone, { month: 'long' }).format(instant)],
    ['MMM', formatter(zone, { month: 'short' }).format(instant)],
    ['DDDD', formatter(zone, { weekday: 'long' }).format(instant)],
    ['DDD', formatter(zone, { weekday: 'short' }).format(instant)],
    ['YYYY', String(p.year)],
    ['YY', String(p.year).slice(-2)],
    ['MM', pad2(p.month)],
    ['DD', pad2(p.day)],
    ['HH', pad2(p.hour)],
    ['mm', pad2(p.minute)],
    ['ss', pad2(p.second)]
  ];

  let out = pattern;
  for (const [token, value] of tokens) out = out.split(token).join(value);
  return out;
}

/**
 * Every value is derived from the same instant, read in the same zone, so the
 * groups can never disagree with each other.
 */
function buildGroups(instant, zone) {
  const p = numericParts(instant, zone);
  const inZone = (options, locale) => formatter(zone, options, locale).format(instant);
  const ms = instant.getTime();

  return [
    {
      title: 'Common',
      icon: '⚡',
      rows: [
        ['ISO 8601', instant.toISOString()],
        ['RFC 2822', instant.toUTCString()],
        ['Date', inZone({ weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })],
        ['Time (24-hour)', `${pad2(p.hour)}:${pad2(p.minute)}`],
        ['Time (12-hour)', inZone({ hour: 'numeric', minute: '2-digit', hour12: true })],
        ['Unix seconds', String(Math.floor(ms / 1000))],
        ['Unix milliseconds', String(ms)]
      ]
    },
    {
      title: 'Date layouts',
      icon: '📐',
      rows: [
        ['YYYY-MM-DD', `${p.year}-${pad2(p.month)}-${pad2(p.day)}`],
        ['DD/MM/YYYY', `${pad2(p.day)}/${pad2(p.month)}/${p.year}`],
        ['MM/DD/YYYY', `${pad2(p.month)}/${pad2(p.day)}/${p.year}`],
        ['DD-MM-YYYY', `${pad2(p.day)}-${pad2(p.month)}-${p.year}`],
        ['YYYY/MM/DD', `${p.year}/${pad2(p.month)}/${pad2(p.day)}`],
        ['YY-MM-DD', `${String(p.year).slice(-2)}-${pad2(p.month)}-${pad2(p.day)}`],
        ['HH:MM', `${pad2(p.hour)}:${pad2(p.minute)}`],
        ['HH:MM:SS', `${pad2(p.hour)}:${pad2(p.minute)}:${pad2(p.second)}`]
      ]
    },
    {
      title: 'Readable',
      icon: '💬',
      rows: [
        ['Full date', inZone({ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })],
        ['Month and year', inZone({ year: 'numeric', month: 'long' })],
        ['Weekday', inZone({ weekday: 'long' })],
        ['Date and time', inZone({
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          hour: 'numeric', minute: '2-digit'
        })],
        ['Time and zone', `${inZone({ hour: '2-digit', minute: '2-digit', hour12: false }).replace(/^24/, '00')} ${zoneName(instant, zone) || zone}`]
      ]
    },
    {
      title: 'Locale',
      icon: '🌍',
      rows: [
        ['United States', inZone({ dateStyle: 'short' }, 'en-US')],
        ['United Kingdom', inZone({ dateStyle: 'short' }, 'en-GB')],
        ['Germany', inZone({ dateStyle: 'short' }, 'de-DE')],
        ['France', inZone({ dateStyle: 'short' }, 'fr-FR')],
        ['Japan', inZone({ dateStyle: 'short' }, 'ja-JP')],
        ['China', inZone({ dateStyle: 'short' }, 'zh-CN')],
        ['India', inZone({ dateStyle: 'short' }, 'en-IN')],
        ['Brazil', inZone({ dateStyle: 'short' }, 'pt-BR')]
      ]
    },
    {
      title: 'Numbers',
      icon: '🔢',
      rows: [
        ['Year', String(p.year)],
        ['Month (1-12)', String(p.month)],
        ['Day of month', String(p.day)],
        ['Hour (0-23)', String(p.hour)],
        ['Minute', String(p.minute)],
        ['Second', String(p.second)]
      ]
    }
  ];
}

export default function DateFormatter() {
  const [mounted, setMounted] = useState(false);
  const [isNow, setIsNow] = useState(true);
  const [now, setNow] = useState(null);
  const [wall, setWall] = useState('');
  const [userZone, setUserZone] = useState('UTC');
  const [zone, setZone] = useState('UTC');
  const [pattern, setPattern] = useState('YYYY-MM-DD HH:mm:ss');
  const [copied, setCopied] = useState('');

  // Mount only: the browser's zone is not known during static export.
  useEffect(() => {
    const start = new Date();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    setUserZone(tz);
    setZone(tz);
    setWall(wallInputValueIn(start, tz));
    setNow(start);
    setMounted(true);
  }, []);

  // The clock only ticks while the live reading is what is being formatted.
  useEffect(() => {
    if (!isNow) return undefined;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [isNow]);

  const instant = useMemo(() => {
    if (!now) return null;
    if (isNow) return now;
    const parsed = parseWallInput(wall);
    // A typed date/time is a wall-clock reading in the user's OWN zone; the
    // zone selector above only chooses how it is displayed.
    return parsed ? wallToInstant(parsed, userZone) : null;
  }, [now, isNow, wall, userZone]);

  const zoneOptions = useMemo(
    () => [[userZone, `Local (${userZone})`], ...ZONES.filter(([value]) => value !== userZone)],
    [userZone]
  );

  const groups = useMemo(
    () => (instant ? buildGroups(instant, zone) : []),
    [instant, zone]
  );

  const customResult = instant ? formatCustom(instant, zone, pattern) : '';
  const wallValue = isNow && now ? wallInputValueIn(now, userZone) : wall;

  const copy = async (value, tag) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(tag);
      setTimeout(() => setCopied(''), 1500);
    } catch {
      /* clipboard unavailable - the value is selectable, so no need to shout */
    }
  };

  if (!mounted) {
    return (
      <div className="tool-container">
        <div className="fmt-formatter">
          <div className="fmt-skeleton" />
          <div className="fmt-skeleton fmt-skeleton-row" />
          <div className="fmt-skeleton fmt-skeleton-row" />
        </div>
      </div>
    );
  }

  return (
    <div className="tool-container">
      <div className="fmt-formatter">
        <section className="fmt-inputs">
          <div className="fmt-field">
            <label className="input-label" htmlFor="fmt-input">Date &amp; time</label>
            <div className="fmt-field-row">
              <input
                id="fmt-input"
                type="datetime-local"
                className="text-input fmt-input"
                value={wallValue}
                onChange={(event) => {
                  setWall(event.target.value);
                  setIsNow(false);
                }}
              />
              <button
                type="button"
                className={`btn btn-outline btn-small fmt-now${isNow ? ' is-active' : ''}`}
                onClick={() => { setNow(new Date()); setIsNow(true); }}
              >
                Now
              </button>
            </div>
          </div>

          <div className="fmt-field">
            <label className="input-label" htmlFor="fmt-zone">Target timezone</label>
            <select
              id="fmt-zone"
              className="text-input fmt-select"
              value={zone}
              onChange={(event) => setZone(event.target.value)}
            >
              {zoneOptions.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </section>

        {!instant ? (
          <p className="fmt-empty">Enter a date and time to see the formats.</p>
        ) : (
          <>
            <p className="fmt-summary">
              <strong>{formatter(zone, {
                weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
              }).format(instant)}</strong>
              <span className="fmt-summary-sep">·</span>
              {formatter(zone, { hour: 'numeric', minute: '2-digit', hour12: true }).format(instant)}
              <span className="fmt-summary-sep">·</span>
              <span className="fmt-summary-zone">{zoneName(instant, zone) || zone}</span>
            </p>

            <section className="fmt-custom">
              <label className="input-label" htmlFor="fmt-pattern">Custom format</label>
              <div className="fmt-pattern">
                <input
                  id="fmt-pattern"
                  type="text"
                  className="text-input fmt-pattern-input"
                  value={pattern}
                  onChange={(event) => setPattern(event.target.value)}
                  spellCheck={false}
                  autoComplete="off"
                  placeholder="YYYY-MM-DD HH:mm:ss"
                />
                <button
                  type="button"
                  className="btn btn-outline btn-small"
                  onClick={() => copy(customResult, 'custom')}
                  aria-label="Copy custom format result"
                  title="Copy"
                >
                  {copied === 'custom' ? '✓' : '📋'}
                </button>
              </div>
              <output className="fmt-pattern-out">{customResult || '—'}</output>
              <div className="fmt-presets">
                {PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`chip${pattern === preset ? ' is-active' : ''}`}
                    onClick={() => setPattern(preset)}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <p className="fmt-tokens">
                <strong>Tokens:</strong> YYYY year · YY short year · MM month · DD day ·
                HH hour · mm minute · ss second · DDD weekday · MMM month name · MMMM full month
              </p>
            </section>

            <div className="fmt-groups">
              {groups.map((group, index) => (
                <details key={group.title} className="fmt-group" open={index === 0}>
                  <summary className="fmt-group-head">
                    <span className="fmt-group-icon" aria-hidden="true">{group.icon}</span>
                    <span className="fmt-group-title">{group.title}</span>
                    <span className="fmt-group-count">{group.rows.length}</span>
                  </summary>
                  <ul className="fmt-rows">
                    {group.rows.map(([label, value]) => (
                      <li key={label}>
                        {/* Same row markup as Timestamp Converter and Date
                            Calculator, so all three read identically. */}
                        <div className="result-item">
                          <span className="result-label">{label}:</span>
                          <span className="result-value">{value}</span>
                          <button
                            type="button"
                            className="btn btn-outline btn-small"
                            onClick={() => copy(value, label)}
                            aria-label={`Copy ${label}`}
                            title="Copy"
                          >
                            {copied === label ? '✓' : '📋'}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </>
        )}

        <SimpleAd adSlot="8095900796" />
      </div>
    </div>
  );
}
