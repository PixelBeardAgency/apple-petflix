/**
 * Image Optimization Plugin Configuration
 * Automatically converts images to WebP and optimizes them
 */

import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export const imageOptimizerConfig = ViteImageOptimizer({
  // PNG optimization
  png: {
    quality: 80,
  },
  // JPEG optimization
  jpeg: {
    quality: 80,
  },
  // JPG optimization
  jpg: {
    quality: 80,
  },
  // WebP conversion
  webp: {
    quality: 80,
  },
  // AVIF conversion (next-gen format)
  avif: {
    quality: 75,
  },
  // SVG optimization
  svg: {
    multipass: true,
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            cleanupIds: false,
            removeViewBox: false,
          },
        },
      },
    ],
  },
  // Cache optimization results
  cache: true,
  cacheLocation: './node_modules/.cache/vite-plugin-image-optimizer',
});

/**
 * Usage in vite.config.ts:
 * 
 * import { imageOptimizerConfig } from './vite-plugin-image-optimizer.config';
 * 
 * export default defineConfig({
 *   plugins: [
 *     react(),
 *     imageOptimizerConfig,
 *     // ... other plugins
 *   ],
 * });
 */

