import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import { Base64Tool } from '@/components/tools/code';
import { generateToolMetadata, generateToolJsonLd } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/code/base64');

export default function Base64Page() {
  const jsonLd = generateToolJsonLd('/code/base64');
  
  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <Base64Tool />
    </AppLayout>
  );
}

