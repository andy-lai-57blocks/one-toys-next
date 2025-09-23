import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import { JSONEscaper } from '@/components/tools/code';
import { generateToolMetadata, generateToolJsonLd } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/code/json-escaper');

export default function JSONEscaperPage() {
  const jsonLd = generateToolJsonLd('/code/json-escaper');
  
  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <JSONEscaper />
    </AppLayout>
  );
}
