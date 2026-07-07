// Generates a sample secret.enc.json compatible with the browser's Web Crypto decryption.
// Run: node make-sample.js
// Sample passphrase: test123
const crypto = require('crypto');
const fs = require('fs');

const PASSPHRASE = 'test123';
const ITERATIONS = 250000;

// Tiny colored SVG placeholder "photos" as data URLs
function svgPhoto(color, label) {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${color}'/><stop offset='1' stop-color='#c44dff'/></linearGradient></defs><rect width='400' height='300' fill='url(#g)'/><text x='50%' y='50%' fill='white' font-family='sans-serif' font-size='28' text-anchor='middle' dominant-baseline='middle'>${label}</text></svg>`;
    return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

const payload = {
    letter: `<p>Dear Nireshnee,</p>
<p>This is the <em>real</em> hidden letter — it was encrypted and could only be revealed with the secret passphrase. Nobody could read it just by snooping the files. 🔐</p>
<p>When you replace this sample with the real thing, your heartfelt words will be safe here, waiting just for you.</p>
<p class="letter-sign">With all my love,<br><span class="letter-signature">Forever yours 💖</span></p>`,
    photos: [
        { caption: 'Our first memory together', data: svgPhoto('#ff6b9d', 'Photo 1') },
        { caption: "That time we couldn't stop laughing", data: svgPhoto('#4dc9ff', 'Photo 2') },
        { caption: 'Adventures with you', data: svgPhoto('#ffd93d', 'Photo 3') },
        { caption: 'My favorite smile', data: svgPhoto('#4dffb8', 'Photo 4') }
    ]
};

const plaintext = Buffer.from(JSON.stringify(payload), 'utf8');
const salt = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);

const key = crypto.pbkdf2Sync(Buffer.from(PASSPHRASE, 'utf8'), salt, ITERATIONS, 32, 'sha256');

const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
const tag = cipher.getAuthTag();
// Web Crypto expects ciphertext with tag appended
const data = Buffer.concat([encrypted, tag]);

const output = {
    v: 1,
    iterations: ITERATIONS,
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    data: data.toString('base64')
};

fs.writeFileSync('secret.enc.json', JSON.stringify(output));
console.log('Wrote secret.enc.json (sample). Passphrase: ' + PASSPHRASE);
