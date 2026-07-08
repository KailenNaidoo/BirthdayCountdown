// Birthday date: July 23, 2026 at midnight
const BIRTHDAY = new Date('2026-07-23T00:00:00');
const NAME = 'Nireshnee';

// Elements
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const progressFill = document.getElementById('progress-fill');
const progressGlow = document.getElementById('progress-glow');
const progressText = document.getElementById('progress-text');
const celebration = document.getElementById('celebration');
const countdown = document.getElementById('countdown');
const cakeSection = document.getElementById('cake-section');

// Store previous values for flip animation
let prevValues = { days: '', hours: '', minutes: '', seconds: '' };

// Decrypted secret content (letter, photos, reasons, timeline, secretNote, eggMessages)
let secretData = null;

// Calculate a reasonable start date for progress
const TOTAL_COUNTDOWN_DAYS = 365;
const START_DATE = new Date(BIRTHDAY.getTime() - TOTAL_COUNTDOWN_DAYS * 24 * 60 * 60 * 1000);

// ============ MUSIC SYSTEM (Web Audio API) ============
let audioContext = null;
let isPlaying = false;
let musicTimeout = null;
let currentNotes = [];

// Happy Birthday melody notes (frequency, duration pairs)
const HAPPY_BIRTHDAY_MELODY = [
    // "Happy birthday to you"
    { freq: 264, dur: 0.3 }, { freq: 264, dur: 0.15 }, { freq: 297, dur: 0.5 },
    { freq: 264, dur: 0.5 }, { freq: 352, dur: 0.5 }, { freq: 330, dur: 0.9 },
    // "Happy birthday to you"
    { freq: 264, dur: 0.3 }, { freq: 264, dur: 0.15 }, { freq: 297, dur: 0.5 },
    { freq: 264, dur: 0.5 }, { freq: 396, dur: 0.5 }, { freq: 352, dur: 0.9 },
    // "Happy birthday dear Nireshnee"
    { freq: 264, dur: 0.3 }, { freq: 264, dur: 0.15 }, { freq: 528, dur: 0.5 },
    { freq: 440, dur: 0.5 }, { freq: 352, dur: 0.4 }, { freq: 330, dur: 0.4 },
    { freq: 297, dur: 0.8 },
    // "Happy birthday to you"
    { freq: 470, dur: 0.3 }, { freq: 470, dur: 0.15 }, { freq: 440, dur: 0.5 },
    { freq: 352, dur: 0.5 }, { freq: 396, dur: 0.5 }, { freq: 352, dur: 0.9 },
];

// Ambient dreamy melody for countdown mode
const AMBIENT_MELODY = [
    { freq: 392, dur: 1.2 }, { freq: 440, dur: 0.8 }, { freq: 523, dur: 1.5 },
    { freq: 494, dur: 1.0 }, { freq: 440, dur: 1.2 }, { freq: 392, dur: 0.8 },
    { freq: 349, dur: 1.5 }, { freq: 330, dur: 1.0 }, { freq: 294, dur: 1.2 },
    { freq: 330, dur: 0.8 }, { freq: 392, dur: 1.5 }, { freq: 349, dur: 1.0 },
    { freq: 330, dur: 1.2 }, { freq: 294, dur: 0.8 }, { freq: 262, dur: 2.0 },
    { freq: 0, dur: 1.0 }, // rest
    { freq: 330, dur: 1.2 }, { freq: 392, dur: 0.8 }, { freq: 440, dur: 1.5 },
    { freq: 523, dur: 1.0 }, { freq: 494, dur: 1.2 }, { freq: 440, dur: 0.8 },
    { freq: 523, dur: 2.0 }, { freq: 0, dur: 0.5 },
    { freq: 392, dur: 1.0 }, { freq: 440, dur: 1.0 }, { freq: 494, dur: 1.5 },
    { freq: 440, dur: 1.2 }, { freq: 392, dur: 1.5 }, { freq: 0, dur: 1.5 },
];

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

function playNote(freq, startTime, duration, type = 'sine', volume = 0.12) {
    if (!audioContext || freq === 0) return;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    // Soft filter for dreamy sound
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, startTime);

    // Envelope
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.05);
    gain.gain.setValueAtTime(volume, startTime + duration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);

    currentNotes.push(osc);
}

function playChord(freqs, startTime, duration, volume = 0.06) {
    freqs.forEach(f => playNote(f, startTime, duration, 'sine', volume));
}

function playMelody(loop = true) {
    if (!audioContext) return;

    const now = audioContext.currentTime;
    const isBirthday = BIRTHDAY - new Date() <= 0;
    const melody = isBirthday ? HAPPY_BIRTHDAY_MELODY : AMBIENT_MELODY;
    const tempo = isBirthday ? 1.0 : 1.8;

    let time = now + 0.1;

    melody.forEach(note => {
        if (note.freq > 0) {
            // Main melody
            playNote(note.freq, time, note.dur * tempo, 'sine', 0.12);
            // Soft harmony (fifth above, quieter)
            playNote(note.freq * 1.5, time, note.dur * tempo, 'sine', 0.04);
            // Sub bass
            playNote(note.freq / 2, time, note.dur * tempo, 'sine', 0.05);
        }
        time += note.dur * tempo;
    });

    // Loop
    if (loop && isPlaying) {
        const totalDur = melody.reduce((sum, n) => sum + n.dur * tempo, 0);
        musicTimeout = setTimeout(() => {
            if (isPlaying) playMelody(true);
        }, totalDur * 1000);
    }
}

function toggleMusic() {
    if (!isPlaying) {
        initAudio();
        isPlaying = true;
        playMelody(true);
    } else {
        isPlaying = false;
        if (musicTimeout) clearTimeout(musicTimeout);
        currentNotes.forEach(osc => {
            try { osc.stop(); } catch (e) {}
        });
        currentNotes = [];
    }
}

// ============ COUNTDOWN ============
const TEST_MODE = new URLSearchParams(window.location.search).has('test');

function updateCountdown() {
    const now = new Date();
    const diff = BIRTHDAY - now;

    if (diff <= 0 || TEST_MODE) {
        countdown.classList.add('hidden');
        cakeSection.classList.add('hidden');
        document.querySelector('.progress-section').classList.add('hidden');
        celebration.classList.remove('hidden');
        document.title = '🎉 Happy Birthday Nireshnee! 🎂';
        unlockSections();
        launchConfetti();
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const daysStr = String(days).padStart(2, '0');
    const hoursStr = String(hours).padStart(2, '0');
    const minutesStr = String(minutes).padStart(2, '0');
    const secondsStr = String(seconds).padStart(2, '0');

    updateWithFlip(daysEl, daysStr, 'days');
    updateWithFlip(hoursEl, hoursStr, 'hours');
    updateWithFlip(minutesEl, minutesStr, 'minutes');
    updateWithFlip(secondsEl, secondsStr, 'seconds');

    // Live countdown in the browser tab
    document.title = `${days}d ${hoursStr}h ${minutesStr}m · Nireshnee's Birthday 🎂`;

    // Update progress
    const totalDuration = BIRTHDAY - START_DATE;
    const elapsed = now - START_DATE;
    const progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);

    progressFill.style.width = progress + '%';
    progressGlow.style.left = `calc(${progress}% - 20px)`;
    progressText.textContent = `${progress.toFixed(2)}% of the way to Nireshnee's special day!`;

    // Milestone celebrations
    checkMilestones(diff);
}

// ============ COUNTDOWN MILESTONES ============
// Fires a celebration when the countdown crosses each of these thresholds.
const MILESTONES = [
    { id: 'week',  secs: 7 * 24 * 60 * 60, msg: '🎉 One week to go, Nireshnee!' },
    { id: 'day',   secs: 24 * 60 * 60,     msg: '🥳 Just 24 hours to go!' },
    { id: 'five',  secs: 5 * 60 * 60,      msg: '✨ Only 5 hours left!' },
    { id: 'hour',  secs: 60 * 60,          msg: '💖 1 hour to go — almost time!' }
];

let firstMilestoneCheck = true;

function milestoneFired(id) {
    try { return localStorage.getItem('nireshnee-ms-' + id) === '1'; }
    catch (e) { return false; }
}
function markMilestone(id) {
    try { localStorage.setItem('nireshnee-ms-' + id, '1'); } catch (e) {}
}

function checkMilestones(diffMs) {
    const remainingSec = diffMs / 1000;
    MILESTONES.forEach(m => {
        if (milestoneFired(m.id)) return;
        if (remainingSec <= m.secs) {
            markMilestone(m.id);
            // On first load, silently mark ones already passed (don't ping)
            if (!firstMilestoneCheck) showMilestone(m.msg);
        }
    });
    firstMilestoneCheck = false;
}

function showMilestone(message) {
    const banner = document.createElement('div');
    banner.className = 'milestone-banner';
    banner.innerHTML = `<span class="milestone-text">${message}</span>`;
    document.body.appendChild(banner);

    if (window.__fireworkBurst) window.__fireworkBurst(4);
    if (typeof playChime === 'function') playChime();

    setTimeout(() => banner.classList.add('leaving'), 4500);
    setTimeout(() => banner.remove(), 5100);
}

// ============ UNLOCK + DECRYPTION ============
let sectionsUnlocked = false;

function unlockSections() {
    if (sectionsUnlocked) return;
    sectionsUnlocked = true;

    const wrapper = document.getElementById('locked-sections');
    const gate = document.getElementById('passphrase-gate');

    // Reveal the passphrase gate
    setTimeout(() => {
        wrapper.classList.remove('hidden');
        gate.classList.remove('hidden');
        gate.querySelector('.gate-inner').classList.add('visible');
        const input = document.getElementById('passphrase-input');
        if (input) input.focus();
    }, 1500);
}

// Convert base64 to ArrayBuffer
function base64ToBuf(b64) {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes.buffer;
}

async function decryptContent(passphrase) {
    const res = await fetch('secret.enc.json?v=' + Date.now());
    if (!res.ok) throw new Error('Could not load encrypted content.');
    const payload = await res.json();

    const salt = base64ToBuf(payload.salt);
    const iv = base64ToBuf(payload.iv);
    const data = base64ToBuf(payload.data);
    const iterations = payload.iterations || 250000;

    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']
    );
    const key = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
    );

    // Throws if passphrase is wrong (auth tag mismatch)
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
    const json = new TextDecoder().decode(plaintext);
    return JSON.parse(json);
}

function renderSecretContent(content) {
    secretData = content;
    // ---- Letter ----
    const letterContent = document.getElementById('letter-content');
    letterContent.innerHTML = `
        <div class="letter">
            <h3 class="letter-heading">💌 Dear Nireshnee,</h3>
            <div class="letter-body">${content.letter || ''}</div>
        </div>
    `;

    // ---- Reasons ticker ----
    const reasons = content.reasons && content.reasons.length ? content.reasons : [];
    const reasonsContent = document.getElementById('reasons-content');
    if (reasons.length) {
        // Duplicate list for seamless scroll
        const items = reasons.concat(reasons);
        reasonsContent.innerHTML = `
            <h3 class="section-heading">💖 Reasons I Adore You</h3>
            <div class="ticker">
                <div class="ticker-track">
                    ${items.map(r => `<span class="ticker-item">${r}</span>`).join('')}
                </div>
            </div>
        `;
    }

    // ---- Memory timeline ----
    const timeline = content.timeline && content.timeline.length ? content.timeline : [];
    const timelineContent = document.getElementById('timeline-content');
    if (timeline.length) {
        timelineContent.innerHTML = `
            <h3 class="section-heading">📖 Our Story So Far</h3>
            <div class="timeline">
                ${timeline.map((t, i) => `
                    <div class="timeline-item ${i % 2 === 0 ? 'left' : 'right'}">
                        <div class="timeline-dot"></div>
                        <div class="timeline-card">
                            <span class="timeline-date">${t.date || ''}</span>
                            <h4 class="timeline-title">${t.title || ''}</h4>
                            <p class="timeline-text">${t.text || ''}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // ---- Photos ----
    const photoContent = document.getElementById('photo-content');
    let galleryHTML = `
        <h3 class="section-heading">📸 Our Memories Together</h3>
        <p class="gallery-subtext">Every photo tells a story of us ✨</p>
        <div class="photo-gallery">
    `;
    (content.photos || []).forEach(photo => {
        galleryHTML += `
            <div class="photo-card">
                <img src="${photo.data}" alt="${(photo.caption || '').replace(/"/g, '&quot;')}">
                <p class="photo-caption">${photo.caption || ''}</p>
            </div>
        `;
    });
    galleryHTML += '</div>';
    photoContent.innerHTML = galleryHTML;

    // ---- Interactive features (generic, no secret content) ----
    renderCandleBlow();
    renderWishJar();
    initEasterEgg();

    // ---- Reveal all sections with a staggered cascade ----
    const sections = [
        'letter-section',
        reasons.length ? 'reasons-section' : null,
        timeline.length ? 'timeline-section' : null,
        'photo-section',
        'candle-section',
        'wishjar-section'
    ].filter(Boolean);

    sections.forEach((id, i) => {
        setTimeout(() => {
            const sec = document.getElementById(id);
            sec.classList.remove('hidden');
            sec.querySelector('.unlocked-content').classList.add('visible');
        }, i * 500);
    });
}

function setupPassphraseGate() {
    const unlockBtn = document.getElementById('unlock-btn');
    const input = document.getElementById('passphrase-input');
    const errorEl = document.getElementById('gate-error');
    const gate = document.getElementById('passphrase-gate');

    async function attempt() {
        const passphrase = input.value.trim();
        if (!passphrase) return;

        unlockBtn.disabled = true;
        unlockBtn.textContent = 'Unlocking...';
        errorEl.classList.add('hidden');

        try {
            const content = await decryptContent(passphrase);
            // Success — hide gate and reveal content
            gate.classList.add('unlocking');
            setTimeout(() => {
                gate.classList.add('hidden');
                renderSecretContent(content);
            }, 1000);
        } catch (err) {
            // Wrong passphrase or decode failure
            unlockBtn.disabled = false;
            unlockBtn.textContent = 'Unlock 💖';
            errorEl.classList.remove('hidden');
            // retrigger shake animation
            errorEl.style.animation = 'none';
            void errorEl.offsetWidth;
            errorEl.style.animation = '';
            input.value = '';
            input.focus();
        }
    }

    unlockBtn.addEventListener('click', attempt);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') attempt();
    });
}

// ============ BLOW OUT THE CANDLES ============
function renderCandleBlow() {
    const el = document.getElementById('candle-content');
    el.innerHTML = `
        <h3 class="section-heading">🎂 Make a Wish</h3>
        <p class="gallery-subtext">Blow out the candles — click them, or use the mic and actually blow!</p>
        <div class="big-cake" id="big-cake">
            <div class="candles-row" id="candles-row">
                ${[0,1,2,3,4].map(i => `
                    <div class="big-candle" data-lit="1">
                        <div class="big-flame"></div>
                    </div>
                `).join('')}
            </div>
            <div class="big-cake-top"></div>
            <div class="big-cake-mid"></div>
            <div class="big-cake-bottom"></div>
        </div>
        <div class="candle-controls">
            <button class="wish-btn" id="mic-blow-btn">🎤 Blow using mic</button>
        </div>
        <p class="wish-made hidden" id="wish-made">✨ You made a wish! May it come true 💫</p>
    `;

    const candles = el.querySelectorAll('.big-candle');
    const wishMade = document.getElementById('wish-made');

    function extinguish(candle) {
        if (candle.dataset.lit === '0') return;
        candle.dataset.lit = '0';
        candle.classList.add('out');
        const puff = document.createElement('div');
        puff.className = 'smoke-puff';
        candle.appendChild(puff);
        setTimeout(() => puff.remove(), 1000);
        checkAllOut();
    }

    function checkAllOut() {
        const anyLit = Array.from(candles).some(c => c.dataset.lit === '1');
        if (!anyLit) {
            wishMade.classList.remove('hidden');
            launchConfetti();
        }
    }

    candles.forEach(c => c.addEventListener('click', () => extinguish(c)));

    // Mic-based blowing
    const micBtn = document.getElementById('mic-blow-btn');
    micBtn.addEventListener('click', async () => {
        micBtn.disabled = true;
        micBtn.textContent = '🎤 Listening... blow!';
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const ac = new (window.AudioContext || window.webkitAudioContext)();
            const source = ac.createMediaStreamSource(stream);
            const analyser = ac.createAnalyser();
            analyser.fftSize = 512;
            source.connect(analyser);
            const dataArr = new Uint8Array(analyser.frequencyBinCount);

            function detect() {
                analyser.getByteFrequencyData(dataArr);
                let sum = 0;
                for (let i = 0; i < 30; i++) sum += dataArr[i];
                const avg = sum / 30;

                if (avg > 90) {
                    const lit = Array.from(candles).find(c => c.dataset.lit === '1');
                    if (lit) extinguish(lit);
                }

                const stillLit = Array.from(candles).some(c => c.dataset.lit === '1');
                if (stillLit) {
                    requestAnimationFrame(detect);
                } else {
                    stream.getTracks().forEach(t => t.stop());
                    ac.close();
                    micBtn.textContent = '🎉 All blown out!';
                }
            }
            detect();
        } catch (err) {
            micBtn.disabled = false;
            micBtn.textContent = '🎤 Mic blocked — click candles instead';
        }
    });
}

// ============ WISH JAR ============
// To let people SEND wishes to you: create a free form at https://formspree.io,
// then paste your endpoint URL below (e.g. 'https://formspree.io/f/abcdwxyz').
// Leave blank to just collect wishes locally.
const WISH_ENDPOINT = '';

// Fallback wish shown if wishes.json can't be loaded
const FALLBACK_WISHES = [
    {
        from: 'Prenell',
        paragraphs: ['Happy Birthday Cupcake! 🥳🧁❤️ Wishing you a day as wonderful as you are. 💖']
    }
];

function renderFeaturedWish(w) {
    const paras = w.paragraphs || (w.message ? [w.message] : []);
    return `
        <div class="featured-wish">
            ${paras.map((p, i) => `<p class="${i === 0 ? 'featured-wish-open' : ''}">${p}</p>`).join('')}
            ${w.from ? `<p class="featured-wish-from">— ${w.from}</p>` : ''}
        </div>
    `;
}

function renderWishJar() {
    const el = document.getElementById('wishjar-content');

    el.innerHTML = `
        <h3 class="section-heading">🫙 Birthday Wish Jar</h3>
        <p class="gallery-subtext">Wishes from people who love you 💌</p>
        <div class="featured-wishes" id="featured-wishes"></div>
        <div class="wish-form">
            <input type="text" id="wish-name" class="wish-name-input" placeholder="Your name" maxlength="40">
            <input type="text" id="wish-input" placeholder="Write a birthday wish..." maxlength="500">
            <button class="wish-btn" id="wish-submit">Send Wish ✨</button>
        </div>
        <p class="wish-status hidden" id="wish-status"></p>
        <div class="wish-jar" id="wish-jar"></div>
    `;

    const featured = document.getElementById('featured-wishes');
    const jar = document.getElementById('wish-jar');
    const nameInput = document.getElementById('wish-name');
    const input = document.getElementById('wish-input');
    const submit = document.getElementById('wish-submit');
    const status = document.getElementById('wish-status');

    // Load baked-in wishes from wishes.json
    fetch('wishes.json?v=' + Date.now())
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => {
            const wishes = (data && data.wishes && data.wishes.length) ? data.wishes : FALLBACK_WISHES;
            featured.innerHTML = wishes.map(renderFeaturedWish).join('');
        })
        .catch(() => {
            featured.innerHTML = FALLBACK_WISHES.map(renderFeaturedWish).join('');
        });

    const STORAGE_KEY = 'nireshnee-birthday-wishes';
    const colors = ['#ff6b9d', '#c44dff', '#ffd93d', '#4dffb8', '#4dc9ff'];

    function loadWishes() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
        catch (e) { return []; }
    }
    function saveWishes(wishes) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes)); } catch (e) {}
    }

    function addBubble(text, animate) {
        const bubble = document.createElement('div');
        bubble.className = 'wish-bubble';
        bubble.textContent = text;
        bubble.style.background = colors[Math.floor(Math.random() * colors.length)] + '33';
        bubble.style.borderColor = colors[Math.floor(Math.random() * colors.length)] + '66';
        if (animate) bubble.classList.add('rising');
        jar.appendChild(bubble);
    }

    // Render this visitor's own previously-submitted wishes
    loadWishes().forEach(w => addBubble(w, false));

    function showStatus(msg) {
        status.textContent = msg;
        status.classList.remove('hidden');
    }

    async function submitWish() {
        const name = nameInput.value.trim();
        const text = input.value.trim();
        if (!text) return;

        const display = name ? `${text} — ${name}` : text;

        // Instant local confirmation
        const wishes = loadWishes();
        wishes.push(display);
        saveWishes(wishes);
        addBubble(display, true);
        input.value = '';
        nameInput.value = '';

        // Sparkle burst
        for (let i = 0; i < 8; i++) {
            setTimeout(() => createSparkle(
                jar.getBoundingClientRect().left + Math.random() * jar.offsetWidth,
                jar.getBoundingClientRect().top + Math.random() * 60
            ), i * 40);
        }

        // Send to be baked in
        if (WISH_ENDPOINT) {
            submit.disabled = true;
            try {
                await fetch(WISH_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ name: name || 'Anonymous', message: text })
                });
                showStatus('Your wish has been sent 💌 It will be added to the jar soon!');
            } catch (e) {
                showStatus('Saved here, but sending failed — check your connection.');
            }
            submit.disabled = false;
        } else {
            showStatus('Wish saved 💖 (Ask Kailen to enable sending so it gets baked in for everyone.)');
        }
    }

    submit.addEventListener('click', submitWish);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') submitWish(); });
    nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') input.focus(); });
}

// ============ EASTER EGG (click title 5x) ============
function initEasterEgg() {
    const title = document.querySelector('.title');
    if (!title || title.dataset.eggBound) return;
    title.dataset.eggBound = '1';
    title.style.cursor = 'pointer';

    let clicks = 0;
    let timer = null;

    title.addEventListener('click', (e) => {
        clicks++;
        clearTimeout(timer);
        timer = setTimeout(() => { clicks = 0; }, 1500);
        if (clicks >= 5) {
            clicks = 0;
            triggerEasterEgg(e.clientX, e.clientY);
        }
    });

    // Faint, easy-to-miss hint that the title is clickable
    setTimeout(() => spawnTitleHint(title), 5000);
    setInterval(() => spawnTitleHint(title), 15000);
}

const DEFAULT_EGG_MESSAGES = [
    'You found it again 💕',
    'Still the most amazing person I know 🥰',
    'Happy Birthday, beautiful ✨',
    'One in a million 💫',
    'You make my world brighter 🌟',
    'Never stop being wonderfully you 💖'
];
const DEFAULT_SECRET_NOTE = "Psst... you found the secret 🤫\n\nOut of everyone in the whole world, it's you. It's always been you. I hope today reminds you how deeply loved you are — not just on your birthday, but every single day.\n\nHappy Birthday, my favourite person. 💖";

let eggTriggerCount = 0;
let eggMsgIndex = 0;

function spawnTitleHint(title) {
    const rect = title.getBoundingClientRect();
    const hint = document.createElement('div');
    hint.className = 'title-hint';
    hint.textContent = '✨';
    hint.style.left = (rect.left + Math.random() * rect.width) + 'px';
    hint.style.top = (rect.top + Math.random() * rect.height) + 'px';
    document.body.appendChild(hint);
    setTimeout(() => hint.remove(), 2000);
}

function playChime() {
    try {
        initAudio();
        if (!audioContext) return;
        const now = audioContext.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((f, i) => {
            playNote(f, now + i * 0.08, 0.5, 'sine', 0.10);
            playNote(f * 2, now + i * 0.08, 0.4, 'sine', 0.03);
        });
    } catch (e) {}
}

function heartExplosion(x, y) {
    const hearts = ['💖', '💕', '💗', '💓', '💞', '❤️', '🥰', '✨', '🌟'];
    const count = 26;
    for (let i = 0; i < count; i++) {
        const heart = document.createElement('div');
        heart.className = 'egg-heart';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];

        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
        const distance = Math.random() * 220 + 120;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        heart.style.left = x + 'px';
        heart.style.top = y + 'px';
        heart.style.fontSize = (Math.random() * 1.4 + 1) + 'rem';
        heart.style.setProperty('--tx', tx + 'px');
        heart.style.setProperty('--ty', ty + 'px');
        heart.style.animationDuration = (Math.random() * 0.5 + 1) + 's';
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 1600);
    }
}

function showEggToast(text) {
    const toast = document.createElement('div');
    toast.className = 'egg-toast';
    toast.textContent = text;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
}

function showSecretNote() {
    if (document.querySelector('.egg-note-overlay')) return;
    const noteText = (secretData && secretData.secretNote) ? secretData.secretNote : DEFAULT_SECRET_NOTE;

    const overlay = document.createElement('div');
    overlay.className = 'egg-note-overlay';
    overlay.innerHTML = `
        <div class="egg-note">
            <div class="egg-note-seal">💌</div>
            <h3 class="egg-note-title">A Secret Just For You</h3>
            <p class="egg-note-text" id="egg-note-text"></p>
            <button class="wish-btn egg-note-close">Close 💖</button>
        </div>
    `;
    document.body.appendChild(overlay);

    const textEl = overlay.querySelector('#egg-note-text');
    let i = 0;
    function type() {
        if (i <= noteText.length) {
            textEl.textContent = noteText.slice(0, i);
            i++;
            const delay = noteText[i - 1] === '\n' ? 180 : 28;
            setTimeout(type, delay);
        }
    }
    type();

    function close() { overlay.classList.add('closing'); setTimeout(() => overlay.remove(), 300); }
    overlay.querySelector('.egg-note-close').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
}

function triggerEasterEgg(x, y) {
    eggTriggerCount++;
    playChime();
    heartExplosion(x, y);

    if (eggTriggerCount === 1) {
        // First discovery: the full typewriter secret note
        setTimeout(showSecretNote, 400);
    } else {
        // Later triggers: playful rotating messages
        const messages = (secretData && secretData.eggMessages && secretData.eggMessages.length)
            ? secretData.eggMessages : DEFAULT_EGG_MESSAGES;
        showEggToast(messages[eggMsgIndex % messages.length]);
        eggMsgIndex++;
    }
}

function updateWithFlip(element, newValue, key) {
    if (prevValues[key] !== newValue) {
        element.textContent = newValue;
        element.classList.add('flip');
        setTimeout(() => element.classList.remove('flip'), 500);
        prevValues[key] = newValue;
    }
}

// ============ CONFETTI ============
function launchConfetti() {
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confetti = [];
    const colors = ['#ff6b9d', '#c44dff', '#ffd93d', '#4dff88', '#4dc9ff', '#ff4d6d', '#ff9a9e'];

    for (let i = 0; i < 300; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: Math.random() * 12 + 4,
            h: Math.random() * 8 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 4 + 2,
            angle: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.3,
            drift: (Math.random() - 0.5) * 3,
            shape: Math.random() > 0.5 ? 'rect' : 'circle'
        });
    }

    function animateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = false;

        confetti.forEach(c => {
            c.y += c.speed;
            c.x += c.drift + Math.sin(c.angle) * 0.5;
            c.angle += c.spin;

            if (c.y < canvas.height + 50) {
                active = true;
                ctx.save();
                ctx.translate(c.x, c.y);
                ctx.rotate(c.angle);
                ctx.fillStyle = c.color;

                if (c.shape === 'circle') {
                    ctx.beginPath();
                    ctx.arc(0, 0, c.w / 2, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
                }
                ctx.restore();
            }
        });

        if (active) {
            requestAnimationFrame(animateConfetti);
        }
    }

    animateConfetti();

    // Launch fireworks show
    if (window.__launchFireworksShow) {
        window.__launchFireworksShow();
    }
}

// ============ PARTICLES ============
function initParticles() {
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 80;

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2 + 0.5,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.5 + 0.1,
            color: ['#ff6b9d', '#c44dff', '#ffd93d'][Math.floor(Math.random() * 3)]
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach((p, i) => {
            p.x += p.speedX;
            p.y += p.speedY;

            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.opacity;
            ctx.fill();

            // Draw connections
            particles.forEach((p2, j) => {
                if (i === j) return;
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    ctx.beginPath();
                    ctx.strokeStyle = p.color;
                    ctx.globalAlpha = (1 - dist / 120) * 0.15;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            });
        });

        ctx.globalAlpha = 1;
        requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });
}

// ============ FLOATING NAME LETTERS ============
function initFloatingLetters() {
    const container = document.createElement('div');
    container.className = 'floating-letters';
    document.body.appendChild(container);

    const letters = NAME.split('');

    function spawnLetter() {
        const letter = document.createElement('span');
        letter.className = 'floating-letter';
        letter.textContent = letters[Math.floor(Math.random() * letters.length)];
        letter.style.left = Math.random() * 100 + '%';
        letter.style.fontSize = (Math.random() * 2 + 1) + 'rem';
        letter.style.animationDuration = (Math.random() * 10 + 12) + 's';
        letter.style.animationDelay = '0s';
        letter.style.color = ['#ff6b9d', '#c44dff', '#ffd93d'][Math.floor(Math.random() * 3)];
        container.appendChild(letter);

        setTimeout(() => letter.remove(), 22000);
    }

    // Spawn letters periodically
    setInterval(spawnLetter, 2000);
    // Initial batch
    for (let i = 0; i < 8; i++) {
        setTimeout(spawnLetter, i * 500);
    }
}

// ============ SHOOTING STARS + FIREWORKS (effects canvas) ============
let fireworksActive = false;

function initEffects() {
    const canvas = document.getElementById('effects');
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const shootingStars = [];
    const fireworkParticles = [];
    const fireworkColors = ['#ff6b9d', '#c44dff', '#ffd93d', '#4dffb8', '#4dc9ff', '#ff4d6d', '#ffffff'];

    function spawnShootingStar() {
        const startX = Math.random() * width;
        const startY = Math.random() * height * 0.5;
        const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.5;
        const speed = Math.random() * 6 + 8;
        shootingStars.push({
            x: startX,
            y: startY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            len: Math.random() * 80 + 60,
            life: 1,
            color: ['#ffffff', '#c9e3ff', '#ffe9b0'][Math.floor(Math.random() * 3)]
        });
    }

    function launchFirework(x, y) {
        const count = 60 + Math.floor(Math.random() * 40);
        const color = fireworkColors[Math.floor(Math.random() * fireworkColors.length)];
        const multiColor = Math.random() > 0.5;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.1;
            const speed = Math.random() * 5 + 2;
            fireworkParticles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: Math.random() * 0.015 + 0.008,
                color: multiColor ? fireworkColors[Math.floor(Math.random() * fireworkColors.length)] : color,
                size: Math.random() * 2 + 1.5
            });
        }
    }

    function animate() {
        // fade trail effect
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(10, 0, 21, 0.15)';
        ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'lighter';

        // Shooting stars
        for (let i = shootingStars.length - 1; i >= 0; i--) {
            const s = shootingStars[i];
            s.x += s.vx;
            s.y += s.vy;
            s.life -= 0.008;

            const tailX = s.x - s.vx * (s.len / 10);
            const tailY = s.y - s.vy * (s.len / 10);
            const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
            grad.addColorStop(0, s.color);
            grad.addColorStop(1, 'transparent');

            ctx.strokeStyle = grad;
            ctx.lineWidth = 2;
            ctx.globalAlpha = Math.max(s.life, 0);
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(tailX, tailY);
            ctx.stroke();

            // star head glow
            ctx.beginPath();
            ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = s.color;
            ctx.fill();

            if (s.life <= 0 || s.x > width + 100 || s.y > height + 100) {
                shootingStars.splice(i, 1);
            }
        }

        // Fireworks
        for (let i = fireworkParticles.length - 1; i >= 0; i--) {
            const p = fireworkParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.04; // gravity
            p.vx *= 0.99;
            p.vy *= 0.99;
            p.life -= p.decay;

            ctx.globalAlpha = Math.max(p.life, 0);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
            ctx.fill();
            ctx.shadowBlur = 0;

            if (p.life <= 0) {
                fireworkParticles.splice(i, 1);
            }
        }

        ctx.globalAlpha = 1;
        requestAnimationFrame(animate);
    }

    animate();

    // Random shooting stars during countdown
    function shootingStarLoop() {
        spawnShootingStar();
        setTimeout(shootingStarLoop, Math.random() * 4000 + 2000);
    }
    setTimeout(shootingStarLoop, 2000);

    // Expose firework launcher
    window.__launchFireworksShow = function () {
        if (fireworksActive) return;
        fireworksActive = true;
        function burst() {
            const x = width * (0.2 + Math.random() * 0.6);
            const y = height * (0.15 + Math.random() * 0.35);
            launchFirework(x, y);
        }
        // Sustained show
        setInterval(burst, 700);
        for (let i = 0; i < 3; i++) setTimeout(burst, i * 250);
    };

    // One-shot burst (for milestones)
    window.__fireworkBurst = function (times) {
        times = times || 4;
        for (let i = 0; i < times; i++) {
            setTimeout(() => {
                const x = width * (0.15 + Math.random() * 0.7);
                const y = height * (0.15 + Math.random() * 0.4);
                launchFirework(x, y);
            }, i * 280);
        }
    };

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });
}

// ============ 3D TILT ON CARDS ============
function initTilt() {
    const cards = document.querySelectorAll('.time-card');

    document.addEventListener('mousemove', (e) => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const rotX = ((e.clientY - cy) / cy) * -6;
        const rotY = ((e.clientX - cx) / cx) * 6;

        cards.forEach(card => {
            card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        });
    });

    // Reset on leave
    document.addEventListener('mouseleave', () => {
        cards.forEach(card => {
            card.style.transform = '';
        });
    });
}

// ============ SPARKLES ============
document.addEventListener('mousemove', (e) => {
    if (Math.random() > 0.9) {
        createSparkle(e.clientX, e.clientY);
    }
});

function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    const colors = ['#ff6b9d', '#c44dff', '#ffd93d', '#4dff88'];
    sparkle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: ${Math.random() * 6 + 4}px;
        height: ${Math.random() * 6 + 4}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        animation: sparkle-fade 1s ease forwards;
        box-shadow: 0 0 6px currentColor;
    `;
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 1000);
}

// Add sparkle animation style
const style = document.createElement('style');
style.textContent = `
    @keyframes sparkle-fade {
        0% { transform: scale(1) rotate(0deg); opacity: 1; }
        50% { transform: scale(1.5) rotate(180deg); opacity: 0.7; }
        100% { transform: scale(0) rotate(360deg) translateY(-30px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// ============ INITIALIZE ============
initParticles();
initEffects();
initTilt();
initFloatingLetters();
setupPassphraseGate();
updateCountdown();
setInterval(updateCountdown, 1000);

// Preview a milestone banner with ?testms in the URL
if (new URLSearchParams(window.location.search).has('testms')) {
    setTimeout(() => showMilestone('✨ Only 5 hours left!'), 1200);
}

// ============ PWA SERVICE WORKER ============
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    });
}
