import { quantize } from './quantize';
import { encodeIndexedPng } from './encodePng';

/**
 * RGBA pixels in, indexed PNG bytes out.
 *
 * Called from a Worker, so it is allowed to take a few hundred milliseconds.
 *
 * @param {Uint8Array|Uint8ClampedArray} rgba 4 bytes per pixel
 * @param {number} width
 * @param {number} height
 * @param {number} [maxColors]
 * @returns {{bytes: Uint8Array, colors: number}}
 */
export function rgbaToIndexedPng(rgba, width, height, maxColors = 256) {
  const { palette, indices, colors } = quantize(rgba, width, height, maxColors);
  return { bytes: encodeIndexedPng({ width, height, palette, indices }), colors };
}
