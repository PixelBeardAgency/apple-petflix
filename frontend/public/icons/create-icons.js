/**
 * Simple script to create PWA icon placeholders
 * Creates PNG-compatible SVG icons for Petflix
 */

const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 72, 96, 128, 144, 152, 180, 192, 384, 512];
const color = '#f97316'; // Petflix orange

sizes.forEach(size => {
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${color}" rx="${size * 0.15}" ry="${size * 0.15}"/>
  <text x="50%" y="50%" font-size="${size * 0.5}" text-anchor="middle" dominant-baseline="middle" fill="white">🐾</text>
</svg>`;
  
  const filename = `icon-${size}x${size}.png`;
  fs.writeFileSync(filename, svg);
  console.log(`✅ Created ${filename}`);
});

// Create search, feed, and share icons for shortcuts
const shortcuts = [
  { name: 'search', emoji: '🔍' },
  { name: 'feed', emoji: '📺' },
  { name: 'share', emoji: '📤' }
];

shortcuts.forEach(({ name, emoji }) => {
  const svg = `<svg width="96" height="96" xmlns="http://www.w3.org/2000/svg">
  <rect width="96" height="96" fill="${color}" rx="15" ry="15"/>
  <text x="50%" y="50%" font-size="48" text-anchor="middle" dominant-baseline="middle" fill="white">${emoji}</text>
</svg>`;
  
  const filename = `${name}-96x96.png`;
  fs.writeFileSync(filename, svg);
  console.log(`✅ Created ${filename}`);
});

console.log('\n✨ All icons created! Note: These are SVG files saved with .png extension.');
console.log('For production, consider using proper PNG icons generated from a source image.');
console.log('See README.md for recommended tools and services.');

