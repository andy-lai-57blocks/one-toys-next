import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import JWTDecoder from '@/components/tools/code/JWTDecoder';
import { generateToolMetadata, generateToolJsonLd, generateFaqJsonLd } from '@/utils/pageGenerator';
import {
  ToolFaq,
  ToolPrivacyNotice,
  ToolRelated
} from '@/components/shared/ToolContent';

export const metadata: Metadata = generateToolMetadata('/code/jwt-decoder');

const faqItems = [
  {
    question: 'Is a JWT encrypted?',
    answer:
      'No. It is Base64URL encoded, not encrypted, so anyone holding the token can read the header and payload without a key — which is why this page can decode it offline. Never put passwords or card numbers in a payload: treat everything in it as public.'
  },
  {
    question: 'Is it safe to paste a real token here?',
    answer:
      'Yes. Decoding and verification run in your browser only — nothing is uploaded, no API is called and nothing is logged, which you can confirm in the Network tab. A JWT is still a live credential, so prefer a test token or one you are about to rotate.'
  },
  {
    question: 'Why does it say my token is expired?',
    answer:
      'exp is a Unix timestamp in seconds compared against your machine’s clock. A few minutes of clock skew, or an nbf that is still in the future, is enough to make a fresh token look invalid. Check that exp is in seconds, not milliseconds.'
  },
  {
    question: 'What does alg=none mean?',
    answer:
      'It declares that the token is not signed at all and leaves the signature segment empty. A server that accepts it lets anyone forge a token with any payload, so unsigned tokens should be rejected outright. This tool flags every one it sees.'
  },
  {
    question: 'Can it verify RS256 or ES256 signatures?',
    answer:
      'Only HS256, HS384 and HS512 can be verified here, using the shared secret. Asymmetric algorithms would need your public key, which this version does not accept — it says so rather than pretending the signature was checked. Never paste a private key into a website.'
  },
  {
    question: 'Do you store or log the tokens people paste?',
    answer:
      'No. Nothing is sent to a server, and the token is not saved to localStorage, cookies or the URL. Reloading the page clears it.'
  }
];

const relatedTools = [
  {
    path: '/code/base64',
    title: 'Base64 Encoder/Decoder',
    description: 'Decode JWT segments by hand'
  },
  {
    path: '/datetime/timestamp',
    title: 'Timestamp Converter',
    description: 'Read exp, iat and nbf as dates'
  },
  {
    path: '/code/json',
    title: 'JSON Formatter',
    description: 'Pretty-print a decoded payload'
  },
  {
    path: '/code/password',
    title: 'Password Generator',
    description: 'Generate a strong HS256 secret'
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
            Decoding and signature checks run entirely in this browser tab — the token is never uploaded,
            sent to an API or logged. A JWT is a live credential, so prefer a test token.
          </p>
        </ToolPrivacyNotice>

        <ToolFaq items={faqItems} />

        <ToolRelated items={relatedTools} />
      </div>
    </AppLayout>
  );
}
