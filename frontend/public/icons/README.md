# PWA Icons

This directory should contain the PWA app icons in various sizes.

## Required Icon Sizes

For a complete PWA experience, you need the following icon sizes:

- `icon-72x72.png` (72x72px)
- `icon-96x96.png` (96x96px)
- `icon-128x128.png` (128x128px)
- `icon-144x144.png` (144x144px)
- `icon-152x152.png` (152x152px)
- `icon-192x192.png` (192x192px)
- `icon-384x384.png` (384x384px)
- `icon-512x512.png` (512x512px)

## Generating Icons

You can use various tools to generate icons from a single source image:

### Option 1: Using PWA Asset Generator (Recommended)

```bash
npm install -g pwa-asset-generator

# Generate all icons from a source image (1024x1024 recommended)
pwa-asset-generator source-logo.png ./public/icons --icon-only --favicon --type png
```

### Option 2: Using Online Tools

- **RealFaviconGenerator**: https://realfavicongenerator.net/
- **PWA Icon Generator**: https://www.pwabuilder.com/imageGenerator
- **Favicon.io**: https://favicon.io/

### Option 3: Manual Creation

Use image editing software like:
- Adobe Photoshop
- GIMP
- Figma
- Canva

Export your logo/icon at each required size.

## Design Guidelines

1. **Source Image**: Start with at least 1024x1024px PNG with transparent background
2. **Padding**: Leave 10-15% padding around the icon for proper display
3. **Simple Design**: Keep it recognizable at small sizes
4. **Branding**: Use your brand colors (#f97316 orange for Petflix)
5. **Maskable Icons**: For Android adaptive icons, ensure important content stays within the safe zone (80% of the icon)

## Testing

After generating icons:

1. Place all icons in `/frontend/public/icons/`
2. Run the app: `npm run dev`
3. Test PWA installation on:
   - Chrome DevTools > Application > Manifest
   - Mobile devices (Chrome on Android, Safari on iOS)
   - Desktop (Chrome/Edge "Install" button)

## Current Status

⚠️ **Placeholder icons needed**: The manifest references these icons, but they need to be generated and placed in this directory.

### Quick Start with Placeholder

For development, you can create placeholder icons:

```bash
# Navigate to the icons directory
cd frontend/public/icons

# Create placeholder icons (macOS/Linux with ImageMagick)
for size in 72 96 128 144 152 192 384 512; do
  convert -size ${size}x${size} xc:orange -gravity center -pointsize $((size/4)) \
  -annotate +0+0 "🐾" icon-${size}x${size}.png
done
```

Or use this Node.js script to create simple colored squares:

```javascript
// create-placeholders.js
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const color = '#f97316'; // Petflix orange

// This creates simple SVG placeholders
sizes.forEach(size => {
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="${color}"/>
    <text x="50%" y="50%" font-size="${size/3}" text-anchor="middle" dy=".3em" fill="white">🐾</text>
  </svg>`;
  
  fs.writeFileSync(`icon-${size}x${size}.svg`, svg);
  console.log(`Created icon-${size}x${size}.svg`);
});
```

Run with: `node create-placeholders.js`

