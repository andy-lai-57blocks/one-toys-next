import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static exports for SSG
  output: 'export',
  
  // Optimize for static hosting
  trailingSlash: true,
  
  // Image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // SCSS support
  sassOptions: {
    includePaths: ['./src/styles'],
  },
  
  // Experimental features - removed optimizeCss due to critters dependency issue
  // experimental: {
  //   optimizeCss: true,
  // },
  
  // Asset prefix for CDN
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  
  // Compression
  compress: true,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Redirect configuration
  async redirects() {
    return [
      // Legacy route redirects
      {
        source: '/encoders/:path*',
        destination: '/code/:path*',
        permanent: true,
      },
      {
        source: '/formatters/:path*',
        destination: '/code/:path*',
        permanent: true,
      },
      {
        source: '/generators/:path*',
        destination: '/code/:path*',
        permanent: true,
      },
      {
        source: '/office/:path*',
        destination: '/code/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
