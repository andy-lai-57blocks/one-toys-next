import { Metadata } from 'next';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { generateToolMetadata } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/about');

// Entity description for the site. There are no social profiles to list in
// `sameAs` yet, so the node carries the name, URL and contact point only —
// add `sameAs: [...]` once real profiles exist.
const aboutJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About One Toys',
  url: 'https://one-toys.com/about/',
  mainEntity: {
    '@type': 'Organization',
    name: 'One Toys',
    url: 'https://one-toys.com/',
    email: 'andy@57blocks.com',
    founder: {
      '@type': 'Person',
      name: 'Andy Lai',
    },
    description:
      'A collection of 27 free developer tools that run entirely in the browser.',
  },
};

export default function AboutPage() {
  return (
    <AppLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <article className="static-page">
        <div className="static-page-inner">
          <h1>About One Toys</h1>
          <p className="static-page-lead">
            One Toys is a set of 27 free developer utilities that run entirely inside
            your browser. No account, no upload, no server-side processing.
          </p>

          <h2>What is on the site</h2>
          <p>
            The site is organised into four categories. <strong>Code</strong>: JSON
            formatting and repair, Base64, URL encoding, HTML and XML escaping, Gzip,
            JWT decoding, UUID and password generation, VAST. <strong>Text</strong>:
            case conversion, character counting, whitespace removal, Lorem Ipsum,
            Markdown preview. <strong>DateTime</strong>: timestamps, timezones, date
            arithmetic, formatting and cron expressions. <strong>Media</strong>: image
            compression, OCR, QR codes and HLS playback.
          </p>

          <h2>Why the tools run in your browser</h2>
          <p>
            The tools people reach for most often are the ones handling data that
            should never leave a machine: production JWTs, internal JSON, API keys
            pasted by mistake, config files, screenshots of dashboards. Most online
            utilities solve that by uploading the input to a server, which is exactly
            the step you did not want.
          </p>
          <p>
            One Toys is a static site. There is no API, no database and no upload
            endpoint, so there is nowhere for your text or files to go. Decoding a
            JWT, repairing broken JSON, compressing an image and running OCR all
            happen in the tab, and closing the page discards them.
          </p>

          <h2>What the site does not do</h2>
          <ul>
            <li>No accounts and no sign-up.</li>
            <li>No saved history — reloading the page starts from empty.</li>
            <li>No usage limits, quotas or paywalled features.</li>
            <li>
              No collection or sale of what you enter, because nothing reaches a
              server to be collected.
            </li>
          </ul>

          <h2>How the tools are built</h2>
          <p>
            Where a reference implementation exists, the output is checked against it —
            image decoders were validated with independent tools rather than our own
            reader, and timestamp and timezone results are compared against the IANA
            database. Where a tool has a real limitation, the page says so instead of
            hiding it: the JSON Fixer completes truncated documents rather than
            guessing which fragment to keep, the OCR tool struggles with angled photos
            and handwriting, and every client-side tool is bounded by the memory of the
            browser you are using.
          </p>

          <h2>Who runs it</h2>
          <p>
            One Toys is built and maintained by Andy Lai. Questions, bug reports and
            removal requests go to{' '}
            <a href="mailto:andy@57blocks.com">andy@57blocks.com</a>, and the{' '}
            <Link href="/contact">contact page</Link> explains what to include.
          </p>
        </div>
      </article>
    </AppLayout>
  );
}
