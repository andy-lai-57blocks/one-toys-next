'use client';

import React, { useMemo, useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { parseJwt, verifySignature } from '../../../utils/jwt';
import SimpleAd from '../../ads/SimpleAdSSG';

// A real HS256 token signed with "one-toys-demo-secret", so the tool can be
// tried (including verification) without pasting a real credential.
const SAMPLE_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEwMjQiLCJuYW1lIjoiQWRhIExvdmVsYWNlIiwiZW1haWwiOiJhZGFAZXhhbXBsZS5jb20iLCJpc3MiOiJodHRwczovL2F1dGguZXhhbXBsZS5jb20iLCJhdWQiOiJhcGkub25lLXRveXMuY29tIiwic2NvcGUiOiJyZWFkOnRvb2xzIHdyaXRlOnRvb2xzIiwiaWF0IjoxNzYwMDAwMDAwLCJleHAiOjIwNTAwMDAwMDAsImp0aSI6IjhmMTRlNDVmLWVhNmItNGMwZC05ZjIxLTc3YTFiMmMzZDRlNSJ9.fpNZtafD2lve7SgQnjWqpwRXClMP-SDfIHGSTZ__iI4';
const SAMPLE_SECRET = 'one-toys-demo-secret';

const LEVEL_ICON = { high: '🔴', warning: '🟠', info: '🔵' };

const JWTDecoder = () => {
  const { isDarkTheme } = useTheme();
  const [token, setToken] = useState('');
  const [secret, setSecret] = useState('');
  const [verification, setVerification] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => parseJwt(token), [token]);
  const alg = parsed.header?.alg;
  const isHmac = typeof alg === 'string' && alg.startsWith('HS');
  const hasToken = token.trim().length > 0;

  const output = useMemo(() => {
    if (!hasToken) return '';
    if (!parsed.ok) return [parsed.error, parsed.hint].filter(Boolean).join('\n\n');
    return parsed.payloadJson || parsed.error || '';
  }, [hasToken, parsed]);

  const status = useMemo(() => {
    if (!hasToken) return null;
    if (!parsed.ok) return { kind: 'invalid', label: '❌ Not decodable' };
    const issues = parsed.alerts.length;
    if (issues === 0) return { kind: 'valid', label: '✅ Decoded' };
    return { kind: 'warn', label: `⚠️ ${issues} issue${issues > 1 ? 's' : ''}` };
  }, [hasToken, parsed]);

  const summary = useMemo(() => {
    if (!parsed.ok) return '';
    const bits = [];
    if (alg) bits.push(`alg ${alg}`);
    if (parsed.payload) bits.push(`${Object.keys(parsed.payload).length} claims`);
    const exp = parsed.times.find((row) => row.key === 'exp');
    if (exp) bits.push(exp.isPast ? `expired ${exp.relative.replace(' ago', '')} ago` : `expires ${exp.relative}`);
    return bits.join(' · ');
  }, [parsed, alg]);

  const loadSample = () => {
    setToken(SAMPLE_TOKEN);
    setSecret(SAMPLE_SECRET);
    setVerification(null);
  };

  const clearAll = () => {
    setToken('');
    setSecret('');
    setVerification(null);
    setCopied(false);
  };

  const copyPayload = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const runVerification = async () => {
    setVerifying(true);
    setVerification(null);
    const result = await verifySignature({ parts: parsed.parts, header: parsed.header, secret });
    setVerification(result);
    setVerifying(false);
  };

  return (
    <div className={`tool-container ${isDarkTheme ? 'dark-mode' : ''}`}>
      <div className="three-column-layout">
        {/* Input Column */}
        <div className="input-column">
          <div className="input-group">
            <label className="input-label" htmlFor="jwt-token-input">
              JWT token
            </label>
            <textarea
              id="jwt-token-input"
              className="text-area code-input"
              value={token}
              onChange={(event) => {
                setToken(event.target.value);
                setVerification(null);
              }}
              placeholder={'Paste a JWT here... (a leading "Bearer " is fine)'}
              spellCheck="false"
              autoComplete="off"
            />
          </div>
        </div>

        {/* Action Column */}
        <div className="action-column">
          <div className="primary-actions">
            <button className="btn btn-primary" onClick={copyPayload} disabled={!output}>
              {copied ? '✅ Copied' : '📋 Copy payload'}
            </button>
          </div>

          <div className="secondary-actions">
            <button className="btn btn-outline" onClick={loadSample}>
              📄 Sample
            </button>
            <button className="btn btn-outline" onClick={clearAll}>
              🗑️ Clear
            </button>
          </div>

          <SimpleAd />
        </div>

        {/* Output Column */}
        <div className="output-column">
          <div className="input-group">
            <label className="input-label">
              Decoded payload
              {status && <span className={`status-indicator ${status.kind}`}>{status.label}</span>}
            </label>
            <textarea
              className="text-area code-output"
              value={output}
              readOnly
              spellCheck="false"
              placeholder="The decoded payload will appear here..."
            />
          </div>

          {summary && <p className="jwt-summary">{summary}</p>}

          {parsed.ok && parsed.alerts.length > 0 && (
            <ul className="jwt-alerts">
              {parsed.alerts.map((alert) => (
                <li key={alert.id} className={`jwt-alert jwt-alert-${alert.level}`}>
                  <span aria-hidden="true">{LEVEL_ICON[alert.level]}</span>
                  <span>
                    <strong>{alert.title}</strong> — {alert.detail}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {parsed.ok && (
            <details className="tool-faq-item jwt-advanced">
              <summary className="tool-faq-question">Header, timestamps &amp; signature</summary>
              <div className="tool-faq-answer">
                <p className="jwt-advanced-label">Header</p>
                <pre className="jwt-json">{parsed.headerJson}</pre>

                {parsed.times.length > 0 && (
                  <>
                    <p className="jwt-advanced-label">Timestamps (your local time)</p>
                    <ul className="jwt-times">
                      {parsed.times.map((row) => (
                        <li key={row.key}>
                          <code>{row.key}</code> {row.local} <span className="jwt-time-rel">{row.relative}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                <p className="jwt-advanced-label">Signature</p>
                <pre className="jwt-json jwt-signature">
                  {parsed.signature || '(empty — unsigned token)'}
                </pre>

                {isHmac ? (
                  <>
                    <p className="jwt-advanced-hint">
                      Verification runs locally with the Web Crypto API; the secret never leaves this page.
                    </p>
                    <div className="jwt-verify-row">
                      <input
                        type="password"
                        className="text-input"
                        value={secret}
                        onChange={(event) => setSecret(event.target.value)}
                        placeholder="HMAC secret"
                        autoComplete="off"
                      />
                      <button
                        className="btn btn-outline"
                        onClick={runVerification}
                        disabled={verifying || !secret}
                      >
                        {verifying ? 'Verifying…' : 'Verify'}
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="jwt-advanced-hint">
                    Local verification is available for HS256/384/512 tokens. This token uses{' '}
                    <code>{alg || 'an unknown algorithm'}</code>.
                  </p>
                )}

                {verification && (
                  <p className={`jwt-verification jwt-verification-${verification.status}`} role="status">
                    <strong>
                      {verification.status === 'valid'
                        ? 'Valid'
                        : verification.status === 'invalid'
                          ? 'Invalid'
                          : 'Not verified'}
                    </strong>{' '}
                    — {verification.message}
                  </p>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};

export default JWTDecoder;
