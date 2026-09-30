import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import JWTDecoder from '@/components/tools/code/JWTDecoder';
import { generateToolMetadata, generateToolJsonLd } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/code/jwt-decoder');

export default function JwtDecoderPage() {
  const jsonLd = generateToolJsonLd('/code/jwt-decoder');

  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <JWTDecoder />
    </AppLayout>
  );
}
