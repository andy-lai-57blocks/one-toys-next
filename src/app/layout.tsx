import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from '../contexts/ThemeContext';
import "../styles/main.scss";

export const metadata: Metadata = {
  title: "One Toys - Comprehensive Platform | Data Processing & Productivity Tools",
  description: "Comprehensive platform with hundreds of practical functions for efficient data processing and productivity. Encoding, decoding, formatting, generation, and text processing tools. Fast, secure, and mobile-friendly.",
  keywords: "productivity tools, data processing, comprehensive platform, online tools, free tools, encoding tools, decoding tools, formatting tools, office productivity, data conversion, efficiency tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* AdSense Script */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8806399994474387" 
          crossOrigin="anonymous"
        ></script>
        {/* Mobile Zoom Prevention */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover" />
      </head>
      <body>
        <ThemeProvider>
          <Analytics 
            debug={process.env.NODE_ENV === 'development'}
          />
          {children}
        </ThemeProvider>
        {/* Mobile Zoom Prevention Scripts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('gesturestart', function (e) { e.preventDefault(); });
              let lastTouchEnd = 0;
              document.addEventListener('touchend', function (e) {
                const now = (new Date()).getTime();
                if (now - lastTouchEnd <= 300) { e.preventDefault(); }
                lastTouchEnd = now;
              }, false);
              document.addEventListener('touchmove', function (e) { if (e.scale !== 1) { e.preventDefault(); } }, { passive: false });
              document.addEventListener('wheel', function(e) { if (e.ctrlKey) { e.preventDefault(); } }, { passive: false });
              document.addEventListener('keydown', function(e) {
                if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) { e.preventDefault(); }
              });
            `
          }}
        />
      </body>
    </html>
  );
}
