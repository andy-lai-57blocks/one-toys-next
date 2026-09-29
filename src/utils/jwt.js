// JWT parsing, security alerting and optional local verification.
//
// Privacy contract (PRD 6, NFR): this module is 100% local. It performs no
// network I/O. Secrets and tokens never leave the browser.

export const ALERT_HIGH = 'high';
export const ALERT_WARNING = 'warning';
export const ALERT_INFO = 'info';

// Human readable explanations for standard claims.
export const CLAIM_DESCRIPTIONS = {
  iss: 'Issuer — who created and signed this token',
  sub: 'Subject — whom the token refers to (usually a user id)',
  aud: 'Audience — who the token is intended for',
  exp: 'Expiration time — after this the token must be rejected',
  nbf: 'Not before — the token must not be accepted before this time',
  iat: 'Issued at — when the token was created',
  jti: 'JWT ID — unique identifier, used to prevent replay / enable revocation',
  scope: 'Scope — the permissions this token grants',
  scp: 'Scope — the permissions this token grants',
  azp: 'Authorized party — the client the token was issued to',
  sid: 'Session ID',
  client_id: 'Client identifier',
  email: 'User email',
  roles: 'Roles granted to the subject',
  nonce: 'Nonce — replay protection value',
  auth_time: 'Authentication time — when the user actually logged in',
  acr: 'Authentication Context Class Reference',
  amr: 'Authentication Methods References'
};

const HMAC_ALGS = {
  HS256: 'SHA-256',
  HS384: 'SHA-384',
  HS512: 'SHA-512'
};

const RSA_ALGS = { RS256: 'RSASSA-PKCS1-v1_5' };
const ECDSA_ALGS = { ES256: 'ECDSA' };

function base64ToBytes(input) {
  const binary = atob(input);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decode a base64url segment with tolerance for padding, whitespace and
 * URL-safe characters (PRD FR-A9).
 */
export function base64UrlDecodeToString(segment) {
  const cleaned = String(segment).replace(/[\s\r\n]/g, '').replace(/-/g, '+').replace(/_/g, '/');
  if (!cleaned) return '';
  // Reject characters that are not valid base64 — a corrupt segment should
  // produce a clear error rather than garbage output.
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned)) {
    throw new Error('Segment contains characters that are not valid Base64URL');
  }
  const padded = cleaned + '='.repeat((4 - (cleaned.length % 4)) % 4);
  const bytes = base64ToBytes(padded);
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
}

function tryParseJson(text) {
  try {
    return { value: JSON.parse(text), error: null };
  } catch (err) {
    return { value: null, error: err.message };
  }
}

/** Normalise whatever the user pasted into a bare token string. */
export function normaliseToken(input) {
  let token = String(input || '').trim();
  token = token.replace(/^authorization\s*:\s*/i, '');
  token = token.replace(/^bearer\s+/i, '');
  token = token.replace(/^["'`]+|["'`]+$/g, '');
  token = token.replace(/\s+/g, '');
  return token;
}

function formatRelative(ms) {
  const abs = Math.abs(ms);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  let text;
  if (abs < minute) text = 'less than a minute';
  else if (abs < hour) text = `${Math.round(abs / minute)} minute(s)`;
  else if (abs < day) text = `${Math.round(abs / hour)} hour(s)`;
  else text = `${Math.round(abs / day)} day(s)`;
  return ms < 0 ? `${text} ago` : `in ${text}`;
}

/**
 * Describe an epoch-seconds timestamp in local time plus a status relative to
 * "now" (PRD FR-A3).
 */
export function describeTime(epochSeconds, now = Date.now()) {
  const date = new Date(epochSeconds * 1000);
  const diff = date.getTime() - now;
  return {
    iso: date.toISOString(),
    local: date.toLocaleString(),
    relative: formatRelative(diff),
    isPast: diff < 0
  };
}

function buildAlerts(header, payload, now) {
  const alerts = [];

  if (header && typeof header.alg === 'string' && header.alg.toLowerCase() === 'none') {
    alerts.push({
      id: 'alg-none',
      level: ALERT_HIGH,
      title: 'alg = "none" — token is not signed',
      detail:
        'Anyone can modify the payload of this token. A server that accepts it is vulnerable to forgery. Reject unsigned tokens unless you have an extremely specific reason.'
    });
  }

  if (!payload) return alerts;

  const hasExp = Object.prototype.hasOwnProperty.call(payload, 'exp');
  if (!hasExp) {
    alerts.push({
      id: 'no-exp',
      level: ALERT_WARNING,
      title: 'No "exp" claim — token never expires',
      detail:
        'A stolen token stays valid forever. Add an expiration (typically 5–60 minutes for access tokens).'
    });
  } else if (typeof payload.exp === 'number') {
    const exp = describeTime(payload.exp, now);
    if (exp.isPast) {
      alerts.push({
        id: 'expired',
        level: ALERT_HIGH,
        title: 'Token is expired',
        detail: `Expired ${exp.relative.replace(' ago', '')} ago (${exp.local}).`
      });
    } else if (payload.exp * 1000 - now < 24 * 60 * 60 * 1000) {
      alerts.push({
        id: 'expiring-soon',
        level: ALERT_WARNING,
        title: 'Token expires within 24 hours',
        detail: `Expires ${exp.relative} (${exp.local}).`
      });
    }
  }

  if (typeof payload.iat === 'number' && payload.iat * 1000 - now > 60 * 1000) {
    alerts.push({
      id: 'iat-future',
      level: ALERT_WARNING,
      title: '"iat" is in the future',
      detail:
        'The issued-at time is ahead of now. This usually means clock skew between issuer and verifier — or a hand-crafted token.'
    });
  }

  if (typeof payload.exp === 'number' && typeof payload.iat === 'number') {
    const lifetimeDays = (payload.exp - payload.iat) / 86400;
    if (lifetimeDays > 30) {
      alerts.push({
        id: 'long-lived',
        level: ALERT_WARNING,
        title: 'Unusually long lifetime',
        detail: `Valid for about ${Math.round(lifetimeDays)} days. Long-lived tokens cannot be revoked easily. Prefer short-lived access tokens plus refresh tokens.`
      });
    }
  }

  if (!Object.prototype.hasOwnProperty.call(payload, 'jti')) {
    alerts.push({
      id: 'no-jti',
      level: ALERT_INFO,
      title: 'No "jti" claim',
      detail:
        'Without a unique token id you cannot revoke or blacklist an individual token — useful for logout and incident response.'
    });
  }

  return alerts;
}

/**
 * Parse a token and produce header/payload, human readable times, claim
 * annotations and security alerts.
 */
export function parseJwt(input, now = Date.now()) {
  const token = normaliseToken(input);

  const empty = {
    ok: false,
    kind: 'empty',
    token,
    parts: [],
    header: null,
    payload: null,
    signature: '',
    headerJson: '',
    payloadJson: '',
    alerts: [],
    times: [],
    error: null,
    hint: null
  };

  if (!token) return empty;

  const parts = token.split('.');
  const base = { ...empty, ok: true, token, parts };

  if (parts.length === 5) {
    // JWE — encrypted, cannot be read without the key (PRD FR-A6)
    return {
      ...base,
      ok: false,
      kind: 'jwe',
      error: 'This looks like a JWE (encrypted JWT) — it has 5 segments.',
      hint:
        'A JWE payload is encrypted, so the header and claims cannot be read without the decryption key. This tool only decodes signed (JWS) tokens.'
    };
  }

  if (parts.length === 2) {
    return {
      ...base,
      ok: false,
      kind: 'invalid',
      error: 'Only 2 segments found — the signature is missing.',
      hint:
        'A signed JWT has 3 segments: header.payload.signature. If you copied this from a log, the trailing part may have been truncated.'
    };
  }

  if (parts.length !== 3) {
    return {
      ...base,
      ok: false,
      kind: 'invalid',
      error: `Expected 3 segments separated by dots, found ${parts.length}.`,
      hint: 'Make sure you copied the whole token, including both dots.'
    };
  }

  let header;
  let payload;
  try {
    header = JSON.parse(base64UrlDecodeToString(parts[0]));
  } catch (err) {
    return {
      ...base,
      ok: false,
      kind: 'invalid',
      error: `Could not read the header: ${err.message}`,
      hint: 'The header segment is not valid Base64URL JSON. The token may be corrupted or truncated.'
    };
  }

  let payloadError = null;
  try {
    payload = JSON.parse(base64UrlDecodeToString(parts[1]));
  } catch (err) {
    payloadError = err.message;
    payload = null;
  }

  const times = [];
  if (payload && typeof payload === 'object') {
    const timeClaims = [
      ['exp', 'Expires at'],
      ['iat', 'Issued at'],
      ['nbf', 'Not before'],
      ['auth_time', 'Authenticated at']
    ];
    for (const [key, label] of timeClaims) {
      const value = payload[key];
      if (typeof value === 'number') {
        const described = describeTime(value, now);
        times.push({ key, label, ...described });
      }
    }
  }

  return {
    ...base,
    ok: true,
    kind: 'jwt',
    header,
    payload,
    payloadJson: payload ? JSON.stringify(payload, null, 2) : '',
    headerJson: JSON.stringify(header, null, 2),
    signature: parts[2],
    alerts: buildAlerts(header, payload, now),
    times,
    error: payloadError
      ? `The payload is not valid JSON: ${payloadError}`
      : null,
    hint: payloadError
      ? 'The header decoded fine, so the token structure is correct — the payload itself is malformed.'
      : null
  };
}

function pemToArrayBuffer(pem) {
  const body = pem
    .replace(/-----BEGIN [^-]+-----/g, '')
    .replace(/-----END [^-]+-----/g, '')
    .replace(/[\s\r\n]/g, '');
  return base64ToBytes(body).buffer;
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Verify the signature locally (PRD FR-A8). Everything happens in-browser:
 * the secret or public key is never transmitted.
 */
export async function verifySignature({ parts, header, secret, publicKeyPem }) {
  if (!parts || parts.length !== 3) {
    return { status: 'error', message: 'Nothing to verify.' };
  }
  const alg = header && header.alg;
  const signingInput = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
  const signature = base64ToBytes(parts[2].replace(/-/g, '+').replace(/_/g, '/'));

  try {
    if (HMAC_ALGS[alg]) {
      if (!secret) {
        return { status: 'error', message: 'Enter the secret used to sign this token.' };
      }
      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: HMAC_ALGS[alg] },
        false,
        ['sign']
      );
      const expected = new Uint8Array(await crypto.subtle.sign('HMAC', key, signingInput));
      const actual = signature;
      if (expected.length !== actual.length) {
        return { status: 'invalid', message: 'Signature does not match.' };
      }
      // Re-encode to latin1 strings for a constant-time comparison.
      const expectedStr = String.fromCharCode(...expected);
      const actualStr = String.fromCharCode(...actual);
      const match = timingSafeEqual(expectedStr, actualStr);
      const weak = secret.length < 32;
      return {
        status: match ? 'valid' : 'invalid',
        message: match
          ? weak
            ? `Signature is valid, but this secret is only ${secret.length} characters. HS256 secrets should be at least 32 random bytes.`
            : 'Signature is valid.'
          : 'Signature does not match — the token was modified, or the secret is wrong.',
        weakSecret: match && weak
      };
    }

    if (RSA_ALGS[alg] || ECDSA_ALGS[alg]) {
      if (!publicKeyPem) {
        return { status: 'error', message: 'Paste the PEM public key to verify this token.' };
      }
      const keyData = pemToArrayBuffer(publicKeyPem);
      const algorithm =
        alg === 'ES256'
          ? { name: 'ECDSA', namedCurve: 'P-256' }
          : { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' };
      const key = await crypto.subtle.importKey('spki', keyData, algorithm, false, ['verify']);
      const ok = await crypto.subtle.verify(
        algorithm,
        key,
        signature,
        signingInput
      );
      return {
        status: ok ? 'valid' : 'invalid',
        message: ok ? 'Signature is valid.' : 'Signature does not match the supplied public key.'
      };
    }

    return {
      status: 'unsupported',
      message: `Local verification is not implemented for ${alg || 'this algorithm'}. Supported: HS256, HS384, HS512, RS256, ES256.`
    };
  } catch (err) {
    return { status: 'error', message: `Verification failed: ${err.message}` };
  }
}
