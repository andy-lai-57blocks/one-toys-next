import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import JWTDecoder from '@/components/tools/code/JWTDecoder';
import { generateToolMetadata, generateToolJsonLd, generateFaqJsonLd } from '@/utils/pageGenerator';
import {
  ToolIntro,
  ToolFaq,
  ToolPrivacyNotice,
  ToolLimits,
  ToolRelated
} from '@/components/shared/ToolContent';

export const metadata: Metadata = generateToolMetadata('/code/jwt-decoder');

const faqItems = [
  {
    question: 'Is a JWT encrypted?',
    answer:
      'No. A JWT is Base64URL encoded, not encrypted, so anyone holding the token can read the header and payload without a key — which is exactly why this page can decode it offline. Never put passwords or card numbers inside a payload: treat everything in it as public. If the contents really must stay confidential even from someone who intercepts them, you need a JWE (an encrypted, five-segment token) rather than a signed JWT.'
  },
  {
    question: 'Is it safe to paste a real token here?',
    answer:
      'Decoding and verification happen entirely in your browser using JavaScript and the Web Crypto API. Nothing is uploaded, no API is called and nothing is logged, so the token never reaches our server — open DevTools, switch to the Network tab and paste a token to confirm that for yourself. That said, a JWT is a live credential: prefer a test token, or one you are about to rotate.'
  },
  {
    question: 'Why does the tool say my token is expired when my clock looks correct?',
    answer:
      'Expiry is a Unix timestamp in seconds compared against the verifier clock. If the issuer and your machine disagree by more than a few minutes, a fresh token can look expired or not-yet-valid. Check that exp is in seconds rather than milliseconds, that your system clock is synchronised, and whether the nbf claim is still in the future. Server-side clock skew is one of the most common causes of "invalid token" bugs.'
  },
  {
    question: 'What does alg=none mean and why is it flagged as high risk?',
    answer:
      'alg=none declares that the token is not signed at all and leaves the signature segment empty. If a server accepts such a token, anyone can forge one with any payload they like, including administrator roles. The safe rule is to reject unsigned tokens outright and to verify that the alg header matches exactly what your service expects. This tool warns whenever it sees alg=none.'
  },
  {
    question: 'Can this tool verify RS256 or ES256 signatures?',
    answer:
      'Verification is currently implemented locally for HS256, HS384 and HS512 using the shared secret. For asymmetric algorithms you would need to paste the matching public key, which this version does not accept yet; it reports that clearly rather than pretending the signature was checked. Never paste a private key into any website — a private key would let an attacker issue valid tokens for your system.'
  },
  {
    question: 'Do you store or log the tokens people paste?',
    answer:
      'No. Because decoding happens in the browser there is nothing to store server-side, and the token is not written to localStorage, cookies or the URL. Reloading the page clears it. For a security review you can verify the claim by watching the Network tab while using the tool: the only requests are for the page assets themselves.'
  }
];

const relatedTools = [
  {
    path: '/code/base64',
    title: 'Base64 Encoder/Decoder',
    description: 'JWT segments are Base64URL — decode them by hand to see the raw structure'
  },
  {
    path: '/code/json',
    title: 'JSON Formatter & Validator',
    description: 'Pretty-print a decoded payload before pasting it into a bug report'
  },
  {
    path: '/datetime/timestamp',
    title: 'Timestamp Converter',
    description: 'Convert exp, iat and nbf values into readable dates'
  },
  {
    path: '/code/password',
    title: 'Password Generator',
    description: 'Generate a strong secret for HS256 signing keys'
  },
  {
    path: '/code/url',
    title: 'URL Encoder/Decoder',
    description: 'Tokens are often passed as query parameters — decode them first'
  },
  {
    path: '/datetime/cron-parser',
    title: 'Cron Expression Parser',
    description: 'Decode the tokens your scheduled jobs receive when they call an API'
  }
];

export default function JwtDecoderPage() {
  const jsonLd = generateToolJsonLd('/code/jwt-decoder');
  const faqJsonLd = generateFaqJsonLd(faqItems);

  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <JWTDecoder />

      <div className="tool-page-content">
        <ToolPrivacyNotice>
        <p>
          Decoding is local: the token is never uploaded, never sent to an API and never logged. That
          matters because a JWT is a live credential carrying an identity, its roles and its permissions.
        </p>
      </ToolPrivacyNotice>

      <ToolIntro title="Decode a JWT without handing it to anyone">
        <p>
          A JSON Web Token is three Base64URL segments joined by dots: a <strong>header</strong> naming
          the signing algorithm, a <strong>payload</strong> holding the claims, and a{' '}
          <strong>signature</strong>. Reading the first two needs no key at all, which is why decoding is
          instant and why the tool above can do it offline.
        </p>
        <p>
          The reason to decode locally is that a bearer token is valid simply because someone holds it.
          Copying a production token into a third-party website hands over a working credential — the
          user identity, the scopes and everything needed to impersonate them until it expires.
        </p>
        <p>
          Paste a token above and you get the payload as JSON, the algorithm, the expiry in your own
          timezone, a list of security findings, and the option to verify an HS256 signature locally. A
          leading <code>Bearer </code> prefix, quotes and line breaks from a copied log line are all
          tolerated, because that is how tokens actually arrive.
        </p>
      </ToolIntro>

      <ToolIntro title="Base64URL is encoding, not encryption">
        <p>
          The payload is not scrambled — it is merely encoded with Base64URL, a URL-safe variant of
          Base64 that swaps <code>+</code> for <code>-</code>, <code>/</code> for <code>_</code> and
          drops the padding. Anyone holding the token can reverse that in one line of code.
        </p>
        <p>
          Because the payload is readable by design, it commonly exposes a user id, an email address,
          role names and scopes. Treat all of it as public data that will end up in logs, screenshots and
          browser history. A valid signature proves the token was issued by whoever holds the signing key
          and has not been altered since — it does not make the contents secret, and it does not mean
          your service should still accept the token.
        </p>
      </ToolIntro>

      <ToolIntro title="Claims you will see most often">
        <ul>
          <li>
            <code>sub</code> — the subject, usually a user id.
          </li>
          <li>
            <code>iss</code> / <code>aud</code> — who issued the token, and which service it is meant for.
            A token minted for one service must not be accepted by another.
          </li>
          <li>
            <code>exp</code> / <code>iat</code> / <code>nbf</code> — when it expires, when it was issued,
            and the earliest moment it may be accepted.
          </li>
          <li>
            <code>scope</code> / <code>roles</code> — what the holder is allowed to do. Check for least
            privilege.
          </li>
          <li>
            <code>jti</code> — a unique token id. Without one there is no practical way to revoke a single
            token after a logout or a breach.
          </li>
        </ul>
      </ToolIntro>

      <ToolFaq items={faqItems} />

      <ToolLimits
        items={[
          'It does not decrypt JWE (five-segment, encrypted) tokens — that is impossible without the key, and the tool says so instead of failing silently.',
          'It does not fetch your issuer’s JWKS endpoint, because the page makes no network requests at all.',
          'It does not confirm that your service still accepts the token: signature and claims can be valid while the token is revoked or scoped for a different audience.',
          'It never creates or forges tokens, including alg=none — that would only help attackers.'
        ]}
      />

        <ToolRelated items={relatedTools} />
      </div>
    </AppLayout>
  );
}
