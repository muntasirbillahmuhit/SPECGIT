/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const SOURCE_ICON = path.resolve('assets/icon.png');
const BACKGROUND_COLOR = '#010403'; // Sampled background color from source icon

async function main() {
  if (!fs.existsSync(SOURCE_ICON)) {
    console.error(`Error: Source icon not found at ${SOURCE_ICON}`);
    process.exit(1);
  }

  console.log(`Using source icon: ${SOURCE_ICON}`);
  const sourceBuffer = fs.readFileSync(SOURCE_ICON);

  // 1. Generate Web / PWA Icons
  const publicDir = path.resolve('public');
  fs.mkdirSync(publicDir, { recursive: true });

  console.log('Generating Web / PWA icons...');
  await sharp(sourceBuffer).resize(16, 16).toFile(path.join(publicDir, 'favicon-16.png'));
  await sharp(sourceBuffer).resize(32, 32).toFile(path.join(publicDir, 'favicon-32.png'));
  await sharp(sourceBuffer).resize(48, 48).toFile(path.join(publicDir, 'favicon-48.png'));
  await sharp(sourceBuffer).resize(48, 48).toFile(path.join(publicDir, 'favicon.ico'));
  await sharp(sourceBuffer).resize(180, 180).toFile(path.join(publicDir, 'apple-touch-icon.png'));
  await sharp(sourceBuffer).resize(192, 192).toFile(path.join(publicDir, 'icon-192.png'));
  await sharp(sourceBuffer).resize(512, 512).toFile(path.join(publicDir, 'icon-512.png'));

  // Maskable PWA icon (artwork in center ~80% safe zone with background padding)
  const innerSize = Math.round(512 * 0.8); // ~410px
  const innerMaskable = await sharp(sourceBuffer).resize(innerSize, innerSize).toBuffer();
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: BACKGROUND_COLOR,
    },
  })
    .composite([{ input: innerMaskable, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'icon-maskable-512.png'));

  console.log('  Web / PWA icons generated in /public.');

  // 2. Generate Android Icons (if Android project directory exists)
  const androidResDir = path.resolve('android/app/src/main/res');
  if (fs.existsSync(path.resolve('android'))) {
    console.log('Android project detected. Generating Android adaptive and legacy mipmaps...');
    fs.mkdirSync(androidResDir, { recursive: true });

    const densities = [
      { folder: 'mipmap-mdpi', iconSize: 48, fgCanvasSize: 108 },
      { folder: 'mipmap-hdpi', iconSize: 72, fgCanvasSize: 162 },
      { folder: 'mipmap-xhdpi', iconSize: 96, fgCanvasSize: 216 },
      { folder: 'mipmap-xxhdpi', iconSize: 144, fgCanvasSize: 324 },
      { folder: 'mipmap-xxxhdpi', iconSize: 192, fgCanvasSize: 432 },
    ];

    for (const { folder, iconSize, fgCanvasSize } of densities) {
      const targetDir = path.join(androidResDir, folder);
      fs.mkdirSync(targetDir, { recursive: true });

      // Legacy ic_launcher.png and ic_launcher_round.png
      await sharp(sourceBuffer).resize(iconSize, iconSize).png().toFile(path.join(targetDir, 'ic_launcher.png'));
      await sharp(sourceBuffer).resize(iconSize, iconSize).png().toFile(path.join(targetDir, 'ic_launcher_round.png'));

      // Adaptive ic_launcher_foreground.png (artwork in ~66% safe zone center)
      const fgArtSize = Math.round(fgCanvasSize * 0.66);
      const resizedArt = await sharp(sourceBuffer).resize(fgArtSize, fgArtSize).toBuffer();

      await sharp({
        create: {
          width: fgCanvasSize,
          height: fgCanvasSize,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
      })
        .composite([{ input: resizedArt, gravity: 'center' }])
        .png()
        .toFile(path.join(targetDir, 'ic_launcher_foreground.png'));

      console.log(`  -> Generated ${folder} (legacy: ${iconSize}px, foreground: ${fgCanvasSize}px)`);
    }

    // Play Store 512x512 icon
    const drawableDir = path.join(androidResDir, 'drawable');
    fs.mkdirSync(drawableDir, { recursive: true });
    await sharp(sourceBuffer).resize(512, 512).png().toFile(path.join(drawableDir, 'ic_launcher_playstore.png'));
    await sharp(sourceBuffer).resize(512, 512).png().toFile(path.join(drawableDir, 'ic_launcher_web.png'));

    // Adaptive icon XMLs
    const anyDpiDir = path.join(androidResDir, 'mipmap-anydpi-v26');
    fs.mkdirSync(anyDpiDir, { recursive: true });

    const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`;
    fs.writeFileSync(path.join(anyDpiDir, 'ic_launcher.xml'), adaptiveXml, 'utf-8');
    fs.writeFileSync(path.join(anyDpiDir, 'ic_launcher_round.xml'), adaptiveXml, 'utf-8');

    // Values background color
    const valuesDir = path.join(androidResDir, 'values');
    fs.mkdirSync(valuesDir, { recursive: true });
    const colorsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">${BACKGROUND_COLOR}</color>
</resources>
`;
    fs.writeFileSync(path.join(valuesDir, 'ic_launcher_background.xml'), colorsXml, 'utf-8');

    // Splash screens
    const splashDirs = [
      'drawable',
      'drawable-land-mdpi',
      'drawable-land-hdpi',
      'drawable-land-xhdpi',
      'drawable-land-xxhdpi',
      'drawable-land-xxxhdpi',
      'drawable-port-mdpi',
      'drawable-port-hdpi',
      'drawable-port-xhdpi',
      'drawable-port-xxhdpi',
      'drawable-port-xxxhdpi',
    ];
    for (const sDir of splashDirs) {
      const dPath = path.join(androidResDir, sDir);
      fs.mkdirSync(dPath, { recursive: true });
      await sharp(sourceBuffer).resize(480, 480).png().toFile(path.join(dPath, 'splash.png'));
    }

    console.log('  Android assets complete.');
  }

  // 3. Keep resources/ folder in sync
  const resourcesDir = path.resolve('resources');
  fs.mkdirSync(resourcesDir, { recursive: true });
  await sharp(sourceBuffer).resize(1024, 1024).png().toFile(path.join(resourcesDir, 'icon.png'));
  await sharp(sourceBuffer).resize(1024, 1024).png().toFile(path.join(resourcesDir, 'icon-only.png'));
  await sharp(sourceBuffer).resize(1024, 1024).png().toFile(path.join(resourcesDir, 'icon-foreground.png'));
  await sharp(sourceBuffer).resize(1024, 1024).png().toFile(path.join(resourcesDir, 'splash.png'));

  console.log('All icon assets processed successfully from assets/icon.png!');
}

main().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
