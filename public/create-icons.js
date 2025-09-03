// Quick icon generator for PWA manifest
// Run this in browser console on icon-generator.html

const createIcon = (size, filename) => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  
  // Fill background
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Add text
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size/4}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('OT', size/2, size/2);
  
  // Download
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
};

// Create icons
createIcon(192, 'logo192.png');
createIcon(512, 'logo512.png');

// Create favicon (16x16 for simplicity)
createIcon(32, 'favicon-32.png');

console.log('Icons created! Convert favicon-32.png to favicon.ico using online converter.');
