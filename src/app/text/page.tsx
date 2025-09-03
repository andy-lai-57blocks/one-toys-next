import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import { TextTools } from '@/components/pages';
import { getSEOData } from '@/utils/seoData';

const seoData = getSEOData('/text');

export const metadata: Metadata = {
  title: seoData.title,
  description: seoData.description,
  keywords: seoData.keywords,
  openGraph: {
    title: seoData.title,
    description: seoData.description,
    url: 'https://one-toys.com/text',
    siteName: 'One Toys',
    images: [{
      url: 'https://one-toys.com/og-image.png',
      width: 1200,
      height: 630,
    }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: seoData.title,
    description: seoData.description,
    images: ['https://one-toys.com/og-image.png'],
    creator: '@onetoys',
  },
  robots: 'index, follow',
  authors: [{ name: 'One Toys' }],
  alternates: {
    canonical: 'https://one-toys.com/text',
  },
};

export default function TextPage() {
  return (
    <AppLayout>
      <TextTools />
    </AppLayout>
  );
}

