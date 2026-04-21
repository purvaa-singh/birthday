// script.js — Classy & Minimal Birthday Site

document.addEventListener("DOMContentLoaded", () => {

    // ═══════════════════════════════════════════
    // 0. LENIS SMOOTH SCROLLING
    // ═══════════════════════════════════════════
    let lenis;
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.4,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        if (typeof ScrollTrigger !== 'undefined') {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => { lenis.raf(time * 1000); });
            gsap.ticker.lagSmoothing(0);
        }
    }

    // ═══════════════════════════════════════════
    // 1. BACKGROUND AUDIO (Cross-page persistence)
    // ═══════════════════════════════════════════
    const bgMusic = document.getElementById('bg-music');
    const musicToggle = document.getElementById('music-toggle');
    const iconPlay = document.getElementById('music-icon-play');
    const iconPause = document.getElementById('music-icon-pause');

    if (bgMusic && musicToggle) {
        const savedTime = sessionStorage.getItem('musicTime');
        const isPlaying = sessionStorage.getItem('musicPlaying') === 'true';

        if (savedTime) bgMusic.currentTime = parseFloat(savedTime);
        bgMusic.volume = 0.5;

        function updatePlayState(play) {
            if (play) {
                bgMusic.play().catch(() => {});
                if (iconPlay) iconPlay.classList.add('hidden');
                if (iconPause) iconPause.classList.remove('hidden');
                sessionStorage.setItem('musicPlaying', 'true');
            } else {
                bgMusic.pause();
                if (iconPause) iconPause.classList.add('hidden');
                if (iconPlay) iconPlay.classList.remove('hidden');
                sessionStorage.setItem('musicPlaying', 'false');
            }
        }

        if (isPlaying) updatePlayState(true);

        musicToggle.addEventListener('click', () => {
            updatePlayState(bgMusic.paused);
        });

        window.addEventListener('beforeunload', () => {
            if (!bgMusic.paused) sessionStorage.setItem('musicPlaying', 'true');
            sessionStorage.setItem('musicTime', bgMusic.currentTime.toString());
        });
    }

    // ═══════════════════════════════════════════
    // 1.5. MOOD TOGGLE (Love Mood)
    // ═══════════════════════════════════════════
    const moodToggle = document.getElementById('mood-toggle');
    if (moodToggle) {
        const savedMood = localStorage.getItem('loveMood');
        if (savedMood === 'true') {
            document.body.classList.add('love-mood');
        } else {
            document.body.classList.remove('love-mood');
        }

        moodToggle.addEventListener('click', () => {
            document.body.classList.toggle('love-mood');
            const isLoveMood = document.body.classList.contains('love-mood');
            localStorage.setItem('loveMood', isLoveMood);
            
            // Add a small bounce animation to the icon
            const icon = moodToggle.querySelector('.mood-icon');
            if (icon) {
                gsap.fromTo(icon, 
                    { scale: 0.8 }, 
                    { scale: 1, duration: 0.4, ease: 'back.out(1.7)' }
                );
                if (isLoveMood) {
                    gsap.to(icon, { fill: 'var(--accent)', duration: 0.3 });
                } else {
                    gsap.to(icon, { fill: 'none', duration: 0.3 });
                }
            }
        });

        // Initialize icon fill state
        const icon = moodToggle.querySelector('.mood-icon');
        if (icon && document.body.classList.contains('love-mood')) {
            icon.style.fill = 'var(--accent)';
        }
    }

    // ═══════════════════════════════════════════
    // 2. PASSCODE SCREEN
    // ═══════════════════════════════════════════
    const passcodeScreen = document.getElementById('passcode-screen');
    const passcodeDots = document.getElementById('passcode-dots');
    const passcodeError = document.getElementById('passcode-error');
    const numpad = document.getElementById('numpad');
    const mainContent = document.getElementById('main-content');

    const CORRECT_CODE = '1412';
    let enteredCode = '';
    let isCheckingCode = false;

    function updateDots() {
        if (!passcodeDots) return;
        const dots = passcodeDots.querySelectorAll('.dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('filled', i < enteredCode.length);
            dot.classList.remove('error');
        });
    }

    function showError() {
        if (!passcodeDots || !passcodeError) return;
        const dots = passcodeDots.querySelectorAll('.dot');
        dots.forEach(dot => dot.classList.add('error'));
        passcodeError.classList.add('show');

        setTimeout(() => {
            enteredCode = '';
            updateDots();
            passcodeError.classList.remove('show');
            isCheckingCode = false;
        }, 800);
    }

    function unlockSite() {
        sessionStorage.setItem('siteUnlocked', 'true');

        if (passcodeScreen) {
            passcodeScreen.classList.add('dismiss');
        }

        setTimeout(() => {
            if (passcodeScreen) passcodeScreen.style.display = 'none';
            document.body.style.overflowY = 'auto';
            if (mainContent) {
                mainContent.classList.remove('main-hidden');
                mainContent.classList.add('main-visible');
                mainContent.style.opacity = '0';
                gsap.to(mainContent, {
                    opacity: 1,
                    duration: 1,
                    ease: 'power2.out',
                    onComplete: () => startAnimations()
                });
            }
        }, 800);
    }

    function handleKeyInput(key) {
        if (isCheckingCode) return;

        if (key === 'del') {
            enteredCode = enteredCode.slice(0, -1);
            updateDots();
            return;
        }

        if (enteredCode.length >= 4) return;
        enteredCode += key;
        updateDots();

        if (enteredCode.length === 4) {
            isCheckingCode = true;
            setTimeout(() => {
                if (enteredCode === CORRECT_CODE) {
                    unlockSite();
                } else {
                    showError();
                }
            }, 300);
        }
    }

    // Numpad click handler
    if (numpad) {
        numpad.addEventListener('click', (e) => {
            const btn = e.target.closest('.numpad-key');
            if (!btn || btn.classList.contains('numpad-empty')) return;
            const key = btn.dataset.key;
            if (key) handleKeyInput(key);
        });
    }

    // Keyboard support for passcode
    if (passcodeScreen) {
        document.addEventListener('keydown', (e) => {
            if (passcodeScreen.style.display === 'none') return;
            if (e.key >= '0' && e.key <= '9') handleKeyInput(e.key);
            if (e.key === 'Backspace') handleKeyInput('del');
        });
    }

    // Check if already unlocked
    if (passcodeScreen && mainContent) {
        if (sessionStorage.getItem('siteUnlocked') === 'true') {
            passcodeScreen.style.display = 'none';
            document.body.style.overflowY = 'auto';
            mainContent.classList.remove('main-hidden');
            mainContent.classList.add('main-visible');
            mainContent.style.opacity = '1';
            startAnimations();
        }
    }

    // Sub-pages: no passcode needed, start directly
    if (!passcodeScreen && mainContent) {
        mainContent.classList.remove('main-hidden');
        mainContent.classList.add('main-visible');
        mainContent.style.opacity = '1';
        startAnimations();
    }


    // ═══════════════════════════════════════════
    // 3. MAIN ANIMATIONS
    // ═══════════════════════════════════════════
    function startAnimations() {
        gsap.registerPlugin(ScrollTrigger);

        // --- Hero Image & Text (Index Page) ---
        const heroImage = document.getElementById('hero-image');
        const heroText = document.getElementById('hero-text');
        const scrollIndicator = document.getElementById('scroll-indicator');

        if (heroImage) {
            const heroTl = gsap.timeline();

            heroTl
                .to(heroImage, {
                    opacity: 1,
                    scale: 1,
                    duration: 2.5,
                    ease: 'power3.out'
                })
                .fromTo('.hero-title', 
                    { 
                        opacity: 1,
                        y: () => window.innerHeight
                    }, 
                    {
                        opacity: 1,
                        y: 0,
                        duration: 2.5,
                        ease: 'power4.out'
                    }, 
                    '-=1.8'
                )
                .to(scrollIndicator, {
                    opacity: 1,
                    duration: 1,
                    ease: 'power2.out'
                }, '-=0.5');

            // Parallax on scroll
            gsap.to(heroImage, {
                scrollTrigger: {
                    trigger: '.hero-section',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true,
                },
                y: 150,
                scale: 1.15,
                ease: 'none'
            });

            // Fade out hero text on scroll
            gsap.to(heroText, {
                scrollTrigger: {
                    trigger: '.hero-section',
                    start: 'top top',
                    end: '60% top',
                    scrub: true,
                },
                opacity: 0,
                y: -60,
                ease: 'none'
            });

            gsap.to(scrollIndicator, {
                scrollTrigger: {
                    trigger: '.hero-section',
                    start: '10% top',
                    end: '30% top',
                    scrub: true,
                },
                opacity: 0,
                ease: 'none'
            });
        }

        // --- Gifts Section (Index Page) ---
        const giftsHeader = document.querySelector('.gifts-header');
        if (giftsHeader) {
            gsap.to(giftsHeader, {
                scrollTrigger: {
                    trigger: '.gifts-section',
                    start: 'top 75%',
                },
                opacity: 1,
                y: 0,
                duration: 1.5,
                ease: 'power3.out'
            });

            gsap.utils.toArray('.gift-card').forEach((card, i) => {
                gsap.to(card, {
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 85%',
                    },
                    opacity: 1,
                    y: 0,
                    duration: 1.2,
                    delay: i * 0.15,
                    ease: 'power3.out'
                });
            });
        }

        // --- Sub-page Hero Animations ---
        const subLine = document.querySelector('.subpage-hero-line');
        const subTitle = document.querySelector('.subpage-hero-title');
        const subDesc = document.querySelector('.subpage-hero-desc');

        if (subTitle) {
            const subTl = gsap.timeline();
            if (subLine) subTl.to(subLine, { opacity: 1, duration: 1.5, ease: 'power2.out' });
            subTl.to(subTitle, { opacity: 1, y: 0, duration: 1.5, ease: 'power3.out' }, '-=1.0');
            if (subDesc) subTl.to(subDesc, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }, '-=0.8');
        }

        // --- Paragraph Cards ---
        gsap.utils.toArray('.para-card').forEach((card, i) => {
            gsap.to(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                },
                opacity: 1,
                y: 0,
                duration: 1.2,
                delay: i * 0.1,
                ease: 'power3.out'
            });
        });

        // --- Moments / Purva Intro Text ---
        gsap.utils.toArray('.moments-intro, .purva-intro').forEach(el => {
            gsap.to(el, {
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                },
                opacity: 1,
                y: 0,
                scale: 1,
                filter: 'blur(0px)',
                duration: 2,
                ease: 'power3.out'
            });
        });

        // --- Closing Section ---
        const closingSection = document.querySelector('.closing-section');
        if (closingSection) {
            gsap.to(closingSection, {
                scrollTrigger: {
                    trigger: closingSection,
                    start: 'top 80%',
                },
                opacity: 1,
                y: 0,
                duration: 2,
                ease: 'power3.out'
            });
        }

        // ═══════════════════════════════════════════
        // 4. CINEMATIC STORY CAROUSEL
        // ═══════════════════════════════════════════
        let isModalOpen = false;

        const storyTrack = document.getElementById('story-track');
        if (storyTrack && window.STORY_SLIDES) {
            const slides = window.STORY_SLIDES;
            let currentIndex = 0;
            const captionEl = document.getElementById('story-caption');
            const dotsEl = document.getElementById('story-dots');
            let isAnimating = false;

            // Initialize DOM elements
            slides.forEach((slide, i) => {
                // 1. Create Image Item
                const el = document.createElement('div');
                el.className = 'story-item story-item-hidden-right';
                el.dataset.index = i;
                
                const img = document.createElement('img');
                img.src = slide.src;
                el.appendChild(img);
                
                storyTrack.appendChild(el);

                // 2. Create Dot
                const dot = document.createElement('div');
                dot.className = 'story-dot';
                dot.addEventListener('click', () => !isAnimating && navigateTo(i));
                dotsEl.appendChild(dot);
                
                // 3. Create Caption
                const p = document.createElement('p');
                p.textContent = slide.caption;
                captionEl.appendChild(p);

                // 4. Interaction (Click side images to navigate)
                el.addEventListener('click', (e) => {
                    if (isAnimating) return;
                    if (el.classList.contains('story-item-left')) navigateTo(currentIndex - 1);
                    else if (el.classList.contains('story-item-right')) navigateTo(currentIndex + 1);
                    else if (el.classList.contains('story-item-center')) {
                        // Open modal (handled by existing modal logic, trigger dynamically here)
                        activeImg = img;
                        openModal(img);
                    }
                });
            });

            const items = Array.from(storyTrack.children);
            const captions = Array.from(captionEl.children);
            const dots = Array.from(dotsEl.children);

            // Core update function to assign CSS classes based on current index
            const updateGallery = (newIndex) => {
                isAnimating = true;

                // Handle infinite wrapping
                if (newIndex < 0) newIndex = slides.length - 1;
                if (newIndex >= slides.length) newIndex = 0;
                
                currentIndex = newIndex;

                items.forEach((item, i) => {
                    // Calculate shortest distance wrapped
                    let diff = i - currentIndex;
                    if (diff < -Math.floor(slides.length / 2)) diff += slides.length;
                    if (diff > Math.floor(slides.length / 2)) diff -= slides.length;

                    // Reset class then apply correct position class
                    item.className = 'story-item';
                    
                    if (diff === 0) {
                        item.classList.add('story-item-center');
                    } else if (diff === -1) {
                        item.classList.add('story-item-left');
                    } else if (diff === 1) {
                        item.classList.add('story-item-right');
                    } else if (diff < -1) {
                        item.classList.add('story-item-hidden-left');
                    } else if (diff > 1) {
                        item.classList.add('story-item-hidden-right');
                    }
                });

                // Update text
                captions.forEach((cp, i) => {
                    if (i === currentIndex) cp.classList.add('active');
                    else cp.classList.remove('active');
                });

                // Update dots
                dots.forEach((dot, i) => {
                    if (i === currentIndex) dot.classList.add('active');
                    else dot.classList.remove('active');
                });

                // Unlock interaction after CSS transition completes (~1.2s)
                setTimeout(() => { isAnimating = false; }, 1200);
            };

            const navigateTo = (index) => {
                if (index === currentIndex) return;
                updateGallery(index);
            };

            document.getElementById('story-prev').addEventListener('click', () => !isAnimating && navigateTo(currentIndex - 1));
            document.getElementById('story-next').addEventListener('click', () => !isAnimating && navigateTo(currentIndex + 1));

            // Initial render
            setTimeout(() => updateGallery(0), 100);
        }

        // ═══════════════════════════════════════════
        // 5. IMAGE MODAL (Gallery pages)
        // ═══════════════════════════════════════════
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'image-modal-overlay';
        const modalImg = document.createElement('img');
        modalOverlay.appendChild(modalImg);
        document.body.appendChild(modalOverlay);

        let activeImg = null;
        let isPopupAnimating = false;

        const galleryImages = document.querySelectorAll('.moment-card img, .purva-card img');
        
        // Expose openModal globally for dynamic elements
        window.openModal = (img) => {
            if (isPopupAnimating) return;
            isPopupAnimating = true;
            activeImg = img;
            isModalOpen = true;
            if (lenis) lenis.stop();

            const rect = img.getBoundingClientRect();
            modalImg.src = img.src;
            gsap.set(modalImg, {
                position: 'fixed', left: 0, top: 0,
                x: rect.left, y: rect.top,
                width: rect.width, height: rect.height,
                objectFit: 'cover', borderRadius: '0px', zIndex: 101, boxShadow: 'none'
            });

            modalOverlay.style.pointerEvents = 'auto';

            const tw = window.innerWidth * 0.85;
            const th = window.innerHeight * 0.85;
            const imgAspect = rect.width / rect.height;
            const winAspect = tw / th;
            let fw, fh;
            if (imgAspect > winAspect) { fw = tw; fh = tw / imgAspect; }
            else { fh = th; fw = th * imgAspect; }
            const fx = (window.innerWidth - fw) / 2;
            const fy = (window.innerHeight - fh) / 2;

            const tl = gsap.timeline({ onComplete: () => isPopupAnimating = false });
            tl.to(modalOverlay, { opacity: 1, duration: 0.25, ease: 'power2.out' })
              .to(modalImg, {
                  x: fx, y: fy, width: fw, height: fh,
                  borderRadius: '6px', boxShadow: '0 0 60px rgba(0,0,0,0.8)',
                  duration: 0.6, ease: 'expo.out'
              }, '-=0.2');
        };

        galleryImages.forEach(img => {
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', () => {
                window.openModal(img);
            });
        });

        modalOverlay.addEventListener('click', () => {
            if (isPopupAnimating || !activeImg) return;
            isPopupAnimating = true;
            const rect = activeImg.getBoundingClientRect();

            const tl = gsap.timeline({
                onComplete: () => {
                    modalOverlay.style.pointerEvents = 'none';
                    modalImg.src = '';
                    gsap.set(modalImg, { clearProps: 'all' });
                    activeImg = null;
                    isPopupAnimating = false;
                    isModalOpen = false;
                    if (lenis) lenis.start();
                }
            });

            tl.to(modalImg, {
                x: rect.left, y: rect.top, width: rect.width, height: rect.height,
                borderRadius: '0px', boxShadow: 'none',
                duration: 0.45, ease: 'power3.inOut'
            }).to(modalOverlay, {
                opacity: 0, duration: 0.3, ease: 'power2.inOut'
            }, '-=0.35');
        });

        // ═══════════════════════════════════════════
        // 6. FLOATING REPULSION GALLERY (Best of Purva)
        // ═══════════════════════════════════════════
        const floatCanvas = document.getElementById('float-canvas');
        if (floatCanvas) {
            const floatItems = document.querySelectorAll('.float-img');
            const canvasRect = () => floatCanvas.getBoundingClientRect();

            // Animate hero text
            const floatTitle = document.querySelector('.float-hero-title');
            const floatDesc = document.querySelector('.float-hero-desc');
            const floatLine = document.querySelector('.float-hero .subpage-hero-line');
            if (floatTitle) {
                const ftl = gsap.timeline();
                if (floatLine) ftl.to(floatLine, { opacity: 1, duration: 1.5, ease: 'power2.out' });
                ftl.to(floatTitle, { opacity: 1, y: 0, duration: 1.5, ease: 'power3.out' }, '-=1.0');
                if (floatDesc) ftl.to(floatDesc, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }, '-=0.8');
            }

            // Mouse tracking
            let mouseX = -9999;
            let mouseY = -9999;
            let mouseInCanvas = false;

            floatCanvas.addEventListener('mousemove', (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
                mouseInCanvas = true;
            });
            floatCanvas.addEventListener('mouseleave', () => {
                mouseInCanvas = false;
            });

            // Physics constants
            const REPEL_RADIUS = 150;    // reduced radius as requested
            const REPEL_STRENGTH = 0.45; // balanced for the slower overall motion
            const DAMPING = 0.95;        // smoother glide than 0.92

            // Initialize each floating image with physics state
            const particles = [];
            const cw = () => floatCanvas.clientWidth;
            const ch = () => floatCanvas.clientHeight;

            // Scatter images across the canvas in a nice spread
            const cols = 4;
            const rows = Math.ceil(floatItems.length / cols);

            floatItems.forEach((item, i) => {
                const col = i % cols;
                const row = Math.floor(i / cols);
                const imgW = item.clientWidth || 200;
                const imgH = imgW * (4 / 3);

                // Spread evenly with some randomness
                const cellW = cw() / cols;
                const cellH = ch() / rows;
                const baseX = cellW * col + cellW * 0.1 + Math.random() * cellW * 0.5;
                const baseY = cellH * row + cellH * 0.1 + Math.random() * cellH * 0.4;

                const p = {
                    el: item,
                    x: Math.max(20, Math.min(baseX, cw() - imgW - 20)),
                    y: Math.max(20, Math.min(baseY, ch() - imgH - 20)),
                    vx: 0,
                    vy: 0,
                    w: imgW,
                    h: imgH,
                    // Ambient drift — barely perceptible
                    driftPhaseX: Math.random() * Math.PI * 2,
                    driftPhaseY: Math.random() * Math.PI * 2,
                    driftAmpX: 0.006,
                    driftAmpY: 0.005,
                    driftFreqX: 0.0008,
                    driftFreqY: 0.0007,
                    driftSpeed: 0.1,
                    // Rotation & scale breathing — very subtle
                    rotPhase: Math.random() * Math.PI * 2,
                    rotAmp: 1.2,
                    rotFreq: 0.005,
                    scalePhase: Math.random() * Math.PI * 2,
                    scaleFreq: 0.004,
                    scaleAmp: 0.01,
                };

                particles.push(p);

                // Staggered fade-in
                gsap.to(item, {
                    opacity: 1,
                    duration: 1.8,
                    delay: 0.6 + i * 0.15,
                    ease: 'power2.out'
                });
            });

            let time = 0;

            // Main physics loop
            gsap.ticker.add(() => {
                if (isModalOpen) return;
                time++;

                const bounds = canvasRect();

                particles.forEach(p => {
                    // 1. Ambient floating drift (very gentle sinusoidal)
                    const driftX = Math.sin(time * p.driftFreqX + p.driftPhaseX) * p.driftAmpX * p.driftSpeed;
                    const driftY = Math.cos(time * p.driftFreqY + p.driftPhaseY) * p.driftAmpY * p.driftSpeed;

                    p.vx += driftX;
                    p.vy += driftY;

                    // 2. Cursor repulsion — push AWAY from cursor
                    if (mouseInCanvas) {
                        const imgCenterX = bounds.left + p.x + p.w / 2;
                        const imgCenterY = bounds.top + p.y + p.h / 2;

                        const dx = imgCenterX - mouseX;
                        const dy = imgCenterY - mouseY;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist < REPEL_RADIUS && dist > 1) {
                            const proximity = 1 - (dist / REPEL_RADIUS);
                            const force = proximity * proximity * REPEL_STRENGTH;

                            p.vx += (dx / dist) * force;
                            p.vy += (dy / dist) * force;
                        }
                    }

                    // 3. Apply velocity with damping
                    p.vx *= DAMPING;
                    p.vy *= DAMPING;

                    p.x += p.vx;
                    p.y += p.vy;

                    // 4. Boundary clamping (soft bounce)
                    const padding = 10;
                    const maxX = cw() - p.w - padding;
                    const maxY = ch() - p.h - padding;

                    if (p.x < padding) { p.x = padding; p.vx *= -0.3; }
                    if (p.x > maxX) { p.x = maxX; p.vx *= -0.3; }
                    if (p.y < padding) { p.y = padding; p.vy *= -0.3; }
                    if (p.y > maxY) { p.y = maxY; p.vy *= -0.3; }

                    // 5. Gentle rotation sway + scale breathing
                    const rot = Math.sin(time * p.rotFreq + p.rotPhase) * p.rotAmp;
                    const scl = 1 + Math.sin(time * p.scaleFreq + p.scalePhase) * p.scaleAmp;

                    // 6. Apply position + rotation + scale
                    gsap.set(p.el, {
                        x: p.x,
                        y: p.y,
                        rotation: rot,
                        scale: scl
                    });
                });
            });

            // Image click → open modal
            floatItems.forEach(item => {
                const img = item.querySelector('img');
                if (!img) return;
                img.addEventListener('click', () => {
                    if (isPopupAnimating) return;
                    isPopupAnimating = true;
                    activeImg = img;
                    isModalOpen = true;
                    if (lenis) lenis.stop();

                    const rect = img.getBoundingClientRect();
                    modalImg.src = img.src;
                    gsap.set(modalImg, {
                        position: 'fixed', left: 0, top: 0,
                        x: rect.left, y: rect.top,
                        width: rect.width, height: rect.height,
                        objectFit: 'cover', borderRadius: '0px', zIndex: 101, boxShadow: 'none'
                    });

                    modalOverlay.style.pointerEvents = 'auto';

                    const tw = window.innerWidth * 0.85;
                    const th = window.innerHeight * 0.85;
                    const imgAspect = rect.width / rect.height;
                    const winAspect = tw / th;
                    let fw, fh;
                    if (imgAspect > winAspect) { fw = tw; fh = tw / imgAspect; }
                    else { fh = th; fw = th * imgAspect; }
                    const fx = (window.innerWidth - fw) / 2;
                    const fy = (window.innerHeight - fh) / 2;

                    const tl = gsap.timeline({ onComplete: () => isPopupAnimating = false });
                    tl.to(modalOverlay, { opacity: 1, duration: 0.25, ease: 'power2.out' })
                      .to(modalImg, {
                          x: fx, y: fy, width: fw, height: fh,
                          borderRadius: '6px', boxShadow: '0 0 60px rgba(0,0,0,0.8)',
                          duration: 0.6, ease: 'expo.out'
                      }, '-=0.2');
                });
            });

            // --- View All Overlay ---
            const viewAllBtn = document.getElementById('view-all-btn');
            const viewAllOverlay = document.getElementById('view-all-overlay');
            const viewAllClose = document.getElementById('view-all-close');
            const viewAllItems = document.querySelectorAll('.view-all-item');

            if (viewAllBtn && viewAllOverlay) {
                viewAllBtn.addEventListener('click', () => {
                    viewAllOverlay.classList.add('active');
                    if (lenis) lenis.stop();

                    // Staggered reveal of grid items
                    viewAllItems.forEach((item, i) => {
                        gsap.to(item, {
                            opacity: 1,
                            y: 0,
                            duration: 0.8,
                            delay: i * 0.06,
                            ease: 'power3.out'
                        });
                    });
                });

                const closeViewAll = () => {
                    viewAllOverlay.classList.remove('active');
                    if (lenis) lenis.start();
                    // Reset items for next open
                    viewAllItems.forEach(item => {
                        gsap.set(item, { opacity: 0, y: 20 });
                    });
                };

                viewAllClose.addEventListener('click', closeViewAll);

                // Close on overlay background click
                viewAllOverlay.addEventListener('click', (e) => {
                    if (e.target === viewAllOverlay) closeViewAll();
                });

                // Image click in grid → open modal
                viewAllItems.forEach(item => {
                    const img = item.querySelector('img');
                    if (!img) return;
                    img.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (isPopupAnimating) return;
                        isPopupAnimating = true;
                        activeImg = img;
                        isModalOpen = true;

                        const rect = img.getBoundingClientRect();
                        modalImg.src = img.src;
                        gsap.set(modalImg, {
                            position: 'fixed', left: 0, top: 0,
                            x: rect.left, y: rect.top,
                            width: rect.width, height: rect.height,
                            objectFit: 'cover', borderRadius: '0px', zIndex: 201, boxShadow: 'none'
                        });

                        modalOverlay.style.pointerEvents = 'auto';
                        modalOverlay.style.zIndex = '200';

                        const tw = window.innerWidth * 0.85;
                        const th = window.innerHeight * 0.85;
                        const imgAspect = rect.width / rect.height;
                        const winAspect = tw / th;
                        let fw2, fh2;
                        if (imgAspect > winAspect) { fw2 = tw; fh2 = tw / imgAspect; }
                        else { fh2 = th; fw2 = th * imgAspect; }
                        const fx2 = (window.innerWidth - fw2) / 2;
                        const fy2 = (window.innerHeight - fh2) / 2;

                        const tl2 = gsap.timeline({ onComplete: () => isPopupAnimating = false });
                        tl2.to(modalOverlay, { opacity: 1, duration: 0.25, ease: 'power2.out' })
                           .to(modalImg, {
                               x: fx2, y: fy2, width: fw2, height: fh2,
                               borderRadius: '6px', boxShadow: '0 0 60px rgba(0,0,0,0.8)',
                               duration: 0.6, ease: 'expo.out'
                           }, '-=0.2');
                    });
                });
            }
        }

    } // end startAnimations

});
