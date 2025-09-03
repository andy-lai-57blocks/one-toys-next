import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import { CallingCodesLookup } from '@/components/tools/info';
import { generateToolMetadata, generateToolJsonLd } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/info/calling-codes');

export default function CallingCodesLookupPage() {
  const jsonLd = generateToolJsonLd('/info/calling-codes');
  
  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <CallingCodesLookup />
    </AppLayout>
  );
}