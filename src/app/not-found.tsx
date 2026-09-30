import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';

// Rendered to out/404.html at build time. Vercel serves this for unmatched
// routes (see the `routes` block in vercel.json) so that unknown URLs answer
// with a real 404 status instead of the homepage.
const POPULAR_TOOLS = [
  { path: '/code/json', title: 'JSON Formatter' },
  { path: '/code/jwt-decoder', title: 'JWT Decoder' },
  { path: '/code/base64', title: 'Base64 Encoder/Decoder' },
  { path: '/datetime/cron-parser', title: 'Cron Expression Parser' },
  { path: '/datetime/timezone', title: 'Timezone Converter' },
  { path: '/text/case-converter', title: 'Case Converter' }
];

const CATEGORIES = [
  { path: '/code', title: 'Code tools', description: 'Encoders, decoders, formatters' },
  { path: '/text', title: 'Text tools', description: 'Convert, count, clean up text' },
  { path: '/datetime', title: 'DateTime tools', description: 'Timestamps, cron, time zones' },
  { path: '/info', title: 'Info tools', description: 'Lookups and reference data' }
];

export default function NotFound() {
  return (
    <AppLayout>
      <div className="tool-content-section">
        <h1 className="tool-content-title">Page not found</h1>
        <div className="tool-content-body">
          <p>
            The page you asked for does not exist. It may have been renamed, or the link that brought
            you here may be out of date — a truncated URL copied from a chat is the usual culprit.
          </p>
          <p>
            Nothing was uploaded and nothing broke: this is simply a wrong address. Pick a destination
            below, or use the search box at the top of the page.
          </p>
        </div>
      </div>

      <section className="tool-content-section" aria-label="Browse categories">
        <h2 className="tool-content-title">Browse by category</h2>
        <ul className="tool-related-list">
          {CATEGORIES.map((category) => (
            <li key={category.path} className="tool-related-item">
              <Link href={category.path} className="tool-related-link">
                {category.title}
              </Link>
              <span className="tool-related-desc"> — {category.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="tool-content-section" aria-label="Popular tools">
        <h2 className="tool-content-title">Popular tools</h2>
        <ul className="tool-related-list">
          {POPULAR_TOOLS.map((tool) => (
            <li key={tool.path} className="tool-related-item">
              <Link href={tool.path} className="tool-related-link">
                {tool.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </AppLayout>
  );
}
