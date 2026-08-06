/* ============================================================
   MIKAEL SANTINO PINEDA — PORTFOLIO
   script.js
   ============================================================ */

'use strict';

const PREFERS_REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ══════════════════════════════════════
   1. BOOT SEQUENCE & PRELOADER
══════════════════════════════════════ */

// Phase 2: The Cinematic Loading Counter
function startPreloader() {
  const el = document.getElementById('preloader');
  if (!el) {
    setTimeout(triggerHeroAnimations, 100);
    return;
  }

  const pctEl = document.getElementById('loader-pct');
  const barEl = document.getElementById('loader-bar');
  const logEl = document.getElementById('loader-log-text');

  function finish() {
    el.classList.add('exit');
    document.body.style.overflow = '';
    el.addEventListener('transitionend', () => el.remove(), { once: true });
    setTimeout(triggerHeroAnimations, 400); 
  }

  if (PREFERS_REDUCED_MOTION || !pctEl || !barEl || !logEl) {
    finish();
    return;
  }

  const logs = [
    "SYS.BOOT_SEQUENCE()",
    "COMPILING_LOGIC...",
    "RENDERING_VECTORS...",
    "ESTABLISHING_ROUTING...",
    "CALIBRATING_COLOR_SPACE...",
    "MOUNTING_DOM...",
    "APPLYING_SHADERS...",
    "WORKSPACE_READY"
  ];

  let progress = 0;
  let stepIdx = 0;

  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 4) + 1; 
    if (progress >= 100) progress = 100;

    barEl.style.width = progress + '%';
    pctEl.textContent = progress;

    const expectedStep = Math.min(Math.floor((progress / 100) * logs.length), logs.length - 1);
    if (expectedStep > stepIdx) {
      stepIdx = expectedStep;
      logEl.textContent = logs[stepIdx];
    }

    if (progress === 100) {
      clearInterval(interval);
      logEl.textContent = "SYSTEM.ONLINE";
      logEl.style.color = "var(--accent-cyan)";
      setTimeout(finish, 600);
    }
  }, 30); 
}

// Phase 1: The Interactive "Click to Initialize" Screen
(function BootSequence() {
  const bootScreen = document.getElementById('boot-screen');
  
  // If there is no boot screen, skip straight to the preloader
  if (!bootScreen || PREFERS_REDUCED_MOTION) {
    if (bootScreen) bootScreen.remove();
    startPreloader();
    return;
  }

  // Lock scrolling while waiting for user input
  document.body.style.overflow = 'hidden';
  window.scrollTo(0, 0);

  // --- Add this block to trigger the Figma typing effect ---
  const bootTitle = document.getElementById('boot-title-type');
  if (bootTitle && !PREFERS_REDUCED_MOTION) {
    const text = bootTitle.getAttribute('data-text');
    let idx = 0;
    let isTag = false;

    function typeBootName() {
      const char = text.charAt(idx);
      if (char === '<') isTag = true;
      if (char === '>') isTag = false;
      
      idx++;
      bootTitle.innerHTML = text.slice(0, idx);
      
      if (idx < text.length) {
        setTimeout(typeBootName, isTag ? 0 : 80);
      }
    }
    // Start typing after the entrance animation finishes
    setTimeout(typeBootName, 800); 
  }
  // ---------------------------------------------------------

  // Make the custom cursor say "CREATE" when hovering over the boot screen
  bootScreen.addEventListener('mousemove', () => {
    const ring = document.getElementById('cursor-ring');
    const lbl = document.getElementById('cursor-label');
    if (ring && lbl) {
      ring.classList.add('hovering');
      lbl.textContent = 'You';
    }
  });

  // When the initialize button is clicked, dynamically shatter the boot screen in 3D
  const bootBtn = document.getElementById('boot-continue-btn');
  if (bootBtn) {
    bootBtn.addEventListener('click', () => {
      // Reset the custom cursor
      const ring = document.getElementById('cursor-ring');
      const lbl = document.getElementById('cursor-label');
      if (ring && lbl) {
        ring.classList.remove('hovering');
        lbl.textContent = 'You';
      }

      // Abort and use CSS fallback if GSAP isn't loaded
      if (typeof gsap === 'undefined') {
        bootScreen.classList.add('exit');
        setTimeout(() => { bootScreen.remove(); startPreloader(); }, 800);
        return;
      }

      // Prepare the 3D stage
      gsap.set(bootScreen, { perspective: 1000 });
      const elements = bootScreen.querySelectorAll('.ar-top-text, .figma-edit-box, .ar-subtitle, .ar-btn');
      const grid = bootScreen.querySelector('.boot-overlay-grid');

      // Execute the Shatter Sequence
      const tl = gsap.timeline({
        onComplete: () => {
          bootScreen.remove();
          startPreloader();
        }
      });

      tl.to(elements, {
        opacity: 0,
        z: 300, // Push elements aggressively toward the camera
        scale: 1.5,
        y: () => (Math.random() - 0.5) * 300, // Randomly scatter Y
        x: () => (Math.random() - 0.5) * 300, // Randomly scatter X
        rotationZ: () => (Math.random() - 0.5) * 45, // Random spin
        duration: 0.7,
        stagger: 0.05,
        ease: "power4.in"
      }, 0)
      .to(grid, { opacity: 0, scale: 2.5, duration: 0.7, ease: "power3.in" }, 0)
      .to(bootScreen, { backgroundColor: "transparent", duration: 0.4 }, 0.4);
    });
  }
})();


/* ══════════════════════════════════════
   2. CINEMATIC HERO TIMELINE (GSAP + Typing Engine)
══════════════════════════════════════ */
function triggerHeroAnimations() {
  const titleEl = document.getElementById('hero-title-type') || 
                  document.getElementById('gd-project-title') || 
                  document.getElementById('sys-project-title');

  if (PREFERS_REDUCED_MOTION) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    if (titleEl && titleEl.dataset.text) titleEl.innerHTML = titleEl.dataset.text;
    return;
  }

  // Reusable typing engine (modified to fire instantly when called by GSAP)
  function typeTarget(el, speed = 50) {
    if (!el || !el.dataset.text) return; 
    const fullText = el.dataset.text;
    let idx = 0;
    let isTag = false;
    
    function type() {
      const char = fullText.charAt(idx);
      if (char === '<') isTag = true;
      if (char === '>') isTag = false;
      
      idx++;
      el.innerHTML = fullText.slice(0, idx);
      
      if (idx < fullText.length) setTimeout(type, isTag ? 0 : speed);
    }
    type(); // Start immediately
  }

  // Check if we are on the main page with the Hero section AND GSAP is loaded
  const figmaBox = document.querySelector('.hero-left .figma-edit-box');
  
  if (figmaBox && typeof gsap !== 'undefined') {
    // 1. Hand control from CSS to GSAP by removing the 'reveal' class
    document.querySelectorAll('.hero .reveal').forEach(el => el.classList.remove('reveal'));

    // Select all the individual parts for choreography
    const figmaUI = document.querySelectorAll('.hero-left .f-anchor, .hero-left .f-label-top, .hero-left .f-label-bottom');
    const portrait = document.querySelector('.hero-right .portrait-card');
    const subtitle = document.querySelector('.hero-subtitle-wrap');
    const buttons = document.querySelectorAll('.hero-btns a');
    const stats = document.querySelectorAll('.hero-stat');

    // 2. Set Initial Hidden States
    gsap.set(figmaBox, { opacity: 0, scale: 0.98, y: 20 });
    gsap.set(figmaUI, { opacity: 0, scale: 0 }); // Shrink anchors and labels
    gsap.set(portrait, { opacity: 0, x: 50, filter: "blur(12px)" }); // Push right and blur
    gsap.set([subtitle, buttons, stats], { opacity: 0, y: 20 });

    // 3. Build the Master Sequence Timeline
    const tl = gsap.timeline({ delay: 0.2 });

    tl.to(figmaBox, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" })
      // Pop the Figma UI anchors and labels into place
      .to(figmaUI, { opacity: 1, scale: 1, duration: 0.4, stagger: 0.05, ease: "back.out(2.5)" }, "-=0.3")
      // Fire the custom typing effect
      .call(() => typeTarget(titleEl, 35))
      // Wait for the typing to make progress, then slide the portrait in from the side
      .to(portrait, { opacity: 1, x: 0, filter: "blur(0px)", duration: 1.2, ease: "power4.out" }, "+=0.2")
      // Cascade the remaining text and buttons seamlessly
      .to(subtitle, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.9")
      .to(buttons, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }, "-=0.7")
      .to(stats, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }, "-=0.6");

  } else {
    // Fallback for inner pages (like the project pages) or if GSAP fails
    typeTarget(titleEl, 50);
  }

  // Fire any remaining standard CSS reveals on the page (like the About/Project headers)
  document.querySelectorAll('.reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), 50 + i * 150);
  });
}

/* ══════════════════════════════════════
   3. CUSTOM CURSOR & INFINITE CANVAS DRAG
══════════════════════════════════════ */
(function CustomCursorAndCanvas() {
  if (PREFERS_REDUCED_MOTION || window.matchMedia('(pointer: coarse)').matches) return;

  const ring = document.getElementById('cursor-ring');
  const lbl  = document.getElementById('cursor-label');
  const grid = document.getElementById('bg-grid');
  const glowTL = document.getElementById('bg-glow-tl');
  const glowBR = document.getElementById('bg-glow-br');
  
  if (!ring || !lbl) return;

  const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const rPos  = { x: mouse.x, y: mouse.y };
  
  let canvasX = 0, canvasY = 0;
  let tgtCanvasX = 0, tgtCanvasY = 0;
  let isDragging = false;
  let startDragX = 0, startDragY = 0;

  lbl.textContent = 'You';

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    
    if (isDragging) {
      tgtCanvasX = e.clientX - startDragX;
      tgtCanvasY = e.clientY - startDragY;
    }
  });

  window.addEventListener('mouseover', e => {
    const target = e.target.closest('a, button, input, textarea, [data-cursor]');
    if (target) {
      ring.classList.add('hovering');
      lbl.textContent = target.getAttribute('data-cursor') || 'CLICK';
    } else if (!isDragging) {
      ring.classList.remove('hovering');
      lbl.textContent = 'You';
    }
  });

  window.addEventListener('mousedown', e => {
    if (e.target.closest('a, button, input, textarea, .bento-card, .it-project, .gd-card, .contact-card, .feature-card, #gallery-viewport')) return;
    
    isDragging = true;
    startDragX = e.clientX - tgtCanvasX;
    startDragY = e.clientY - tgtCanvasY;
    
    ring.classList.add('dragging');
    lbl.textContent = 'You';
   /* cursor grab removed */
  });

  window.addEventListener('mouseup', e => {
    isDragging = false;
    ring.classList.remove('dragging');
    /* cursor none removed */
    
    if(!e.target.closest('[data-cursor], a, button')) {
       ring.classList.remove('hovering');
       lbl.textContent = 'You';
    }
  });

  function render() {
    rPos.x += (mouse.x - rPos.x) * 0.7;
    rPos.y += (mouse.y - rPos.y) * 0.7;
    
    ring.style.transform = `translate3d(${rPos.x}px,${rPos.y}px,0)`;

    canvasX += (tgtCanvasX - canvasX) * 0.08;
    canvasY += (tgtCanvasY - canvasY) * 0.08;
    
    if (grid) grid.style.backgroundPosition = `${canvasX}px ${canvasY}px`;
    if (glowTL) glowTL.style.transform = `translate3d(${canvasX * 0.05}px, ${canvasY * 0.05}px, 0)`;
    if (glowBR) glowBR.style.transform = `translate3d(${canvasX * 0.03}px, ${canvasY * 0.03}px, 0)`;

    requestAnimationFrame(render);
  }
  render();
})();

/* ══════════════════════════════════════
   4. SCROLL PROGRESS
══════════════════════════════════════ */
(function ScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrolled = document.documentElement.scrollTop;
    const total    = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    bar.style.width = (total > 0 ? (scrolled / total * 100) : 0) + '%';
  }, { passive: true });
})();


/* ══════════════════════════════════════
   5. HEADER — scroll + mobile menu
══════════════════════════════════════ */
(function Header() {
  const header     = document.getElementById('header');
  const toggle     = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!header || !toggle || !mobileMenu) return;

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });

  document.querySelectorAll('.mobile-link, .mobile-resume').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });
})();


/* ══════════════════════════════════════
   6. BACKGROUND PARTICLE CANVAS
══════════════════════════════════════ */
(function ParticleCanvas() {
  if (PREFERS_REDUCED_MOTION) return;

  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [], mouse = { x: -1000, y: -1000 };
  const COUNT  = window.innerWidth < 768 ? 30 : 60;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function init() {
    particles = [];
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x:   Math.random() * W,
        y:   Math.random() * H,
        vx:  (Math.random() - 0.5) * 0.5,
        vy:  (Math.random() - 0.5) * 0.5,
        hue: 260 + Math.random() * 30
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        const force = (150 - dist) / 150;
        p.x += (dx / dist) * force * 2;
        p.y += (dy / dist) * force * 2;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue},83%,56%,0.6)`;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const ddx = p.x - p2.x, ddy = p.y - p2.y;
        const d = Math.sqrt(ddx * ddx + ddy * ddy);
        if (d < 110) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x, p2.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `hsla(${p.hue},83%,56%,${0.2 * (1 - d / 110)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  window.addEventListener('resize', () => { resize(); init(); }, { passive: true });
  resize(); init(); draw();
})();


/* ══════════════════════════════════════
   7. BINARY RAIN CANVAS
══════════════════════════════════════ */
(function BinaryRain() {
  if (PREFERS_REDUCED_MOTION) return;

  const canvas = document.getElementById('binary-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, drops = [];
  const FONT = 14;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    const cols = Math.floor(W / FONT);
    drops = Array.from({ length: cols }, () => Math.random() * -100);
  }

  function draw() {
    ctx.fillStyle = 'rgba(19,19,24,0.1)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(147,51,234,0.15)';
    ctx.font = FONT + 'px monospace';
    drops.forEach((y, i) => {
      ctx.fillText(Math.random() > 0.5 ? '1' : '0', i * FONT, y * FONT);
      if (y * FONT > H && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    });
  }

  const ro = new ResizeObserver(() => resize());
  ro.observe(canvas.parentElement);
  resize();
  setInterval(draw, 33);
})();


/* ══════════════════════════════════════
   8. PING COUNTER
══════════════════════════════════════ */
(function Ping() {
  const el = document.getElementById('ping');
  if (!el) return;
  setInterval(() => { el.textContent = Math.floor(Math.random() * 15) + 10; }, 2500);
})();


/* ══════════════════════════════════════
   9. GSAP 3D TILT ANIMATION FOR ALL CARDS
══════════════════════════════════════ */
(function TiltGSAP() {
  if (PREFERS_REDUCED_MOTION || typeof gsap === 'undefined') return;

  const cards = document.querySelectorAll('.tilt-card');

  cards.forEach(card => {
    // 1. Prevent CSS transitions from fighting GSAP's 60fps updates
    card.style.transitionProperty = "box-shadow, border-color, filter, background";

    // 2. Create high-performance trackers using strict GSAP properties (rotationX/Y)
    const xTo = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3.out" });
    const yTo = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3.out" });
    const yMove = gsap.quickTo(card, "y", { duration: 0.5, ease: "power3.out" });
    const scaleTo = gsap.quickTo(card, "scale", { duration: 0.5, ease: "back.out(1.5)" });

    card.addEventListener('mouseenter', () => {
      // Enforce 3D perspective every time you hover, ensuring scroll animations don't clear it
      gsap.set(card, { transformPerspective: 1000, transformStyle: "preserve-3d", transformOrigin: "center center" });
      
      yMove(-8); // Replicates the card lift
      scaleTo(1.02); // Replicates the card expansion
    });

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      // Calculate normalized mouse position (-1 to 1)
      const xPos = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const yPos = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      
      xTo(xPos * 10);
      yTo(yPos * -10); // Inverted so the card tilts 'toward' the mouse
    });

    card.addEventListener('mouseleave', () => {
      // Smoothly glide all properties back to resting state
      xTo(0);
      yTo(0);
      yMove(0); 
      scaleTo(1);
    });
  });

  const img = document.getElementById('portrait-img');
  if (img) img.addEventListener('error', () => { img.style.display = 'none'; });
})();


/* ══════════════════════════════════════
   10. GSAP MAGNETIC BUTTONS (Elastic Physics)
══════════════════════════════════════ */
(function MagneticGSAP() {
  if (PREFERS_REDUCED_MOTION || typeof gsap === 'undefined') return;

  document.querySelectorAll('.magnetic').forEach(btn => {
    // gsap.quickTo is highly optimized for tying animations directly to mouse movement
    const xTo = gsap.quickTo(btn, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
    const yTo = gsap.quickTo(btn, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });

    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      // Calculate distance from the center of the button
      const x = (e.clientX - rect.left - rect.width / 2) * 0.4;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.4;
      
      xTo(x);
      yTo(y);
    });

    btn.addEventListener('mouseleave', () => {
      // Snaps the button back to origin with a satisfying elastic bounce
      xTo(0);
      yTo(0);
    });
  });
})();


/* ══════════════════════════════════════
   11. BENTO CARD SPOTLIGHT BORDER
══════════════════════════════════════ */
(function BentoSpotlight() {
  if (PREFERS_REDUCED_MOTION) return;

  const grid = document.getElementById('bento-grid');
  if (!grid) return;
  grid.addEventListener('mousemove', e => {
    grid.querySelectorAll('.bento-card').forEach(card => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top)  + 'px');
    });
  });
})();


/* ══════════════════════════════════════
   10. SCROLL REVEAL & FIGMA TYPING
══════════════════════════════════════ */
(function ScrollRevealAndType() {
  const revealEls = document.querySelectorAll('.reveal');

  // Reusable HTML Typing Engine
  function typeHTML(elementId, fullText, speed = 50) {
    const el = document.getElementById(elementId);
    if (!el || el.getAttribute('data-typed') === 'true') return;
    el.setAttribute('data-typed', 'true'); // Prevent it from typing twice
    
    if (PREFERS_REDUCED_MOTION) {
      el.innerHTML = fullText;
      return;
    }
    
    let idx = 0;
    let isTag = false;
    function type() {
      const char = fullText.charAt(idx);
      if (char === '<') isTag = true;
      if (char === '>') isTag = false;
      
      idx++;
      el.innerHTML = fullText.slice(0, idx);
      
      if (idx < fullText.length) {
        setTimeout(type, isTag ? 0 : speed);
      }
    }
    setTimeout(type, 400); // Wait for the blur reveal to finish before typing
  }

  // If user prefers no motion, just reveal everything instantly
  if (PREFERS_REDUCED_MOTION) {
    revealEls.forEach(el => el.classList.add('visible'));
    typeHTML('about-title-type', "About <span class='f-highlight'>System</span>");
    typeHTML('project-title-type', "Project <span class='f-highlight'>Directory</span>");
    typeHTML('gallery-title-type', "Visual <span class='f-highlight'>Gallery</span>");
    return;
  }

  // Trigger animations when scrolled into view
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
        
        // If this section contains our Figma boxes, trigger the typing!
        if (entry.target.querySelector('#about-title-type')) {
          typeHTML('about-title-type', "About <span class='f-highlight'>System</span>", 50);
        }
        if (entry.target.querySelector('#project-title-type')) {
          typeHTML('project-title-type', "Project <span class='f-highlight'>Directory</span>", 50);
        }
        if (entry.target.querySelector('#gallery-title-type')) {
          typeHTML('gallery-title-type', "Visual <span class='f-highlight'>Gallery</span>", 50);
        }
      }
    });
  }, { threshold: 0.1, rootMargin: '-60px' });

  revealEls.forEach(el => io.observe(el));
})();


/* ══════════════════════════════════════
   13. INTERACTIVE TERMINAL
══════════════════════════════════════ */
(function Terminal() {
  const body  = document.getElementById('terminal-body');
  const input = document.getElementById('terminal-input');
  if (!body || !input) return;

  const COMMANDS = {
    help:     () => 'Available commands: skills, bio, projects, contact, clear, sudo',
    skills:   () => '• Technical: C++, HTML5/CSS3/JS, System Servicing, SQL\n• Creative: Figma, Adobe Photoshop, Illustrator, Brand Design',
    bio:      () => 'Mikael Santino Pineda — 2nd Year Diploma in IT student @ PUP. Actively seeking OJT opportunities.',
    projects: () => '1. puptask (Campus Delivery System)\n2. Altura-579 (Health Tracker UI)\n3. iSkout (PUP Directory)',
    contact:  () => 'Email: pinedamakisantino@gmail.com | Phone: +63 967 235 5196',
    sudo:     () => ({ text: "Permission denied: You need superuser privileges to hire Mikael immediately!\n(Try the contact form instead 😉)", cyan: true }),
    clear:    () => 'CLEAR'
  };

  function addLine(cmd, output, cyan = false) {
    if (cmd !== null) {
      const row = document.createElement('div');
      row.className = 'term-line';
      row.innerHTML = `<div class="term-cmd"><span class="term-user">mikael@pup-it</span>:<span class="term-path">~</span>$ ${escHtml(cmd)}</div>`;
      body.appendChild(row);
    }
    if (output) {
      const out = document.createElement('div');
      out.className = 'term-line';
      const span = document.createElement('span');
      span.className = 'term-output' + (cyan ? ' cyan' : '');
      span.textContent = output;
      out.appendChild(span);
      body.appendChild(out);
    }
    body.scrollTop = body.scrollHeight;
  }

  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  body.addEventListener('click', () => input.focus());

  input.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const cmd = input.value.trim().toLowerCase();
    input.value = '';
    if (!cmd) return;

    const fn = COMMANDS[cmd];
    if (!fn) {
      addLine(cmd, `bash: command not found: ${cmd}. Type 'help' for options.`);
      return;
    }
    if (cmd === 'clear') { body.innerHTML = ''; return; }
    const result = fn();
    if (typeof result === 'string') {
      addLine(cmd, result);
    } else {
      addLine(cmd, result.text, result.cyan);
    }
  });
})();


/* ══════════════════════════════════════
   14. PROJECTS — tabs + code runner + GD filter
══════════════════════════════════════ */
(function Projects() {
  const tabBtns   = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Don't do anything if clicking the already active tab
      if (btn.classList.contains('active')) return;

      const targetId = 'tab-' + btn.dataset.tab;
      const currentActive = document.querySelector('.tab-panel.active');
      const nextActive = document.getElementById(targetId);

      // Update button states
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Animate out the current tab, then animate in the new one
      // Animate out the current tab, then animate in the new one (GSAP Blur & Slide)
      if (currentActive && typeof gsap !== 'undefined') {
        gsap.to(currentActive, {
          opacity: 0,
          y: 15,
          filter: "blur(8px)",
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => {
            currentActive.classList.remove('active');
            currentActive.style.cssText = ""; // Clear inline styles
            
            if (nextActive) {
              nextActive.classList.add('active');
              gsap.fromTo(nextActive, 
                { opacity: 0, y: -15, filter: "blur(8px)" },
                { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.4, ease: "power2.out" }
              );
            }
          }
        });
      } else if (currentActive) {
        // Fallback if GSAP fails to load
        currentActive.classList.remove('active');
        if (nextActive) nextActive.classList.add('active');
      }
    });
  });

  document.querySelectorAll('.code-window').forEach(win => {
    const btn      = win.querySelector('.run-btn');
    const console_ = win.querySelector('.code-console');
    const output   = win.dataset.output || '';
    let running    = false;

    if (!btn || !console_) return;

    btn.addEventListener('click', () => {
      if (running || typeof gsap === 'undefined') return;
      running = true;

      // Extract the lines from your HTML data-output attribute
      const lines = output.split('\n');
      console_.innerHTML = ''; 
      btn.innerHTML = '<i class="bx bx-loader-alt spin"></i> ...';

      // Build the execution timeline
      const tl = gsap.timeline({
        onComplete: () => {
          btn.innerHTML = '<i class="bx bx-link-external"></i> DOCS';
          
          gsap.delayedCall(0.8, () => {
            window.location.href = 'system-project.html'; 
            
            // Background reset in case the user hits the "Back" button on their browser
            gsap.delayedCall(1, () => {
              btn.innerHTML = '<i class="bx bx-play"></i> RUN';
              console_.innerHTML = '<span class="console-placeholder">> Status: Ready to execute. Click Run for Arch.</span>';
              running = false;
            });
          });
        }
      });

      // Stagger the lines appearing one by one
      lines.forEach((line, index) => {
        tl.add(() => {
          const div = document.createElement('div');
          div.className = 'console-output';
          div.style.opacity = '0';
          div.textContent = line;
          console_.appendChild(div);
          
          gsap.to(div, { opacity: 1, duration: 0.2, ease: "none" });
        }, index * 0.35); // 0.35s delay between each line logging
      });

      // Add the final cyan redirect notification
      tl.add(() => {
        const redirect = document.createElement('div');
        redirect.innerHTML = '<br/><span style="color: #00e5ff;">> [SYS] Redirecting to project documentation...</span>';
        redirect.style.opacity = '0';
        console_.appendChild(redirect);
        
        // Pop the final message up slightly
        gsap.fromTo(redirect, 
          { opacity: 0, y: 5 }, 
          { opacity: 1, y: 0, duration: 0.4, ease: "back.out(2)" }
        );
      }, "+=0.3");
    });
  });

  const filterBtns = document.querySelectorAll('.filter-btn');
  const gdCards    = document.querySelectorAll('.gd-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;

      gdCards.forEach(card => {
        const match = f === 'All' || card.dataset.cat === f;

        if (match) {
          card.style.display = '';
          requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.92)';
          setTimeout(() => {
            if (card.style.opacity === '0') card.style.display = 'none';
          }, 300);
        }
      });
    });
  });
})();


/* ══════════════════════════════════════
   15. CONTACT FORM
══════════════════════════════════════ */
(function ContactForm() {
  const form   = document.getElementById('contact-form');
  const btn    = document.getElementById('submit-btn');
  if (!form || !btn) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    btn.disabled     = true;
    btn.innerHTML    = '<i class="bx bx-loader-alt spin"></i> Sending...';

    setTimeout(() => {
      btn.innerHTML = '<i class="bx bx-check"></i> Sent!';
      setTimeout(() => {
        btn.disabled  = false;
        btn.innerHTML = 'Send Message';
        form.reset();
      }, 3000);
    }, 1500);
  });
})();


/* ══════════════════════════════════════
   16. SECTION DIVIDER PULSE ON SCROLL
══════════════════════════════════════ */
(function DividerReveal() {
  const dividers = document.querySelectorAll('.divider-icon');
  if (!dividers.length) return;

  if (PREFERS_REDUCED_MOTION) {
    dividers.forEach(el => { el.style.opacity = '1'; });
    return;
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'scale(1.15)';
        setTimeout(() => { e.target.style.transform = 'scale(1)'; }, 400);
      }
    });
  }, { threshold: 0.5 });

  dividers.forEach(el => {
    el.style.transition = 'opacity 0.4s, transform 0.4s';
    el.style.opacity = '0';
    io.observe(el);
  });
})();

/* ══════════════════════════════════════
   17. THEME TOGGLE
══════════════════════════════════════ */
(function ThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');
  if (!toggleBtn || !icon) return;

  // Retrieve saved theme or default to dark
  const currentTheme = localStorage.getItem('theme') || 'dark';

  function setTheme(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      icon.classList.replace('bx-sun', 'bx-moon');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
      icon.classList.replace('bx-moon', 'bx-sun');
      localStorage.setItem('theme', 'dark');
    }
  }

  // Set initial theme on load
  setTheme(currentTheme);

  // Listen for clicks
  toggleBtn.addEventListener('click', () => {
    const newTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  });
})();

/* ══════════════════════════════════════
   19. DRAGGABLE FIGMA BOXES (With Snap-Back)
══════════════════════════════════════ */
(function DraggableFigmaBoxes() {
  const figmaBoxes = document.querySelectorAll('.figma-edit-box');
  if (!figmaBoxes.length) return;

  figmaBoxes.forEach(box => {
    let isDragging = false;
    let currentX = 0, currentY = 0;
    let initialX = 0, initialY = 0;
    let xOffset = 0, yOffset = 0;

    box.addEventListener('mousedown', dragStart);
    
    // Attach mouseup and mousemove to window so dragging doesn't break if mouse leaves the box fast
    window.addEventListener('mouseup', dragEnd);
    window.addEventListener('mousemove', drag);

    function dragStart(e) {
      // Don't drag if they are selecting text
      if (e.target.tagName.toLowerCase() === 'span' && window.getSelection().toString() !== '') return;
      
      // Remove the spring physics so it follows the mouse instantly without lag
      box.classList.remove('snap-back');
      
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;

      if (e.target === box || box.contains(e.target)) {
        isDragging = true;
        box.classList.add('is-dragging');
        
        // Sync with custom cursor
        const ring = document.getElementById('cursor-ring');
        const lbl = document.getElementById('cursor-label');
        if (ring && lbl) {
          ring.classList.add('dragging');
          lbl.textContent = 'You';
        }
      }
    }

    function dragEnd(e) {
      if (!isDragging) return;
      
      isDragging = false;
      box.classList.remove('is-dragging');
      
      // RUBBER BAND PHYSICS TRIGGER
      // If this box has the boot-box/ar-drag-box classes, reset it to center
      if (box.classList.contains('ar-drag-box')) {
        box.classList.add('snap-back');
        
        // Reset all tracking coordinates
        currentX = 0;
        currentY = 0;
        initialX = 0;
        initialY = 0;
        xOffset = 0;
        yOffset = 0;
        
        // Push the box back to origin (CSS transition handles the bounce)
        box.style.transform = `translate3d(0px, 0px, 0) scale(1)`;
      } else {
        // If it's a normal Figma box (like in About section), leave it where dropped
        initialX = currentX;
        initialY = currentY;
      }
      
      // Reset custom cursor
      const ring = document.getElementById('cursor-ring');
      const lbl = document.getElementById('cursor-label');
      if (ring && lbl) {
        ring.classList.remove('dragging');
        lbl.textContent = 'You';
      }
    }

    function drag(e) {
      if (isDragging) {
        e.preventDefault();
        
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        xOffset = currentX;
        yOffset = currentY;

        // Smooth hardware-accelerated movement
        box.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) scale(1.05)`;
      }
    }
  });
})();

/* ══════════════════════════════════════
   20. 2D DRAGGABLE GALLERY (Drag-to-Scroll)
══════════════════════════════════════ */
(function DraggableGallery() {
  const viewport = document.getElementById('gallery-viewport');
  if (!viewport) return;

  let isDown = false;
  let startX;
  let startY;
  let scrollLeft;
  let scrollTop;

  // Center the gallery on load so the user starts in the middle of the grid
  setTimeout(() => {
    viewport.scrollLeft = (viewport.scrollWidth - viewport.clientWidth) / 2;
    viewport.scrollTop = (viewport.scrollHeight - viewport.clientHeight) / 2;
  }, 100);

  viewport.addEventListener('mousedown', (e) => {
    isDown = true;
    viewport.classList.add('active');
    
    // Connect to your custom cursor
    const ring = document.getElementById('cursor-ring');
    const lbl = document.getElementById('cursor-label');
    if (ring && lbl) {
      ring.classList.add('dragging');
      lbl.textContent = 'You';
    }

    startX = e.pageX - viewport.offsetLeft;
    startY = e.pageY - viewport.offsetTop;
    scrollLeft = viewport.scrollLeft;
    scrollTop = viewport.scrollTop;
  });

  viewport.addEventListener('mouseleave', () => {
    isDown = false;
    viewport.classList.remove('active');
    
    // Safety check to reset cursor if they drag out of bounds
    const ring = document.getElementById('cursor-ring');
    const lbl = document.getElementById('cursor-label');
    if (ring && lbl && ring.classList.contains('dragging')) {
      ring.classList.remove('dragging');
      lbl.textContent = 'You';
    }
  });

  viewport.addEventListener('mouseup', () => {
    isDown = false;
    viewport.classList.remove('active');
    
    const ring = document.getElementById('cursor-ring');
    const lbl = document.getElementById('cursor-label');
    if (ring && lbl) {
      ring.classList.remove('dragging');
      lbl.textContent = 'You';
    }
  });

  viewport.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault(); // Prevents accidental text/image selection
    
    const x = e.pageX - viewport.offsetLeft;
    const y = e.pageY - viewport.offsetTop;
    
    const walkX = (x - startX) * 1.5; // Multiplier adjusts drag speed
    const walkY = (y - startY) * 1.5;
    
    viewport.scrollLeft = scrollLeft - walkX;
    viewport.scrollTop = scrollTop - walkY;
  });
})();

/* ══════════════════════════════════════
   21. GSAP BENTO GRID CASCADE
══════════════════════════════════════ */
(function BentoGSAPStagger() {
  // Abort if GSAP isn't loaded or user prefers reduced motion
  if (PREFERS_REDUCED_MOTION || typeof gsap === 'undefined') return;

  const grid = document.getElementById('bento-grid');
  const cards = document.querySelectorAll('.bento-card');
  if (!grid || cards.length === 0) return;

  // 1. Remove the old CSS '.reveal' class from these specific cards to prevent conflicts
  cards.forEach(card => card.classList.remove('reveal'));

  // 2. Set the initial GSAP state (hidden, pushed down, slightly shrunk)
  gsap.set(cards, { opacity: 0, y: 80, scale: 0.95 });

  // 3. Create a dedicated observer to trigger the GSAP timeline
  const bentoObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      
      // Fire the cascade!
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.1,          // 0.1s delay between each card firing
        ease: "back.out(1.5)", // Creates the mechanical 'pop' / overshoot effect
        onComplete: () => {
          // Clean up the inline GSAP styles after the animation finishes 
          // so your 3D mouse hover tilt effects continue to work perfectly!
          gsap.set(cards, { clearProps: "opacity" });
        }
      });
      
      // Stop observing once the animation has triggered
      bentoObserver.disconnect();
    }
  }, { threshold: 0.15 }); // Triggers when 15% of the grid enters the viewport

  bentoObserver.observe(grid);
})();

/* ══════════════════════════════════════
   22. GSAP SCROLL ANIMATIONS (Projects to Footer)
══════════════════════════════════════ */
(function ScrollAnimationsGSAP() {
  if (PREFERS_REDUCED_MOTION || typeof gsap === 'undefined') return;

  // Reusable observer helper to fire GSAP tweens when elements enter viewport
  function createScrollObserver(targetSelector, animateFunc, options = { threshold: 0.15 }) {
    const elements = document.querySelectorAll(targetSelector);
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateFunc(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, options);

    elements.forEach(el => {
      // Strips old static CSS reveal class to give GSAP 100% smooth control
      el.classList.remove('reveal');
      observer.observe(el);
    });
  }

  // 1. IT Project Cards (Info slides from left, Code Window from right)
  createScrollObserver('.it-project', (project) => {
    const info = project.querySelector('.it-info');
    const codeWin = project.querySelector('.code-window');

    gsap.set([info, codeWin], { opacity: 0 });
    
    const tl = gsap.timeline();
    tl.fromTo(info, 
      { opacity: 0, x: -40, y: 20 }, 
      { opacity: 1, x: 0, y: 0, duration: 0.8, ease: "power3.out" }
    )
    .fromTo(codeWin, 
      { opacity: 0, x: 40, scale: 0.96 }, 
      { opacity: 1, x: 0, scale: 1, duration: 0.8, ease: "power3.out" }, 
      "-=0.6"
    );
  }, { threshold: 0.2 });

  // 2. Graphic Design Cards (Staggered Spring Entrance)
  createScrollObserver('.gd-grid', (grid) => {
    const cards = grid.querySelectorAll('.gd-card');
    gsap.fromTo(cards, 
      { opacity: 0, y: 40, scale: 0.92 }, 
      { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.2)" }
    );
  });

  // 3. Visual Gallery Items (Workspace Grid Stagger)
  createScrollObserver('#gallery-viewport', (viewport) => {
    const items = viewport.querySelectorAll('.g-item');
    gsap.fromTo(items, 
      { opacity: 0, y: 40, scale: 0.92 }, 
      { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.05, ease: "power2.out" }
    );
  }, { threshold: 0.1 });

  // 4. Contact Card & Cascading Form Fields
  createScrollObserver('.contact-card', (card) => {
    const header = card.querySelector('.contact-header');
    const fields = card.querySelectorAll('.form-field');
    const submitBtn = card.querySelector('.btn-submit');

    gsap.set(card, { opacity: 0, y: 50, scale: 0.98 });
    gsap.set([header, ...fields, submitBtn], { opacity: 0, y: 20 });

    const tl = gsap.timeline();
    tl.to(card, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" })
      .to(header, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "-=0.3")
      .to(fields, { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: "power2.out" }, "-=0.2")
      .to(submitBtn, { opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.5)" }, "-=0.2");
  }, { threshold: 0.2 });

  // 5. Footer Fade-In
  createScrollObserver('#footer', (footer) => {
    gsap.fromTo(footer, 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
    );
  }, { threshold: 0.1 });

})();

/* ══════════════════════════════════════
   21. GSAP SCROLL-VELOCITY MARQUEE
══════════════════════════════════════ */
(function MarqueeVelocityGSAP() {
  if (PREFERS_REDUCED_MOTION || typeof gsap === 'undefined') return;

  const tracks = document.querySelectorAll('.marquee-track');
  if (!tracks.length) return;

  tracks.forEach(track => {
    // 1. Disable the static CSS animation so GSAP can take the wheel
    track.style.animation = "none";

    // 2. Create the seamless GSAP infinite loop
    let marqueeTween = gsap.to(track, {
      xPercent: -50,
      repeat: -1,
      duration: 15,
      ease: "linear"
    }).totalProgress(0.5); // Start halfway so it's already populated

    // 3. Add scroll velocity physics
    let lastScroll = window.scrollY;
    let isScrollingDown = true;
    let scrollTimeout;

    window.addEventListener("scroll", () => {
      let currentScroll = window.scrollY;
      isScrollingDown = currentScroll > lastScroll;
      lastScroll = currentScroll;

      // Instantly speed up the marquee (3x speed) based on scroll direction
      gsap.to(marqueeTween, {
        timeScale: isScrollingDown ? 3 : -3, 
        duration: 0.25,
        ease: "power1.in"
      });

      // Clear the previous timeout
      clearTimeout(scrollTimeout);
      
      // When the user stops scrolling, smoothly settle back to normal speed (1 or -1)
      scrollTimeout = setTimeout(() => {
        gsap.to(marqueeTween, {
          timeScale: isScrollingDown ? 1 : -1,
          duration: 0.8,
          ease: "power3.out"
        });
      }, 150);
    });
  });
})();

/* ══════════════════════════════════════
   23. GSAP STACK CARD HOVER STAGGER
══════════════════════════════════════ */
(function StackHoverGSAP() {
  if (PREFERS_REDUCED_MOTION || typeof gsap === 'undefined') return;

  const stackCard = document.querySelector('.stack-card');
  if (!stackCard) return;

  const tools = stackCard.querySelectorAll('.tool-item');

  stackCard.addEventListener('mouseenter', () => {
    // 1. Kill any ongoing bounce animations so it doesn't glitch if you hover rapidly
    gsap.killTweensOf(tools);
    
    // 2. Fire the cascade bounce
    gsap.fromTo(tools, 
      { y: 0, scale: 1 }, 
      { 
        y: -12,             // Jumps up 12 pixels
        scale: 1.05,        // Expands slightly 
        duration: 0.25,     // Fast, snappy jump
        stagger: 0.08,      // 0.08 seconds between each icon jumping
        ease: "power2.out", 
        yoyo: true,         // Tells GSAP to reverse the animation automatically
        repeat: 1           // Do the yoyo once (jump up, then back down)
      }
    );
  });
})();

/* ══════════════════════════════════════
   24. GSAP ORGANIC 3D ARCHITECTURE FLOAT
══════════════════════════════════════ */
(function ArchFloatGSAP() {
  if (PREFERS_REDUCED_MOTION || typeof gsap === 'undefined') return;

  // Select the 3 floating layers in the System Arch card
  const topLayer = document.querySelector('.layer-top');
  const midLayer = document.querySelector('.layer-mid');
  const botLayer = document.querySelector('.layer-bot');

  if (!topLayer || !midLayer || !botLayer) return;

  // Animate their Z-axis continuously using sine waves so they drift out of sync
  gsap.to(topLayer, { z: "+=15", duration: 2.5, yoyo: true, repeat: -1, ease: "sine.inOut" });
  gsap.to(midLayer, { z: "+=10", duration: 3.2, yoyo: true, repeat: -1, ease: "sine.inOut" });
  gsap.to(botLayer, { z: "-=8",  duration: 2.8, yoyo: true, repeat: -1, ease: "sine.inOut" });
})();


/* ══════════════════════════════════════
   25. GSAP HARDWARE SCROLL GEARS
══════════════════════════════════════ */
(function ScrollGearsGSAP() {
  if (PREFERS_REDUCED_MOTION || typeof gsap === 'undefined') return;

  // Target the hardware icons inside the section dividers
  const icons = document.querySelectorAll('.divider-icon i');
  if (!icons.length) return;

  // Spin the icons based on how far down the page the user has scrolled
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    gsap.to(icons, {
      rotation: scrollY * 0.2, // Adjust multiplier to change spin speed
      duration: 0.5,
      ease: "power2.out",
      overwrite: "auto" // Prevents animation stuttering during fast scrolling
    });
  });
})();


