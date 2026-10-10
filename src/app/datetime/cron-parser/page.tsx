import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import CronParser from '@/components/tools/datetime/CronParser';
import ToolPageContent from '@/components/shared/ToolPageContent';
import { generateToolMetadata, generateToolJsonLd } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/datetime/cron-parser');

export default function CronParserPage() {
  const jsonLd = generateToolJsonLd('/datetime/cron-parser');

  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <CronParser />
      <ToolPageContent path="/datetime/cron-parser" />
    </AppLayout>
  );
}
