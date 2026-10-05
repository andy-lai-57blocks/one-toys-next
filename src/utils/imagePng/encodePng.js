/**
 * Minimal indexed-PNG writer.
 *
 * The browser cannot emit an indexed PNG: `canvas.toBlob('image/png')` only
 * ever writes 24/32-bit truecolour, and it exposes no controls at all. Going
 * from 4 bytes per pixel to 1 byte per pixel plus a palette is where the
 * 70-80% saving comes from, so the chunks are assembled by hand and the
 * compressed stream comes from pako (already a project dependency).
 *
 * Scan lines are NOT filtered. Delta filtering assumes neighbouring sample
 * values are numerically related, which is true for colour but false for
 * palette indices - measured on real files it made the output 11-34% BIGGER.
 */
import * as pako from 'pako';

const SIGNATURE = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(bytes) {
  let c = ~0;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return ~c >>> 0;
}

/** length(4) + type(4) + data + crc(4), the CRC covering type and data. */
function chunk(type, data) {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length, false);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)), false);
  return out;
}

function concat(parts) {
  let total = 0;
  for (const p of parts) total += p.length;
  const out = new Uint8Array(total);
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

/**
 * @param {object} o
 * @param {number} o.width
 * @param {number} o.height
 * @param {Uint8Array} o.palette  RGBA quads, at most 256 entries
 * @param {Uint8Array} o.indices  one byte per pixel, indexing into `palette`
 * @returns {Uint8Array} a complete PNG file
 */
export function encodeIndexedPng({ width, height, palette, indices }) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
    throw new Error('encodeIndexedPng: bad dimensions');
  }
  if (indices.length !== width * height) {
    throw new Error('encodeIndexedPng: index buffer does not match dimensions');
  }
  const used = palette.length / 4;
  if (used < 1 || used > 256) throw new Error('encodeIndexedPng: palette out of range');

  // 1- 2- 4-bit index streams when the palette is small enough.
  const bitDepth = used <= 2 ? 1 : used <= 4 ? 2 : used <= 16 ? 4 : 8;
  // Decoders expect a palette that at least covers the index range; pad with
  // black rather than leaving the tail undefined.
  const entries = bitDepth === 8 ? used : 1 << bitDepth;

  const stride = Math.ceil((bitDepth * width) / 8);
  const scanlines = new Uint8Array((stride + 1) * height); // leading filter byte per row
  const perByte = 8 / bitDepth;
  for (let y = 0; y < height; y++) {
    const row = y * (stride + 1) + 1;
    if (bitDepth === 8) {
      scanlines.set(indices.subarray(y * width, (y + 1) * width), row);
    } else {
      for (let x = 0; x < width; x++) {
        scanlines[row + ((x / perByte) | 0)] |= indices[y * width + x] << ((perByte - 1 - (x % perByte)) * bitDepth);
      }
    }
  }

  const ihdr = new Uint8Array(13);
  const header = new DataView(ihdr.buffer);
  header.setUint32(0, width, false);
  header.setUint32(4, height, false);
  ihdr[8] = bitDepth;
  ihdr[9] = 3; // colour type 3 = indexed
  ihdr[10] = 0; // deflate
  ihdr[11] = 0; // adaptive filtering (unused: every row is filter 0)
  ihdr[12] = 0; // not interlaced

  const plte = new Uint8Array(entries * 3);
  for (let i = 0; i < used; i++) {
    plte[i * 3] = palette[i * 4];
    plte[i * 3 + 1] = palette[i * 4 + 1];
    plte[i * 3 + 2] = palette[i * 4 + 2];
  }

  const parts = [SIGNATURE, chunk('IHDR', ihdr), chunk('PLTE', plte)];

  // tRNS is only written up to the last non-opaque entry - trailing opaque
  // entries are implied and would just be bytes.
  let lastTransparent = -1;
  for (let i = 0; i < used; i++) if (palette[i * 4 + 3] !== 255) lastTransparent = i;
  if (lastTransparent >= 0) {
    const trns = new Uint8Array(lastTransparent + 1);
    for (let i = 0; i <= lastTransparent; i++) trns[i] = palette[i * 4 + 3];
    parts.push(chunk('tRNS', trns));
  }

  parts.push(chunk('IDAT', pako.deflate(scanlines, { level: 9 })));
  parts.push(chunk('IEND', new Uint8Array(0)));
  return concat(parts);
}
