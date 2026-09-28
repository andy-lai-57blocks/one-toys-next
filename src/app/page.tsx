import type { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import { Home } from '@/components/pages';

const TITLE = 'One Toys - Comprehensive Platform | Data Processing & Productivity Tools';
const DESCRIPTION =
  'Comprehensive platform with hundreds of practical functions for efficient data processing and productivity. Encoding, decoding, formatting, generation, and text processing tools. Fast, secure, and mobile-friendly.';
const OG_IMAGE = 'https://one-toys.com/og-image.png';

// The homepage previously had no canonical, so https://one-toys.com/ and
// https://www.one-toys.com/ competed as duplicates. This pins the canonical URL.
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: 'index, follow',
  authors: [{ name: 'One Toys' }],
  alternates: {
    canonical: 'https://one-toys.com/',
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://one-toys.com/',
    siteName: 'One Toys',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
    creator: '@onetoys',
  },
};

export default function HomePage() {
  return (
    <AppLayout>
      <Home />
    </AppLayout>
  );
}
