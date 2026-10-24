'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '../../../contexts/ThemeContext';
import { downloadAsFile } from '../../../utils/downloadUtils';
import SimpleAd from '../../ads/SimpleAdSSG';

// Image -> text (OCR), done in the browser.
//
// The engine (tesseract.js + its WebAssembly core + one language model) is the
// heaviest thing on the site, so it is NEVER imported at module level: the
// `await import()` inside getWorker() puts it in its own chunk, and it only
// downloads when someone presses "Extract text". The image itself never leaves
// the device - tesseract runs in a Web Worker here.
//
// The CodeEditor is lazy for the same reason (react-ace is ~360 kB). OCR output
// is prose, so it is rendered without line numbers.

const CodeEditor = dynamic(() => import('../../common/CodeEditor'), {
  ssr: false,
  loading: () => <div className="ocr-editor-loading">Loading editor…</div>,
});

// Tesseract's accuracy collapses when the x-height is under ~10 px, which is
// exactly what a UI screenshot at 12-14 px CSS (often 1x DPI) contains. Small
// images are therefore UPSCALED to this long edge; large photos are downscaled
// from MAX_EDGE. Measured on a 10 px fixture: 94% character accuracy before the
// upscale, 100% after.
const TARGET_EDGE = 2400;
const MAX_EDGE = 3200;
const MAX_UPSCALE = 2.5;

const LANGUAGES = [
  { value: 'eng', label: 'English' },
  { value: 'chi_sim+eng', label: 'Chinese (Simplified) + English' },
  { value: 'chi_tra+eng', label: 'Chinese (Traditional) + English' },
  { value: 'jpn', label: 'Japanese' },
  { value: 'kor', label: 'Korean' },
  { value: 'spa', label: 'Spanish' },
  { value: 'fra', label: 'French' },
  { value: 'deu', label: 'German' },
];

// Tesseract page segmentation modes. Measured across 10 fixtures (clean, dark,
// low-contrast, 10 px, JPEG-noise, 3° skew): SINGLE_BLOCK was >=99% on every
// one, while AUTO reordered the blocks of the skewed page (52%). Documents and
// screenshots are one block, so that is the default; AUTO stays available for
// genuinely multi-column pages.
const LAYOUTS = [
  { value: '6', label: 'Text block — documents, screenshots' },
  { value: '3', label: 'Auto — mixed layout' },
  { value: '7', label: 'Single line — cropped line' },
  { value: '11', label: 'Sparse text — labels, forms' },
];

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

// The worker reports tesseract's internal phase names; only the ones a user can
// act on are surfaced.
const describeStage = (status) => {
  if (!status) return 'Preparing the OCR engine';
  if (status.includes('loading tesseract core')) return 'Downloading the OCR engine';
  if (status.includes('initializing tesseract')) return 'Starting the OCR engine';
  if (status.includes('loading language')) return 'Downloading language data';
  if (status.includes('initializing api')) return 'Preparing the language';
  if (status.includes('recognizing text')) return 'Reading text';
  return 'Preparing the OCR engine';
};

/**
 * Otsu's method on a grayscale histogram: the threshold that maximises the
 * between-class variance. Used only for the optional B/W pass.
 */
const otsu = (hist, total) => {
  let sum = 0;
  for (let i = 0; i < 256; i += 1) sum += i * hist[i];

  let sumB = 0;
  let weightB = 0;
  let best = 0;
  let threshold = 128;

  for (let t = 0; t < 256; t += 1) {
    weightB += hist[t];
    if (weightB === 0) continue;
    const weightF = total - weightB;
    if (weightF === 0) break;

    sumB += t * hist[t];
    const meanB = sumB / weightB;
    const meanF = (sum - sumB) / weightF;
    const variance = weightB * weightF * (meanB - meanF) ** 2;

    if (variance > best) {
      best = variance;
      threshold = t;
    }
  }

  return threshold;
};

/**
 * Decode the file, apply EXIF orientation, resize to a size OCR can read, then
 * normalise the pixels.
 *
 * The pixel pass matters more than anything else on real-world images:
 *   * grayscale + a 0.5%..99.5% contrast stretch rescues grey-on-grey
 *     screenshots (measured: 11 px #8d8d8d on #e9e9e9 went from 96% to 100%)
 *   * auto-invert for light-on-dark screenshots and dark mode
 *   * optional Otsu binarisation for the "High contrast" switch
 *
 * Without `imageOrientation: 'from-image'`, photos taken in portrait often reach
 * OCR rotated 90°, which reads as gibberish.
 */
const prepareImage = async (file, { binarize = false } = {}) => {
  let source;
  let release = () => {};

  if (typeof createImageBitmap === 'function') {
    try {
      source = await createImageBitmap(file, { imageOrientation: 'from-image' });
      release = () => source.close && source.close();
    } catch {
      /* fall through to the <img> path */
    }
  }

  if (!source) {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('This file could not be decoded as an image.'));
        img.src = url;
      });
      source = img;
      release = () => URL.revokeObjectURL(url);
    } catch (error) {
      URL.revokeObjectURL(url);
      throw error;
    }
  }

  const naturalWidth = source.width || source.naturalWidth;
  const naturalHeight = source.height || source.naturalHeight;
  const longEdge = Math.max(naturalWidth, naturalHeight);

  let scale = 1;
  if (longEdge > MAX_EDGE) scale = MAX_EDGE / longEdge;
  else if (longEdge < TARGET_EDGE) scale = Math.min(MAX_UPSCALE, TARGET_EDGE / longEdge);

  const width = Math.max(1, Math.round(naturalWidth * scale));
  const height = Math.max(1, Math.round(naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  // A transparent PNG would otherwise reach the recognizer as black.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, width, height);

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const total = width * height;
  const hist = new Uint32Array(256);

  for (let i = 0; i < data.length; i += 4) {
    // Integer luma, 299/587/114 weights.
    const grey = (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000 | 0;
    data[i] = grey;
    data[i + 1] = grey;
    data[i + 2] = grey;
    hist[grey] += 1;
  }

  const tail = Math.max(1, Math.floor(total * 0.005));
  let lo = 0;
  let acc = 0;
  for (let v = 0; v < 256; v += 1) {
    acc += hist[v];
    if (acc >= tail) { lo = v; break; }
  }

  let hi = 255;
  acc = 0;
  for (let v = 255; v >= 0; v -= 1) {
    acc += hist[v];
    if (acc >= tail) { hi = v; break; }
  }

  if (hi <= lo) { lo = 0; hi = 255; }

  // Dark median => light text on a dark background.
  let median = 128;
  acc = 0;
  for (let v = 0; v < 256; v += 1) {
    acc += hist[v];
    if (acc >= total / 2) { median = v; break; }
  }
  const inverted = median < 128;

  const threshold = binarize ? otsu(hist, total) : -1;
  const range = hi - lo || 1;

  for (let i = 0; i < data.length; i += 4) {
    let value;
    if (threshold >= 0) {
      value = data[i] > threshold ? 255 : 0;
      if (inverted) value = 255 - value;
    } else {
      value = ((data[i] - lo) * 255) / range;
      if (inverted) value = 255 - value;
      value = value < 0 ? 0 : value > 255 ? 255 : value;
    }
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  }

  ctx.putImageData(imageData, 0, 0);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  canvas.width = 0;
  canvas.height = 0;
  release();

  if (!blob) throw new Error('The image could not be prepared for OCR.');

  return {
    blob,
    width,
    height,
    upscaled: scale > 1.001,
    downscaled: scale < 0.999,
    inverted,
  };
};

const ImageToText = () => {
  const { isDarkTheme } = useTheme();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [dims, setDims] = useState(null);
  const [lang, setLang] = useState('eng');
  const [layout, setLayout] = useState('6');
  const [binarize, setBinarize] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | preparing | loading | recognizing | done | error
  const [stage, setStage] = useState('');
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState('');
  const [confidence, setConfidence] = useState(null);
  const [seconds, setSeconds] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);

  const workerRef = useRef(null);
  const workerLangRef = useRef('');
  const cancelledRef = useRef(false);

  const busy = status === 'preparing' || status === 'loading' || status === 'recognizing';

  useEffect(() => () => {
    cancelledRef.current = true;
    if (workerRef.current) workerRef.current.terminate();
    workerRef.current = null;
  }, []);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const getWorker = useCallback(async (language) => {
    if (workerRef.current) {
      if (workerLangRef.current !== language) {
        setStatus('loading');
        setStage('Loading the selected language');
        await workerRef.current.reinitialize(language);
        workerLangRef.current = language;
      }
      return workerRef.current;
    }

    setStatus('loading');
    setStage('Downloading the OCR engine');

    // Loaded here, never at module scope: this is what keeps the page's first
    // load small.
    const { createWorker } = await import('tesseract.js');

    const worker = await createWorker(language, 1, {
      logger: (message) => {
        if (cancelledRef.current) return;
        setStage(describeStage(message.status));
        if (message.status === 'recognizing text') {
          setStatus('recognizing');
          if (typeof message.progress === 'number') {
            setProgress(Math.round(message.progress * 100));
          }
        }
      },
    });

    workerRef.current = worker;
    workerLangRef.current = language;
    return worker;
  }, []);

  const pickFile = useCallback((picked) => {
    if (!picked) return;
    setError('');

    if (!picked.type.startsWith('image/')) {
      setError('That is not an image file. Use a PNG, JPEG, WebP or BMP screenshot or photo.');
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
    setDims(null);
    setText('');
    setConfidence(null);
    setSeconds(null);
    setStatus('idle');
    setStage('');
    setProgress(0);

    const img = new Image();
    const url = URL.createObjectURL(picked);
    img.onload = () => {
      setDims({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  }, [preview]);

  const run = useCallback(async () => {
    if (!file || busy) return;

    cancelledRef.current = false;
    setError('');
    setText('');
    setConfidence(null);
    setSeconds(null);
    setProgress(0);
    setCopied(false);

    const started = performance.now();
    setStatus('preparing');
    setStage('Preparing the image');

    try {
      const prepared = await prepareImage(file, { binarize });
      setDims((prev) => prev || { width: prepared.width, height: prepared.height });

      const worker = await getWorker(lang);
      if (cancelledRef.current) return;

      // PSM is re-applied after any reinitialize(), which resets parameters.
      await worker.setParameters({
        tessedit_pageseg_mode: layout,
        user_defined_dpi: '300',
      });
      if (cancelledRef.current) return;

      setStatus('recognizing');
      setStage('Reading text');

      const { data } = await worker.recognize(prepared.blob);
      if (cancelledRef.current) return;

      const cleaned = (data.text || '').replace(/\n{3,}/g, '\n\n').trim();
      setText(cleaned);
      setConfidence(typeof data.confidence === 'number' ? Math.round(data.confidence) : null);
      setSeconds((performance.now() - started) / 1000);
      setStatus('done');
      setStage('');
    } catch (err) {
      if (cancelledRef.current) return;
      setStatus('error');
      setStage('');
      const message = err && err.message ? err.message : '';
      setError(
        /fetch|network|load|worker|import/i.test(message)
          ? 'The OCR engine could not be downloaded. Check your connection and try again — the language data is fetched once and then cached.'
          : 'The text could not be read from this image. Try a sharper image with more contrast.',
      );
    }
  }, [file, busy, getWorker, lang, layout, binarize]);

  const cancel = useCallback(async () => {
    cancelledRef.current = true;
    const worker = workerRef.current;
    workerRef.current = null;
    workerLangRef.current = '';
    setStatus('idle');
    setStage('');
    setProgress(0);
    if (worker) {
      try {
        await worker.terminate();
      } catch {
        /* terminating a dead worker is not an error we can act on */
      }
    }
  }, []);

  const clearAll = useCallback(() => {
    cancelledRef.current = true;
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
      workerLangRef.current = '';
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview('');
    setDims(null);
    setText('');
    setConfidence(null);
    setSeconds(null);
    setError('');
    setStatus('idle');
    setStage('');
    setProgress(0);
  }, [preview]);

  const copy = useCallback(async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);

  const download = useCallback(() => {
    if (!text) return;
    downloadAsFile(text, 'recognized-text.txt', 'text/plain');
  }, [text]);

  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className={`tool-container image-to-text ${isDarkTheme ? 'dark-mode' : ''}`}>
      <div className="ocr-layout">
        <div className="ocr-panel">
          <div
            className={`ocr-drop ${dragging ? 'is-dragging' : ''} ${file ? 'has-file' : ''}`}
            onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              pickFile(event.dataTransfer.files?.[0]);
            }}
          >
            {file && preview ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL of a local file */}
                <img className="ocr-preview" src={preview} alt="Image to read" />
                <div className="ocr-file-meta">
                  <span>{dims ? `${dims.width} × ${dims.height}` : 'Reading dimensions…'}</span>
                  <span>{formatBytes(file.size)}</span>
                  <span>{file.type.replace('image/', '').toUpperCase()}</span>
                </div>
              </>
            ) : (
              <>
                <span className="ocr-drop-icon" aria-hidden="true">{'\uD83D\uDD8D\uFE0F'}</span>
                <p className="ocr-drop-title">Drop an image here</p>
                <p className="ocr-drop-hint">Screenshot, scan or photo. It never leaves your device.</p>
              </>
            )}

            <label className="btn btn-outline ocr-drop-button">
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

          <div className="ocr-controls">
            <div className="ocr-fields">
              <label className="ocr-control">
                <span className="ocr-control-label">Language</span>
                <select
                  className="text-input"
                  value={lang}
                  disabled={busy}
                  onChange={(event) => setLang(event.target.value)}
                >
                  {LANGUAGES.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>

              <label className="ocr-control">
                <span className="ocr-control-label">Text layout</span>
                <select
                  className="text-input"
                  value={layout}
                  disabled={busy}
                  onChange={(event) => setLayout(event.target.value)}
                >
                  {LAYOUTS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>

              <label className="ocr-toggle">
                <input
                  type="checkbox"
                  checked={binarize}
                  disabled={busy}
                  onChange={(event) => setBinarize(event.target.checked)}
                />
                <span>High contrast (B/W)</span>
              </label>
            </div>

            <div className="ocr-actions">
              {busy ? (
                <button className="btn btn-secondary" type="button" onClick={cancel}>
                  Cancel
                </button>
              ) : (
                <button className="btn btn-primary" type="button" onClick={run} disabled={!file}>
                  Extract text
                </button>
              )}
              <button className="btn btn-outline" type="button" onClick={clearAll} disabled={!file && !text}>
                Clear
              </button>
            </div>
          </div>

          {busy && (
            <div className="ocr-status" role="status" aria-live="polite">
              <div className="ocr-status-row">
                <span>{stage}</span>
                {status === 'recognizing' && <span>{progress}%</span>}
              </div>
              <div
                className={`ocr-progress ${status === 'recognizing' ? '' : 'is-indeterminate'}`}
                aria-hidden="true"
              >
                <span style={status === 'recognizing' ? { width: `${progress}%` } : undefined} />
              </div>
            </div>
          )}

          {error && <p className="ocr-error" role="alert">{error}</p>}

          <p className="ocr-note">
            Before recognition the image is upscaled if its text is small, converted to
            grayscale, contrast-normalised and inverted when the text is light on dark. Turn
            on <strong>High contrast</strong> for clean screenshots. The engine and one
            language model are downloaded once (roughly 5–8 MB) and then cached; the image
            itself never leaves this device.
          </p>
        </div>

        <div className="ocr-result">
          <div className="ocr-result-head">
            <span className="ocr-result-title">Recognized text</span>
            {status === 'done' && (
              <span className="ocr-result-meta">
                {text.length.toLocaleString()} characters · {wordCount.toLocaleString()} words
                {confidence !== null ? ` · ${confidence}% confidence` : ''}
                {seconds !== null ? ` · ${seconds.toFixed(1)}s` : ''}
              </span>
            )}
          </div>

          {text || status === 'done' ? (
            <CodeEditor
              value={text}
              onChange={setText}
              language="text"
              name="ocr-output-editor"
              height="420px"
              showLineNumbers={false}
              showGutter={false}
              placeholder="No text was found in this image."
            />
          ) : (
            <div className="ocr-result-placeholder">
              <p>Recognized text will appear here.</p>
              <p className="ocr-result-hint">
                Clear, high-contrast images work best: a screenshot or a flat scan reads far
                more reliably than a photo of a screen at an angle.
              </p>
            </div>
          )}

          <div className="ocr-result-actions">
            <button className="btn btn-primary" type="button" onClick={copy} disabled={!text}>
              {copied ? 'Copied' : 'Copy text'}
            </button>
            <button className="btn btn-outline" type="button" onClick={download} disabled={!text}>
              Download .txt
            </button>
          </div>
        </div>
      </div>

      <SimpleAd style={{ width: '100%', marginTop: '1.5rem' }} />
    </div>
  );
};

export default ImageToText;
