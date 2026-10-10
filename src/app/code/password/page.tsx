import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import PasswordGenerator from '@/components/tools/code/PasswordGenerator';
import ToolPageContent from '@/components/shared/ToolPageContent';
import { generateToolMetadata, generateToolJsonLd } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/code/password');

export default function PasswordGeneratorPage() {
  const jsonLd = generateToolJsonLd('/code/password');
  
  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <PasswordGenerator />
      <ToolPageContent path="/code/password" />
    </AppLayout>
  );
}