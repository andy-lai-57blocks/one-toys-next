import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import { TimezoneConverter } from '@/components/tools/datetime';
import { generateToolMetadata, generateToolJsonLd } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/datetime/timezone');

export default function TimezoneConverterPage() {
  const jsonLd = generateToolJsonLd('/datetime/timezone');
  
  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <TimezoneConverter />
    </AppLayout>
  );
}