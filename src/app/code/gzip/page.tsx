import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import GzipTool from '@/components/tools/code/GzipTool';
import ToolPageContent from '@/components/shared/ToolPageContent';
import { generateToolMetadata, generateToolJsonLd } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/code/gzip');

export default function GzipToolPage() {
  const jsonLd = generateToolJsonLd('/code/gzip');
  
  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <GzipTool />
      <ToolPageContent path="/code/gzip" />
    </AppLayout>
  );
}