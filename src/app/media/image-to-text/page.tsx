import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import ImageToText from '@/components/tools/media/ImageToText';
import ToolPageContent from '@/components/shared/ToolPageContent';
import { generateToolMetadata, generateToolJsonLd } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/media/image-to-text');

export default function ImageToTextPage() {
  const jsonLd = generateToolJsonLd('/media/image-to-text');

  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ImageToText />
      <ToolPageContent path="/media/image-to-text" />
    </AppLayout>
  );
}
