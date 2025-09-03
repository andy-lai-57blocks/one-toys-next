import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import { PostcodeLookup } from '@/components/tools/info';
import { generateToolMetadata, generateToolJsonLd } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/info/postcodes');

export default function PostcodeLookupPage() {
  const jsonLd = generateToolJsonLd('/info/postcodes');
  
  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <PostcodeLookup />
    </AppLayout>
  );
}