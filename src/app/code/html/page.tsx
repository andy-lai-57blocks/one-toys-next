import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import HTMLTool from '@/components/tools/code/HTMLTool';
import ToolPageContent from '@/components/shared/ToolPageContent';
import { generateToolMetadata, generateToolJsonLd } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/code/html');

export default function HTMLToolPage() {
  const jsonLd = generateToolJsonLd('/code/html');
  
  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <HTMLTool />
      <ToolPageContent path="/code/html" />
    </AppLayout>
  );
}