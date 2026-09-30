// Cron expression parsing, description and next-run calculation.
//
// Runs entirely in the browser: no network calls, no dependencies. Time zone
// handling uses Intl and is DST-aware (see zonedTimeToUtc) because getting DST
// wrong silently schedules jobs at the wrong hour twice a year.

const FIELD_RANGES = {
  second: [0, 59],
  minute: [0, 59],
  hour: [0, 23],
  dayOfMonth: [1, 31],
  month: [1, 12],
  dayOfWeek: [0, 6]
};

const FIELD_LABELS = {
  second: 'second',
  minute: 'minute',
  hour: 'hour',
  dayOfMonth: 'day of month',
  month: 'month',
  dayOfWeek: 'day of week'
};

const MONTH_ALIASES = {
  JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6,
  JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12
};

const DOW_ALIASES = {
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6
};

const DOW_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
// Cron months are 1-12, so use an explicit map rather than an array index.
const MONTH_NAMES = {
  1: 'January',
  2: 'February',
  3: 'March',
  4: 'April',
  5: 'May',
  6: 'June',
  7: 'July',
  8: 'August',
  9: 'September',
  10: 'October',
  11: 'November',
  12: 'December'
};

export const PRESETS = [
  { label: 'Every minute', expression: '* * * * *' },
  { label: 'Every 5 minutes', expression: '*/5 * * * *' },
  { label: 'Every 15 minutes', expression: '*/15 * * * *' },
  { label: 'Every hour, on the hour', expression: '0 * * * *' },
  { label: 'Every 6 hours', expression: '0 */6 * * *' },
  { label: 'Daily at 00:00', expression: '0 0 * * *' },
  { label: 'Daily at 03:30', expression: '30 3 * * *' },
  { label: 'Weekdays at 09:00', expression: '0 9 * * 1-5' },
  { label: 'Every Monday at 09:00', expression: '0 9 * * 1' },
  { label: 'First day of month at 00:00', expression: '0 0 1 * *' },
  { label: 'Every 30 seconds (6-field)', expression: '*/30 * * * * *' }
];

function buildFieldSet(values) {
  const set = new Set(values);
  return set;
}

function expandField(rawToken, field, { names } = {}) {
  const [min, max] = FIELD_RANGES[field];
  const values = new Set();
  const parts = rawToken.split(',');

  for (const part of parts) {
    if (part === '') {
      throw { message: `empty value in "${FIELD_LABELS[field]}"`, hint: 'Remove the extra comma.' };
    }

    let body = part;
    let step = 1;
    const slashIndex = part.indexOf('/');
    if (slashIndex !== -1) {
      body = part.slice(0, slashIndex);
      const stepText = part.slice(slashIndex + 1);
      if (!/^\d+$/.test(stepText)) {
        throw {
          message: `"${stepText}" is not a valid step in "${FIELD_LABELS[field]}"`,
          hint: 'A step must be a whole number, for example */5.'
        };
      }
      step = parseInt(stepText, 10);
      if (step < 1) {
        throw { message: `step must be 1 or greater in "${FIELD_LABELS[field]}"` };
      }
    }

    let start;
    let end;

    if (body === '*' || body === '?') {
      start = min;
      end = max;
    } else if (body.includes('-')) {
      const [startPart, endPart] = body.split('-');
      start = resolveValue(startPart, field, names, min, max);
      end = resolveValue(endPart, field, names, min, max);
      if (start === null || end === null) {
        throw { message: `invalid range "${part}" in "${FIELD_LABELS[field]}"` };
      }
    } else {
      const single = resolveValue(body, field, names, min, max);
      if (single === null) {
        throw { message: `invalid value "${body}" in "${FIELD_LABELS[field]}"` };
      }
      if (slashIndex === -1) {
        values.add(single);
        continue;
      }
      // Quartz style "start/step" — start at `single`, step to the end of range.
      start = single;
      end = max;
    }

    if (start > end) {
      // Wrapping range such as 22-2 (hours) or FRI-MON.
      for (let v = start; v <= max; v += step) values.add(v);
      for (let v = min; v <= end; v += step) values.add(v);
    } else {
      for (let v = start; v <= end; v += step) values.add(v);
    }
  }

  return values;
}

function resolveValue(text, field, names, min, max) {
  if (text === undefined || text === '') return null;
  let value;
  if (/^\d+$/.test(text)) {
    value = parseInt(text, 10);
  } else if (names) {
    value = names[text.toUpperCase()];
    if (value === undefined) return null;
  } else {
    return null;
  }
  // 7 is a common alias for Sunday.
  if (field === 'dayOfWeek' && value === 7) value = 0;
  if (value < min || value > max) return null;
  return value;
}

/**
 * Parse a cron expression. Returns the expanded field sets plus any platform
 * notes and unsupported syntax found (PRD FR-B1..B6).
 */
export function parseCron(expression) {
  const raw = String(expression || '').trim().replace(/\s+/g, ' ');

  if (!raw) {
    return { ok: false, error: { message: 'Enter a cron expression.' }, notes: [], unsupported: [] };
  }

  const tokens = raw.split(' ');
  const unsupported = [];
  const notes = [];

  // Detect Quartz-only syntax that we deliberately do not pretend to support.
  const special = tokens.find((t) => /[LW#]/i.test(t) && !/^[A-Z]{3}(-[A-Z]{3})?$/i.test(t));
  if (special) {
    const hasHash = special.includes('#');
    const hasW = /W/i.test(special);
    const hasL = /L/i.test(special);
    return {
      ok: false,
      error: {
        message: `"${special}" uses Quartz-specific syntax that this tool does not evaluate.`,
        hint: 'See the supported-syntax table on this page for the exact limits and the portable alternatives.'
      },
      notes,
      unsupported: [
        hasL ? 'L (last day / last weekday of month)' : null,
        hasW ? 'W (nearest weekday)' : null,
        hasHash ? '# (nth weekday of month)' : null
      ].filter(Boolean)
    };
  }

  let fields;
  let hasSeconds = false;

  if (tokens.length === 5) {
    fields = ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];
    notes.push('Standard 5-field format: minute hour day-of-month month day-of-week.');
  } else if (tokens.length === 6) {
    fields = ['second', 'minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];
    hasSeconds = true;
    notes.push(
      'Six fields detected: the first field is seconds. AWS EventBridge and Quartz use this layout — plain crontab does not.'
    );
  } else if (tokens.length === 7) {
    return {
      ok: false,
      error: {
        message: 'Seven fields detected — this looks like Quartz with a trailing year field.',
        hint: 'Quartz adds a year field at the end. Remove the trailing year, or use a Quartz-aware tool.'
      },
      notes,
      unsupported: ['year field']
    };
  } else {
    return {
      ok: false,
      error: {
        message: `Expected 5 fields (or 6 with seconds), but found ${tokens.length}.`,
        hint: 'A standard expression is "minute hour day-of-month month day-of-week", for example 0 9 * * 1-5.'
      },
      notes,
      unsupported: []
    };
  }

  const parsed = {};
  for (let i = 0; i < fields.length; i += 1) {
    const field = fields[i];
    const token = tokens[i];
    try {
      parsed[field] = {
        raw: token,
        values: expandField(token, field, {
          names: field === 'month' ? MONTH_ALIASES : field === 'dayOfWeek' ? DOW_ALIASES : null
        }),
        wildcard: token === '*' || token === '?'
      };
    } catch (err) {
      return {
        ok: false,
        error: {
          field,
          message: `Invalid ${FIELD_LABELS[field]} field "${token}": ${err.message}`,
          hint: err.hint || `Allowed range for ${FIELD_LABELS[field]} is ${FIELD_RANGES[field][0]}-${FIELD_RANGES[field][1]}.`
        },
        notes,
        unsupported: []
      };
    }
  }

  return {
    ok: true,
    raw,
    hasSeconds,
    fields: parsed,
    notes,
    unsupported,
    error: null
  };
}

function listValues(set, names) {
  const values = [...set].sort((a, b) => a - b);
  if (names) {
    return values.map((v) => names[v]).join(', ');
  }
  return values.join(', ');
}

function pad(value) {
  return String(value).padStart(2, '0');
}

/** Human readable description of a parsed expression (PRD FR-B2). */
export function describeCron(parsed) {
  if (!parsed || !parsed.ok) return '';

  const { minute, hour, dayOfMonth, month, dayOfWeek } = parsed.fields;
  const parts = [];
  const minutes = [...minute.values].sort((a, b) => a - b);
  const hours = [...hour.values].sort((a, b) => a - b);

  const stepOf = (field) => {
    const match = field.raw.match(/^\*\/(\d+)$/);
    return match ? parseInt(match[1], 10) : null;
  };

  const minuteStep = stepOf(minute);
  const hourStep = stepOf(hour);

  if (minute.wildcard) {
    parts.push('Every minute');
  } else if (minuteStep) {
    parts.push(`Every ${minuteStep} minute${minuteStep > 1 ? 's' : ''}`);
  } else if (hours.length === 1 && minutes.length === 1) {
    parts.push(`At ${pad(hours[0])}:${pad(minutes[0])}`);
  } else if (hours.length > 1 && minutes.length === 1) {
    parts.push(`At minute ${pad(minutes[0])} past hours ${hours.map(pad).join(', ')}`);
  } else {
    parts.push(`At minutes ${minutes.map(pad).join(', ')}`);
  }

  if (!hour.wildcard && hours.length === 1 && minuteStep) {
    parts.push(`of hour ${pad(hours[0])}`);
  } else if (hourStep && !minute.wildcard && !minuteStep) {
    parts.push(`of every ${hourStep} hour${hourStep > 1 ? 's' : ''}`);
  } else if (!hour.wildcard && (hours.length > 1 || minuteStep)) {
    // already covered above for readability
  } else if (hour.wildcard && !minute.wildcard && !minuteStep) {
    parts.push('of every hour');
  }

  const dayDescriptions = [];
  if (!dayOfWeek.wildcard) {
    const dowValues = [...dayOfWeek.values].sort((a, b) => a - b);
    if (dowValues.length === 5 && dowValues.join(',') === '1,2,3,4,5') {
      dayDescriptions.push('on weekdays');
    } else if (dowValues.length === 2 && dowValues.join(',') === '0,6') {
      dayDescriptions.push('on weekends');
    } else {
      dayDescriptions.push(`on ${listValues(dayOfWeek.values, DOW_NAMES)}`);
    }
  }

  if (!dayOfMonth.wildcard) {
    const domValues = [...dayOfMonth.values].sort((a, b) => a - b);
    if (domValues.length === 1) {
      dayDescriptions.push(`on day ${domValues[0]} of the month`);
    } else {
      dayDescriptions.push(`on days ${domValues.join(', ')} of the month`);
    }
  }

  if (!month.wildcard) {
    dayDescriptions.push(`in ${listValues(month.values, MONTH_NAMES)}`);
  }

  if (dayDescriptions.length === 0) {
    dayDescriptions.push('every day');
  }

  return `${parts.join(' ')} ${dayDescriptions.join(', ')}`.replace(/\s+/g, ' ').trim();
}

/* --------------------------------------------------------------------------
 * Time zone helpers
 * ------------------------------------------------------------------------ */

function tzParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'short'
  });
  const parts = {};
  for (const { type, value } of formatter.formatToParts(date)) {
    if (type !== 'literal') parts[type] = value;
  }
  const weekdayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    year: parseInt(parts.year, 10),
    month: parseInt(parts.month, 10),
    day: parseInt(parts.day, 10),
    hour: parseInt(parts.hour, 10),
    minute: parseInt(parts.minute, 10),
    second: parseInt(parts.second, 10),
    weekday: weekdayMap[parts.weekday] ?? 0
  };
}

function tzOffsetMs(utcMs, timeZone) {
  const p = tzParts(new Date(utcMs), timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(utcMs / 1000) * 1000;
}

/**
 * Convert a wall-clock time in `timeZone` to every UTC instant that displays as
 * that clock time. Normally one; two on a fall-back transition (the clock reads
 * the same time twice); none on a spring-forward transition (that clock time
 * never happens). Getting this right is what makes the schedule DST-correct.
 */
export function zonedTimeToUtcCandidates(year, month, day, hour, minute, second, timeZone) {
  const guess = Date.UTC(year, month - 1, day, hour, minute, second);
  const offsets = new Set([
    tzOffsetMs(guess - 24 * 3600 * 1000, timeZone),
    tzOffsetMs(guess, timeZone),
    tzOffsetMs(guess + 24 * 3600 * 1000, timeZone)
  ]);

  const candidates = new Set();
  for (const offset of offsets) {
    const ts = guess - offset;
    const check = tzParts(new Date(ts), timeZone);
    if (
      check.year === year &&
      check.month === month &&
      check.day === day &&
      check.hour === hour &&
      check.minute === minute &&
      check.second === second
    ) {
      candidates.add(ts);
    }
  }
  return [...candidates].sort((a, b) => a - b);
}

/** Convenience wrapper: the first matching instant, or null when it never occurs. */
export function zonedTimeToUtc(year, month, day, hour, minute, second, timeZone) {
  const candidates = zonedTimeToUtcCandidates(year, month, day, hour, minute, second, timeZone);
  return candidates.length ? candidates[0] : null;
}

function matchesDay(parsed, parts) {
  const { dayOfMonth, month, dayOfWeek } = parsed.fields;

  if (!month.values.has(parts.month)) return false;

  const domRestricted = !dayOfMonth.wildcard;
  const dowRestricted = !dayOfWeek.wildcard;
  const domMatch = dayOfMonth.values.has(parts.day);
  const dowMatch = dayOfWeek.values.has(parts.weekday);

  // Vixie cron: when both day fields are restricted, either may match.
  if (domRestricted && dowRestricted) return domMatch || dowMatch;
  if (domRestricted) return domMatch;
  if (dowRestricted) return dowMatch;
  return true;
}

/**
 * Next `count` execution times after `from`, evaluated in `timeZone`
 * (PRD FR-B3, DST-correct).
 */
export function nextRuns(parsed, { timeZone = 'UTC', from = new Date(), count = 10 } = {}) {
  if (!parsed || !parsed.ok) return [];

  const { second, minute, hour } = parsed.fields;
  const seconds = [...(second ? second.values : [0])].sort((a, b) => a - b);
  const minutes = [...minute.values].sort((a, b) => a - b);
  const hours = [...hour.values].sort((a, b) => a - b);

  const results = [];
  const fromMs = from.getTime();
  const start = tzParts(from, timeZone);
  const MAX_DAYS = 366 * 8;

  for (let dayOffset = 0; dayOffset < MAX_DAYS && results.length < count; dayOffset += 1) {
    // Calendar arithmetic on the target zone's own date, then re-derive noon to
    // avoid DST shifting the date while iterating.
    const base = new Date(Date.UTC(start.year, start.month - 1, start.day + dayOffset, 12, 0, 0));
    const dayParts = tzParts(base, timeZone);

    if (!matchesDay(parsed, dayParts)) continue;

    for (const h of hours) {
      for (const m of minutes) {
        for (const s of seconds) {
          const candidates = zonedTimeToUtcCandidates(
            dayParts.year,
            dayParts.month,
            dayParts.day,
            h,
            m,
            s,
            timeZone
          );
          // Zero candidates means the clock time is skipped by a DST jump.
          // Two candidates means the clock time happens twice (fall back).
          for (const ts of candidates) {
            if (ts <= fromMs) continue;
            results.push(new Date(ts));
            if (results.length >= count) break;
          }
          if (results.length >= count) break;
        }
        if (results.length >= count) break;
      }
      if (results.length >= count) break;
    }
  }

  return results.sort((a, b) => a.getTime() - b.getTime());
}

export function formatInTimeZone(date, timeZone) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  }).format(date);
}

export function utcOffsetLabel(date, timeZone) {
  const offsetMs = tzOffsetMs(date.getTime(), timeZone);
  const totalMinutes = Math.round(offsetMs / 60000);
  const sign = totalMinutes < 0 ? '-' : '+';
  const abs = Math.abs(totalMinutes);
  return `UTC${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

export const COMMON_TIME_ZONES = [
  'UTC',
  'America/Los_Angeles',
  'America/New_York',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Moscow',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Australia/Sydney'
];

/**
 * Very small rule-based natural language -> cron converter (PRD FR-B7). This is
 * deliberately deterministic: no model, no guessing. It returns null when the
 * sentence is not recognised.
 */
export function naturalLanguageToCron(input) {
  const text = String(input || '').toLowerCase().trim().replace(/\s+/g, ' ');
  if (!text) return null;

  const parseTime = (hourText, minuteText, meridiem) => {
    let hour = parseInt(hourText, 10);
    const minute = minuteText ? parseInt(minuteText, 10) : 0;
    if (meridiem === 'pm' && hour !== 12) hour += 12;
    if (meridiem === 'am' && hour === 12) hour = 0;
    if (hour > 23 || minute > 59) return null;
    return { hour, minute };
  };

  // every N minutes
  let match = text.match(/every (\d+) minutes?/);
  if (match) return `*/${parseInt(match[1], 10)} * * * *`;

  if (/every minute/.test(text)) return '* * * * *';

  // every N hours
  match = text.match(/every (\d+) hours?/);
  if (match) return `0 */${parseInt(match[1], 10)} * * *`;

  if (/every hour/.test(text)) return '0 * * * *';

  // at HH[:MM] [am|pm], optionally with a day qualifier
  const timeMatch = text.match(/(?:at )?(\d{1,2})(?::(\d{2}))?\s?(am|pm)?/);
  const dayMatch = text.match(/(weekdays?|weekends?|mondays?|tuesdays?|wednesdays?|thursdays?|fridays?|saturdays?|sundays?|daily|every day)/);

  if (timeMatch && dayMatch) {
    const time = parseTime(timeMatch[1], timeMatch[2], timeMatch[3]);
    if (!time) return null;
    const day = dayMatch[1];
    const dowMap = {
      monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 0
    };
    let dow = '*';
    if (day.startsWith('weekday')) dow = '1-5';
    else if (day.startsWith('weekend')) dow = '0,6';
    else if (dowMap[day.replace(/s$/, '')] !== undefined) dow = String(dowMap[day.replace(/s$/, '')]);
    else if (day === 'daily' || day === 'every day') dow = '*';
    return `${time.minute} ${time.hour} * * ${dow}`;
  }

  // monthly on the Nth at HH[:MM]
  const monthly = text.match(/(?:on the )?(\d{1,2})(?:st|nd|rd|th)? of (?:the )?month(?: at (\d{1,2})(?::(\d{2}))?\s?(am|pm)?)?/);
  if (monthly) {
    const day = parseInt(monthly[1], 10);
    if (day < 1 || day > 31) return null;
    const time = monthly[2] ? parseTime(monthly[2], monthly[3], monthly[4]) : { hour: 0, minute: 0 };
    if (!time) return null;
    return `${time.minute} ${time.hour} ${day} * *`;
  }

  return null;
}
