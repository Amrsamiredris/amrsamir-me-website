/**
 * FlowFest-Inspired GSAP Animations & Speech Prompt Sequence
 */

document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP TextPlugin if available
    if (typeof gsap !== 'undefined' && typeof TextPlugin !== 'undefined') {
        gsap.registerPlugin(TextPlugin);
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

    // Ensure initial states before animation starts
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

    // 4. Subtle, continuous floating animation on the Builder Avatar
    gsap.to(builderAvatar, {
        y: -8,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });

    // 5. Interactive Hover & Tap Reactions
    let isInteracting = false;
    let hoverTimeout = null;

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
        // Desktop Hover
        builderCombo.addEventListener('mouseenter', () => {
            // Only trigger if timeline has finished
            if (!tl.isActive()) {
                showRandomMessage();
            }
        });

        builderCombo.addEventListener('mouseleave', () => {
            if (!tl.isActive()) {
                revertToDefault();
            }
        });

        // Mobile Tap / Click
        builderCombo.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!tl.isActive()) {
                showRandomMessage();
            }
        });
    }

    // Tap outside on mobile reverts text
    document.addEventListener('click', (e) => {
        if (builderCombo && !builderCombo.contains(e.target) && !tl.isActive() && isInteracting) {
            revertToDefault();
        }
    });
});
