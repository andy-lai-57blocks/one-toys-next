import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import JWTDecoder from '@/components/tools/code/JWTDecoder';
import { generateToolMetadata, generateToolJsonLd, generateFaqJsonLd } from '@/utils/pageGenerator';
import {
  ToolIntro,
  ToolExamples,
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
      'No. A JWT is Base64URL encoded, not encrypted. Anyone who holds the token can read the header and payload without any key — that is why this page can decode it offline. The only part that requires a key is the signature, which proves the token was issued by someone holding the signing key. Never place passwords, card numbers or other secrets inside a JWT payload: treat everything in it as public information.'
  },
  {
    question: 'Is it safe to paste a real token here?',
    answer:
      'The decoding and any signature verification happen entirely inside your browser using JavaScript and the Web Crypto API. There is no upload, no API call and no logging, so the token never reaches our server — you can confirm this yourself by opening your browser DevTools Network tab while using the tool and watching for outgoing requests. That said, a JWT is a live credential: if it is short-lived production token, prefer decoding a test token or one you are about to rotate anyway.'
  },
  {
    question: 'Why does the tool say my token is expired when my clock looks correct?',
    answer:
      'Expiry claims are Unix timestamps in seconds, measured against the verifier clock. If the issuer and your machine disagree by more than a few minutes, a token can look expired or not-yet-valid even though it was just issued. Check three things: that exp is in seconds rather than milliseconds, that your system clock is synchronised, and whether the nbf (not before) claim is in the future. Server-side clock skew is a very common cause of "invalid token" bugs.'
  },
  {
    question: 'What does alg=none mean and why is it flagged as high risk?',
    answer:
      'alg=none declares that the token is not signed at all — the signature segment is empty. If a server accepts such a token, anybody can forge one with any payload they like, including administrator roles. The safe rule is to reject unsigned tokens outright and to validate that the alg header matches exactly what your service expects. This tool warns whenever it sees alg=none, and an empty signature is a strong sign the token came from a broken or malicious issuer.'
  },
  {
    question: 'Can this tool verify RS256 or ES256 signatures?',
    answer:
      'Yes, if you paste the matching public key in PEM format. Public keys are safe to share — they can only verify signatures, never create them. Never paste a private key into any website, including this one: a private key would let an attacker issue valid tokens for your system. For HS256, HS384 and HS512 the token is verified with the shared secret instead.'
  },
  {
    question: 'What is the difference between exp, iat and nbf?',
    answer:
      'iat is when the token was issued, exp is when it stops being valid, and nbf is the earliest moment it may be accepted. iat and exp together define the lifetime of the token: a lifetime of days or weeks is risky because a leaked token cannot easily be revoked. nbf is mostly used for tokens prepared in advance. A healthy access token usually has a short lifetime of five to sixty minutes, with a separate refresh token handling renewal.'
  },
  {
    question: 'Why can I not read a token with five segments?',
    answer:
      'A five-segment token is a JWE — a JSON Web Encryption structure — rather than the usual three-segment JWS. Its payload is genuinely encrypted, so the claims cannot be read without the decryption key even in principle. That is exactly why JWE is used when the contents must stay confidential even from someone who intercepts the token. This tool tells you when it detects a JWE instead of pretending the decode failed.'
  },
  {
    question: 'Do you store or log the tokens people paste?',
    answer:
      'No. Because decoding happens in the browser, there is nothing to store on the server. The tool does not write your token to localStorage, cookies or the URL, and refreshing the page clears it. If you need proof for a security review, open DevTools, switch to the Network tab and use the tool: the only requests you should see are for the page assets themselves.'
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
    description: 'Pretty-print or minify a decoded payload before sharing it in a bug report'
  },
  {
    path: '/code/gzip',
    title: 'Gzip Compression',
    description: 'Inspect compressed payloads that often accompany token responses'
  },
  {
    path: '/code/password',
    title: 'Password Generator',
    description: 'Generate strong secrets for HS256 signing keys'
  },
  {
    path: '/code/url',
    title: 'URL Encoder/Decoder',
    description: 'Tokens are frequently passed as query parameters — decode them first'
  },
  {
    path: '/datetime/timestamp',
    title: 'Timestamp Converter',
    description: 'Convert exp, iat and nbf values into readable dates'
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

      <ToolPrivacyNotice>
        <p>
          Your token is decoded locally in this browser tab. It is never uploaded, never sent to an API
          and never written to a log — which matters, because a JWT is a live credential that often
          carries a user identity, their roles and their permissions.
        </p>
        <p>
          Optional signature verification uses the Web Crypto API, so any secret or public key you
          enter stays in this page&apos;s memory. Verify that claim yourself: open DevTools, select the
          Network tab, then paste a token — you will see no outgoing request.
        </p>
      </ToolPrivacyNotice>

      <ToolIntro title="Decode a JWT without handing it to anyone">
        <p>
          A JSON Web Token is three Base64URL segments joined by dots: a <strong>header</strong> that
          names the signing algorithm, a <strong>payload</strong> holding the claims, and a{' '}
          <strong>signature</strong> that lets the issuer prove the first two were not modified. Almost
          everything developers need to debug authentication problems lives in the first two segments,
          and neither of them requires a key to read.
        </p>
        <p>
          That last detail is the reason this tool exists. Most online decoders send your token to a
          server, but the token is exactly the thing an attacker wants: a bearer token is valid simply
          because someone holds it. Copying a production token into a third-party website hands over a
          working credential, complete with the user&apos;s identity and scopes. Decoding it locally
          removes that risk entirely.
        </p>
        <p>
          Paste a token above and you get the decoded header and payload, every claim explained in
          plain English, the expiry rendered in your own timezone, a list of security findings, and the
          option to verify the signature locally — with HS256, HS384, HS512, RS256 and ES256 supported.
          A leading <code>Bearer </code> prefix, line breaks from a copied log line and surrounding
          quotes are all tolerated, because that is how tokens actually arrive in practice.
        </p>
      </ToolIntro>

      <ToolIntro title="Base64URL is encoding, not encryption">
        <p>
          This is the single most common misconception about JWTs, and it has real security
          consequences. The payload is not scrambled: it is merely encoded with Base64URL, a
          URL-safe variant of Base64 that swaps <code>+</code> for <code>-</code>, <code>/</code> for{' '}
          <code>_</code> and drops the padding. Anyone holding the token can reverse that in one line
          of code — no key, no permission, no trace.
        </p>
        <p>
          Because the payload is readable by design, never store secrets there. A payload commonly
          exposes a user id, an email address, role names, scopes, an issuer and an audience. Treat all
          of it as public data that may end up in logs, browser history, screenshots and analytics
          dashboards. If the contents genuinely must stay confidential even from someone who intercepts
          the token, you need a JWE — a five-segment, encrypted structure — not a signed JWT.
        </p>
        <p>
          It is worth being precise about what a valid signature does and does not prove. It proves the
          token was issued by somebody holding the signing key and that the header and payload have not
          been altered since. It does not prove the token is still meant to be accepted by your service,
          and it does not make the contents secret.
        </p>
      </ToolIntro>

      <ToolIntro title="What to check before you trust a token">
        <p>
          Decoding is only half the job. When you are debugging an authentication failure, work through
          the same checks the server should be performing, in this order.
        </p>
        <p>
          <strong>1. Expiry.</strong> Confirm <code>exp</code> exists and is in the future, and that{' '}
          <code>iat</code> is not in the future either. A missing <code>exp</code> means the token never
          expires — a stolen copy stays valid forever.
        </p>
        <p>
          <strong>2. Algorithm.</strong> The <code>alg</code> header must match exactly what your
          service expects. Be suspicious of <code>none</code>, of unexpected algorithm families, and of
          a token whose header was swapped while the payload stayed the same.
        </p>
        <p>
          <strong>3. Issuer and audience.</strong> <code>iss</code> should identify the system that
          issued the token and <code>aud</code> should contain your service. Tokens minted for one
          service must not be accepted by another: that is the confused-deputy problem in practice.
        </p>
        <p>
          <strong>4. Scopes and roles.</strong> Check that the permissions in the token are the minimum
          the operation needs. A token carrying administrative scopes where read-only access would do
          turns any leak into a much larger incident.
        </p>
        <p>
          <strong>5. Lifetime and revocation.</strong> Short lifetimes limit the damage of a leak.
          Where tokens are long-lived, look for a <code>jti</code> claim — without a unique token id
          there is no practical way to blacklist a single token after a logout or a breach.
        </p>
        <p>
          The security findings above the decoded output automate these checks, so you can see at a
          glance whether the token you are holding would pass a careful review.
        </p>
      </ToolIntro>

      <ToolExamples
        title="Decoding in practice"
        items={[
          {
            title: 'A healthy access token',
            description:
              'The header names the algorithm and the payload carries identity, issuer, audience and a short lifetime.',
            input: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEwMjQiLCJleHAiOjIwNTAwMDAwMDB9...',
            output:
              'Header:\n{\n  "alg": "HS256",\n  "typ": "JWT"\n}\n\nPayload:\n{\n  "sub": "user_1024",\n  "iss": "https://auth.example.com",\n  "aud": "api.example.com",\n  "scope": "read:tools",\n  "iat": 1760000000,\n  "exp": 2050000000\n}',
            note: 'No high-risk findings: exp is present, the algorithm is explicit and the lifetime is bounded.'
          },
          {
            title: 'An expired token',
            description: 'A token whose exp is already in the past is reported as a high-risk finding.',
            input: '{"sub":"user_1024","iat":1759900000,"exp":1759903600}',
            output:
              'High risk — Token is expired\nExpired 2 hour(s) ago (local time shown in the table)\n\nexp  →  in the past',
            note: 'If the issuer clock is correct, the user simply needs a new token — or a refresh flow.'
          },
          {
            title: 'An unsigned token (alg=none)',
            description: 'The signature segment is empty and the header declares no algorithm.',
            input: '{"alg":"none","typ":"JWT"}.{"sub":"admin","role":"admin"}.',
            output:
              'High risk — alg = "none" — token is not signed\nAnyone can modify the payload of this token. A server that accepts it is vulnerable to forgery.',
            note: 'This is a forgery attempt or a badly misconfigured issuer. Reject it.'
          },
          {
            title: 'A five-segment JWE',
            description: 'Encrypted tokens cannot be decoded at all without the decryption key.',
            input: 'eyJhbGciOiJSU0EtT0FFUCJ9...ZW5jcnlwdGVk...aXY...Y2lwaGVydGV4dA...dGFn',
            output:
              'This looks like a JWE (encrypted JWT) — it has 5 segments.\nA JWE payload is encrypted, so the header and claims cannot be read without the decryption key.',
            note: 'Not an error in your token: encrypted payloads are unreadable by design.'
          }
        ]}
      />

      <ToolFaq items={faqItems} />

      <ToolLimits
        items={[
          'It does not decrypt JWE (five-segment, encrypted) tokens — that is impossible without the key.',
          'It does not fetch your issuer’s live JWKS endpoint, because the tool makes no network requests at all. Paste the public key manually if you need to verify RS256 or ES256.',
          'It does not validate that a token is accepted by your service: signature and claims can be perfectly valid while the token is revoked or scoped for a different audience.',
          'It does not keep a history of decoded tokens, in memory or anywhere else.',
          'It never supports creating or forging tokens, including alg=none — that would only help attackers.'
        ]}
      />

      <ToolRelated items={relatedTools} />
    </AppLayout>
  );
}
