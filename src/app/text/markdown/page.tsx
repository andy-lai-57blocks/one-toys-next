import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import { MarkdownPreview } from '@/components/tools/text';
import { generateToolMetadata, generateToolJsonLd } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/text/markdown');

export default function MarkdownPreviewPage() {
  const jsonLd = generateToolJsonLd('/text/markdown');
  
  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <MarkdownPreview />
    </AppLayout>
  );
}

