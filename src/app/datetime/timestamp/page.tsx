import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import { TimestampConverter } from '@/components/tools/datetime';
import { generateToolMetadata, generateToolJsonLd } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/datetime/timestamp');

export default function TimestampConverterPage() {
  const jsonLd = generateToolJsonLd('/datetime/timestamp');
  
  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <TimestampConverter />
    </AppLayout>
  );
}