import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import QRCodeGenerator from '@/components/tools/media/QRCodeGenerator';
import ToolPageContent from '@/components/shared/ToolPageContent';
import { generateToolMetadata, generateToolJsonLd } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/media/qr-code');

export default function QRCodePage() {
  const jsonLd = generateToolJsonLd('/media/qr-code');

  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <QRCodeGenerator />
      <ToolPageContent path="/media/qr-code" />
    </AppLayout>
  );
}
