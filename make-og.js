const sharp = require('sharp');
const fs = require('fs');

async function main() {
    // Social share image
    await sharp('assets/og-image.svg', { density: 150 })
        .resize(1200, 630)
        .png()
        .toFile('assets/og-image.png');
    console.log('assets/og-image.png', Math.round(fs.statSync('assets/og-image.png').size / 1024) + 'KB');

    // PWA icons
    for (const size of [192, 512]) {
        await sharp('assets/icon.svg', { density: 200 })
            .resize(size, size)
            .png()
            .toFile(`assets/icon-${size}.png`);
        console.log(`assets/icon-${size}.png`, Math.round(fs.statSync(`assets/icon-${size}.png`).size / 1024) + 'KB');
    }

    // Apple touch icon (180)
    await sharp('assets/icon.svg', { density: 200 })
        .resize(180, 180)
        .png()
        .toFile('assets/apple-touch-icon.png');
    console.log('assets/apple-touch-icon.png done');
}

main().catch(e => console.error('FAILED:', e.message));
