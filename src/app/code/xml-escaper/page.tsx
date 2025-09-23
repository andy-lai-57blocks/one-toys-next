import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import { XMLEscaper } from '@/components/tools/code';
import { generateToolMetadata, generateToolJsonLd } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/code/xml-escaper');

export default function XMLEscaperPage() {
  const jsonLd = generateToolJsonLd('/code/xml-escaper');
  
  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <XMLEscaper />
    </AppLayout>
  );
}
