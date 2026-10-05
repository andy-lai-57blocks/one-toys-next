/**
 * Worker entry for indexed-PNG encoding.
 *
 * The quantiser is pure arithmetic over a few million pixels, which is easily
 * a second or more on a phone. Running it here keeps the page responsive.
 *
 * The pixel buffer is transferred rather than copied - on a 12 megapixel image
 * that saves a 48 MB structured clone.
 */
import { rgbaToIndexedPng } from './index';

self.onmessage = (event) => {
  const { id, width, height, maxColors, dither, rgba } = event.data;
  try {
    const result = rgbaToIndexedPng(new Uint8Array(rgba), width, height, maxColors, { dither });
    self.postMessage({ id, ok: true, colors: result.colors, bytes: result.bytes }, [result.bytes.buffer]);
  } catch (error) {
    self.postMessage({ id, ok: false, error: (error && error.message) || String(error) });
  }
};
