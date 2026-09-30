'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { Breadcrumbs } from '@/components/shared';
import GlobalSearch from '@/components/search/GlobalSearch';

// Sidebar Navigation Component
const Sidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedSubmenus, setExpandedSubmenus] = useState({
    '/code': true,
    '/text': true,
    '/info': true,
    '/datetime': true
  });

  const menuItems = [
    { path: '/', label: 'Home', icon: '🏠', exact: true },
    { 
      path: '/code', 
      label: 'Code', 
      icon: '🖥️',
      submenu: [
        { path: '/code/jwt-decoder', title: 'JWT Decoder', icon: '🎫' },
        { path: '/code/json', title: 'JSON Formatter', icon: '📋' },
        { path: '/code/xml', title: 'XML Formatter', icon: '📄' },
        { path: '/code/vast', title: 'VAST Formatter', icon: '📺' },
        { path: '/code/base64', title: 'Base64 Encoder/Decoder', icon: '🔐' },
        { path: '/code/url', title: 'URL Encoder/Decoder', icon: '🌐' },
        { path: '/code/html', title: 'HTML Encoder/Decoder', icon: '🏷️' },
        { path: '/code/xml-escaper', title: 'XML Escaper/Unescaper', icon: '📝' },
        { path: '/code/json-escaper', title: 'JSON Escaper/Unescaper', icon: '🔤' },
        { path: '/code/gzip', title: 'Gzip Compression', icon: '🗜️' },
        { path: '/code/uuid', title: 'UUID Generator', icon: '🆔' },
        { path: '/code/password', title: 'Password Generator', icon: '🔑' },
        { path: '/code/hls', title: 'HLS Stream Player', icon: '📺' }
      ]
    },
    { 
      path: '/text', 
      label: 'Text', 
      icon: '🔤',
      submenu: [
        { path: '/text/space-remover', title: 'Space Remover', icon: '🚫' },
        { path: '/text/case-converter', title: 'Case Converter', icon: '🔤' },
        { path: '/text/character-count', title: 'Character Count Tool', icon: '📊' },
        { path: '/text/lorem', title: 'Lorem Ipsum Generator', icon: '📝' },
        { path: '/text/markdown', title: 'Markdown Preview', icon: '📝' }
      ]
    },
    { 
      path: '/info', 
      label: 'Info', 
      icon: 'ℹ️',
      submenu: [
        { path: '/info/system', title: 'System Information', icon: '💻' },
        { path: '/info/network', title: 'Network Information', icon: '🌐' },
        { path: '/info/browser', title: 'Browser Information', icon: '🌍' },
        { path: '/info/calling-codes', title: 'International Calling Codes', icon: '📞' },
        { path: '/info/public-services', title: 'Public Service Numbers', icon: '🚨' },
        { path: '/info/postcodes', title: 'Postcode Lookup', icon: '📮' }
      ]
    },
    { 
      path: '/datetime', 
      label: 'DateTime', 
      icon: '🕐',
      submenu: [
        { path: '/datetime/cron-parser', title: 'Cron Expression Parser', icon: '⏲️' },
        { path: '/datetime/timestamp', title: 'Timestamp Converter', icon: '⏰' },
        { path: '/datetime/format', title: 'Date Formatter', icon: '📅' },
        { path: '/datetime/calculator', title: 'Date Calculator', icon: '🧮' },
        { path: '/datetime/timezone', title: 'Timezone Converter', icon: '🌍' },
        { path: '/datetime/countdown', title: 'Countdown Tool', icon: '⏱️' }
      ]
    }
  ];

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  const toggleSubmenu = (menuPath: string) => {
    setExpandedSubmenus(prev => ({
      ...prev,
      [menuPath]: !prev[menuPath as keyof typeof prev]
    }));
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="mobile-header">
        <Link href="/" className="mobile-logo" onClick={closeMobileMenu}>
          <h1>One Toys</h1>
        </Link>
        
        <button 
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <span className={`hamburger ${isMobileOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && <div className="mobile-overlay" onClick={closeMobileMenu}></div>}

      {/* Sidebar */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <Link href="/" className="sidebar-logo" onClick={closeMobileMenu}>
            {!isCollapsed && <span className="logo-text">One Toys</span>}
          </Link>
          
          {/* Desktop Collapse Toggle */}
          <button 
            className="collapse-toggle desktop-only"
            onClick={toggleCollapse}
            aria-label="Toggle sidebar"
          >
            <span className={`toggle-icon ${isCollapsed ? 'collapsed' : ''}`}>‹</span>
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <ul className="nav-links">
            {menuItems.map((item) => {
              const isActive = item.exact 
                ? pathname === item.path
                : pathname === item.path || pathname.startsWith(item.path + '/');
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              
              return (
                <li key={item.path} className={`nav-item ${hasSubmenu ? 'has-submenu' : ''}`}>
                  <div className="nav-link-container">
                    <Link 
                      href={item.path} 
                      className={`nav-link ${isActive ? 'active' : ''} ${hasSubmenu ? 'has-toggle' : ''}`}
                      onClick={closeMobileMenu}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      {!isCollapsed && (
                        <>
                          <span className="nav-text">{item.label}</span>
                          {/* Integrated Submenu Toggle */}
                          {hasSubmenu && (
                            <span
                              className={`submenu-toggle ${expandedSubmenus[item.path as keyof typeof expandedSubmenus] ? 'expanded' : 'collapsed'}`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleSubmenu(item.path);
                              }}
                              aria-label={`Toggle ${item.label} submenu`}
                            >
                              <svg 
                                width="16" 
                                height="16" 
                                viewBox="0 0 16 16" 
                                fill="none" 
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path 
                                  d="M4 6L8 10L12 6" 
                                  stroke="currentColor" 
                                  strokeWidth="1.5" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  </div>
                  
                  {/* Submenu items - show when expanded and not collapsed */}
                  {hasSubmenu && !isCollapsed && expandedSubmenus[item.path as keyof typeof expandedSubmenus] && (
                    <ul className="submenu">
                      {item.submenu?.map((subitem) => {
                        const isSubitemActive = pathname === subitem.path;
                        return (
                          <li key={subitem.path}>
                            <Link
                              href={subitem.path}
                              className={`submenu-link ${isSubitemActive ? 'active' : ''}`}
                              onClick={closeMobileMenu}
                              title={subitem.title}
                            >
                              <span className="submenu-icon">{subitem.icon}</span>
                              <span className="submenu-text">{subitem.title}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
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
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <div className="content-container">
          <div className="content-area">
            <Breadcrumbs />
            {!isHomePage && (
              <div className="global-search-section">
                <GlobalSearch />
              </div>
            )}
            {children}
          </div>
        </div>
      </main>
      <FloatingThemeToggle />
    </div>
  );
};

export default AppLayout;
