import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
// Imported directly rather than through the '@components/tools/code' barrel:
// that barrel re-exports tools which pull in the ~600 kB ace editor, and this
// page must stay inside the PRD's < 20 kB first-load budget.
import JSONFixer from '@/components/tools/code/JSONFixer';
import { generateToolMetadata, generateToolJsonLd } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/code/json-fixer');

export default function JsonFixerPage() {
  const jsonLd = generateToolJsonLd('/code/json-fixer');

  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <JSONFixer />
    </AppLayout>
  );
}
