# Favicon Generation Guide

You'll need to create these favicon sizes from your existing icon.png:

## Required Favicon Sizes:

- favicon-16x16.png (16x16)
- favicon-32x32.png (32x32)
- favicon-96x96.png (96x96)
- icon-192.png (192x192)
- icon-512.png (512x512)
- apple-touch-icon.png (180x180)
- apple-touch-icon-152x152.png (152x152)
- mstile-150x150.png (150x150)
- safari-pinned-tab.svg (vector format)

## Tools to Generate Favicons:

### Online Tools (Recommended):

1. **RealFaviconGenerator** (https://realfavicongenerator.net/)

   - Upload your icon.png
   - Download the generated package
   - Replace the files in your /public folder

2. **Favicon.io** (https://favicon.io/)
   - Simple favicon generator
   - Upload PNG and get all sizes

### Command Line (if you have ImageMagick):

```bash
# Navigate to your public folder
cd public

# Generate different sizes from icon.png
convert icon.png -resize 16x16 favicon-16x16.png
convert icon.png -resize 32x32 favicon-32x32.png
convert icon.png -resize 96x96 favicon-96x96.png
convert icon.png -resize 192x192 icon-192.png
convert icon.png -resize 512x512 icon-512.png
convert icon.png -resize 180x180 apple-touch-icon.png
convert icon.png -resize 152x152 apple-touch-icon-152x152.png
convert icon.png -resize 150x150 mstile-150x150.png

# Create favicon.ico (multi-size)
convert icon.png -resize 16x16 favicon-16.png
convert icon.png -resize 32x32 favicon-32.png
convert favicon-16.png favicon-32.png favicon.ico
```

## After generating the favicons:

1. Place all generated files in your /public folder
2. Keep your existing icon.png, hero.png, splash.png (needed for minikit)
3. Test your favicons at https://realfavicongenerator.net/favicon_checker

## Screenshot Images:

Create these in /public/images/:

- screenshot1.png (1280x720) - Your trading interface
- screenshot2.png (1280x720) - Token selection screen
- screenshot3.png (1280x720) - Portfolio or protocol page

These are referenced in your minikit config and will be used for app store listings and social sharing.
