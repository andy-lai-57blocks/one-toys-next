import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import { SpaceRemover } from '@/components/tools/text';
import { generateToolMetadata, generateToolJsonLd } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/text/space-remover');

export default function SpaceRemoverPage() {
  const jsonLd = generateToolJsonLd('/text/space-remover');
  
  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <SpaceRemover />
    </AppLayout>
  );
}