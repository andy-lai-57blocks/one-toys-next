import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import { generateToolMetadata } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/privacy');

export default function PrivacyPage() {
  return (
    <AppLayout>
      <article className="static-page">
        <div className="static-page-inner">
          <h1>Privacy Policy</h1>
          <p className="static-page-lead">
            Every tool on One Toys runs inside your browser. Nothing you type, paste or
            upload is sent to us, because there is no server to send it to.
          </p>

          <h2>What stays on your device</h2>
          <ul>
            <li>Text typed or pasted into any tool — JSON, JWTs, Base64, URLs, passwords.</li>
            <li>Files opened in the image compressor, the OCR tool or the QR generator.</li>
            <li>Generated passwords, UUIDs, images and QR codes.</li>
          </ul>
          <p>
            These are processed in the browser tab and never transmitted. Reloading or
            closing the page discards them, and there is no history to recover.
          </p>

          <h2>What does leave your device</h2>
          <p>Only what is needed to load the page and show the ads:</p>
          <ul>
            <li>
              <strong>Vercel</strong> (hosting) receives the request for a page — IP
              address, user agent, requested URL — and keeps short-lived access logs,
              as any web host does.
            </li>
            <li>
              <strong>Google AdSense</strong> serves the ads on tool pages and may set
              cookies or use identifiers to select and measure them.
            </li>
            <li>
              <strong>jsDelivr</strong> (CDN) is where the OCR tool downloads its
              language model from on first use — 5 to 8 MB, cached by the browser
              afterwards. The request contains no image and no text from you.
            </li>
            <li>
              <strong>The HLS player</strong> connects directly to the stream URL you
              enter, so that server sees your IP address. It is a connection between
              your browser and that host, not through us.
            </li>
            <li>
              <strong>Links you follow</strong> lead to other sites, and their privacy
              policies apply from that point.
            </li>
          </ul>

          <h2>Analytics</h2>
          <p>
            Page views are counted with Vercel Analytics, which reports aggregate
            numbers and referrers. It does not use cookies and does not build a profile
            of you across sites.
          </p>

          <h2>Cookies and local storage</h2>
          <p>
            One Toys sets no cookies of its own. Google AdSense may set advertising
            cookies. The only thing stored locally by the site is your theme
            preference, kept in <code>localStorage</code> under the key{' '}
            <code>one-toys-theme</code>.
          </p>

          <h2>Advertising</h2>
          <p>
            Ads are served by Google. You can review or turn off personalised
            advertising at{' '}
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Ad Settings
            </a>
            .
          </p>

          <h2>Children</h2>
          <p>
            One Toys is a developer tool site and is not directed at children under 13.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            If this policy changes, the date below changes with it. Substantive changes
            will be described on this page rather than made silently.
          </p>
          <p className="static-page-updated">Last updated: 31 October 2026</p>

          <h2>Contact</h2>
          <p>
            Questions about this policy: <a href="mailto:andy@57blocks.com">andy@57blocks.com</a>.
          </p>
        </div>
      </article>
    </AppLayout>
  );
}
