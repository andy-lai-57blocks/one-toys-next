const fs = require('fs');
const path = require('path');

// Files that need 'use client' directive (components using React hooks)
const clientComponents = [
  // Tool components
  'src/components/tools/code/Base64Tool.js',
  'src/components/tools/code/GzipTool.js',
  'src/components/tools/code/HLSTool.js',
  'src/components/tools/code/HTMLTool.js',
  'src/components/tools/code/JSONFormatter.js',
  'src/components/tools/code/PasswordGenerator.js',
  'src/components/tools/code/URLTool.js',
  'src/components/tools/code/UUIDGenerator.js',
  'src/components/tools/code/VASTFormatter.js',
  'src/components/tools/code/XMLFormatter.js',
  
  // DateTime tools
  'src/components/tools/datetime/CountdownTool.js',
  'src/components/tools/datetime/DateCalculator.js',
  'src/components/tools/datetime/DateFormatter.js',
  'src/components/tools/datetime/TimestampConverter.js',
  'src/components/tools/datetime/TimezoneConverter.js',
  
  // Info tools
  'src/components/tools/info/BrowserInfo.js',
  'src/components/tools/info/CallingCodesLookup.js',
  'src/components/tools/info/NetworkInfo.js',
  'src/components/tools/info/PostcodeLookup.js',
  'src/components/tools/info/PublicServiceNumbers.js',
  'src/components/tools/info/SystemInfo.js',
  
  // Text tools
  'src/components/tools/text/CaseConverter.js',
  'src/components/tools/text/CharacterCount.js',
  'src/components/tools/text/LoremGenerator.js',
  'src/components/tools/text/SpaceRemover.js',
  
  // Context
  'src/contexts/ThemeContext.js',
  
  // Common components
  'src/components/common/CodeEditor.js'
];

// Files that need React Router to Next.js conversion
const routerComponents = [
  'src/components/pages/Code.js',
  'src/components/pages/DateTime.js', 
  'src/components/pages/Home.js',
  'src/components/pages/Info.js',
  'src/components/pages/Office.js',
  'src/components/pages/TextTools.js'
];

// Add 'use client' directive to components
clientComponents.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if already has 'use client'
    if (!content.startsWith("'use client'")) {
      content = "'use client';\n\n" + content;
      fs.writeFileSync(filePath, content);
      console.log(`✅ Added 'use client' to: ${filePath}`);
    } else {
      console.log(`⏭️  Already has 'use client': ${filePath}`);
    }
  } else {
    console.log(`❌ File not found: ${filePath}`);
  }
});

// Convert React Router to Next.js in page components
routerComponents.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add 'use client' if not present
    if (!content.startsWith("'use client'")) {
      content = "'use client';\n\n" + content;
    }
    
    // Replace React Router imports with Next.js imports
    content = content.replace(
      /import { Link } from 'react-router-dom';/g,
      "import Link from 'next/link';"
    );
    
    // Replace React Router Link props (to -> href)
    content = content.replace(/to=/g, 'href=');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated React Router imports in: ${filePath}`);
  } else {
    console.log(`❌ File not found: ${filePath}`);
  }
});

console.log('\n🎉 All client components and router imports fixed!');

