/**
 * Palette quantiser for indexed PNG output.
 *
 * Pipeline: colour histogram -> modified median cut -> k-means (Voronoi)
 * refinement -> nearest-colour assignment through a lookup table.
 *
 * Distance is measured in OKLab, NOT in weighted sRGB.
 *
 * Why that matters, measured: on a dark navy graphic this file used to land at
 * 42.3 dB where native pngquant reached 56.3 dB - same 256-colour budget, a
 * 14 dB gap - and the difference was visible, with our dark blue background
 * coming out lifted and grey. The old metric was
 *     0.30*dr^2 + 0.59*dg^2 + 0.11*db^2
 * which are LUMINANCE sensitivity weights applied to gamma-encoded sRGB
 * differences. Those are the wrong weights for palette selection: they discount
 * blue by 89%, so a blue-heavy image gets an under-resolved palette, and they
 * under-weight error in dark regions - exactly where the eye is most sensitive.
 * No choice of weights makes a non-uniform space uniform, so convert instead.
 *
 * OKLab rather than CIELAB because it is cheap enough to sit inside the k-means
 * inner loop while still being markedly more uniform than raw sRGB.
 *
 * Dithering is opt-in and off by default. Where it is on, it is applied per
 * pixel and only where it can help - flat neighbourhoods whose colour the
 * palette genuinely misses. See the two gates in the diffusion block below.
 *
 * Pure JS, no dependencies, runs in a Worker.
 */

/** Above this many distinct colours we stop tracking them exactly. */
const EXACT_LIMIT = 60000;

/** sRGB byte -> linear light. Precomputed, because the transform needs a pow(). */
const TO_LINEAR = new Float32Array(256);
for (let i = 0; i < 256; i++) {
  const c = i / 255;
  TO_LINEAR[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * sRGB bytes -> OKLab, written into out[o..o+2].
 * Reference: Bjorn Ottosson, https://bottosson.github.io/posts/oklab/
 *
 * r, g, b MUST be integers in 0..255. TO_LINEAR is a 256-entry table, so a
 * fractional argument reads undefined and turns every component into NaN
 * without throwing. The `& 255` is cheap insurance that keeps an out-of-range
 * caller from reading past the table; it is not a substitute for rounding.
 */
function toOklab(r, g, b, out, o) {
  const lr = TO_LINEAR[r & 255];
  const lg = TO_LINEAR[g & 255];
  const lb = TO_LINEAR[b & 255];

  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  out[o] = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  out[o + 1] = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  out[o + 2] = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
}

function linearToSrgb(c) {
  const v = c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  const byte = Math.round(v * 255);
  return byte < 0 ? 0 : byte > 255 ? 255 : byte;
}

/** OKLab -> sRGB bytes, written into out[o..o+2]. */
function fromOklab(L, a, b, out, o) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  out[o] = linearToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s);
  out[o + 1] = linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s);
  out[o + 2] = linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s);
}

/**
 * How strongly an alpha mismatch counts relative to a colour mismatch. OKLab
 * distances reach ~1.0 for very different colours, so an alpha difference in
 * 0..1 needs lifting to compete; edges are also where alpha error shows most.
 */
const ALPHA_WEIGHT = 1.5;

/** Squared distance between two OKLab points, alpha aware. */
function dist(p, q) {
  const pa = p.a * (1 / 255);
  const qa = q.a * (1 / 255);
  const dl = p.L - q.L;
  const da = p.la - q.la;
  const db = p.lb - q.lb;
  const dAlpha = pa - qa;
  // The colour term is scaled by how opaque both sides are, so the arbitrary
  // RGB of a transparent pixel cannot vote (the old premultiplied-space idea,
  // expressed in OKLab terms).
  return pa * qa * (dl * dl + da * da + db * db) + ALPHA_WEIGHT * dAlpha * dAlpha;
}

/** Weighted mean in OKLab, plus weighted variance per axis. */
function makeBox(pts) {
  if (pts.length === 0) {
    return { pts, w: 0, c: { L: 0, la: 0, lb: 0, a: 0 }, variance: 0, vl: 0, va: 0, vb: 0, vA: 0 };
  }
  let w = 0, sL = 0, sa = 0, sb = 0, sA = 0;
  for (const p of pts) {
    w += p.w;
    sL += p.L * p.w;
    sa += p.la * p.w;
    sb += p.lb * p.w;
    sA += p.a * p.w;
  }
  const c = { L: sL / w, la: sa / w, lb: sb / w, a: sA / w };

  let vl = 0, va = 0, vb = 0, vA = 0;
  for (const p of pts) {
    vl += p.w * (p.L - c.L) ** 2;
    va += p.w * (p.la - c.la) ** 2;
    vb += p.w * (p.lb - c.lb) ** 2;
    const dA = (p.a - c.a) * (1 / 255);
    vA += p.w * dA * dA;
  }
  // Alpha variance is expressed in the same 0..1 units as the OKLab axes so it
  // can be compared against them when picking a split axis.
  return { pts, w, c, variance: (vl + va + vb + vA) / w, vl, va, vb, vA };
}

/** Axis with the largest weighted spread - the one worth splitting on. */
function widestDim(b) {
  const dims = [b.vl, b.va, b.vb, b.vA];
  const keys = ['L', 'la', 'lb', 'a'];
  let best = 0;
  for (let i = 1; i < 4; i++) if (dims[i] > dims[best]) best = i;
  return keys[best];
}

/**
 * Colour histogram, in OKLab.
 *
 * When the image has few enough distinct colours they are kept EXACTLY.
 * Bucketing averages the colours that land in a bucket, which is precisely what
 * ruins flat graphics - and graphics are the case indexed PNG should win.
 * Busy images (photos) fall back to 5-bit buckets, where the 8-value precision
 * is far below the quantisation error anyway.
 */
function histogram(rgba) {
  const seen = new Set();
  let exact = true;
  for (let i = 0; i < rgba.length; i += 4) {
    seen.add(((rgba[i] << 24) | (rgba[i + 1] << 16) | (rgba[i + 2] << 8) | rgba[i + 3]) >>> 0);
    if (seen.size > EXACT_LIMIT) {
      exact = false;
      break;
    }
  }
  seen.clear();

  const pts = [];
  const lab = new Float32Array(3);

  if (exact) {
    const tally = new Map();
    for (let i = 0; i < rgba.length; i += 4) {
      const k = ((rgba[i] << 24) | (rgba[i + 1] << 16) | (rgba[i + 2] << 8) | rgba[i + 3]) >>> 0;
      tally.set(k, (tally.get(k) || 0) + 1);
    }
    for (const [k, w] of tally) {
      const r = (k >>> 24) & 255, g = (k >>> 16) & 255, b = (k >>> 8) & 255, a = k & 255;
      toOklab(r, g, b, lab, 0);
      pts.push({ w, r, g, b, a, L: lab[0], la: lab[1], lb: lab[2] });
    }
    return { pts, exact: true };
  }

  const tally = new Map();
  for (let i = 0; i < rgba.length; i += 4) {
    const r = rgba[i], g = rgba[i + 1], b = rgba[i + 2], a = rgba[i + 3];
    const key = ((a >> 3) << 15) | ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    const e = tally.get(key);
    if (e) {
      e.w++; e.r += r; e.g += g; e.b += b; e.a += a;
    } else {
      tally.set(key, { w: 1, r, g, b, a });
    }
  }
  for (const e of tally.values()) {
    const r = e.r / e.w, g = e.g / e.w, b = e.b / e.w, a = e.a / e.w;
    toOklab(Math.round(r), Math.round(g), Math.round(b), lab, 0);
    pts.push({ w: e.w, r, g, b, a, L: lab[0], la: lab[1], lb: lab[2] });
  }
  return { pts, exact: false };
}

/**
 * Modified median cut: repeatedly split the box contributing most
 * weight x variance, at the weighted median of its widest axis. Choosing by
 * variance rather than by volume or population is what keeps near-identical
 * colours from consuming the whole budget.
 */
function medianCut(pts, maxColors) {
  const boxes = [makeBox(pts)];
  while (boxes.length < maxColors) {
    let target = -1, best = -1;
    for (let i = 0; i < boxes.length; i++) {
      const b = boxes[i];
      if (b.pts.length < 2) continue;
      const score = b.w * b.variance;
      if (score > best) {
        best = score;
        target = i;
      }
    }
    if (target < 0) break;

    const box = boxes[target];
    const dim = widestDim(box);
    const sorted = box.pts.slice().sort((p, q) => p[dim] - q[dim]);
    const half = box.w / 2;
    let acc = 0, cut = 1;
    for (let i = 0; i < sorted.length - 1; i++) {
      acc += sorted[i].w;
      if (acc >= half) {
        cut = i + 1;
        break;
      }
    }
    boxes.splice(target, 1, makeBox(sorted.slice(0, cut)), makeBox(sorted.slice(cut)));
  }
  return boxes.map((b) => ({ L: b.c.L, la: b.c.la, lb: b.c.lb, a: b.c.a }));
}

/** Lloyd/Voronoi iteration - nudges the palette toward a local optimum. */
function kmeans(pts, palette, iters) {
  const n = palette.length;
  let current = palette;
  for (let iter = 0; iter < iters; iter++) {
    const acc = Array.from({ length: n }, () => ({ w: 0, L: 0, la: 0, lb: 0, a: 0 }));
    for (const p of pts) {
      let best = Infinity, bi = 0;
      for (let i = 0; i < n; i++) {
        const d = dist(p, current[i]);
        if (d < best) {
          best = d;
          bi = i;
        }
      }
      const t = acc[bi];
      t.w += p.w;
      t.L += p.L * p.w;
      t.la += p.la * p.w;
      t.lb += p.lb * p.w;
      t.a += p.a * p.w;
    }
    let moved = 0;
    const next = current.slice();
    for (let i = 0; i < n; i++) {
      if (acc[i].w === 0) continue;
      const prev = current[i];
      const np = {
        L: acc[i].L / acc[i].w,
        la: acc[i].la / acc[i].w,
        lb: acc[i].lb / acc[i].w,
        a: acc[i].a / acc[i].w,
      };
      if (
        Math.abs(np.L - prev.L) + Math.abs(np.la - prev.la)
        + Math.abs(np.lb - prev.lb) + Math.abs(np.a - prev.a) > 0.002
      ) {
        moved++;
      }
      next[i] = np;
    }
    current = next;
    if (iter > 2 && moved === 0) break;
  }
  return current;
}

/**
 * Reduce an RGBA buffer to at most `maxColors` colours.
 *
 * @param {Uint8Array|Uint8ClampedArray} rgba
 * @param {number} width
 * @param {number} height
 * @param {number} [maxColors] PNG allows at most 256.
 * @param {{dither?: boolean}} [options] dither = trade banding for grain and size.
 * @returns {{palette: Uint8Array, indices: Uint8Array, colors: number}}
 *          palette is RGBA quads; indices is one byte per pixel.
 */
export function quantize(rgba, width, height, maxColors = 256, options = {}) {
  const dither = options.dither === true;
  const limit = Math.max(1, Math.min(256, maxColors | 0));
  const { pts, exact } = histogram(rgba);

  let centroids;
  if (exact && pts.length <= limit) {
    // Every colour fits. Keep the source bytes rather than round-tripping them
    // through OKLab, so the conversion stays bit-exact.
    centroids = pts.map((p) => ({ L: p.L, la: p.la, lb: p.lb, a: p.a, exactRgb: [p.r, p.g, p.b] }));
  } else {
    let rest = pts;
    let reserved = [];
    // Low colour count means graphics. Pinning the most frequent colours to
    // their exact values stops flat fills and text from drifting to a
    // near-miss colour.
    if (exact && pts.length > limit) {
      const reserve = Math.min(24, Math.floor(limit / 4));
      const sorted = pts.slice().sort((a, b) => b.w - a.w);
      reserved = sorted
        .slice(0, reserve)
        .map((p) => ({ L: p.L, la: p.la, lb: p.lb, a: p.a, exactRgb: [p.r, p.g, p.b] }));
      rest = sorted.slice(reserve);
    }
    const budget = Math.max(1, limit - reserved.length);
    centroids = rest.length ? kmeans(rest, medianCut(rest, budget), 12) : [];
    centroids = reserved.concat(centroids);
  }

  if (centroids.length === 0) centroids = [{ L: 0, la: 0, lb: 0, a: 255, exactRgb: [0, 0, 0] }];

  const n = centroids.length;
  const palette = new Uint8Array(n * 4);
  const scratch = new Float32Array(3);
  for (let i = 0; i < n; i++) {
    const c = centroids[i];
    if (c.exactRgb) {
      palette[i * 4] = c.exactRgb[0];
      palette[i * 4 + 1] = c.exactRgb[1];
      palette[i * 4 + 2] = c.exactRgb[2];
    } else {
      fromOklab(c.L, c.la, c.lb, scratch, 0);
      palette[i * 4] = scratch[0];
      palette[i * 4 + 1] = scratch[1];
      palette[i * 4 + 2] = scratch[2];
    }
    const a = Math.round(c.a);
    palette[i * 4 + 3] = a < 0 ? 0 : a > 255 ? 255 : a;
  }

  // Score against the values that will actually be written to the PLTE chunk.
  const palLab = new Float32Array(n * 3);
  const palA = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    toOklab(palette[i * 4], palette[i * 4 + 1], palette[i * 4 + 2], palLab, i * 3);
    palA[i] = palette[i * 4 + 3];
  }

  // Assignment lookup. Scanning 256 palette entries per pixel is too slow, so
  // results are cached per colour bucket - which also means the OKLab
  // conversion happens once per bucket instead of once per pixel.
  let opaque = true;
  for (let i = 3; i < rgba.length; i += 4) {
    if (rgba[i] !== 255) {
      opaque = false;
      break;
    }
  }
  const CB = opaque ? 6 : 5;
  const AB = opaque ? 0 : 5;
  const lut = new Uint16Array((1 << AB) * (1 << (3 * CB))).fill(65535);
  const queryLab = new Float32Array(3);

  const nearest = (r, g, b, a) => {
    const key = (AB ? (a >> (8 - AB)) << (3 * CB) : 0)
      | ((r >> (8 - CB)) << (2 * CB))
      | ((g >> (8 - CB)) << CB)
      | (b >> (8 - CB));
    const hit = lut[key];
    if (hit !== 65535) return hit;

    toOklab(r, g, b, queryLab, 0);
    const qL = queryLab[0], qa = queryLab[1], qb = queryLab[2];
    const qAlpha = a * (1 / 255);
    let best = Infinity, bi = 0;
    for (let i = 0; i < n; i++) {
      const pa = palA[i] * (1 / 255);
      const dl = qL - palLab[i * 3];
      const da = qa - palLab[i * 3 + 1];
      const db = qb - palLab[i * 3 + 2];
      const dAlpha = qAlpha - pa;
      const d = qAlpha * pa * (dl * dl + da * da + db * db) + ALPHA_WEIGHT * dAlpha * dAlpha;
      if (d < best) {
        best = d;
        bi = i;
      }
    }
    lut[key] = bi;
    return bi;
  };

  const indices = new Uint8Array(width * height);

  if (!dither) {
    for (let i = 0, p = 0; i < indices.length; i++, p += 4) {
      indices[i] = nearest(rgba[p], rgba[p + 1], rgba[p + 2], rgba[p + 3]);
    }
    return { palette, indices, colors: n };
  }

  // --- Error diffusion, gated to where it can actually help ----------------
  // Dithering trades banding for fine grain. It is the only lever that makes a
  // 256-colour gradient look continuous, but it is never free, so it is turned
  // on per pixel by two tests rather than globally (see MIN_ERR below and the
  // FLAT_SPREAD test in the loop). Detail, edges and flat fills stay exact;
  // only smooth areas that the palette genuinely misses pick up grain.
  const FLAT_SPREAD = 12; // max luminance spread in a 5x5 window
  // Dithering a colour the palette already holds exactly is pure cost: it
  // turns a run that deflates to nothing into noise, for no visible gain.
  // It is also what keeps this feature affordable. Measured at MIN_ERR = 6,
  // the pass costs +3% on a UI screenshot, +8% on a photo, +13% on an image
  // with alpha, +15% on a flat graphic and +96% on a true gradient - and it is
  // the gradient, which is the only one of those that visibly bands, that
  // actually needs the grain. With no threshold at all the flat graphic paid
  // +306% for no visible change.
  const MIN_ERR = 6; // sum of |err| per channel below which we leave it alone
  const errR = new Float32Array(width + 2);
  const errG = new Float32Array(width + 2);
  const errB = new Float32Array(width + 2);
  const nextR = new Float32Array(width + 2);
  const nextG = new Float32Array(width + 2);
  const nextB = new Float32Array(width + 2);

  for (let y = 0; y < height; y++) {
    nextR.fill(0);
    nextG.fill(0);
    nextB.fill(0);
    for (let x = 0; x < width; x++) {
      const p = (y * width + x) * 4;
      const a = rgba[p + 3];

      let flat = true;
      let lo = 255;
      let hi = 0;
      for (let dy = -2; dy <= 2 && flat; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= height) continue;
        for (let dx = -2; dx <= 2; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= width) continue;
          const o = (yy * width + xx) * 4;
          const v = (rgba[o] + rgba[o + 1] + rgba[o + 2]) / 3;
          if (v < lo) lo = v;
          if (v > hi) hi = v;
          if (hi - lo > FLAT_SPREAD) {
            flat = false;
            break;
          }
        }
      }

      const r0 = rgba[p];
      const g0 = rgba[p + 1];
      const b0 = rgba[p + 2];
      let r = r0;
      let g = g0;
      let b = b0;
      if (flat) {
        // The rounding is load-bearing, not cosmetic. toOklab() feeds these
        // straight into a 256-entry lookup table, so a fractional value reads
        // back undefined and every candidate distance becomes NaN - no `d <
        // best` ever succeeds and the whole image collapses onto palette[0].
        r = Math.round(r0 + errR[x + 1]);
        g = Math.round(g0 + errG[x + 1]);
        b = Math.round(b0 + errB[x + 1]);
        if (r < 0) r = 0; else if (r > 255) r = 255;
        if (g < 0) g = 0; else if (g > 255) g = 255;
        if (b < 0) b = 0; else if (b > 255) b = 255;
      }

      const i = nearest(r, g, b, a);
      indices[y * width + x] = i;
      if (!flat) continue;

      const er = r - palette[i * 4];
      const eg = g - palette[i * 4 + 1];
      const eb = b - palette[i * 4 + 2];
      if (Math.abs(er) + Math.abs(eg) + Math.abs(eb) < MIN_ERR) continue;
      errR[x + 2] += (er * 7) / 16;
      errG[x + 2] += (eg * 7) / 16;
      errB[x + 2] += (eb * 7) / 16;
      nextR[x] += (er * 3) / 16;
      nextG[x] += (eg * 3) / 16;
      nextB[x] += (eb * 3) / 16;
      nextR[x + 1] += (er * 5) / 16;
      nextG[x + 1] += (eg * 5) / 16;
      nextB[x + 1] += (eb * 5) / 16;
      nextR[x + 2] += er / 16;
      nextG[x + 2] += eg / 16;
      nextB[x + 2] += eb / 16;
    }
    errR.set(nextR);
    errG.set(nextG);
    errB.set(nextB);
  }

  return { palette, indices, colors: n };
}
