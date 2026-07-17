document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('constellationCanvas');
    const ctx = canvas.getContext('2d');
    const body = document.body;

    let particles = [];
    let particleCount = 70;
    const connectionDistance = 120;
    
    // Mouse interaction tracker
    const mouse = {
        x: null,
        y: null,
        active: false,
        radius: 150
    };

    // Adapt particle count for mobile screens to guarantee high FPS performance
    function initSettings() {
        if (window.innerWidth < 768) {
            particleCount = 35;
        } else {
            particleCount = 75;
        }
    }

    // Set canvas dimensions
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    }

    // Particle representation
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            // Slow, professional float speeds
            this.vx = (Math.random() - 0.5) * 0.35;
            this.vy = (Math.random() - 0.5) * 0.35;
            this.radius = Math.random() * 1.8 + 1; // 1px to 2.8px
            this.baseAlpha = Math.random() * 0.35 + 0.15; // 0.15 to 0.5
            this.alpha = this.baseAlpha;
            // 70% gold, 30% white nodes
            this.isGold = Math.random() < 0.7;
            this.color = this.isGold ? '201, 168, 106' : '255, 255, 255';
        }

        update() {
            // Magnetic drift towards mouse cursor
            if (mouse.active && window.innerWidth >= 768) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.hypot(dx, dy);
                if (dist < mouse.radius) {
                    // Soft attraction pull force
                    const force = (mouse.radius - dist) / mouse.radius;
                    this.x += (dx / dist) * force * 0.4;
                    this.y += (dy / dist) * force * 0.4;
                }
            }

            // Normal floating movement
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off boundary edges with velocity reversal
            if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

            // Clamp positions to avoid sticking outside screens
            if (this.x < 0) this.x = 0;
            if (this.x > canvas.width) this.x = canvas.width;
            if (this.y < 0) this.y = 0;
            if (this.y > canvas.height) this.y = canvas.height;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            // Draw particle with subtle glow on gold ones
            ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
            if (this.isGold) {
                ctx.shadowBlur = 8;
                ctx.shadowColor = `rgba(${this.color}, 0.5)`;
            }
            ctx.fill();
            ctx.shadowBlur = 0; // Reset shadow for line performance
        }
    }

    function initParticles() {
        particles = [];
        initSettings();
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    // Connect particles near each other
    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];

            // Connect particles to mouse cursor
            if (mouse.active && window.innerWidth >= 768) {
                const dx = mouse.x - p1.x;
                const dy = mouse.y - p1.y;
                const dist = Math.hypot(dx, dy);
                if (dist < mouse.radius) {
                    const lineOpacity = (1 - dist / mouse.radius) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(201, 168, 106, ${lineOpacity})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }

            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.hypot(dx, dy);

                if (dist < connectionDistance) {
                    const lineOpacity = (1 - dist / connectionDistance) * 0.18;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    
                    // Connection line color blends
                    if (p1.isGold && p2.isGold) {
                        ctx.strokeStyle = `rgba(201, 168, 106, ${lineOpacity})`;
                    } else {
                        ctx.strokeStyle = `rgba(255, 255, 255, ${lineOpacity * 0.6})`;
                    }
                    
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    // Animation Loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw constellation lines first, then nodes on top
        drawConnections();
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animate);
    }

    // Listeners for mouse tracking
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
        
        // Update glow background position too (original feature fallback)
        const xPercent = (e.clientX / window.innerWidth) * 100;
        const yPercent = (e.clientY / window.innerHeight) * 100;
        const glowBg = document.getElementById('glowBg');
        if (glowBg) {
            glowBg.style.setProperty('--glow-x', `${xPercent}%`);
            glowBg.style.setProperty('--glow-y', `${yPercent}%`);
        }
        if (!body.classList.contains('mouse-active')) {
            body.classList.add('mouse-active');
        }
    });

    window.addEventListener('mouseleave', () => {
        mouse.active = false;
        body.classList.remove('mouse-active');
        const glowBg = document.getElementById('glowBg');
        if (glowBg) {
            glowBg.style.removeProperty('--glow-x');
            glowBg.style.removeProperty('--glow-y');
        }
    });

    // Handle orientation and resizing
    window.addEventListener('resize', () => {
        clearTimeout(window.resizeTimer);
        window.resizeTimer = setTimeout(() => {
            resizeCanvas();
        }, 150);
    });

    // Start constellation rendering
    resizeCanvas();
    animate();
});
