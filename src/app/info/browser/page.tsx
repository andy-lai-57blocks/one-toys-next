import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import { BrowserInfo } from '@/components/tools/info';
import { generateToolMetadata, generateToolJsonLd } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/info/browser');

export default function BrowserInfoPage() {
  const jsonLd = generateToolJsonLd('/info/browser');
  
  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <BrowserInfo />
    </AppLayout>
  );
}