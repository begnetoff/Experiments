// Utility functions for main app logic
function isPrime(num) {
    if (num < 2) return false;
    if (num === 2) return true;
    if (num % 2 === 0) return false;
    
    const sqrt = Math.sqrt(num);
    for (let i = 3; i <= sqrt; i += 2) {
        if (num % i === 0) return false;
    }
    return true;
}

function getNextNPrimes(start, n) {
    const primes = [];
    let num = start + 1;
    
    while (primes.length < n && num < start + 10000) {
        if (isPrime(num)) primes.push(num);
        num++;
    }
    return primes;
}

function analyzeHobbies() {
    const hobbiesText = "My hobbies include reading dark fantasy books and playing games on PC and PlayStation.";
    const charCount = hobbiesText.length;
    const gCount = (hobbiesText.match(/g/gi) || []).length;
    const words = hobbiesText.split(/\s+/).filter(word => word.length > 0);
    const wordsWithG = words.filter(word => word.toLowerCase().includes('g'));
    return { charCount, gCount, wordsWithG };
}

function displayCarWeightTable(carWeight) {
    let output = '<h2><span class="scroll-reveal-text">Perceived Car Weight at Different Speeds</span></h2>';
    output += '<table><tr><th><span class="word">Speed (km/h)</span></th><th><span class="word">Perceived Weight (kg)</span></th></tr>';
    
    for (let speed = 30; speed <= 130; speed += 10) {
        const perceivedWeight = carWeight * (speed / 60) * 14;
        output += `<tr><td><span class="word">${speed}</span></td><td><span class="word">${perceivedWeight.toFixed(2)}</span></td></tr>`;
    }
    output += '</table>';
    return output;
}

// Main application logic
function main() {
    let output = '<span class="scroll-reveal-text">';

    const ageInput = prompt("Enter your age:");
    const age = parseInt(ageInput);
    if (isNaN(age) || age < 0) {
        output += `<p>Invalid <span class="word">age</span> <span class="word">entered</span>.</p>`;
    } else if (age >= 18) {
        output += `<p>You <span class="word">are</span> <span class="word">${age}</span> <span class="word">years</span> <span class="word">old</span>, <span class="word">eligible</span> <span class="word">to</span> <span class="word">drive</span> <span class="word">the</span> <span class="word">Belaz</span>!</p>`;
    } else {
        output += `<p>You <span class="word">are</span> <span class="word">${age}</span> <span class="word">years</span> <span class="word">old</span>, <span class="word">too</span> <span class="word">young</span> <span class="word">to</span> <span class="word">drive</span>.</p>`;
    }

    const luckyNumberInput = prompt("Enter your lucky number:");
    const luckyNumber = parseInt(luckyNumberInput);
    if (isNaN(luckyNumber) || luckyNumber < 0 || luckyNumber > 50000) {
        output += `<p>Invalid <span class="word">lucky</span> <span class="word">number</span> (must be 0-50000).</p>`;
    } else {
        let primes = [];
        let primeCount = 0;
        
        for (let i = 2; i < Math.min(luckyNumber, 5000); i++) {
            if (isPrime(i)) {
                primes.push(i);
                primeCount++;
            }
        }
        
        if (primeCount < 5) {
            primes = getNextNPrimes(luckyNumber, 5);
            output += `<p>Fewer <span class="word">than</span> <span class="word">5</span> <span class="word">primes</span> <span class="word">before</span> <span class="word">${luckyNumber}</span>. <span class="word">Next</span> <span class="word">5</span> <span class="word">primes</span>: <span class="word">${primes.join(', ')}</span></p>`;
        } else {
            const displayPrimes = primes.slice(0, 20); // Limit display
            output += `<p>First 20 primes <span class="word">before</span> <span class="word">${luckyNumber}</span>: <span class="word">${displayPrimes.join(', ')}</span></p>`;
        }
    }

    const carWeightInput = prompt("Enter the weight of your Belaz (kg):");
    const carWeight = parseFloat(carWeightInput);
    if (isNaN(carWeight) || carWeight <= 0 || carWeight > 500000) {
        output += `<p>Invalid <span class="word">weight</span> <span class="word">entered</span> (must be 1-500000 kg).</p>`;
    } else {
        output += displayCarWeightTable(carWeight);
    }

    const analysis = analyzeHobbies();
    output += `<h2><span class="scroll-reveal-text">Hobbies <span class="word">Analysis</span></span></h2>`;
    output += `<p>Total <span class="word">characters</span>: <span class="word">${analysis.charCount}</span></p>`;
    output += `<p>Number <span class="word">of</span> <span class="word">'g'</span> <span class="word">letters</span>: <span class="word">${analysis.gCount}</span></p>`;
    output += `<p>Words <span class="word">with</span> <span class="word">'g'</span>: <span class="word">${analysis.wordsWithG.join(', ')}</span></p>`;

    output += '</span>';
    document.getElementById('js-output').innerHTML = output;

    // Re-trigger ScrollReveal for dynamic content with delay
    setTimeout(() => {
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }
        initScrollReveal();
    }, 100);
}

// Optimized Target Cursor Implementation
function initTargetCursor() {
    if (window.innerWidth <= 768 || !window.gsap) return;

    const cursor = document.querySelector('.target-cursor-wrapper');
    const dot = document.querySelector('.target-cursor-dot');
    const corners = document.querySelectorAll('.target-cursor-corner');
    
    if (!cursor || !dot || corners.length === 0) return;

    const targetSelector = '.cursor-target';
    const spinDuration = 2;
    const constants = {
        borderWidth: 3,
        cornerSize: 14,
        parallaxStrength: 0.00002 // Reduced for performance
    };

    document.body.style.cursor = 'none';

    gsap.set(cursor, {
        xPercent: -50,
        yPercent: -50,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
    });

    let spinTl = gsap.timeline({ repeat: -1 })
        .to(cursor, { rotation: '+=360', duration: spinDuration, ease: 'none' });

    let activeTarget = null;
    let currentTargetMove = null;
    let currentLeaveHandler = null;
    let isAnimatingToTarget = false;
    let lastMoveTime = 0;
    const moveThrottle = 16; // ~60fps

    function cleanupTarget(target) {
        if (currentTargetMove) {
            target.removeEventListener('mousemove', currentTargetMove);
        }
        if (currentLeaveHandler) {
            target.removeEventListener('mouseleave', currentLeaveHandler);
        }
        currentTargetMove = null;
        currentLeaveHandler = null;
    }

    function moveCursor(x, y) {
        const now = performance.now();
        if (now - lastMoveTime < moveThrottle) return;
        lastMoveTime = now;

        gsap.to(cursor, {
            x,
            y,
            duration: 0.1,
            ease: 'power2.out'
        });
    }

    function updateCorners(target, mouseX, mouseY) {
        if (!target) return;

        const rect = target.getBoundingClientRect();
        const cursorRect = cursor.getBoundingClientRect();
        const cursorCenterX = cursorRect.left + cursorRect.width / 2;
        const cursorCenterY = cursorRect.top + cursorRect.height / 2;

        const [tlc, trc, brc, blc] = corners;
        const offsets = [
            { x: rect.left - cursorCenterX - constants.borderWidth, y: rect.top - cursorCenterY - constants.borderWidth },
            { x: rect.right - cursorCenterX + constants.borderWidth - constants.cornerSize, y: rect.top - cursorCenterY - constants.borderWidth },
            { x: rect.right - cursorCenterX + constants.borderWidth - constants.cornerSize, y: rect.bottom - cursorCenterY + constants.borderWidth - constants.cornerSize },
            { x: rect.left - cursorCenterX - constants.borderWidth, y: rect.bottom - cursorCenterY + constants.borderWidth - constants.cornerSize }
        ];

        // Optional parallax effect with throttling
        if (mouseX !== undefined && mouseY !== undefined) {
            const targetCenterX = rect.left + rect.width / 2;
            const targetCenterY = rect.top + rect.height / 2;
            const mouseOffsetX = (mouseX - targetCenterX) * constants.parallaxStrength;
            const mouseOffsetY = (mouseY - targetCenterY) * constants.parallaxStrength;
            
            offsets.forEach(offset => {
                offset.x += mouseOffsetX;
                offset.y += mouseOffsetY;
            });
        }

        gsap.to(corners, {
            duration: 0.2,
            ease: 'power2.out',
            motionPath: false, // Disable complex path calculations
        });

        corners.forEach((corner, index) => {
            gsap.to(corner, {
                x: offsets[index].x,
                y: offsets[index].y,
                duration: 0.2,
                ease: 'power2.out'
            });
        });
    }

    function enterHandler(e) {
        const target = e.target.closest(targetSelector);
        if (!target || !cursor) return;

        if (activeTarget === target) return;
        if (activeTarget) cleanupTarget(activeTarget);

        activeTarget = target;
        gsap.killTweensOf(cursor, 'rotation');
        spinTl.pause();
        gsap.set(cursor, { rotation: 0 });

        isAnimatingToTarget = true;
        updateCorners(target);
        setTimeout(() => { isAnimatingToTarget = false; }, 1);

        const targetMove = (ev) => {
            if (isAnimatingToTarget) return;
            
            // Throttle mouse move updates
            const now = performance.now();
            if (now - lastMoveTime < 32) return; // ~30fps for corner updates
            
            requestAnimationFrame(() => {
                updateCorners(target, ev.clientX, ev.clientY);
            });
        };

        const leaveHandler = () => {
            activeTarget = null;
            isAnimatingToTarget = false;

            const positions = [
                { x: -constants.cornerSize * 1.5, y: -constants.cornerSize * 1.5 },
                { x: constants.cornerSize * 0.5, y: -constants.cornerSize * 1.5 },
                { x: constants.cornerSize * 0.5, y: constants.cornerSize * 0.5 },
                { x: -constants.cornerSize * 1.5, y: constants.cornerSize * 0.5 }
            ];

            corners.forEach((corner, index) => {
                gsap.to(corner, {
                    x: positions[index].x,
                    y: positions[index].y,
                    duration: 0.3,
                    ease: 'power3.out'
                });
            });

            setTimeout(() => {
                if (!activeTarget && cursor) {
                    const currentRotation = gsap.getProperty(cursor, 'rotation') % 360;
                    spinTl.kill();
                    spinTl = gsap.timeline({ repeat: -1 })
                        .to(cursor, { rotation: '+=360', duration: spinDuration, ease: 'none' });
                    gsap.to(cursor, {
                        rotation: currentRotation + 360,
                        duration: spinDuration * (1 - currentRotation / 360),
                        ease: 'none',
                        onComplete: () => spinTl.restart()
                    });
                }
            }, 50);

            cleanupTarget(target);
        };

        currentTargetMove = targetMove;
        currentLeaveHandler = leaveHandler;
        target.addEventListener('mousemove', targetMove, { passive: true });
        target.addEventListener('mouseleave', leaveHandler);
    }

    window.addEventListener('mousemove', (e) => moveCursor(e.clientX, e.clientY), { passive: true });
    window.addEventListener('mouseover', enterHandler, { passive: true });

    window.addEventListener('mousedown', () => {
        gsap.to(dot, { scale: 0.7, duration: 0.2 });
        gsap.to(cursor, { scale: 0.9, duration: 0.15 });
    });
    
    window.addEventListener('mouseup', () => {
        gsap.to(dot, { scale: 1, duration: 0.2 });
        gsap.to(cursor, { scale: 1, duration: 0.15 });
    });

    // Cleanup function
    return () => {
        if (activeTarget) cleanupTarget(activeTarget);
        spinTl.kill();
        document.body.style.cursor = 'auto';
    };
}

// Scroll reveal animations with optimization
function initScrollReveal() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach(el => {
        const textElement = el.querySelector('.scroll-reveal-text');
        if (!textElement) return;

        gsap.fromTo(
            el,
            { transformOrigin: '0% 50%', rotate: 5 },
            {
                ease: 'none',
                rotate: 0,
                scrollTrigger: {
                    trigger: el,
                    start: 'top bottom',
                    end: 'bottom bottom',
                    scrub: 1, // Reduced scrub for smoother performance
                    invalidateOnRefresh: true
                }
            }
        );

        const wordElements = textElement.querySelectorAll('.word');
        if (wordElements.length > 0) {
            gsap.fromTo(
                wordElements,
                { opacity: 0, willChange: 'opacity' },
                {
                    ease: 'none',
                    opacity: 1,
                    stagger: 0.03, // Reduced stagger for performance
                    scrollTrigger: {
                        trigger: el,
                        start: 'top bottom-=20%',
                        end: 'bottom bottom',
                        scrub: 1,
                        invalidateOnRefresh: true
                    }
                }
            );

            gsap.fromTo(
                wordElements,
                { filter: 'blur(8px)' }, // Reduced blur
                {
                    ease: 'none',
                    filter: 'blur(0px)',
                    stagger: 0.03,
                    scrollTrigger: {
                        trigger: el,
                        start: 'top bottom-=20%',
                        end: 'bottom bottom',
                        scrub: 1,
                        invalidateOnRefresh: true
                    }
                }
            );
        }
    });
}

// Optimized fade-in animations
function initFadeInAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Stop observing once visible
            }
        });
    }, { 
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px'
    });

    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

// Optimized initialization
let cursorCleanup = null;

function init() {
    // Quick loading screen hide
    const loading = document.getElementById('loading');
    if (loading) {
        setTimeout(() => {
            loading.style.opacity = '0';
            setTimeout(() => loading.remove(), 500);
        }, 500);
    }

    // Initialize features with proper delays
    setTimeout(() => {
        cursorCleanup = initTargetCursor();
    }, 100);

    setTimeout(() => {
        initScrollReveal();
        initFadeInAnimations();
    }, 200);

    setTimeout(() => {
        main();
    }, 300);
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (cursorCleanup) cursorCleanup();
    if (window.ScrollTrigger) ScrollTrigger.killAll();
});

// Throttled resize handler
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (window.ScrollTrigger) ScrollTrigger.refresh();
    }, 250);
});

// Start when page loads
window.addEventListener('load', init);