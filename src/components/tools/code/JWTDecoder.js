'use client';

import React, { useMemo, useState } from 'react';
import {
  parseJwt,
  verifySignature,
  CLAIM_DESCRIPTIONS,
  ALERT_HIGH,
  ALERT_WARNING,
  ALERT_INFO
} from '../../../utils/jwt';

// A real HS256 token signed with "one-toys-demo-secret", so users can try the
// tool (including verification) without pasting a real credential.
const SAMPLE_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEwMjQiLCJuYW1lIjoiQWRhIExvdmVsYWNlIiwiZW1haWwiOiJhZGFAZXhhbXBsZS5jb20iLCJpc3MiOiJodHRwczovL2F1dGguZXhhbXBsZS5jb20iLCJhdWQiOiJhcGkub25lLXRveXMuY29tIiwic2NvcGUiOiJyZWFkOnRvb2xzIHdyaXRlOnRvb2xzIiwiaWF0IjoxNzYwMDAwMDAwLCJleHAiOjIwNTAwMDAwMDAsImp0aSI6IjhmMTRlNDVmLWVhNmItNGMwZC05ZjIxLTc3YTFiMmMzZDRlNSJ9.fpNZtafD2lve7SgQnjWqpwRXClMP-SDfIHGSTZ__iI4';
const SAMPLE_SECRET = 'one-toys-demo-secret';

const ALERT_LABELS = {
  [ALERT_HIGH]: 'High risk',
  [ALERT_WARNING]: 'Warning',
  [ALERT_INFO]: 'Note'
};

function renderValue(value) {
  if (value === null) return 'null';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

const JWTDecoder = () => {
  const [token, setToken] = useState('');
  const [secret, setSecret] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [verification, setVerification] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => parseJwt(token), [token]);

  const handleTokenChange = (event) => {
    setToken(event.target.value);
    setVerification(null);
    setCopied(false);
  };

  const loadSample = () => {
    setToken(SAMPLE_TOKEN);
    setSecret(SAMPLE_SECRET);
    setVerification(null);
  };

  const clearAll = () => {
    setToken('');
    setSecret('');
    setPublicKey('');
    setVerification(null);
    setCopied(false);
  };

  const copyPayload = async () => {
    if (!parsed.payloadJson) return;
    try {
      await navigator.clipboard.writeText(parsed.payloadJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const runVerification = async () => {
    setVerifying(true);
    setVerification(null);
    const result = await verifySignature({
      parts: parsed.parts,
      header: parsed.header,
      secret,
      publicKeyPem: publicKey
    });
    setVerification(result);
    setVerifying(false);
  };

  const alg = parsed.header?.alg;
  const needsSecret = typeof alg === 'string' && alg.startsWith('HS');
  const needsPublicKey = typeof alg === 'string' && /^(RS|PS|ES)/.test(alg);
  const claims = parsed.payload && typeof parsed.payload === 'object' ? Object.entries(parsed.payload) : [];

  return (
    <div className="tool-container jwt-tool">
      <div className="input-group">
        <label className="input-label" htmlFor="jwt-token-input">
          Paste a JWT
        </label>
        <textarea
          id="jwt-token-input"
          className="text-area jwt-input"
          value={token}
          onChange={handleTokenChange}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (a leading &quot;Bearer &quot; is fine)"
          spellCheck="false"
          autoComplete="off"
        />
        <p className="jwt-hint">
          Decoding and signature verification run entirely in your browser. The token and any key you
          enter are never sent to a server.
        </p>
      </div>

      <div className="button-group">
        <button type="button" className="btn btn-outline btn-small" onClick={loadSample}>
          Load sample token
        </button>
        <button type="button" className="btn btn-outline btn-small" onClick={clearAll} disabled={!token}>
          Clear
        </button>
        {parsed.ok && (
          <button type="button" className="btn btn-primary btn-small" onClick={copyPayload}>
            {copied ? 'Copied!' : 'Copy payload'}
          </button>
        )}
      </div>

      {token && !parsed.ok && (
        <div className="jwt-error" role="alert">
          <p className="jwt-error-title">{parsed.error}</p>
          {parsed.hint && <p className="jwt-error-hint">{parsed.hint}</p>}
          {parsed.kind === 'jwe' && (
            <p className="jwt-error-hint">
              Encrypted tokens (JWE) can only be read by the party holding the decryption key — which
              is exactly why they are used for sensitive payloads.
            </p>
          )}
        </div>
      )}

      {parsed.ok && (
        <>
          {parsed.alerts.length > 0 && (
            <section className="jwt-section" aria-label="Security findings">
              <h3 className="jwt-section-title">Security findings</h3>
              <ul className="jwt-alerts">
                {parsed.alerts.map((alert) => (
                  <li key={alert.id} className={`jwt-alert jwt-alert-${alert.level}`}>
                    <span className="jwt-alert-badge">{ALERT_LABELS[alert.level]}</span>
                    <div>
                      <p className="jwt-alert-title">{alert.title}</p>
                      <p className="jwt-alert-detail">{alert.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="jwt-section" aria-label="Decoded token">
            <h3 className="jwt-section-title">Decoded token</h3>
            <div className="jwt-parts">
              <div className="jwt-part">
                <h4 className="jwt-part-title">Header</h4>
                <pre className="jwt-json">{parsed.headerJson}</pre>
              </div>
              <div className="jwt-part">
                <h4 className="jwt-part-title">Payload</h4>
                {parsed.payload ? (
                  <pre className="jwt-json">{parsed.payloadJson}</pre>
                ) : (
                  <p className="jwt-part-error">{parsed.error}</p>
                )}
              </div>
              <div className="jwt-part">
                <h4 className="jwt-part-title">Signature</h4>
                <pre className="jwt-json jwt-signature">{parsed.signature || '(empty — unsigned token)'}</pre>
                <p className="jwt-part-note">
                  The signature is not readable data — it can only be verified with the key.
                </p>
              </div>
            </div>
          </section>

          {parsed.times.length > 0 && (
            <section className="jwt-section" aria-label="Timestamps">
              <h3 className="jwt-section-title">Timestamps</h3>
              <div className="jwt-table-wrap">
                <table className="jwt-table">
                  <thead>
                    <tr>
                      <th>Claim</th>
                      <th>Local time</th>
                      <th>Unix</th>
                      <th>Relative to now</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.times.map((row) => (
                      <tr key={row.key}>
                        <td>
                          <code>{row.key}</code>
                          <span className="jwt-time-label">{row.label}</span>
                        </td>
                        <td>{row.local}</td>
                        <td className="jwt-mono">{Math.floor(new Date(row.iso).getTime() / 1000)}</td>
                        <td>
                          <span className={row.isPast ? 'jwt-chip jwt-chip-past' : 'jwt-chip jwt-chip-valid'}>
                            {row.isPast ? 'in the past' : 'still valid'}
                          </span>{' '}
                          {row.relative}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {claims.length > 0 && (
            <section className="jwt-section" aria-label="Claims">
              <h3 className="jwt-section-title">Claims explained</h3>
              <div className="jwt-table-wrap">
                <table className="jwt-table">
                  <thead>
                    <tr>
                      <th>Claim</th>
                      <th>Value</th>
                      <th>Meaning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claims.map(([key, value]) => (
                      <tr key={key}>
                        <td>
                          <code>{key}</code>
                        </td>
                        <td className="jwt-mono jwt-value">{renderValue(value)}</td>
                        <td>{CLAIM_DESCRIPTIONS[key] || 'Custom claim — defined by the issuer'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section className="jwt-section" aria-label="Local signature verification">
            <h3 className="jwt-section-title">Verify the signature (optional)</h3>
            <p className="jwt-part-note">
              Verification happens locally with the Web Crypto API. For HS* algorithms the secret stays
              in this page&apos;s memory; for RS*/ES* paste the public key — never a private key.
            </p>

            {needsSecret && (
              <div className="input-group">
                <label className="input-label" htmlFor="jwt-secret">
                  HMAC secret ({alg})
                </label>
                <input
                  id="jwt-secret"
                  type="password"
                  className="text-input"
                  value={secret}
                  onChange={(event) => setSecret(event.target.value)}
                  placeholder="The secret used to sign this token"
                  autoComplete="off"
                />
              </div>
            )}

            {needsPublicKey && (
              <div className="input-group">
                <label className="input-label" htmlFor="jwt-public-key">
                  Public key (PEM, {alg})
                </label>
                <textarea
                  id="jwt-public-key"
                  className="text-area jwt-key-input"
                  value={publicKey}
                  onChange={(event) => setPublicKey(event.target.value)}
                  placeholder="-----BEGIN PUBLIC KEY-----"
                  spellCheck="false"
                />
              </div>
            )}

            {!needsSecret && !needsPublicKey && (
              <p className="jwt-part-note">
                Local verification is implemented for HS256/384/512, RS256 and ES256. This token uses{' '}
                <code>{alg || 'an unknown algorithm'}</code>.
              </p>
            )}

            {(needsSecret || needsPublicKey) && (
              <div className="button-group">
                <button
                  type="button"
                  className="btn btn-primary btn-small"
                  onClick={runVerification}
                  disabled={verifying || (needsSecret ? !secret : !publicKey)}
                >
                  {verifying ? 'Verifying…' : 'Verify locally'}
                </button>
              </div>
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
          </section>
        </>
      )}
    </div>
  );
};

export default JWTDecoder;
