import { Metadata } from 'next';
import { getSEOData } from './seoData';

export function generateToolMetadata(path: string): Metadata {
  const seoData = getSEOData(path);
  const fullUrl = `https://one-toys.com${path}`;
  
  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
    openGraph: {
      title: seoData.title,
      description: seoData.description,
      url: fullUrl,
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
      canonical: fullUrl,
    },
  };
}

// Schema.org structured data for tools
export function generateToolJsonLd(path: string) {
  const seoData = getSEOData(path);
  const fullUrl = `https://one-toys.com${path}`;
  
  if (seoData.type === 'tool') {
    return {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": seoData.title.split(' - ')[0],
      "description": seoData.description,
      "url": fullUrl,
      "applicationCategory": "ProductivityApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "browserRequirements": "Requires JavaScript. Requires HTML5.",
      "author": {
        "@type": "Organization",
        "name": "One Toys",
        "url": "https://one-toys.com"
      }
    };
  }
  
  return null;
}

