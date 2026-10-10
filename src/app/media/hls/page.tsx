import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import HLSTool from '@/components/tools/media/HLSTool';
import ToolPageContent from '@/components/shared/ToolPageContent';
import { generateToolMetadata, generateToolJsonLd } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/media/hls');

export default function HLSToolPage() {
  const jsonLd = generateToolJsonLd('/media/hls');

  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <HLSTool />
      <ToolPageContent path="/media/hls" />
    </AppLayout>
  );
}
