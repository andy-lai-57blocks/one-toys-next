'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { Breadcrumbs } from '@/components/shared';
import GlobalSearch from '@/components/search/GlobalSearch';

interface NavTool {
  path: string;
  title: string;
}

interface NavItem {
  path: string;
  label: string;
  icon: string;
  exact?: boolean;
  submenu?: NavTool[];
}

// Row 2 is text-only on purpose: 14 coloured emoji in a 12px strip is the
// loudest thing on the page. The four top-level items keep their icons.
// Ordered by general industry usage (most-used tools first) within each category.
const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Home', icon: '🏠', exact: true },
  {
    path: '/code',
    label: 'Code',
    icon: '🖥️',
    submenu: [
      { path: '/code/json', title: 'JSON Formatter' },
      { path: '/code/json-fixer', title: 'JSON Fixer' },
      { path: '/code/base64', title: 'Base64' },
      { path: '/code/url', title: 'URL Encode' },
      { path: '/code/password', title: 'Password Generator' },
      { path: '/code/uuid', title: 'UUID Generator' },
      { path: '/code/html', title: 'HTML Encode' },
      { path: '/code/xml', title: 'XML Formatter' },
      { path: '/code/jwt-decoder', title: 'JWT Decoder' },
      { path: '/code/gzip', title: 'Gzip' },
      { path: '/code/json-escaper', title: 'JSON Escape' },
      { path: '/code/xml-escaper', title: 'XML Escape' },
      { path: '/code/vast', title: 'VAST Formatter' },
    ],
  },
  {
    path: '/text',
    label: 'Text',
    icon: '🔤',
    submenu: [
      { path: '/text/case-converter', title: 'Case Converter' },
      { path: '/text/character-count', title: 'Character Count' },
      { path: '/text/space-remover', title: 'Space Remover' },
      { path: '/text/lorem', title: 'Lorem Ipsum' },
      { path: '/text/markdown', title: 'Markdown Preview' },
    ],
  },
  {
    path: '/datetime',
    label: 'DateTime',
    icon: '🕐',
    submenu: [
      { path: '/datetime/timestamp', title: 'Timestamp Converter' },
      { path: '/datetime/timezone', title: 'Timezone Converter' },
      { path: '/datetime/calculator', title: 'Date Calculator' },
      { path: '/datetime/format', title: 'Date Formatter' },
      { path: '/datetime/cron-parser', title: 'Cron Parser' },
    ],
  },
  // Appended last so the nav order matches the homepage's category order.
  {
    path: '/media',
    label: 'Media',
    icon: '🖼️',
    submenu: [
      { path: '/media/image-compress', title: 'Image Compressor' },
      { path: '/media/hls', title: 'HLS Player' },
    ],
  },
];

// next.config.ts sets `trailingSlash: true`, so usePathname() reports routes
// WITH a trailing slash ("/code/base64/") while the paths in NAV_ITEMS have
// none. Comparing the two raw silently fails to mark anything active, so both
// sides go through this first.
const normalize = (path: string) =>
  path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;

const matches = (current: string, item: NavItem) =>
  item.exact
    ? current === normalize(item.path)
    : current === normalize(item.path) || current.startsWith(`${normalize(item.path)}/`);

// Top navigation, two rows.
//
// The first row carries the four primary destinations plus the search box. The
// second row lists every tool of the category the current route belongs to, so
// switching between tools never needs a hover menu or a trip back to the
// category landing page. The second row is omitted on Home, which has no
// category of its own.
const TopNav = () => {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const closeMobileNav = () => setIsMobileOpen(false);

  const current = normalize(pathname);
  const activeCategory = NAV_ITEMS.find((item) => item.submenu && matches(current, item));
  // Home has its own hero search box; showing this one too would put two
  // identical search fields on the same screen.
  const showSearch = current !== '/';

  return (
    <>
      <header className="topnav">
        <div className="topnav-bar">
          <Link href="/" className="topnav-logo" onClick={closeMobileNav}>
            One Toys
          </Link>

          <nav className={`topnav-nav ${isMobileOpen ? 'mobile-open' : ''}`}>
            <ul className="topnav-links">
              {NAV_ITEMS.map((item) => {
                const isActive = matches(current, item);
                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className={`topnav-link ${isActive ? 'active' : ''}`}
                      onClick={closeMobileNav}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span className="topnav-icon" aria-hidden="true">
                        {item.icon}
                      </span>
                      <span className="topnav-text">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {showSearch && (
            <div className="topnav-search">
              <GlobalSearch />
            </div>
          )}

          <button
            type="button"
            className="topnav-toggle"
            onClick={() => setIsMobileOpen((open) => !open)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileOpen}
          >
            <span className={`hamburger ${isMobileOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>

        {activeCategory?.submenu && (
          <div className="topnav-subnav">
            <div className="subnav-scroll">
              <ul className="subnav-links">
                {activeCategory.submenu.map((tool) => {
                  const isActive = normalize(tool.path) === current;
                  return (
                    <li key={tool.path}>
                      <Link
                        href={tool.path}
                        className={`subnav-link ${isActive ? 'active' : ''}`}
                        onClick={closeMobileNav}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {tool.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </header>

      {isMobileOpen && <div className="topnav-overlay" onClick={closeMobileNav} />}
    </>
  );
};

// Floating Theme Toggle Component
const FloatingThemeToggle = () => {
  const { isDarkTheme, toggleTheme } = useTheme();

  return (
    <button
      className="floating-theme-toggle"
      onClick={toggleTheme}
      title={isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="floating-theme-icon">{isDarkTheme ? '☀️' : '🌙'}</span>
    </button>
  );
};

// Main Layout Component
interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="app">
      <TopNav />
      <main className="main-content">
        <div className="content-container">
          <div className="content-area">
            <Breadcrumbs />
            {children}
          </div>
        </div>
      </main>
      <FloatingThemeToggle />
    </div>
  );
};

export default AppLayout;
