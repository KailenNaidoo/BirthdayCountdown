// Birthday date: July 23, 2026 at midnight
const BIRTHDAY = new Date('2026-07-23T00:00:00');

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

// Calculate a reasonable start date for progress (e.g., 30 days before)
const TOTAL_COUNTDOWN_DAYS = 365; // 1 year countdown
const START_DATE = new Date(BIRTHDAY.getTime() - TOTAL_COUNTDOWN_DAYS * 24 * 60 * 60 * 1000);

function updateCountdown() {
    const now = new Date();
    const diff = BIRTHDAY - now;

    if (diff <= 0) {
        // It's the birthday!
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

    // Animate on change
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
    progressText.textContent = `${progress.toFixed(2)}% of the way there!`;
}

function updateWithFlip(element, newValue, key) {
    if (prevValues[key] !== newValue) {
        element.textContent = newValue;
        element.classList.add('flip');
        setTimeout(() => element.classList.remove('flip'), 500);
        prevValues[key] = newValue;
    }
}

// Confetti burst on birthday
function launchConfetti() {
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confetti = [];
    const colors = ['#ff6b9d', '#c44dff', '#ffd93d', '#4dff88', '#4dc9ff', '#ff4d6d'];

    for (let i = 0; i < 200; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: Math.random() * 10 + 5,
            h: Math.random() * 6 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 3 + 2,
            angle: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.2,
            drift: (Math.random() - 0.5) * 2
        });
    }

    function animateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = false;

        confetti.forEach(c => {
            c.y += c.speed;
            c.x += c.drift;
            c.angle += c.spin;

            if (c.y < canvas.height + 50) {
                active = true;
                ctx.save();
                ctx.translate(c.x, c.y);
                ctx.rotate(c.angle);
                ctx.fillStyle = c.color;
                ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
                ctx.restore();
            }
        });

        if (active) {
            requestAnimationFrame(animateConfetti);
        }
    }

    animateConfetti();
}

// Particle background
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

            // Wrap around
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

// Initialize
initParticles();
updateCountdown();
setInterval(updateCountdown, 1000);

// Add sparkle effect on mouse move
document.addEventListener('mousemove', (e) => {
    if (Math.random() > 0.92) {
        createSparkle(e.clientX, e.clientY);
    }
});

function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 6px;
        height: 6px;
        background: ${['#ff6b9d', '#c44dff', '#ffd93d'][Math.floor(Math.random() * 3)]};
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        animation: sparkle-fade 0.8s ease forwards;
    `;
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 800);
}

// Add sparkle animation
const style = document.createElement('style');
style.textContent = `
    @keyframes sparkle-fade {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(0) translateY(-20px); opacity: 0; }
    }
`;
document.head.appendChild(style);
