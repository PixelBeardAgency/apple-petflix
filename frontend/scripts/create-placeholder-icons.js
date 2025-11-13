#!/usr/bin/env node

/**
 * Creates placeholder PWA icons for development
 * For production, use proper icons generated from your logo
 */

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const color = '#f97316'; // Petflix orange
const iconsDir = path.join(__dirname, '../public/icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG placeholder icons
sizes.forEach(size => {
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${color}" rx="${size * 0.1}"/>
  <text x="50%" y="50%" font-size="${size * 0.5}" text-anchor="middle" dy=".35em" fill="white" font-family="Arial, sans-serif">🐾</text>
</svg>`;
  
  const filename = `icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(iconsDir, filename), svg);
  console.log(`✅ Created ${filename}`);
});

console.log('\n🎉 Placeholder icons created successfully!');
console.log('📝 For production, replace these with proper PNG icons.');
console.log('📖 See frontend/public/icons/README.md for instructions.\n');

