import Link from 'next/link';

// Site-wide footer. Static markup only — it is imported by AppLayout (a client
// component) so it ships inside that bundle, but it holds no state and no
// handlers, which keeps the cost at markup.
//
// Links here are the ones a directory reviewer or a journalist looks for
// (About / Privacy / Contact). Kept in one place so the sitemap, the footer and
// the pages cannot drift apart.

// Three groups, four columns. "Popular" exists for two reasons: it fills the
// footer width so the brand block does not leave a void in the middle, and it
// puts a plain-text internal link to the highest-value tools on every page.
const POPULAR_LINKS = [
  { path: '/code/json', label: 'JSON Formatter' },
  { path: '/code/jwt-decoder', label: 'JWT Decoder' },
  { path: '/media/image-compress', label: 'Image Compressor' },
  { path: '/datetime/cron-parser', label: 'Cron Parser' },
];

const CATEGORY_LINKS = [
  { path: '/code', label: 'Code tools' },
  { path: '/text', label: 'Text tools' },
  { path: '/datetime', label: 'DateTime tools' },
  { path: '/media', label: 'Media tools' },
];

const SITE_LINKS = [
  { path: '/about', label: 'About' },
  { path: '/privacy', label: 'Privacy' },
  { path: '/contact', label: 'Contact' },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link href="/" className="footer-logo">
            One Toys
          </Link>
          <p className="footer-tagline">
            27 free developer tools that run entirely in your browser. No account,
            no uploads.
          </p>
        </div>

        <nav className="footer-col" aria-label="Popular tools">
          <h2 className="footer-heading">Popular</h2>
          <ul>
            {POPULAR_LINKS.map((link) => (
              <li key={link.path}>
                <Link href={link.path}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="footer-col" aria-label="Tool categories">
          <h2 className="footer-heading">Categories</h2>
          <ul>
            {CATEGORY_LINKS.map((link) => (
              <li key={link.path}>
                <Link href={link.path}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="footer-col" aria-label="About this site">
          <h2 className="footer-heading">Site</h2>
          <ul>
            {SITE_LINKS.map((link) => (
              <li key={link.path}>
                <Link href={link.path}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="footer-bottom">
        {/* The year is evaluated at BUILD time for the static export and again
            on hydration; suppressHydrationWarning covers the New Year edge. */}
        <p suppressHydrationWarning>
          © {new Date().getFullYear()} One Toys
        </p>
        <p className="footer-contact">
          <a href="mailto:andy@57blocks.com">andy@57blocks.com</a>
        </p>
      </div>
    </footer>
  );
}
