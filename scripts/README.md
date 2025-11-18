# Scripts Directory

This directory contains build and utility scripts for the Petflix project.

## Files

### `create-icons.cjs`
Node.js script to generate PWA icons for Petflix.

**Usage**:
```bash
node scripts/create-icons.cjs
```

**Note**: Icons have already been generated and are stored in `frontend/public/icons/`. This script is only needed if you want to regenerate them.

**Why moved here?**:
- Scripts should not be in the public assets folder
- Prevents test runners from trying to parse build scripts
- Keeps the public folder clean for static assets only

## Generated Icons Location
All generated icons are stored in: `frontend/public/icons/`

These include:
- PWA icons (16x16 to 512x512)
- Shortcut icons (search, feed, share)

