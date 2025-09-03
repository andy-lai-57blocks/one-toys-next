const fs = require('fs');
const path = require('path');

// Define all tool pages
const tools = {
  code: [
    { path: 'html', component: 'HTMLTool' },
    { path: 'xml', component: 'XMLFormatter' },
    { path: 'vast', component: 'VASTFormatter' },
    { path: 'gzip', component: 'GzipTool' },
    { path: 'uuid', component: 'UUIDGenerator' },
    { path: 'password', component: 'PasswordGenerator' },
    { path: 'hls', component: 'HLSTool' }
  ],
  text: [
    { path: 'case-converter', component: 'CaseConverter' },
    { path: 'character-count', component: 'CharacterCount' },
    { path: 'space-remover', component: 'SpaceRemover' },
    { path: 'lorem', component: 'LoremGenerator' }
  ],
  info: [
    { path: 'system', component: 'SystemInfo' },
    { path: 'network', component: 'NetworkInfo' },
    { path: 'browser', component: 'BrowserInfo' },
    { path: 'calling-codes', component: 'CallingCodesLookup' },
    { path: 'public-services', component: 'PublicServiceNumbers' },
    { path: 'postcodes', component: 'PostcodeLookup' }
  ],
  datetime: [
    { path: 'timestamp', component: 'TimestampConverter' },
    { path: 'format', component: 'DateFormatter' },
    { path: 'calculator', component: 'DateCalculator' },
    { path: 'timezone', component: 'TimezoneConverter' },
    { path: 'countdown', component: 'CountdownTool' }
  ]
};

// Template function for generating page content
const generatePageContent = (category, toolPath, component) => {
  const componentImportPath = category === 'code' ? 'code' : category === 'text' ? 'text' : category === 'info' ? 'info' : 'datetime';
  
  return `import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import { ${component} } from '@/components/tools/${componentImportPath}';
import { generateToolMetadata, generateToolJsonLd } from '@/utils/pageGenerator';

export const metadata: Metadata = generateToolMetadata('/${category}/${toolPath}');

export default function ${component}Page() {
  const jsonLd = generateToolJsonLd('/${category}/${toolPath}');
  
  return (
    <AppLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <${component} />
    </AppLayout>
  );
}`;
};

// Generate all pages
Object.entries(tools).forEach(([category, toolList]) => {
  toolList.forEach(({ path: toolPath, component }) => {
    const filePath = `src/app/${category}/${toolPath}/page.tsx`;
    const dirPath = path.dirname(filePath);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // Generate page content
    const content = generatePageContent(category, toolPath, component);
    
    // Write file
    fs.writeFileSync(filePath, content);
    
    console.log(`Generated: ${filePath}`);
  });
});

console.log('All pages generated successfully!');

