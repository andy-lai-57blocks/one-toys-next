import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import { CountdownTool } from '@/components/tools/datetime';
import { generateToolMetadata, generateToolJsonLd } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/datetime/countdown');

export default function CountdownToolPage() {
  const jsonLd = generateToolJsonLd('/datetime/countdown');
  
  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <CountdownTool />
    </AppLayout>
  );
}