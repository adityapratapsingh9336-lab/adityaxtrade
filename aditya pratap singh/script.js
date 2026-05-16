// Ensure DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Custom Cursor ---
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    const interactiveElements = document.querySelectorAll('.interactive, a, button');

    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0;
    let outlineY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Dot follows instantly
        cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

    // Smooth animation for the outline
    const animateCursor = () => {
        let distX = mouseX - outlineX;
        let distY = mouseY - outlineY;
        
        outlineX += distX * 0.15;
        outlineY += distY * 0.15;
        
        cursorOutline.style.transform = `translate(${outlineX}px, ${outlineY}px)`;
        requestAnimationFrame(animateCursor);
    };
    animateCursor();

    interactiveElements.forEach((el) => {
        el.addEventListener('mouseenter', () => {
            cursorOutline.classList.add('hovering');
        });
        el.addEventListener('mouseleave', () => {
            cursorOutline.classList.remove('hovering');
        });
    });

    // --- 2. Navbar Scroll Effect ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- 3. Three.js Background ---
    const initThreeJS = () => {
        const canvas = document.getElementById('bg-canvas');
        const scene = new THREE.Scene();
        
        // Camera
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 30;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Particles
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 1500;
        const posArray = new Float32Array(particlesCount * 3);
        const colorsArray = new Float32Array(particlesCount * 3);

        const color1 = new THREE.Color('#00FFFF'); // Cyan
        const color2 = new THREE.Color('#8A2BE2'); // Purple

        for(let i = 0; i < particlesCount * 3; i+=3) {
            // Spread particles across a wide area
            posArray[i] = (Math.random() - 0.5) * 100;     // x
            posArray[i+1] = (Math.random() - 0.5) * 100;   // y
            posArray[i+2] = (Math.random() - 0.5) * 50;    // z

            // Mix colors randomly
            const mixedColor = color1.clone().lerp(color2, Math.random());
            colorsArray[i] = mixedColor.r;
            colorsArray[i+1] = mixedColor.g;
            colorsArray[i+2] = mixedColor.b;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

        // Material
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        // Mesh
        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        // Mouse interaction
        let mouseX = 0;
        let mouseY = 0;
        let targetX = 0;
        let targetY = 0;

        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX - window.innerWidth / 2);
            mouseY = (event.clientY - window.innerHeight / 2);
        });

        // Animation Loop
        const clock = new THREE.Clock();

        const tick = () => {
            const elapsedTime = clock.getElapsedTime();

            // Update objects
            particlesMesh.rotation.y = -elapsedTime * 0.05;
            particlesMesh.rotation.x = elapsedTime * 0.02;

            // Ease mouse interaction
            targetX = mouseX * 0.001;
            targetY = mouseY * 0.001;
            
            particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);
            particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);

            // Render
            renderer.render(scene, camera);

            // Call tick again on the next frame
            window.requestAnimationFrame(tick);
        };

        tick();

        // Handle Resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        });
    };

    // Initialize ThreeJS
    if (typeof THREE !== 'undefined') {
        initThreeJS();
    } else {
        console.error("Three.js not loaded.");
    }

    // --- 4. GSAP Animations ---
    gsap.registerPlugin(ScrollTrigger);

    // Hero Entrance
    const heroTl = gsap.timeline();
    heroTl.from(".hero-title", {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.2
    })
    .from(".rotating-text-wrapper", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
    }, "-=0.5")
    .from(".hero-subtitle", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
    }, "-=0.5")
    .from(".hero-buttons", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
    }, "-=0.5");

    // Fade out scroll indicator on scroll
    gsap.to('.scroll-indicator', {
        opacity: 0,
        scrollTrigger: {
            trigger: 'body',
            start: "top top",
            end: "300px top",
            scrub: true
        }
    });

    // Hero Background Image Sequenced Crossfade
    let heroBgTl = gsap.timeline({
        scrollTrigger: {
            trigger: '#hero',
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });

    heroBgTl.to('#hero-img-front', { opacity: 0, duration: 1 })
            .to('#hero-img-mid', { opacity: 0, duration: 1 });

    // Fade out entire Hero Background when entering main content
    gsap.to('#hero-bg-container', {
        opacity: 0,
        scrollTrigger: {
            trigger: 'main',
            start: "top bottom", // Start fading when main enters the bottom of the viewport
            end: "top top",      // Finish fading when main reaches the top of the viewport
            scrub: true
        }
    });
    // Scroll Reveal Elements
    gsap.utils.toArray('.reveal-up').forEach(elem => {
        gsap.fromTo(elem, 
            { y: 50, opacity: 0 },
            { 
                y: 0, 
                opacity: 1, 
                duration: 1, 
                ease: "power3.out",
                scrollTrigger: {
                    trigger: elem,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    gsap.utils.toArray('.reveal-left').forEach(elem => {
        gsap.fromTo(elem, 
            { x: -50, opacity: 0 },
            { 
                x: 0, 
                opacity: 1, 
                duration: 1, 
                ease: "power3.out",
                scrollTrigger: {
                    trigger: elem,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    gsap.utils.toArray('.reveal-right').forEach(elem => {
        gsap.fromTo(elem, 
            { x: 50, opacity: 0 },
            { 
                x: 0, 
                opacity: 1, 
                duration: 1, 
                ease: "power3.out",
                scrollTrigger: {
                    trigger: elem,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // Stat Counters Animation
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        ScrollTrigger.create({
            trigger: stat,
            start: "top 85%",
            once: true,
            onEnter: () => {
                let obj = { val: 0 };
                gsap.to(obj, {
                    val: target,
                    duration: 2,
                    ease: "power2.out",
                    onUpdate: () => {
                        stat.innerHTML = Math.floor(obj.val);
                    }
                });
            }
        });
    });

    // Roadmap Timeline Line
    gsap.to('.timeline-progress', {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
            trigger: '#roadmap',
            start: "top center",
            end: "bottom center",
            scrub: true
        }
    });

    // Roadmap Dots
    gsap.utils.toArray('.timeline-item').forEach((item, i) => {
        const dot = item.querySelector('.timeline-dot');
        ScrollTrigger.create({
            trigger: item,
            start: "top center",
            onEnter: () => dot.classList.add('glow-purple', 'bg-neonPurple'),
            onLeaveBack: () => dot.classList.remove('glow-purple', 'bg-neonPurple')
        });
    });

    // --- 5. 3D Tilt Effect on Service Cards ---
    const cards = document.querySelectorAll('.service-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg tilt
            const rotateY = ((x - centerX) / centerX) * 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
            card.style.transition = 'transform 0.5s ease';
        });
        
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none'; // Remove transition for instant follow
        });
    });

});
