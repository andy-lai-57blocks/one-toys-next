/**
 * Runs the indexed-PNG encoder, preferring a Worker.
 *
 * Quantising a 12 megapixel image is seconds of solid arithmetic; on the main
 * thread that is a frozen tab. The Worker is optional though - if it cannot be
 * constructed (or dies), we quietly fall back to running inline so the feature
 * never becomes unavailable.
 *
 * The inline path is imported DYNAMICALLY on purpose. Importing it statically
 * drags pako (~17 kB) into the tool's own bundle for the main thread, purely as
 * insurance for a path that normally never runs.
 */
let worker = null;
let workerUnavailable = false;
let nextId = 1;
const pending = new Map();

function failAll(reason) {
  for (const entry of pending.values()) entry.reject(new Error(reason));
  pending.clear();
}

function ensureWorker() {
  if (worker || workerUnavailable) return worker;
  if (typeof Worker === 'undefined') {
    workerUnavailable = true;
    return null;
  }
  try {
    const instance = new Worker(new URL('./pngWorker.js', import.meta.url));

    instance.onmessage = (event) => {
      const { id } = event.data;
      const entry = pending.get(id);
      if (!entry) return;
      pending.delete(id);
      if (event.data.ok) entry.resolve({ bytes: event.data.bytes, colors: event.data.colors });
      else entry.reject(new Error(event.data.error));
    };

    instance.onerror = () => {
      // Give up on the Worker for the rest of the session and let the awaiting
      // calls retry on the inline path.
      workerUnavailable = true;
      try {
        instance.terminate();
      } catch {
        /* already gone */
      }
      worker = null;
      failAll('worker failed');
    };

    worker = instance;
  } catch {
    workerUnavailable = true;
    worker = null;
  }
  return worker;
}

/**
 * @param {ImageData} imageData
 * @param {number} [maxColors]
 * @returns {Promise<{bytes: Uint8Array, colors: number}>}
 */
export async function encodePngAsync(imageData, maxColors = 256) {
  const { width, height, data } = imageData;

  const instance = ensureWorker();
  if (instance) {
    try {
      // Copy before transferring: the buffer must survive for the inline
      // fallback, and transferring detaches it.
      const buffer = data.buffer.slice(0);
      return await new Promise((resolve, reject) => {
        const id = nextId++;
        pending.set(id, { resolve, reject });
        try {
          instance.postMessage({ id, width, height, maxColors, rgba: buffer }, [buffer]);
        } catch (error) {
          pending.delete(id);
          reject(error);
        }
      });
    } catch {
      /* fall through to the synchronous path */
    }
  }

  const { rgbaToIndexedPng } = await import('./index');
  return rgbaToIndexedPng(data, width, height, maxColors);
}
