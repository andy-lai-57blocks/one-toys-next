import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import { JSONFormatter } from '@/components/tools/code';
import { generateToolMetadata, generateToolJsonLd } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/code/json');

export default function JSONPage() {
  const jsonLd = generateToolJsonLd('/code/json');
  
  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <JSONFormatter />
    </AppLayout>
  );
}

