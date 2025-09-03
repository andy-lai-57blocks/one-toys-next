import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import { VASTFormatter } from '@/components/tools/code';
import { generateToolMetadata, generateToolJsonLd } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/code/vast');

export default function VASTFormatterPage() {
  const jsonLd = generateToolJsonLd('/code/vast');
  
  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <VASTFormatter />
    </AppLayout>
  );
}