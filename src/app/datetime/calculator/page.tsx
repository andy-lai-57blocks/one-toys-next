import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import { DateCalculator } from '@/components/tools/datetime';
import { generateToolMetadata, generateToolJsonLd } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/datetime/calculator');

export default function DateCalculatorPage() {
  const jsonLd = generateToolJsonLd('/datetime/calculator');
  
  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <DateCalculator />
    </AppLayout>
  );
}