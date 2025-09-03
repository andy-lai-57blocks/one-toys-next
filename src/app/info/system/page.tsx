import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import { SystemInfo } from '@/components/tools/info';
import { generateToolMetadata, generateToolJsonLd } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/info/system');

export default function SystemInfoPage() {
  const jsonLd = generateToolJsonLd('/info/system');
  
  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <SystemInfo />
    </AppLayout>
  );
}