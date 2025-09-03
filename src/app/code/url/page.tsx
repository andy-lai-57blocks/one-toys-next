import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import { URLTool } from '@/components/tools/code';
import { generateToolMetadata, generateToolJsonLd } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/code/url');

export default function URLPage() {
  const jsonLd = generateToolJsonLd('/code/url');
  
  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <URLTool />
    </AppLayout>
  );
}

