import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import { PublicServiceNumbers } from '@/components/tools/info';
import { generateToolMetadata, generateToolJsonLd } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/info/public-services');

export default function PublicServiceNumbersPage() {
  const jsonLd = generateToolJsonLd('/info/public-services');
  
  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <PublicServiceNumbers />
    </AppLayout>
  );
}