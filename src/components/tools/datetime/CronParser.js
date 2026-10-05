'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  parseCron,
  describeCron,
  nextRuns,
  formatInTimeZone,
  utcOffsetLabel,
  COMMON_TIME_ZONES,
  PRESETS
} from '../../../utils/cron';
import SimpleAd from '../../ads/SimpleAdSSG';

const DEFAULT_EXPRESSION = '0 9 * * 1-5';

const CronParser = () => {
  const [expression, setExpression] = useState(DEFAULT_EXPRESSION);
  const [timeZone, setTimeZone] = useState('UTC');
  const [copied, setCopied] = useState(null);

  // seoData promises "the next 10 run times in your own time zone", but the
  // server-rendered HTML cannot know it: this is a static export, so deriving
  // it while rendering would emit HTML for UTC and different HTML on the
  // client, which is a hydration mismatch. Start on UTC and switch in an
  // effect, the same way SimpleAdSSG handles localhost.
  //
  // This was the real reason the control read as meaningless. The page answered
  // in UTC for everyone, so changing the zone left the visible column on 09:00
  // and only the UTC column moved - which looks like nothing happened.
  const [zones, setZones] = useState(COMMON_TIME_ZONES);
  useEffect(() => {
    let local = null;
    try {
      local = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      /* no Intl - stay on UTC */
    }
    if (!local) return;
    // A visitor outside the curated list still gets their own zone rather than
    // being silently shown UTC.
    setZones(COMMON_TIME_ZONES.includes(local) ? COMMON_TIME_ZONES : [local, ...COMMON_TIME_ZONES]);
    setTimeZone(local);
  }, []);

  // Option labels carry the current offset, so the list says something to
  // someone who does not know IANA names. Computed once; a DST flip during the
  // session is not worth re-rendering for.
  const zoneLabels = useMemo(
    () => new Map(zones.map((zone) => [zone, utcOffsetLabel(new Date(), zone)])),
    [zones]
  );

  const parsed = useMemo(() => parseCron(expression), [expression]);
  const description = useMemo(() => (parsed.ok ? describeCron(parsed) : ''), [parsed]);
  const runs = useMemo(() => {
    if (!parsed.ok) return [];
    try {
      return nextRuns(parsed, { timeZone, count: 10 });
    } catch {
      return [];
    }
  }, [parsed, timeZone]);

  const copy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div className="tool-container cron-tool">
      <div className="input-group">
        <label className="input-label" htmlFor="cron-expression">
          Cron expression
        </label>
        <input
          id="cron-expression"
          type="text"
          className="text-input cron-input"
          value={expression}
          onChange={(event) => setExpression(event.target.value)}
          placeholder="0 9 * * 1-5"
          spellCheck="false"
          autoComplete="off"
        />
        <p className="cron-hint">
          Five fields: minute, hour, day-of-month, month, day-of-week. Six fields are also accepted, where
          the first field is seconds. Runs entirely in your browser.
        </p>
      </div>

      <div className="cron-presets" role="group" aria-label="Common expressions">
        {PRESETS.map((preset) => (
          <button
            key={preset.expression}
            type="button"
            className={`cron-preset ${expression === preset.expression ? 'active' : ''}`}
            onClick={() => setExpression(preset.expression)}
            title={preset.expression}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="input-group">
        <label className="input-label" htmlFor="cron-timezone">
          Times shown in
        </label>
        <select
          id="cron-timezone"
          className="text-input cron-select"
          value={timeZone}
          onChange={(event) => setTimeZone(event.target.value)}
        >
          {zones.map((zone) => (
            <option key={zone} value={zone}>
              {zone} ({zoneLabels.get(zone)})
            </option>
          ))}
        </select>
        <p className="cron-hint">
          Pick the time zone the job really runs in - a server is usually UTC. The runs
          below are recalculated for it.
        </p>
      </div>

      {!parsed.ok && expression.trim() !== '' && (
        <div className="cron-error" role="alert">
          <p className="cron-error-title">{parsed.error.message}</p>
          {parsed.error.hint && <p className="cron-error-hint">{parsed.error.hint}</p>}
          {parsed.unsupported.length > 0 && (
            <ul className="cron-error-list">
              {parsed.unsupported.map((item) => (
                <li key={item}>Unsupported syntax detected: {item}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {parsed.ok && (
        <>
          <section className="cron-section" aria-label="Description">
            <div className="cron-summary">
              <p className="cron-description">{description}</p>
              <button
                type="button"
                className="btn btn-outline btn-small"
                onClick={() => copy(description, 'description')}
              >
                {copied === 'description' ? 'Copied!' : 'Copy description'}
              </button>
            </div>
            {parsed.notes.length > 0 && (
              <ul className="cron-notes">
                {parsed.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            )}
          </section>

          <section className="cron-section" aria-label="Next executions">
            <div className="cron-section-head">
              <h3 className="cron-section-title">Next 10 executions</h3>
              <span className="cron-offset">
                {runs.length > 0 ? utcOffsetLabel(runs[0], timeZone) : ''}
              </span>
              <button
                type="button"
                className="btn btn-outline btn-small"
                onClick={() => copy(runs.map((d) => d.toISOString()).join('\n'), 'runs')}
                disabled={runs.length === 0}
              >
                {copied === 'runs' ? 'Copied!' : 'Copy as ISO'}
              </button>
            </div>

            {runs.length === 0 ? (
              <p className="cron-hint">No upcoming execution found within the next 8 years.</p>
            ) : (
              <div className="cron-table-wrap">
                <table className="cron-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{timeZone}</th>
                      <th>UTC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runs.map((date, index) => (
                      <tr key={date.toISOString()}>
                        <td>{index + 1}</td>
                        <td className="cron-mono">{formatInTimeZone(date, timeZone)}</td>
                        <td className="cron-mono">{date.toISOString().replace('.000Z', 'Z')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {/* Same unit as the Image Compressor. The width and the top margin ride
          inline because SimpleAdSSG writes `margin: 0 auto` as an inline style,
          which outranks any stylesheet rule; the preceding .cron-section only
          has a margin-top, so without it the ad sits flush against it. */}
      <SimpleAd adSlot="8095900796" style={{ width: '100%', marginTop: '1.5rem' }} />
    </div>
  );
};

export default CronParser;
