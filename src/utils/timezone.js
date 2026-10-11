// Shared timezone maths for the datetime tools.
//
// Offsets are derived from Intl.DateTimeFormat, never from
// Date#getTimezoneOffset (which only reports the BROWSER's zone) and never from
// the `new Date(date.toLocaleString(...))` trick, which is wrong across a DST
// boundary. All offsets here are minutes east of UTC.
//
// Formatters are cached: these run per row per second on the timezone clock, and
// constructing a fresh Intl.DateTimeFormat each time costs real milliseconds.

const FORMAT_CACHE = new Map();

export function formatter(timeZone, options, locale = 'en-US') {
  const key = `${locale}|${timeZone}|${JSON.stringify(options)}`;
  let instance = FORMAT_CACHE.get(key);
  if (!instance) {
    instance = new Intl.DateTimeFormat(locale, { timeZone, ...options });
    FORMAT_CACHE.set(key, instance);
  }
  return instance;
}

export const OPT = {
  time24: { hour: '2-digit', minute: '2-digit', hour12: false },
  time12: { hour: 'numeric', minute: '2-digit', hour12: true },
  dateFull: { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' },
  hour: { hour: '2-digit', hour12: false },
  weekday: { weekday: 'short' },
  abbr: { timeZoneName: 'short' },
  ymd: { year: 'numeric', month: '2-digit', day: '2-digit' },
  ymdt: {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    // MUST be explicit. en-US defaults to h12, which returns the hour as "02"
    // for 2 PM plus a separate dayPeriod part - read without it, every offset
    // computed from these parts comes out 12 hours wrong.
    hour12: false
  }
};

export function partsOf(instant, timeZone, options) {
  const out = {};
  for (const part of formatter(timeZone, options).formatToParts(instant)) {
    out[part.type] = part.value;
  }
  return out;
}

/** Minutes east of UTC for `timeZone` at `instant`. */
export function zoneOffsetMinutes(instant, timeZone) {
  const p = partsOf(instant, timeZone, OPT.ymdt);
  const hour = p.hour === '24' ? '00' : p.hour; // some engines report 24 at midnight
  const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +hour, +p.minute);
  const base = Math.floor(instant.getTime() / 60000) * 60000;
  return Math.round((asUTC - base) / 60000);
}

/**
 * The instant at which a wall-clock reading occurs in `timeZone`. Two passes:
 * around a DST change the offset that applies is the one in effect at the
 * RESULT, not at the naive guess.
 */
export function wallToInstant(wall, timeZone) {
  const naiveUTC = Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute);
  const firstPass = zoneOffsetMinutes(new Date(naiveUTC), timeZone);
  let instant = naiveUTC - firstPass * 60000;
  const secondPass = zoneOffsetMinutes(new Date(instant), timeZone);
  if (secondPass !== firstPass) instant = naiveUTC - secondPass * 60000;
  return new Date(instant);
}

export const pad = (n) => String(n).padStart(2, '0');

/** Browser-local wall clock, i.e. a valid value for <input type="datetime-local">. */
export function wallInputValue(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Wall-clock reading of `instant` AS SEEN IN `timeZone`, as an input value. */
export function wallInputValueIn(instant, timeZone) {
  const p = partsOf(instant, timeZone, OPT.ymdt);
  return `${p.year}-${p.month}-${p.day}T${p.hour === '24' ? '00' : p.hour}:${p.minute}`;
}

export function parseWallInput(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value || '');
  if (!match) return null;
  return { year: +match[1], month: +match[2], day: +match[3], hour: +match[4], minute: +match[5] };
}

/** en-US renders midnight as 24:xx with hour12:false, so normalise it. */
export function time24(instant, timeZone) {
  return formatter(timeZone, OPT.time24).format(instant).replace(/^24/, '00');
}

/** "GMT+8" / "EDT" - computed for the displayed instant, so DST is always right. */
export function zoneName(instant, timeZone) {
  return partsOf(instant, timeZone, OPT.abbr).timeZoneName || '';
}

/** Parts of `instant` as read in `timeZone`, as numbers. */
export function numericParts(instant, timeZone) {
  const p = partsOf(instant, timeZone, { ...OPT.ymdt, second: '2-digit' });
  return {
    year: +p.year,
    month: +p.month,
    day: +p.day,
    hour: +p.hour % 24,
    minute: +p.minute,
    second: +p.second
  };
}
