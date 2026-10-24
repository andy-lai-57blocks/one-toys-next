'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { useTheme } from '../../../contexts/ThemeContext';
import { downloadAsFile } from '../../../utils/downloadUtils';
import SimpleAd from '../../ads/SimpleAdSSG';

// QR Code Generator.
//
// The encoding itself is done by `qrcode` (MIT) in the browser: no text, network
// name or password ever leaves the device. The package's browser build renders
// through <canvas>, which is what produces the downloadable PNG; the SVG path is
// the same encoder with a different renderer.
//
// Two payload shapes are offered because they are what people actually search
// for: free text / links, and a Wi-Fi network, which phones recognise and offer
// to join. The Wi-Fi payload is the de-facto `WIFI:` string understood by iOS and
// Android.

const SIZES = [256, 512, 1024];

const LEVELS = [
  { value: 'L', label: 'L — 7% recoverable' },
  { value: 'M', label: 'M — 15% recoverable' },
  { value: 'Q', label: 'Q — 25% recoverable' },
  { value: 'H', label: 'H — 30% recoverable' },
];

const MARGINS = [
  { value: 4, label: 'Standard (4 modules)' },
  { value: 2, label: 'Tight (2 modules)' },
  { value: 0, label: 'None (0 modules)' },
];

const SECURITY = [
  { value: 'WPA', label: 'WPA/WPA2/WPA3' },
  { value: 'WEP', label: 'WEP' },
  { value: 'nopass', label: 'Open — no password' },
];

// The WIFI: payload is a semicolon-delimited string, so those delimiters (plus
// backslash and quotes) have to be escaped inside a value or a network called
// `Guest;5G` would break the payload in half.
const escapeWifi = (value) => String(value).replace(/([\\;,:"])/g, '\\$1');

const buildWifiPayload = ({ ssid, password, security, hidden }) => {
  const name = ssid.trim();
  if (!name) return '';

  let payload = `WIFI:T:${security};S:${escapeWifi(name)};`;
  if (security !== 'nopass') payload += `P:${escapeWifi(password)};`;
  if (hidden) payload += 'H:true;';

  return `${payload};`;
};

const QRCodeGenerator = () => {
  const { isDarkTheme } = useTheme();
  const [mode, setMode] = useState('text');
  const [text, setText] = useState('');
  const [wifi, setWifi] = useState({ ssid: '', password: '', security: 'WPA', hidden: false });
  const [size, setSize] = useState(512);
  const [level, setLevel] = useState('M');
  const [margin, setMargin] = useState(4);
  const [dark, setDark] = useState('#000000');
  const [light, setLight] = useState('#ffffff');
  const [dataUrl, setDataUrl] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const payload = useMemo(
    () => (mode === 'wifi' ? buildWifiPayload(wifi) : text.trim()),
    [mode, text, wifi],
  );

  useEffect(() => {
    if (!payload) {
      setDataUrl('');
      setError('');
      return undefined;
    }

    if (dark.toLowerCase() === light.toLowerCase()) {
      setDataUrl('');
      setError('The foreground and background colours must be different, or the code is invisible.');
      return undefined;
    }

    let cancelled = false;
    setBusy(true);

    // A small debounce keeps the generator from re-encoding on every keystroke
    // while someone types a URL.
    const timer = setTimeout(() => {
      QRCode.toDataURL(payload, {
        errorCorrectionLevel: level,
        margin,
        width: size,
        color: { dark, light },
      })
        .then((url) => {
          if (cancelled) return;
          setDataUrl(url);
          setError('');
          setBusy(false);
        })
        .catch((err) => {
          if (cancelled) return;
          setDataUrl('');
          setBusy(false);
          const message = err && err.message ? err.message : '';
          setError(
            /too big|too long|code length overflow/i.test(message)
              ? 'That content is too long for a QR code. Shorten it, or lower the error-correction level.'
              : 'The QR code could not be generated. Check the content and the colours.',
          );
        });
    }, 120);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [payload, level, margin, size, dark, light]);

  const downloadPng = useCallback(async () => {
    if (!dataUrl) return;
    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      downloadAsFile(blob, 'qr-code.png', 'image/png');
    } catch {
      setError('The PNG could not be prepared for download.');
    }
  }, [dataUrl]);

  const downloadSvg = useCallback(async () => {
    if (!payload) return;
    try {
      const svg = await QRCode.toString(payload, {
        type: 'svg',
        errorCorrectionLevel: level,
        margin,
        width: size,
        color: { dark, light },
      });
      downloadAsFile(new Blob([svg], { type: 'image/svg+xml' }), 'qr-code.svg', 'image/svg+xml');
    } catch {
      setError('The SVG could not be prepared for download.');
    }
  }, [payload, level, margin, size, dark, light]);

  const reset = () => {
    if (mode === 'wifi') setWifi({ ssid: '', password: '', security: 'WPA', hidden: false });
    else setText('');
  };

  const emptyHint = mode === 'wifi'
    ? 'Enter the network name to generate a code'
    : 'Type a link or any text to generate a code';

  return (
    <div className={`tool-container qr-code-tool ${isDarkTheme ? 'dark-mode' : ''}`}>
      <div className="qr-layout">
        <div className="qr-form">
          <div className="qr-tabs" role="tablist" aria-label="QR code content type">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'text'}
              className={`chip ${mode === 'text' ? 'is-active' : ''}`}
              onClick={() => setMode('text')}
            >
              Text or URL
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'wifi'}
              className={`chip ${mode === 'wifi' ? 'is-active' : ''}`}
              onClick={() => setMode('wifi')}
            >
              Wi-Fi network
            </button>
          </div>

          {mode === 'text' ? (
            <div className="input-group qr-field">
              <label className="input-label" htmlFor="qr-text">Text or URL</label>
              <textarea
                id="qr-text"
                className="text-area qr-textarea"
                rows={5}
                value={text}
                placeholder="https://example.com"
                onChange={(event) => setText(event.target.value)}
                spellCheck={false}
              />
              <span className="qr-hint">
                Anything the scanner can read as text: a link, an email address, a phone
                number, a short note. Most phones show a link as tappable.
              </span>
            </div>
          ) : (
            <div className="qr-fields">
              <label className="qr-field">
                <span className="input-label">Network name (SSID)</span>
                <input
                  className="text-input"
                  type="text"
                  value={wifi.ssid}
                  placeholder="MyHomeNetwork"
                  autoComplete="off"
                  onChange={(event) => setWifi((prev) => ({ ...prev, ssid: event.target.value }))}
                />
              </label>

              <label className="qr-field">
                <span className="input-label">Password</span>
                <input
                  className="text-input"
                  type="text"
                  value={wifi.password}
                  placeholder="Network password"
                  disabled={wifi.security === 'nopass'}
                  autoComplete="off"
                  onChange={(event) => setWifi((prev) => ({ ...prev, password: event.target.value }))}
                />
              </label>

              <label className="qr-field">
                <span className="input-label">Security</span>
                <select
                  className="text-input"
                  value={wifi.security}
                  onChange={(event) => setWifi((prev) => ({ ...prev, security: event.target.value }))}
                >
                  {SECURITY.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>

              <label className="qr-toggle">
                <input
                  type="checkbox"
                  checked={wifi.hidden}
                  onChange={(event) => setWifi((prev) => ({ ...prev, hidden: event.target.checked }))}
                />
                <span>Hidden network</span>
              </label>

              <p className="qr-hint qr-hint-wide">
                The password is written into the code in plain text. Anyone who scans it can
                join, so only print it for a network you are happy to share.
              </p>
            </div>
          )}

          <div className="qr-controls">
            <label className="qr-control">
              <span className="qr-control-label">Image size</span>
              <select className="text-input" value={size} onChange={(event) => setSize(Number(event.target.value))}>
                {SIZES.map((value) => (
                  <option key={value} value={value}>{value} × {value} px</option>
                ))}
              </select>
            </label>

            <label className="qr-control">
              <span className="qr-control-label">Error correction</span>
              <select className="text-input" value={level} onChange={(event) => setLevel(event.target.value)}>
                {LEVELS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            <label className="qr-control">
              <span className="qr-control-label">Quiet zone</span>
              <select className="text-input" value={margin} onChange={(event) => setMargin(Number(event.target.value))}>
                {MARGINS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            <label className="qr-control qr-control-color">
              <span className="qr-control-label">Foreground</span>
              <input type="color" value={dark} onChange={(event) => setDark(event.target.value)} />
            </label>

            <label className="qr-control qr-control-color">
              <span className="qr-control-label">Background</span>
              <input type="color" value={light} onChange={(event) => setLight(event.target.value)} />
            </label>
          </div>

          {error && <p className="qr-error" role="alert">{error}</p>}
        </div>

        <div className="qr-preview-column">
          <div className="qr-preview">
            {dataUrl ? (
              // A data: URL from a local canvas render; next/image cannot take one.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={dataUrl} alt="Generated QR code" width={size} height={size} />
            ) : (
              <p className="qr-placeholder">{busy ? 'Generating…' : emptyHint}</p>
            )}
          </div>

          <p className="qr-hint">
            {busy ? 'Encoding…' : 'Scan it with a phone before you print or publish it.'}
          </p>

          <div className="qr-actions">
            <button className="btn btn-primary" type="button" onClick={downloadPng} disabled={!dataUrl || busy}>
              Download PNG
            </button>
            <button className="btn btn-outline" type="button" onClick={downloadSvg} disabled={!payload || busy}>
              Download SVG
            </button>
            <button className="btn btn-secondary" type="button" onClick={reset}>
              Clear
            </button>
          </div>

          <p className="qr-hint qr-hint-small">
            PNG is the safe choice for screens and messaging. SVG stays sharp at any print
            size. Everything is generated in this browser — the content is never uploaded.
          </p>
        </div>
      </div>

      <SimpleAd style={{ width: '100%', marginTop: '1.5rem' }} />
    </div>
  );
};

export default QRCodeGenerator;
