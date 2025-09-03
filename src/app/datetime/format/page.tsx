import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import { DateFormatter } from '@/components/tools/datetime';
import { generateToolMetadata, generateToolJsonLd } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/datetime/format');

export default function DateFormatterPage() {
  const jsonLd = generateToolJsonLd('/datetime/format');
  
  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <DateFormatter />
    </AppLayout>
  );
}