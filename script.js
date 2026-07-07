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
const musicBtn = document.getElementById('music-btn');
const musicIcon = document.getElementById('music-icon');
const musicText = document.getElementById('music-text');

// Store previous values for flip animation
let prevValues = { days: '', hours: '', minutes: '', seconds: '' };

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
        musicBtn.classList.add('playing');
        musicIcon.textContent = '🎵';
        musicText.textContent = 'Playing';
        playMelody(true);
    } else {
        isPlaying = false;
        musicBtn.classList.remove('playing');
        musicIcon.textContent = '🔇';
        musicText.textContent = 'Play Music';
        if (musicTimeout) clearTimeout(musicTimeout);
        currentNotes.forEach(osc => {
            try { osc.stop(); } catch (e) {}
        });
        currentNotes = [];
    }
}

musicBtn.addEventListener('click', toggleMusic);

// ============ COUNTDOWN ============
function updateCountdown() {
    const now = new Date();
    const diff = BIRTHDAY - now;

    if (diff <= 0) {
        countdown.classList.add('hidden');
        cakeSection.classList.add('hidden');
        document.querySelector('.progress-section').classList.add('hidden');
        celebration.classList.remove('hidden');
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

    // Update progress
    const totalDuration = BIRTHDAY - START_DATE;
    const elapsed = now - START_DATE;
    const progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);

    progressFill.style.width = progress + '%';
    progressGlow.style.left = `calc(${progress}% - 20px)`;
    progressText.textContent = `${progress.toFixed(2)}% of the way to Nireshnee's special day!`;
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

    // Auto-play birthday music
    if (!isPlaying) {
        toggleMusic();
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
initFloatingLetters();
updateCountdown();
setInterval(updateCountdown, 1000);
