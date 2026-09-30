'use client';

import React, { useMemo, useState } from 'react';
import {
  parseCron,
  describeCron,
  nextRuns,
  formatInTimeZone,
  utcOffsetLabel,
  naturalLanguageToCron,
  COMMON_TIME_ZONES,
  PRESETS
} from '../../../utils/cron';
import SimpleAd from '../../ads/SimpleAdSSG';

const DEFAULT_EXPRESSION = '0 9 * * 1-5';

const CronParser = () => {
  const [expression, setExpression] = useState(DEFAULT_EXPRESSION);
  const [timeZone, setTimeZone] = useState('UTC');
  const [question, setQuestion] = useState('');
  const [nlMessage, setNlMessage] = useState(null);
  const [copied, setCopied] = useState(null);

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

  const applyQuestion = () => {
    const result = naturalLanguageToCron(question);
    if (result) {
      setExpression(result);
      setNlMessage({ ok: true, text: `Matched "${question}" → ${result}` });
    } else {
      setNlMessage({
        ok: false,
        text: 'That sentence was not recognised. This converter only understands a small set of patterns — see the examples on this page.'
      });
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
          Time zone used to calculate the next runs
        </label>
        <select
          id="cron-timezone"
          className="text-input cron-select"
          value={timeZone}
          onChange={(event) => setTimeZone(event.target.value)}
        >
          {COMMON_TIME_ZONES.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </select>
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
                      <th>Local time ({timeZone})</th>
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

      <section className="cron-section" aria-label="Build an expression from a sentence">
        <h3 className="cron-section-title">Describe it in words</h3>
        <p className="cron-hint">
          Deterministic pattern matching — no AI, no guessing. Recognised patterns are listed on this page.
        </p>
        <div className="cron-ask">
          <input
            type="text"
            className="text-input"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') applyQuestion();
            }}
            placeholder="weekdays at 9am"
            spellCheck="false"
          />
          <button type="button" className="btn btn-primary btn-small" onClick={applyQuestion}>
            Convert
          </button>
        </div>
        {nlMessage && (
          <p className={nlMessage.ok ? 'cron-nl-ok' : 'cron-nl-fail'} role="status">
            {nlMessage.text}
          </p>
        )}
      </section>

      <SimpleAd />
    </div>
  );
};

export default CronParser;
