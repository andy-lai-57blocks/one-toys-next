const fs = require('fs');

// Fix unescaped entities in JSX
const files = [
  'src/components/pages/Office.js',
  'src/components/tools/code/HLSTool.js',
  'src/components/tools/datetime/CountdownTool.js',
  'src/components/tools/info/CallingCodesLookup.js',
  'src/components/tools/info/PostcodeLookup.js'
];

files.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace unescaped quotes and apostrophes in JSX
    // Single quotes
    content = content.replace(/([^=])'([^']*'[^=])/g, '$1&apos;$2');
    content = content.replace(/([^{])'/g, '$1&apos;');
    content = content.replace(/'([^{])/g, '&apos;$1');
    
    // Double quotes in text content (not attributes)
    content = content.replace(/([^=])"([^"]*"[^=])/g, '$1&quot;$2');
    content = content.replace(/([^{])"/g, '$1&quot;');
    content = content.replace(/"([^{])/g, '&quot;$1');
    
    // More precise replacements for common patterns
    content = content.replace(/doesn't/g, 'doesn&apos;t');
    content = content.replace(/can't/g, 'can&apos;t');
    content = content.replace(/won't/g, 'won&apos;t');
    content = content.replace(/isn't/g, 'isn&apos;t');
    content = content.replace(/aren't/g, 'aren&apos;t');
    content = content.replace(/haven't/g, 'haven&apos;t');
    content = content.replace(/couldn't/g, 'couldn&apos;t');
    content = content.replace(/wouldn't/g, 'wouldn&apos;t');
    content = content.replace(/shouldn't/g, 'shouldn&apos;t');
    content = content.replace(/mustn't/g, 'mustn&apos;t');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed unescaped entities in: ${filePath}`);
  } else {
    console.log(`❌ File not found: ${filePath}`);
  }
});

console.log('🎉 Fixed unescaped entities!');

