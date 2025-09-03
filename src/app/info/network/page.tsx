import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import { NetworkInfo } from '@/components/tools/info';
import { generateToolMetadata, generateToolJsonLd } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/info/network');

export default function NetworkInfoPage() {
  const jsonLd = generateToolJsonLd('/info/network');
  
  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <NetworkInfo />
    </AppLayout>
  );
}