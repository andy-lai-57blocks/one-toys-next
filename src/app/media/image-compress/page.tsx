import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import ImageCompressor from '@/components/tools/media/ImageCompressor';
import { generateToolMetadata, generateToolJsonLd } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/media/image-compress');

export default function ImageCompressPage() {
  const jsonLd = generateToolJsonLd('/media/image-compress');

  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ImageCompressor />
    </AppLayout>
  );
}
