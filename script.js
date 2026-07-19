/**
 * FlowFest-Inspired GSAP Animations, Real-Time Sun Pupil Mouse-Tracking,
 * Rainbow Stripe Arcs & Interactive Parallax Polish
 */

document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP Plugins safely
    if (typeof gsap !== 'undefined') {
        if (typeof TextPlugin !== 'undefined') gsap.registerPlugin(TextPlugin);
        if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);
    }

    // ==========================================================================
    // Real-Time Direct CMS Content Sync (Connects editor.html directly to index.html)
    // ==========================================================================
    async function applyLiveContentSync(customData = null) {
        let content = customData;
        if (!content) {
            try {
                const localStr = localStorage.getItem('amr_live_content');
                if (localStr) content = JSON.parse(localStr);
            } catch (err) {}
        }

        if (!content) {
            try {
                const res = await fetch('/api/content');
                if (res.ok) {
                    const payload = await res.json();
                    if (payload && payload.data && Object.keys(payload.data).length > 0) {
                        content = payload.data;
                    }
                }
            } catch (err) {
                try {
                    const fallbackRes = await fetch('/content.json');
                    if (fallbackRes.ok) content = await fallbackRes.json();
                } catch (e) {}
            }
        }

        if (!content) return;

        if (content.displayName) {
            document.querySelectorAll('.display-name').forEach(el => el.innerText = content.displayName);
        }
        if (content.statusText) {
            document.querySelectorAll('.status-text').forEach(el => el.innerText = content.statusText);
        }
        if (content.subbanner) {
            document.querySelectorAll('.flowfest-subbanner').forEach(el => el.innerText = content.subbanner);
        }
        if (content.tagline) {
            document.querySelectorAll('.tagline').forEach(el => el.innerText = content.tagline);
        }
        if (content.currentFocus) {
            document.querySelectorAll('.live-content').forEach(el => el.innerHTML = content.currentFocus);
        }
        if (content.aboutText) {
            document.querySelectorAll('.about-text').forEach(el => el.innerText = content.aboutText);
        }
        if (content.speechBubble) {
            const chatBox = document.getElementById('chatText');
            if (chatBox) chatBox.innerText = content.speechBubble;
        }
        if (content.ctaButton) {
            document.querySelectorAll('.cta-text').forEach(el => el.innerText = content.ctaButton);
        }
    }

    // Run sync right now on page load
    applyLiveContentSync();

    // Listen across open tabs so editing in editor.html updates index.html in real-time
    window.addEventListener('storage', (e) => {
        if (e.key === 'amr_live_content' && e.newValue) {
            try { applyLiveContentSync(JSON.parse(e.newValue)); } catch (err) {}
        }
    });

    // ==========================================================================
    // Real-Time Robot Eye Pupil Mouse-Tracking Physics
    // ==========================================================================
    function updateEyeTracking(e) {
        const sockets = document.querySelectorAll('.robot-eye-socket, .sun-eye-socket');
        sockets.forEach(socket => {
            const rect = socket.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const deltaX = e.clientX - centerX;
            const deltaY = e.clientY - centerY;
            const angle = Math.atan2(deltaY, deltaX);
            // Limit pupil movement inside the 13px eye socket
            const distance = Math.min(3.0, Math.hypot(deltaX, deltaY) / 20);
            
            const pupil = socket.querySelector('.robot-pupil, .sun-pupil');
            if (pupil) {
                const moveX = Math.cos(angle) * distance;
                const moveY = Math.sin(angle) * distance;
                pupil.style.transform = `translate(${moveX}px, ${moveY}px)`;
            }
        });
    }

    window.addEventListener('mousemove', updateEyeTracking);

    // ==========================================================================
    // Day / Night Theme Switcher Logic
    // ==========================================================================
    const themeToggleBtn = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const themeLabel = document.getElementById('themeLabel');

    function applyTheme(isDark) {
        if (isDark) {
            document.documentElement.classList.add('dark-theme');
            document.body.classList.add('dark-theme');
            if (themeIcon) themeIcon.textContent = '☀';
            if (themeLabel) themeLabel.textContent = 'DAY';
        } else {
            document.documentElement.classList.remove('dark-theme');
            document.body.classList.remove('dark-theme');
            if (themeIcon) themeIcon.textContent = '☾';
            if (themeLabel) themeLabel.textContent = 'NIGHT';
        }
    }

    const savedTheme = localStorage.getItem('site_theme');
    if (savedTheme === 'dark') {
        applyTheme(true);
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isCurrentlyDark = document.documentElement.classList.contains('dark-theme');
            applyTheme(!isCurrentlyDark);
            localStorage.setItem('site_theme', !isCurrentlyDark ? 'dark' : 'light');
        });
    }

    // ==========================================================================
    // Initialize Lenis Smooth Scrolling safely
    // ==========================================================================
    let lenis;
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 1.1
        });

        if (typeof ScrollTrigger !== 'undefined') {
            lenis.on('scroll', ScrollTrigger.update);
        }

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.fps(60);
    }

    const loader = document.getElementById('loader');
    const contentWrapper = document.querySelector('.content-wrapper');
    const chatText = document.getElementById('chatText');
    const robotAvatar = document.querySelector('.builder-combo .robot-avatar-container');
    const builderCombo = document.getElementById('builderCombo');

    const rotatingMessages = [
        "Large-Scale Events Management & Protocol 🎪",
        "Full-Funnel Digital Marketing Strategies 📈",
        "Using Tech & AI to Deliver Experiences & Design Systems ⚡",
        "Full site coming soon — stay tuned! 🚀"
    ];

    // Ensure contentWrapper is visible immediately (safety guarantee)
    if (contentWrapper) {
        gsap.set(contentWrapper, { opacity: 1, y: 0 });
    }

    // ==========================================================================
    // Rainbow Arcs Animation & Loading Screen Sequence
    // ==========================================================================
    if (typeof gsap !== 'undefined') {
        // Animate rainbow stripes gentle breathing expansion
        gsap.to('.rainbow-arc-left .rainbow-stripe', {
            scale: 1.06,
            duration: 2.8,
            stagger: 0.2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });

        gsap.to('.rainbow-arc-right .rainbow-stripe', {
            scale: 1.06,
            duration: 2.8,
            stagger: 0.2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });

        // If loader exists on page (index.html), animate entrance and transition
        if (loader) {
            const tlLoader = gsap.timeline();
            tlLoader.fromTo('.loader-center-box', { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.5)" })
                    .to(loader, {
                        duration: 0.75,
                        opacity: 0,
                        delay: 1.2,
                        ease: "power2.inOut",
                        onComplete: () => {
                            loader.style.display = 'none';
                            if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
                        }
                    });
        }
    }

    // FlowFest Speech Bubble Rotating Sequence
    let currentMsgIdx = 0;
    let cycleInterval = null;

    function cycleNextMessage() {
        if (!chatText || typeof gsap === 'undefined') return;
        currentMsgIdx = (currentMsgIdx + 1) % rotatingMessages.length;
        const nextMsg = rotatingMessages[currentMsgIdx];

        gsap.to(chatText, {
            duration: 0.25,
            text: "...",
            ease: "none",
            onComplete: () => {
                gsap.to(chatText, { duration: 0.65, text: nextMsg, ease: "none" });
            }
        });
    }

    if (chatText && typeof gsap !== 'undefined') {
        const tlChat = gsap.timeline({
            onComplete: () => {
                cycleInterval = setInterval(cycleNextMessage, 4200);
            }
        });
        tlChat.to(chatText, { duration: 0.45, text: "Hi Friends!", ease: "none", delay: 0.2 })
              .to(chatText, { duration: 0.25, text: "...", ease: "none", delay: 1.0 })
              .to(chatText, { duration: 0.65, text: "We are building something unique...", ease: "none", delay: 0.2 })
              .to(chatText, { duration: 0.25, text: "...", ease: "none", delay: 1.0 })
              .to(chatText, { duration: 0.75, text: rotatingMessages[0], ease: "none", delay: 0.2 });
    }

    // Gentle floating animation on Robot Avatar
    if (robotAvatar && typeof gsap !== 'undefined') {
        gsap.to(robotAvatar, {
            y: -8,
            rotation: 3,
            duration: 2.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }

    // Interactive Tap/Hover reaction
    if (builderCombo) {
        builderCombo.addEventListener('mouseenter', () => {
            if (cycleInterval) clearInterval(cycleInterval);
            cycleNextMessage();
        });
        builderCombo.addEventListener('mouseleave', () => {
            if (cycleInterval) clearInterval(cycleInterval);
            cycleInterval = setInterval(cycleNextMessage, 4200);
        });
    }

    // ==========================================================================
    // GSAP ScrollTrigger Background Parallax & Floating Shapes
    // ==========================================================================
    if (typeof gsap !== 'undefined') {
        const floatingShapes = gsap.utils.toArray('.floating-shape');
        floatingShapes.forEach((shape, index) => {
            const speed = parseFloat(shape.getAttribute('data-speed') || 0.2);
            gsap.to(shape, {
                rotation: (index % 2 === 0 ? 360 : -360),
                duration: 20 + index * 5,
                repeat: -1,
                ease: "none"
            });

            if (typeof ScrollTrigger !== 'undefined') {
                gsap.to(shape, {
                    yPercent: speed * 500,
                    ease: "none",
                    scrollTrigger: {
                        trigger: document.body,
                        start: "top top",
                        end: "bottom bottom",
                        scrub: true
                    }
                });
            }
        });

        // Capabilities Cards & Contact Cards Reveal safely
        if (typeof ScrollTrigger !== 'undefined') {
            const capCards = document.querySelectorAll('.cap-card');
            if (capCards.length > 0) {
                gsap.from(capCards, {
                    scrollTrigger: {
                        trigger: '.capabilities-section',
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    },
                    y: 40,
                    opacity: 0,
                    duration: 0.6,
                    stagger: 0.15,
                    ease: 'back.out(1.4)',
                    onComplete: () => {
                        gsap.set(capCards, { clearProps: "transform,opacity" });
                    }
                });
            }

            const contactCards = document.querySelectorAll('.contact-card');
            if (contactCards.length > 0) {
                gsap.from(contactCards, {
                    scrollTrigger: {
                        trigger: '.contact-section',
                        start: 'top 92%',
                        toggleActions: 'play none none none'
                    },
                    y: 35,
                    opacity: 0,
                    duration: 0.6,
                    stagger: 0.12,
                    ease: 'back.out(1.4)',
                    onComplete: () => {
                        gsap.set(contactCards, { clearProps: "transform,opacity" });
                    }
                });
            }

            window.addEventListener('resize', () => ScrollTrigger.refresh());
        }

        // Interactive 3D Tilt Physics for Cards
        const tiltCards = document.querySelectorAll('.tilt-card');
        tiltCards.forEach((card) => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -6;
                const rotateY = ((x - centerX) / centerX) * 6;
                
                gsap.to(card, {
                    rotateX: rotateX,
                    rotateY: rotateY,
                    transformPerspective: 1000,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.5, ease: "power2.out" });
            });
        });
    }
});
