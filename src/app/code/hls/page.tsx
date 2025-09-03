import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import { HLSTool } from '@/components/tools/code';
import { generateToolMetadata, generateToolJsonLd } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/code/hls');

export default function HLSToolPage() {
  const jsonLd = generateToolJsonLd('/code/hls');
  
  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <HLSTool />
    </AppLayout>
  );
}