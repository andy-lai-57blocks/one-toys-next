import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import { XMLFormatter } from '@/components/tools/code';
import { generateToolMetadata, generateToolJsonLd } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/code/xml');

export default function XMLFormatterPage() {
  const jsonLd = generateToolJsonLd('/code/xml');
  
  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <XMLFormatter />
    </AppLayout>
  );
}