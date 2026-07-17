/**
 * FlowFest-Inspired GSAP Animations, Lenis Smooth Scroll, Parallax & Active Polish
 */

document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP Plugins
    if (typeof gsap !== 'undefined') {
        if (typeof TextPlugin !== 'undefined') gsap.registerPlugin(TextPlugin);
        if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);
    }

    // Initialize Lenis Smooth Scrolling
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
    const builderAvatar = document.querySelector('.builder-avatar');
    const builderCombo = document.getElementById('builderCombo');

    const defaultText = "Full site launching soon | Dubai, UAE";
    const hoverMessages = [
        "Let's build something extraordinary together 🚀",
        "Delivering large-scale productions & AI engineering ⚡",
        "Feel free to download my CV below 👇",
        "Welcome to my personal portal across the MENA region ✨"
    ];

    // Ensure initial states
    gsap.set(contentWrapper, { opacity: 0, y: 30 });
    gsap.set(chatText, { text: "..." });

    // Create Main Entry Timeline
    const tl = gsap.timeline();

    // 1. Fade out the Loading Screen
    tl.to(loader, {
        duration: 0.5,
        opacity: 0,
        delay: 0.6,
        onComplete: () => {
            if (loader) loader.style.display = 'none';
        }
    });

    // 2. Reveal Main Content Container smoothly
    tl.to(contentWrapper, {
        duration: 0.7,
        opacity: 1,
        y: 0,
        ease: "power3.out"
    }, "-=0.2");

    // 3. FlowFest Speech Bubble Typing Sequence
    tl.to(chatText, {
        duration: 0.45,
        text: "Hi Friends!",
        ease: "none",
        delay: 0.2
    });

    tl.to(chatText, {
        duration: 0.25,
        text: "...",
        ease: "none",
        delay: 1.2
    });

    tl.to(chatText, {
        duration: 0.65,
        text: "We are building something unique...",
        ease: "none",
        delay: 0.2
    });

    tl.to(chatText, {
        duration: 0.25,
        text: "...",
        ease: "none",
        delay: 1.2
    });

    tl.to(chatText, {
        duration: 0.75,
        text: defaultText,
        ease: "none",
        delay: 0.2
    });

    // 4. Subtle floating animation on Builder Avatar
    gsap.to(builderAvatar, {
        y: -8,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });

    // 5. Interactive Hover & Tap Reactions on Avatar
    let isInteracting = false;

    function showRandomMessage() {
        if (isInteracting) return;
        isInteracting = true;
        
        const randomIndex = Math.floor(Math.random() * hoverMessages.length);
        const selectedMsg = hoverMessages[randomIndex];

        gsap.killTweensOf(chatText);
        gsap.to(chatText, {
            duration: 0.2,
            text: "...",
            ease: "none",
            onComplete: () => {
                gsap.to(chatText, {
                    duration: 0.5,
                    text: selectedMsg,
                    ease: "none"
                });
            }
        });
    }

    function revertToDefault() {
        isInteracting = false;
        gsap.killTweensOf(chatText);
        gsap.to(chatText, {
            duration: 0.2,
            text: "...",
            ease: "none",
            onComplete: () => {
                gsap.to(chatText, {
                    duration: 0.5,
                    text: defaultText,
                    ease: "none"
                });
            }
        });
    }

    if (builderCombo) {
        builderCombo.addEventListener('mouseenter', () => {
            if (!tl.isActive()) showRandomMessage();
        });

        builderCombo.addEventListener('mouseleave', () => {
            if (!tl.isActive()) revertToDefault();
        });

        builderCombo.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!tl.isActive()) showRandomMessage();
        });
    }

    document.addEventListener('click', (e) => {
        if (builderCombo && !builderCombo.contains(e.target) && !tl.isActive() && isInteracting) {
            revertToDefault();
        }
    });

    // ==========================================================================
    // GSAP ScrollTrigger Background Parallax & Floating Shapes
    // ==========================================================================
    const floatingShapes = gsap.utils.toArray('.floating-shape');
    
    floatingShapes.forEach((shape, index) => {
        const speed = parseFloat(shape.getAttribute('data-speed') || 0.2);
        
        // Continuous infinite rotation
        gsap.to(shape, {
            rotation: (index % 2 === 0 ? 360 : -360),
            duration: 20 + index * 5,
            repeat: -1,
            ease: "none"
        });

        // Vertical scroll displacement
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

    // Mouse Parallax Reaction on Background Shapes
    window.addEventListener('mousemove', (e) => {
        const mouseX = (e.clientX - window.innerWidth / 2) / window.innerWidth;
        const mouseY = (e.clientY - window.innerHeight / 2) / window.innerHeight;

        floatingShapes.forEach((shape) => {
            const speed = parseFloat(shape.getAttribute('data-speed') || 0.2);
            gsap.to(shape, {
                x: mouseX * speed * 120,
                y: mouseY * speed * 120,
                duration: 1.5,
                ease: "power2.out"
            });
        });
    });

    // ==========================================================================
    // GSAP ScrollTrigger Staggered Reveals
    // ==========================================================================
    if (typeof ScrollTrigger !== 'undefined') {
        // Capabilities Cards Reveal
        const capCards = document.querySelectorAll('.cap-card');
        if (capCards.length > 0) {
            gsap.from(capCards, {
                scrollTrigger: {
                    trigger: '.capabilities-section',
                    start: 'top 82%',
                    toggleActions: 'play none none none'
                },
                y: 50,
                opacity: 0,
                duration: 0.75,
                stagger: 0.15,
                ease: 'back.out(1.5)'
            });
        }

        // Contact Cards Reveal
        const contactCards = document.querySelectorAll('.contact-card');
        if (contactCards.length > 0) {
            gsap.from(contactCards, {
                scrollTrigger: {
                    trigger: '.contact-section',
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                y: 40,
                opacity: 0,
                duration: 0.65,
                stagger: 0.12,
                ease: 'back.out(1.4)'
            });
        }
    }

    // ==========================================================================
    // Interactive 3D Tilt Physics for Cards
    // ==========================================================================
    const tiltCards = document.querySelectorAll('.tilt-card');
    
    tiltCards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -6; // Max 6 deg tilt
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
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.5,
                ease: "power2.out"
            });
        });
    });
});
