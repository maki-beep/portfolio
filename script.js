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
      lbl.textContent = 'CREATE';
    }
  });

  // When the initialize button is clicked, shatter the boot screen
  const bootBtn = document.getElementById('boot-continue-btn');
  if (bootBtn) {
    bootBtn.addEventListener('click', () => {
      // Reset the custom cursor
      const ring = document.getElementById('cursor-ring');
      const lbl = document.getElementById('cursor-label');
      if (ring && lbl) {
        ring.classList.remove('hovering');
        lbl.textContent = '';
      }

      // Trigger exit animation
      bootScreen.classList.add('exit');
      
      // Wait for the blur/scale CSS transition to finish, then start Phase 2
      setTimeout(() => {
        bootScreen.remove();
        startPreloader();
      }, 800);
    });
  }
})();


/* ══════════════════════════════════════
   2. HERO ANIMATIONS (Figma Typing Engine)
══════════════════════════════════════ */
function triggerHeroAnimations() {
  // Grab whichever title exists on the current page
  const titleEl = document.getElementById('hero-title-type') || 
                  document.getElementById('gd-project-title') || 
                  document.getElementById('sys-project-title');

  if (PREFERS_REDUCED_MOTION) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    if (titleEl && titleEl.dataset.text) {
      titleEl.innerHTML = titleEl.dataset.text;
    }
    return;
  }

  // Trigger standard reveals
  document.querySelectorAll('.reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), 50 + i * 150);
  });

  // Reusable function to handle typing logic based on data-text
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
      
      if (idx < fullText.length) {
        setTimeout(type, isTag ? 0 : speed);
      }
    }
    
    setTimeout(type, 400);
  }

  // Execute typing 
  typeTarget(titleEl, 50);
}

/* ══════════════════════════════════════
   3. CUSTOM CURSOR & INFINITE CANVAS DRAG
══════════════════════════════════════ */
(function CustomCursorAndCanvas() {
  if (PREFERS_REDUCED_MOTION || window.matchMedia('(pointer: coarse)').matches) return;

  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  const lbl  = document.getElementById('cursor-label');
  const grid = document.getElementById('bg-grid');
  const glowTL = document.getElementById('bg-glow-tl');
  const glowBR = document.getElementById('bg-glow-br');
  
  if (!dot || !ring || !lbl) return;

  const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const dPos  = { x: mouse.x, y: mouse.y };
  const rPos  = { x: mouse.x, y: mouse.y };
  
  let canvasX = 0, canvasY = 0;
  let tgtCanvasX = 0, tgtCanvasY = 0;
  let isDragging = false;
  let startDragX = 0, startDragY = 0;

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    
    // Calculate how far the mouse has dragged
    if (isDragging) {
      tgtCanvasX = e.clientX - startDragX;
      tgtCanvasY = e.clientY - startDragY;
    }
  });

  window.addEventListener('mouseover', e => {
    const target = e.target.closest('a, button, input, textarea, [data-cursor]');
    if (target) {
      ring.classList.add('hovering');
      lbl.textContent = target.getAttribute('data-cursor') || '';
    } else if (!isDragging) {
      ring.classList.remove('hovering');
      lbl.textContent = '';
    }
  });

  // Infinite Canvas Drag Mechanics
  window.addEventListener('mousedown', e => {
    // Prevent dragging when clicking on cards, buttons, or inputs
    if (e.target.closest('a, button, input, textarea, .bento-card, .it-project, .gd-card, .contact-card, .feature-card, #gallery-viewport')) return;
    
    isDragging = true;
    startDragX = e.clientX - tgtCanvasX;
    startDragY = e.clientY - tgtCanvasY;
    
    ring.classList.add('dragging');
    lbl.textContent = 'DRAG';
    document.body.style.cursor = 'grabbing';
  });

  window.addEventListener('mouseup', e => {
    isDragging = false;
    ring.classList.remove('dragging');
    document.body.style.cursor = 'none';
    
    if(!e.target.closest('[data-cursor], a, button')) {
       ring.classList.remove('hovering');
       lbl.textContent = '';
    }
  });

  // Main Render Loop for Cursor and Canvas Physics
  function render() {
    // Cursor Physics
    dPos.x += (mouse.x - dPos.x) * 0.35;
    dPos.y += (mouse.y - dPos.y) * 0.35;
    rPos.x += (mouse.x - rPos.x) * 0.15;
    rPos.y += (mouse.y - rPos.y) * 0.15;
    
    dot.style.transform  = `translate3d(${dPos.x}px,${dPos.y}px,0) translate(-50%,-50%)`;
    ring.style.transform = `translate3d(${rPos.x}px,${rPos.y}px,0) translate(-50%,-50%)`;

    // Canvas Parallax Physics (Smooth Easing)
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
   9. GLOBAL TILT ANIMATION FOR ALL CARDS
══════════════════════════════════════ */
(function Tilt() {
  if (PREFERS_REDUCED_MOTION) return;

  const cards = document.querySelectorAll('.tilt-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * -10;
      const ry = ((e.clientX - r.left - r.width  / 2) / (r.width  / 2)) *  10;
      card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02,1.02,1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    });
  });

  const img = document.getElementById('portrait-img');
  if (img) img.addEventListener('error', () => { img.style.display = 'none'; });
})();


/* ══════════════════════════════════════
   10. MAGNETIC BUTTONS
══════════════════════════════════════ */
(function Magnetic() {
  if (PREFERS_REDUCED_MOTION) return;

  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width  / 2) * 0.3;
      const y = (e.clientY - r.top  - r.height / 2) * 0.3;
      btn.style.transform = `translate(${x}px,${y}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0,0)';
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
      if (currentActive) {
        currentActive.classList.add('fade-out');
        
        setTimeout(() => {
          currentActive.classList.remove('active', 'fade-out');
          if (nextActive) nextActive.classList.add('active');
        }, 300); // Matches the CSS exit animation duration
      } else {
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
      if (running) return;
      running = true;
      btn.innerHTML = '<i class="bx bx-loader-alt spin"></i> ...';
      console_.innerHTML = '<span class="console-placeholder">> Executing script...</span>';

      // 1. Simulate the script running
      setTimeout(() => {
        console_.innerHTML = `<span class="console-output">${output}\n<span style="color: #00e5ff;">> [SYS] Redirecting to project documentation...</span></span>`;
        btn.innerHTML = '<i class="bx bx-link-external"></i> DOCS';
        
        // 2. Redirect to the system project page after a short delay
        setTimeout(() => {
          // Navigates to the new system page
          window.location.href = 'system-project.html';
          
          // Reset the button state in case the user clicks the browser 'Back' button
          setTimeout(() => {
            btn.innerHTML = '<i class="bx bx-play"></i> RUN';
            running = false;
            console_.innerHTML = '<span class="console-placeholder">> Status: Ready to execute. Click Run.</span>';
          }, 1000);
        }, 900);
      }, 650);
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
          lbl.textContent = 'MOVE';
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
        lbl.textContent = '';
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
      lbl.textContent = 'DRAG';
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
      lbl.textContent = '';
    }
  });

  viewport.addEventListener('mouseup', () => {
    isDown = false;
    viewport.classList.remove('active');
    
    const ring = document.getElementById('cursor-ring');
    const lbl = document.getElementById('cursor-label');
    if (ring && lbl) {
      ring.classList.remove('dragging');
      lbl.textContent = '';
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