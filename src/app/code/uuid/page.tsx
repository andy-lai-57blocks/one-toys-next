import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import { UUIDGenerator } from '@/components/tools/code';
import { generateToolMetadata, generateToolJsonLd } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/code/uuid');

export default function UUIDGeneratorPage() {
  const jsonLd = generateToolJsonLd('/code/uuid');
  
  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <UUIDGenerator />
    </AppLayout>
  );
}