import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import { CharacterCount } from '@/components/tools/text';
import { generateToolMetadata, generateToolJsonLd } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/text/character-count');

export default function CharacterCountPage() {
  const jsonLd = generateToolJsonLd('/text/character-count');
  
  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <CharacterCount />
    </AppLayout>
  );
}