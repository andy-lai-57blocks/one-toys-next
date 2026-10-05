'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { downloadAsFile } from '../../../utils/downloadUtils';
import { encodePngAsync } from '../../../utils/imagePng/encodePngAsync';
import SimpleAd from '../../ads/SimpleAdSSG';

// Client-side image compression, zero dependencies.
//
// Everything happens in the browser with the Canvas API — nothing is uploaded.
// That is the whole point of the tool, and it is only possible because the site
// is a static export with no server to fall back on.
//
// HONEST SCOPE, deliberately:
//   * WebP and JPEG come straight from `canvas.toBlob`. PNG cannot: the canvas
//     only ever writes 24/32-bit truecolour and exposes no controls, so a PNG
//     path built on it routinely returns a LARGER file (measured: +5% to +12%
//     on real inputs). PNG output is therefore assembled by hand in
//     src/utils/imagePng — truecolour is reduced to a 256-colour indexed PNG,
//     which is exactly how TinyPNG/pngquant get their 70-80%. Measured here:
//     PNG in -> PNG out saves 71-85%.
//   * It is offered only for PNG input, and only as an extra option. Re-encoding
//     a photograph into 256 colours is far worse than the WebP we would
//     otherwise produce, so we say so instead of quietly shipping it.
//   * All metadata is dropped, because the canvas has no way to write it back.
//     That removes EXIF/GPS (a privacy win) and also the ICC profile (a fidelity
//     loss that matters to people who colour-manage).
//
// A genuinely lossless PNG path would need WASM (oxipng) and is a separate
// decision — see the PRD note.

// A 48 MP photo decodes to ~192 MB of RGBA, and iOS Safari kills the tab well
// before that. Refuse rather than crash.
const MAX_PIXELS = 30_000_000;

const FORMATS = [
  { value: 'image/webp', label: 'WebP', ext: 'webp' },
  { value: 'image/jpeg', label: 'JPEG', ext: 'jpg' },
];

// Indexed PNG, built by hand. Only meaningful going PNG -> PNG.
const PNG_FORMAT = { value: 'image/png', label: 'PNG (256 colours)', ext: 'png' };
const ALL_FORMATS = [...FORMATS, PNG_FORMAT];

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const baseName = (name) => name.replace(/\.[^.]+$/, '') || 'image';

/**
 * Reads the intrinsic size WITHOUT decoding the frame into an RGBA buffer.
 * An <img> keeps the compressed data and only needs the header for naturalWidth,
 * which is exactly the cheap probe the pixel cap needs.
 */
const probeSize = (file) => new Promise((resolve) => {
  const url = URL.createObjectURL(file);
  const img = new Image();
  const done = (result) => {
    URL.revokeObjectURL(url);
    resolve(result);
  };
  img.onload = () => done({ width: img.naturalWidth, height: img.naturalHeight });
  img.onerror = () => done(null);
  img.src = url;
});

/**
 * @param {File} file
 * @param {{width: number, height: number}|null} cap decode straight to this size
 */
const loadBitmap = async (file, cap = null) => {
  // Resizing DURING the decode is the whole point: decoding a 32 MP photo at
  // full size first would allocate ~130 MB of RGBA before we get to shrink it.
  const resize = cap
    ? { resizeWidth: cap.width, resizeHeight: cap.height, resizeQuality: 'high' }
    : {};

  if (typeof createImageBitmap === 'function') {
    try {
      // `from-image` applies the EXIF orientation. Without it, most phone photos
      // come out rotated, which is the classic bug in hand-rolled client-side
      // image tools.
      return await createImageBitmap(file, { imageOrientation: 'from-image', ...resize });
    } catch {
      try {
        return await createImageBitmap(file, resize);
      } catch {
        /* fall through to the <img> path */
      }
    }
  }

  const url = URL.createObjectURL(file);
  const img = new Image();
  try {
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error('This file could not be decoded as an image.'));
      img.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
};

const encode = async (source, { quality, maxWidth, format, dither }) => {
  const srcW = source.width;
  const srcH = source.height;
  const scale = maxWidth > 0 && srcW > maxWidth ? maxWidth / srcW : 1;
  const width = Math.max(1, Math.round(srcW * scale));
  const height = Math.max(1, Math.round(srcH * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  // JPEG has no alpha channel. Without an opaque backdrop the transparent parts
  // of a PNG come out black instead of white. (PNG keeps its alpha, so it must
  // NOT get this treatment.)
  if (format === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, width, height);

  if (format === PNG_FORMAT.value) {
    try {
      const pixels = ctx.getImageData(0, 0, width, height);
      const { bytes, colors } = await encodePngAsync(pixels, 256, { dither });
      return { blob: new Blob([bytes], { type: 'image/png' }), width, height, colors };
    } finally {
      // Release the canvas backing store now rather than waiting for GC.
      canvas.width = 0;
      canvas.height = 0;
    }
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        // Release the canvas backing store now rather than waiting for GC.
        canvas.width = 0;
        canvas.height = 0;
        if (blob) resolve({ blob, width, height });
        else reject(new Error('The browser could not encode this image in the selected format.'));
      },
      format,
      quality,
    );
  });
};

const ImageCompressor = () => {
  const { isDarkTheme } = useTheme();
  const [file, setFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState('');
  const [source, setSource] = useState(null); // decoded bitmap / img
  const [dims, setDims] = useState(null);
  const [quality, setQuality] = useState(0.75);
  const [dither, setDither] = useState(false);
  const [maxWidth, setMaxWidth] = useState(0);
  const [format, setFormat] = useState('image/webp');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [preScale, setPreScale] = useState(null);
  const [dragging, setDragging] = useState(false);
  const decodedRef = useRef(null);

  // Free the previous preview URL and decoded bitmap whenever they are replaced.
  useEffect(() => () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
  }, [originalUrl]);

  useEffect(() => () => {
    if (result?.url) URL.revokeObjectURL(result.url);
  }, [result]);

  const clearAll = useCallback(() => {
    if (decodedRef.current && typeof decodedRef.current.close === 'function') {
      decodedRef.current.close();
    }
    decodedRef.current = null;
    setFile(null);
    setSource(null);
    setDims(null);
    setResult(null);
    setPreScale(null);
    setError('');
  }, []);

  const pickFile = useCallback(async (picked) => {
    if (!picked) return;
    setError('');
    setResult(null);

    if (!picked.type.startsWith('image/')) {
      setError('That is not an image file. Drop a JPEG, PNG or WebP.');
      return;
    }

    if (decodedRef.current && typeof decodedRef.current.close === 'function') {
      decodedRef.current.close();
    }
    decodedRef.current = null;

    setBusy(true);
    try {
      // Work out the target size BEFORE decoding. A 48 MP phone photo is ~190 MB
      // of RGBA, and iOS Safari kills the tab well before that, so decoding it
      // at full size and shrinking afterwards is exactly what we must not do.
      let cap = null;
      const probed = await probeSize(picked);
      if (probed && probed.width * probed.height > MAX_PIXELS) {
        // FLOOR, not round. Rounding both axes can push the product back over
        // the limit (4629 x 6481 = 30.01 MP > 30 MP), which then trips the
        // guard below and rejects an image we could have handled. Flooring
        // makes floor(w*s) * floor(h*s) <= w*h*s^2 == MAX_PIXELS by
        // construction; the 0.999 keeps a little headroom on top.
        const scale = Math.sqrt(MAX_PIXELS / (probed.width * probed.height)) * 0.999;
        cap = {
          width: Math.max(1, Math.floor(probed.width * scale)),
          height: Math.max(1, Math.floor(probed.height * scale)),
        };
      }

      const decoded = await loadBitmap(picked, cap);

      // The browser may still hand back something larger than asked for (an
      // ignored resize hint, or the <img> fallback), so keep a final guard.
      if (decoded.width * decoded.height > MAX_PIXELS) {
        const mp = (decoded.width * decoded.height) / 1e6;
        if (typeof decoded.close === 'function') decoded.close();
        setFile(null);
        setSource(null);
        setDims(null);
        setPreScale(null);
        setError(
          `This image is ${mp.toFixed(1)} megapixels and the browser would not decode it at a ` +
          `smaller size. The in-browser encoder stops at ${MAX_PIXELS / 1e6} MP so that phones ` +
          'do not run out of memory. Resize it first.',
        );
        return;
      }

      if (probed) {
        const fromMp = (probed.width * probed.height) / 1e6;
        const toMp = (decoded.width * decoded.height) / 1e6;
        setPreScale(fromMp > MAX_PIXELS / 1e6
          ? { from: fromMp.toFixed(1), to: toMp.toFixed(1), w: probed.width, h: probed.height }
          : null);
      } else {
        setPreScale(null);
      }

      decodedRef.current = decoded;
      setSource(decoded);
      setFile(picked);
      setDims({ width: decoded.width, height: decoded.height });
      setOriginalUrl(URL.createObjectURL(picked));
      // Indexed PNG only makes sense for PNG input, so drop a stale selection.
      if (picked.type !== 'image/png') {
        setFormat((current) => (current === PNG_FORMAT.value ? 'image/webp' : current));
      }
    } catch (err) {
      setError(err?.message || 'This file could not be decoded as an image.');
    } finally {
      setBusy(false);
    }
  }, []);

  // Re-encode whenever the image or a setting changes. Small debounce so dragging
  // the quality slider does not queue an encode per pixel of mouse movement.
  useEffect(() => {
    if (!source || !file) return undefined;
    let cancelled = false;

    const timer = setTimeout(async () => {
      setBusy(true);
      try {
        const { blob, width, height, colors } = await encode(source, { quality, maxWidth, format, dither });
        if (cancelled) return;
        setResult((prev) => {
          if (prev?.url) URL.revokeObjectURL(prev.url);
          return { url: URL.createObjectURL(blob), blob, size: blob.size, width, height, colors };
        });
        setError('');
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Compression failed.');
      } finally {
        if (!cancelled) setBusy(false);
      }
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [source, file, quality, maxWidth, format, dither]);

  const saved = useMemo(() => {
    if (!file || !result) return null;
    const diff = file.size - result.size;
    return { bytes: diff, pct: file.size ? Math.round((diff / file.size) * 100) : 0 };
  }, [file, result]);

  const ext = ALL_FORMATS.find((f) => f.value === format)?.ext || 'webp';
  const isPngInput = file?.type === 'image/png';
  const isPngOutput = format === PNG_FORMAT.value;
  const formats = isPngInput ? ALL_FORMATS : FORMATS;
  const paletteSize = result?.colors ?? 256;
  const paletteLabel = paletteSize === 1 ? 'a single colour' : `${paletteSize} colours`;

  const download = () => {
    if (!result || !file) return;
    // Pass the Blob itself, never its object URL. downloadAsFile() falls back to
    // string-based type detection when it is not given a MIME type, so handing it
    // a blob URL produced a text/plain file whose contents WERE that URL - the
    // download had the right extension and could not be opened.
    downloadAsFile(result.blob, `${baseName(file.name)}-compressed.${ext}`, format);
  };

  return (
    <div className={`tool-container image-compressor ${isDarkTheme ? 'dark-mode' : ''}`}>
      <div
        className={`image-drop ${dragging ? 'is-dragging' : ''} ${file ? 'has-file' : ''}`}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          pickFile(event.dataTransfer.files?.[0]);
        }}
      >
        {!file && (
          <>
            <span className="image-drop-icon" aria-hidden="true">{'\uD83D\uDDBC\uFE0F'}</span>
            <p className="image-drop-title">Drop an image here</p>
            <p className="image-drop-hint">JPEG, PNG or WebP. It never leaves your device.</p>
          </>
        )}

        <label className="btn btn-outline image-drop-button">
          {file ? 'Choose another image' : 'Choose an image'}
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              pickFile(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
        </label>
      </div>

      {error && <p className="image-error" role="alert">{error}</p>}

      {file && dims && (
        <>
          <div className="image-controls">
            <label className="image-control">
              <span className="image-control-label">Format</span>
              <select className="text-input" value={format} onChange={(event) => setFormat(event.target.value)}>
                {formats.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </label>

            <label className="image-control">
              <span className="image-control-label">
                Quality{' '}
                <strong>{isPngOutput ? 'not used' : `${Math.round(quality * 100)}%`}</strong>
              </span>
              <input
                type="range"
                min="0.3"
                max="0.95"
                step="0.01"
                value={quality}
                disabled={isPngOutput}
                onChange={(event) => setQuality(Number(event.target.value))}
              />
            </label>

            <label className="image-control">
              <span className="image-control-label">Max width</span>
              <select className="text-input" value={maxWidth} onChange={(event) => setMaxWidth(Number(event.target.value))}>
                <option value={0}>Keep original ({dims.width}px)</option>
                <option value={3840}>3840px</option>
                <option value={2560}>2560px</option>
                <option value={1920}>1920px</option>
                <option value={1280}>1280px</option>
                <option value={800}>800px</option>
              </select>
            </label>

            {isPngOutput && (
              <div className="image-control">
                <span className="image-control-label">Gradients</span>
                <label className="image-toggle">
                  <input
                    type="checkbox"
                    checked={dither}
                    onChange={(event) => setDither(event.target.checked)}
                  />
                  <span>Dither (smoother, larger)</span>
                </label>
              </div>
            )}
          </div>

          {preScale && (
            <p className="image-note">
              This image is {preScale.from} MP ({preScale.w} × {preScale.h}), above the{' '}
              {MAX_PIXELS / 1e6} MP a browser can hold, so it was decoded at {preScale.to} MP.
              Nothing was uploaded — the decode happens at the reduced size rather than
              afterwards, which is what keeps it from running out of memory.
            </p>
          )}

          {isPngInput && isPngOutput && (
            <p className="image-note">
              The output stays a PNG, reduced to {paletteLabel} — that reduction is what makes it
              smaller. If smooth areas look banded, turn on <strong>Dither</strong> above: it trades
              clean flat colour for fine grain and a larger file. If you do not need to keep the PNG
              format, WebP is smaller and has no such limit.
            </p>
          )}

          {isPngInput && !isPngOutput && (
            <p className="image-note">
              Switching to <strong>PNG</strong> above keeps this file a PNG and still shrinks it —
              usually by 70% or more.
            </p>
          )}

          {isPngOutput && saved && saved.bytes <= 0 && (
            <p className="image-note image-note-warn">
              This image holds more detail than 256 colours can carry, so the PNG came out bigger
              than the original. WebP will do much better here.
            </p>
          )}

          <div className="image-compare">
            <figure className="image-panel">
              {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL of a
                  local file; next/image cannot optimise or even receive it. */}
              <img src={originalUrl} alt="Original" />
              <figcaption>
                <span className="image-panel-title">Original</span>
                <span>{dims.width} × {dims.height}</span>
                <span>{formatBytes(file.size)}</span>
              </figcaption>
            </figure>

            <figure className="image-panel">
              {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL of a
                  local file; next/image cannot optimise or even receive it. */}
              {result ? <img src={result.url} alt="Compressed" /> : <div className="image-panel-placeholder" />}
              <figcaption>
                <span className="image-panel-title">Compressed</span>
                <span>{result ? `${result.width} × ${result.height}` : '—'}</span>
                <span>{result ? formatBytes(result.size) : busy ? 'working…' : '—'}</span>
                {saved && (
                  <span className={saved.bytes > 0 ? 'image-saved' : 'image-grew'}>
                    {saved.bytes > 0 ? `−${saved.pct}%` : `+${Math.abs(saved.pct)}% larger`}
                  </span>
                )}
              </figcaption>
            </figure>
          </div>

          {/* Generic advice. Suppressed for indexed PNG, where "lower the
              quality" is not a thing and the note above already explains it. */}
          {!isPngOutput && saved && saved.bytes <= 0 && (
            <p className="image-note">
              The result is larger than the original. Raise the max-width reduction, lower the
              quality, or the source was already well compressed.
            </p>
          )}

          <div className="image-actions">
            <button className="btn btn-primary" onClick={download} disabled={!result || busy}>
              {result ? `Download ${formatBytes(result.size)} ${ext.toUpperCase()}` : 'Download'}
            </button>
            <button className="btn btn-outline" onClick={clearAll}>Clear</button>
          </div>
        </>
      )}

      {/* width 100% so data-full-width-responsive can actually fill: the
          component defaults to a 300px box, which forces AdSense to pick a
          size that fits 300px instead of the horizontal banner this slot is
          configured as.
          The spacing has to ride along inline too. SimpleAdSSG writes
          `margin: 0 auto` as an inline style, which outranks any stylesheet
          rule, so a .image-compressor .ad-* margin-top never applies. */}
      <SimpleAd adSlot="8095900796" style={{ width: '100%', marginTop: '1.5rem' }} />
    </div>
  );
};

export default ImageCompressor;
