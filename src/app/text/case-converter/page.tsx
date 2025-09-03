import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import { CaseConverter } from '@/components/tools/text';
import { generateToolMetadata, generateToolJsonLd } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/text/case-converter');

export default function CaseConverterPage() {
  const jsonLd = generateToolJsonLd('/text/case-converter');
  
  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <CaseConverter />
    </AppLayout>
  );
}