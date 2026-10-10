import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import { LoremGenerator } from '@/components/tools/text';
import ToolPageContent from '@/components/shared/ToolPageContent';
import { generateToolMetadata, generateToolJsonLd } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/text/lorem');

export default function LoremGeneratorPage() {
  const jsonLd = generateToolJsonLd('/text/lorem');
  
  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <LoremGenerator />
      <ToolPageContent path="/text/lorem" />
    </AppLayout>
  );
}