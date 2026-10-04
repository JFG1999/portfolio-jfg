import './style.css';
import captions from './captions.js';

/* ========================================== */
/* PRELOADER                                  */
/* ========================================== */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  let hidden = false;
  const hidePreloader = () => {
    if (hidden) return;
    hidden = true;
    preloader.classList.add('preloader--hidden');
    setTimeout(() => {
      if (preloader.parentNode) {
        preloader.remove();
      }
    }, 900);
  };

  if (document.readyState === 'complete') {
    setTimeout(hidePreloader, 600);
  } else {
    window.addEventListener('load', () => {
      setTimeout(hidePreloader, 600);
    });
    // Fallback: Never hang longer than 1.5 seconds under any circumstances
    setTimeout(hidePreloader, 1500);
  }
}

/* ========================================== */
/* CUSTOM CURSOR                              */
/* ========================================== */
function initCursor() {
  const cursor = document.getElementById('cursor');
  const trail = document.getElementById('cursor-trail');
  const scanner = document.getElementById('cursor-scanner');
  if (!cursor || !trail) return;

  if (window.matchMedia('(pointer: coarse)').matches) {
    cursor.remove();
    trail.remove();
    if (scanner) scanner.remove();
    return;
  }

  let mouseX = 0;
  let mouseY = 0;
  let trailX = 0;
  let trailY = 0;
  let scannerX = 0;
  let scannerY = 0;
  let isOverPhoto = false;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
  });

  function animateTrail() {
    trailX += (mouseX - trailX) * 0.15;
    trailY += (mouseY - trailY) * 0.15;
    trail.style.left = `${trailX}px`;
    trail.style.top = `${trailY}px`;

    // Scanner follows with slightly more lag for organic feel
    if (scanner) {
      scannerX += (mouseX - scannerX) * 0.2;
      scannerY += (mouseY - scannerY) * 0.2;
      scanner.style.left = `${scannerX}px`;
      scanner.style.top = `${scannerY}px`;
    }

    requestAnimationFrame(animateTrail);
  }
  animateTrail();

  // Hover effect on interactive elements + scanner on photos
  function updateHoverTargets() {
    const hoverTargets = document.querySelectorAll('a, button, .photo-window__frame');
    hoverTargets.forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('custom-cursor--hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('custom-cursor--hover'));
    });

    // Scanner visibility only on photo frames
    if (scanner) {
      const photoFrames = document.querySelectorAll('.photo-window__frame');
      photoFrames.forEach((frame) => {
        frame.addEventListener('mouseenter', () => {
          isOverPhoto = true;
          scanner.style.opacity = '1';
        });
        frame.addEventListener('mouseleave', () => {
          isOverPhoto = false;
          scanner.style.opacity = '0';
        });
      });
    }
  }
  updateHoverTargets();
}

/* ========================================== */
/* PARALLAX SCROLLING                         */
/* ========================================== */
function initParallax() {
  const layers = document.querySelectorAll('.parallax-layer');
  if (!layers.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // Disable JS scroll parallax on mobile/touch screens to ensure 60/120fps native GPU scrolling
  if (window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 768) return;

  let ticking = false;

  function updateParallax() {
    const scrollY = window.scrollY;

    layers.forEach((layer) => {
      const speed = parseFloat(layer.dataset.speed) || 0.1;
      const parent = layer.closest('section, footer');
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      const parentTop = rect.top + scrollY;
      const offset = (scrollY - parentTop) * speed;

      layer.style.transform = `translate3d(0, ${offset}px, 0)`;
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });

  updateParallax();
}

/* ========================================== */
/* SCROLL REVEAL (IntersectionObserver)       */
/* ========================================== */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal-on-scroll');
  if (!elements.length) return;

  const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 768;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || isMobile) {
    elements.forEach((el) => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.01,
      rootMargin: '350px 0px 350px 0px',
    }
  );

  elements.forEach((el) => observer.observe(el));
}

/* ========================================== */
/* PHOTO TILT EFFECT                          */
/* ========================================== */
function initTilt() {
  const frames = document.querySelectorAll('[data-tilt] .photo-window__frame');
  if (!frames.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  frames.forEach((frame) => {
    frame.addEventListener('mousemove', (e) => {
      const rect = frame.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      frame.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
    });

    frame.addEventListener('mouseleave', () => {
      frame.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg)';
    });
  });
}

/* ========================================== */
/* LIGHTBOX (Photo Stack)                     */
/* ========================================== */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const stack = document.getElementById('lightbox-stack');
  const counter = document.getElementById('lightbox-counter');
  const caption = document.getElementById('lightbox-caption');
  const btnClose = document.getElementById('lightbox-close');
  const btnPrev = document.getElementById('lightbox-prev');
  const btnNext = document.getElementById('lightbox-next');
  if (!lightbox || !stack) return;

  // Collect all gallery photos
  const allPhotos = Array.from(document.querySelectorAll('.photo-window__frame img'));
  let currentIndex = 0;
  let cards = [];
  let isAnimating = false;

  // Build card elements for the stack
  function buildCards() {
    stack.innerHTML = '';
    cards = allPhotos.map((img, i) => {
      const card = document.createElement('div');
      card.className = 'lightbox__card';
      const cardImg = document.createElement('img');
      cardImg.alt = img.alt;
      cardImg.sizes = '90vw';
      card.appendChild(cardImg);
      stack.appendChild(card);
      return card;
    });
  }

  // Assign CSS classes based on position relative to current
  function updateStack() {
    cards.forEach((card, i) => {
      // Remove all state classes
      card.className = 'lightbox__card';

      const diff = i - currentIndex;

      // Only load photos near the current one (previous + next three)
      const cardImg = card.querySelector('img');
      if (diff >= -1 && diff <= 3 && !cardImg.srcset) {
        cardImg.srcset = allPhotos[i].srcset;
        cardImg.src = allPhotos[i].src;
      }

      if (diff === 0) {
        card.classList.add('lightbox__card--active');
      } else if (diff === 1) {
        card.classList.add('lightbox__card--next');
      } else if (diff === 2) {
        card.classList.add('lightbox__card--behind-1');
      } else if (diff >= 3) {
        card.classList.add('lightbox__card--behind-2');
      } else if (diff === -1) {
        card.classList.add('lightbox__card--prev');
      } else {
        card.classList.add('lightbox__card--hidden');
      }
    });

    // Update counter
    if (counter) {
      counter.textContent = `${currentIndex + 1} / ${allPhotos.length}`;
    }

    // Caption from captions.js (empty fields are skipped)
    if (caption) {
      const name = allPhotos[currentIndex].getAttribute('src').split('/').pop().replace(/-800\.webp$/, '');
      const info = captions[name] || {};
      const line = [info.ort, info.jahr, info.kamera].filter(Boolean).join(' · ');
      caption.replaceChildren();
      if (line) caption.append(line);
      if (info.notiz) {
        const note = document.createElement('em');
        note.textContent = info.notiz;
        caption.append(note);
      }
      caption.hidden = !line && !info.notiz;
    }
  }

  function openLightbox(index) {
    currentIndex = index;
    buildCards();
    updateStack();
    lightbox.removeAttribute('hidden');
    lightbox.offsetHeight; // Force reflow
    lightbox.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.removeAttribute('open');
    document.body.style.overflow = '';
    lightbox.addEventListener('transitionend', () => {
      lightbox.setAttribute('hidden', '');
      stack.innerHTML = '';
    }, { once: true });
  }

  function goNext() {
    if (isAnimating || currentIndex >= allPhotos.length - 1) return;
    isAnimating = true;

    const activeCard = cards[currentIndex];
    activeCard.classList.add('lightbox__card--swiping-left');

    setTimeout(() => {
      currentIndex++;
      updateStack();
      isAnimating = false;
    }, 400);
  }

  function goPrev() {
    if (isAnimating || currentIndex <= 0) return;
    isAnimating = true;

    // Briefly show the previous card swiping in from left
    currentIndex--;
    updateStack();

    // Short delay for the animation to settle
    setTimeout(() => {
      isAnimating = false;
    }, 400);
  }

  // Gesture-aware touch & tap handlers for gallery photos
  allPhotos.forEach((img, i) => {
    const frame = img.closest('.photo-window__frame') || img;
    img.style.cursor = 'none';

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let isTouchActive = false;
    let holdTimer = null;

    frame.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = Date.now();
      isTouchActive = true;

      // Hold finger down -> reveal colored version after 80ms
      holdTimer = setTimeout(() => {
        if (isTouchActive) {
          frame.classList.add('touch-active');
        }
      }, 80);
    }, { passive: true });

    frame.addEventListener('touchmove', (e) => {
      if (!isTouchActive) return;
      const touch = e.touches[0];
      const moveDist = Math.hypot(touch.clientX - touchStartX, touch.clientY - touchStartY);

      // If finger moves more than 6px (user is scrolling), cancel color preview & tap
      if (moveDist > 6) {
        isTouchActive = false;
        clearTimeout(holdTimer);
        frame.classList.remove('touch-active');
      }
    }, { passive: true });

    frame.addEventListener('touchend', (e) => {
      clearTimeout(holdTimer);
      const wasActive = isTouchActive;
      isTouchActive = false;
      frame.classList.remove('touch-active');

      if (!wasActive) return;

      const duration = Date.now() - touchStartTime;
      const touch = e.changedTouches[0];
      const moveDist = Math.hypot(touch.clientX - touchStartX, touch.clientY - touchStartY);

      // Clean tap (duration < 350ms and finger stayed still) -> open lightbox!
      if (duration < 350 && moveDist < 10) {
        openLightbox(i);
      }
    });

    frame.addEventListener('touchcancel', () => {
      clearTimeout(holdTimer);
      isTouchActive = false;
      frame.classList.remove('touch-active');
    });

    // Desktop Click (only triggers for mouse users)
    frame.addEventListener('click', () => {
      if (!window.matchMedia('(pointer: coarse)').matches) {
        openLightbox(i);
      }
    });
  });

  // Navigation
  if (btnNext) btnNext.addEventListener('click', goNext);
  if (btnPrev) btnPrev.addEventListener('click', goPrev);
  if (btnClose) btnClose.addEventListener('click', closeLightbox);

  // Click backdrop to close
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.hasAttribute('open')) return;

    switch (e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowRight':
        goNext();
        break;
      case 'ArrowLeft':
        goPrev();
        break;
    }
  });

  // Touch swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  stack.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  stack.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 60) {
      if (diff > 0) goNext();
      else goPrev();
    }
  }, { passive: true });

  return openLightbox;
}

/* ========================================== */
/* DREAMCORE LIVING EYES (engraved, fatigue)  */
/* ========================================== */
// Each eye is drawn as an old engraving that rips through the page.
// Fatigue grows from the hero (0 = awake) to the footer (1 = overwhelmed),
// with a short recovery in the quiet interludes.

function seededRandom(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

const mix = (a, b, t) => a + (b - a) * t;

function drawEye(f, seed) {
  const r = seededRandom(seed);
  const ink = '#1d1a16';
  const id = `eye${seed}`;
  const cx = 120, cy = 76;
  const shapes = [88, 80, 94];                       // almond, round, narrow
  const half = shapes[Math.floor(r() * 3)];
  const open = mix(1, 0.3, Math.pow(f, 0.9));        // lids droop with fatigue
  const upH = (half === 80 ? 60 : half === 94 ? 46 : 54) * open;
  const loH = (half === 80 ? 38 : 30) * mix(1, 0.9, f);
  const L = cx - half, R = cx + half;
  const tilt = (r() - 0.5) * 8;
  const upper = `M ${L} ${cy + tilt} C ${cx - half * 0.55} ${cy - upH * 1.25} ${cx + half * 0.55} ${cy - upH * 1.25} ${R} ${cy - tilt}`;
  const lower = `C ${cx + half * 0.5} ${cy + loH * 1.2} ${cx - half * 0.5} ${cy + loH * 1.2} ${L} ${cy + tilt}`;
  const outline = `${upper} ${lower} Z`;

  // Ripped hole in the page: the more tired the eye, the more violent the tear
  const amp = 0.12 + f * 0.14;
  const phase = r() * 6;
  const pts = [];
  for (let k = 0; k < 56; k++) {
    const a = (k / 56) * Math.PI * 2;
    let rad = 1 + (r() - 0.5) * amp + Math.sin(a * 3 + phase) * 0.06;
    if (r() < 0.12) rad += (r() < 0.5 ? -1 : 1) * (0.08 + f * 0.1);   // sharp spikes
    pts.push([Math.cos(a) * (half + 24) * rad, Math.sin(a) * 64 * rad]);
  }
  const ring = (scale) => pts.map(([x, y], k) => `${k ? 'L' : 'M'} ${(cx + x * scale).toFixed(1)} ${(cy + 6 + y * scale).toFixed(1)}`).join(' ') + ' Z';
  const hole = ring(1);
  const paperColor = `rgb(${Math.round(mix(236, 222, f))},${Math.round(mix(229, 206, f))},${Math.round(mix(214, 178, f))})`;
  const flapColor = `rgb(${Math.round(mix(205, 180, f))},${Math.round(mix(194, 162, f))},${Math.round(mix(172, 132, f))})`;
  const sclera = `rgb(${Math.round(mix(248, 238, f))},${Math.round(mix(244, 194, f))},${Math.round(mix(236, 184, f))})`;

  // white torn fibres around the hole
  let tear = `<path d="${ring(1.08)}" fill="#f7f2e8" filter="url(#${id}t)"/>`;
  // small rips running outwards
  for (let i = 0; i < 2 + Math.round(f * 2); i++) {
    const [px, py] = pts[Math.floor(r() * pts.length)];
    const ang = Math.atan2(py, px);
    let x = cx + px * 1.06, y = cy + 6 + py * 1.06;
    let d = `M ${x.toFixed(1)} ${y.toFixed(1)}`;
    for (let k = 0; k < 3; k++) {
      x += Math.cos(ang + (r() - 0.5) * 0.9) * (5 + r() * 6 + f * 4);
      y += Math.sin(ang + (r() - 0.5) * 0.9) * (5 + r() * 6 + f * 4);
      d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    tear += `<path d="${d}" fill="none" stroke="#f7f2e8" stroke-width="1.6" stroke-linecap="round"/>`;
  }

  // flaps of the page, peeled outwards (showing their back side)
  let flaps = '';
  for (let i = 0; i < 2 + Math.round(f * 3); i++) {
    const j = Math.floor(r() * pts.length);
    const [ax, ay] = pts[j];
    const [bx, by] = pts[(j + 4 + Math.floor(r() * 4)) % pts.length];
    const mx = (ax + bx) / 2, my = (ay + by) / 2;
    const out = 1.12 + r() * 0.16 + f * 0.12;
    const skew = (r() - 0.5) * 14;
    const tip = [cx + mx * out + skew, cy + 6 + my * out];
    const A = [cx + ax * 1.04, cy + 6 + ay * 1.04], B = [cx + bx * 1.04, cy + 6 + by * 1.04];
    // curled edges: bulge each side slightly so the flap looks bent, not cut
    const bend = (P, Q, k) => [((P[0] + Q[0]) / 2 + (Q[1] - P[1]) * k).toFixed(1), ((P[1] + Q[1]) / 2 - (Q[0] - P[0]) * k).toFixed(1)];
    const c1 = bend(A, tip, 0.18), c2 = bend(tip, B, 0.18);
    const tri = `M ${A[0].toFixed(1)} ${A[1].toFixed(1)} Q ${c1[0]} ${c1[1]} ${tip[0].toFixed(1)} ${tip[1].toFixed(1)} Q ${c2[0]} ${c2[1]} ${B[0].toFixed(1)} ${B[1].toFixed(1)} Z`;
    flaps += `<path d="${tri}" fill="#000" fill-opacity="0.35" transform="translate(3 4)"/>`;
    flaps += `<path d="${tri}" fill="url(#${id}f)" stroke="${ink}" stroke-opacity="0.45" stroke-width="0.7"/>`;
    flaps += `<path d="M ${A[0].toFixed(1)} ${A[1].toFixed(1)} L ${B[0].toFixed(1)} ${B[1].toFixed(1)}" stroke="#f7f2e8" stroke-width="1.4"/>`;
  }

  // the layer behind the page, with a shadow cast by the torn edge
  let back = `<path d="${hole}" fill="${paperColor}"/>`;
  back += `<path d="${hole}" fill="none" stroke="#000" stroke-opacity="${(0.35 + f * 0.2).toFixed(2)}" stroke-width="16" clip-path="url(#${id}h)" filter="url(#${id}b)"/>`;
  // dark circles: hatching + arcs under the eye
  if (f > 0.25) {
    for (let x = L + 30; x < R - 30; x += 5) {
      const y0 = cy + loH + 4;
      const len = 6 + f * 12 * Math.sin(Math.PI * (x - L) / (2 * half));
      back += `<line x1="${x}" y1="${y0}" x2="${x - 4}" y2="${(y0 + len).toFixed(1)}" stroke="${ink}" stroke-opacity="${(0.35 * f).toFixed(2)}" stroke-width="0.8"/>`;
    }
  }
  for (let i = 1; i <= Math.round(f * 3.2); i++) {
    const y = cy + loH * 1.05 + i * 9;
    back += `<path d="M ${L + 20 + i * 6} ${y - 6} Q ${cx} ${y + 12} ${R - 20 - i * 6} ${y - 6}" fill="none" stroke="${ink}" stroke-opacity="${(0.25 + f * 0.35).toFixed(2)}" stroke-width="1.1"/>`;
  }
  // lid creases and engraved shading above the eye
  for (let i = 0; i < 1 + Math.round(f * 2); i++) {
    const off = 14 + i * 8 + (1 - open) * 6;
    back += `<path d="M ${L + 10 + i * 8} ${cy - 4 - i * 2} C ${cx - half * 0.5} ${cy - upH * 1.25 - off} ${cx + half * 0.5} ${cy - upH * 1.25 - off} ${R - 10 - i * 8} ${cy - 4 - i * 2}" fill="none" stroke="${ink}" stroke-width="${i ? 1 : 1.6}" stroke-opacity="${i ? 0.45 : 0.8}"/>`;
  }
  for (let k = 0; k < 14; k++) {
    const x = L + 25 + (k / 13) * (2 * half - 50);
    back += `<line x1="${x.toFixed(1)}" y1="${(cy - upH * 1.05 - 18).toFixed(1)}" x2="${(x + 6).toFixed(1)}" y2="${(cy - upH * 0.95 - 4).toFixed(1)}" stroke="${ink}" stroke-width="0.7" stroke-opacity="${(0.35 + f * 0.4).toFixed(2)}"/>`;
  }

  // the eyeball (clipped to the eye shape)
  let ball = `<path d="${outline}" fill="${sclera}"/>`;
  for (let v = 0; v < Math.round(f * 16); v++) {
    const fromLeft = v % 2 === 0;
    let x = fromLeft ? L + 2 : R - 2;
    let y = cy + (r() - 0.5) * 30;
    let d = `M ${x} ${y.toFixed(1)}`;
    const steps = 3 + Math.floor(r() * 3);
    for (let k = 0; k < steps; k++) {
      x += (fromLeft ? 1 : -1) * (8 + r() * 12);
      y += (r() - 0.5) * 12;
      d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    ball += `<path d="${d}" fill="none" stroke="#a3201c" stroke-width="${(0.5 + f * 0.9).toFixed(2)}" stroke-opacity="${(0.5 + f * 0.4).toFixed(2)}" stroke-linecap="round"/>`;
  }
  const irisR = half === 94 ? 30 : 34;
  const pupilR = mix(10, 15, f);                     // overstimulated: pupils widen
  const iy = cy + (1 - open) * 6;
  let iris = `<circle cx="${cx}" cy="${iy}" r="${irisR}" fill="#efe8da" stroke="${ink}" stroke-width="2"/>`;
  const rays = 34 + Math.floor(r() * 30);
  for (let k = 0; k < rays; k++) {
    const a = (k / rays) * Math.PI * 2 + r() * 0.1;
    const r1 = pupilR + 2 + r() * 3, r2 = irisR - 1 - r() * 6;
    iris += `<line x1="${(cx + Math.cos(a) * r1).toFixed(1)}" y1="${(iy + Math.sin(a) * r1).toFixed(1)}" x2="${(cx + Math.cos(a) * r2).toFixed(1)}" y2="${(iy + Math.sin(a) * r2).toFixed(1)}" stroke="${ink}" stroke-width="0.9" stroke-opacity="0.75"/>`;
  }
  iris += `<circle cx="${cx}" cy="${iy}" r="${irisR - 5}" fill="none" stroke="${ink}" stroke-width="0.6" stroke-dasharray="2 2"/>`;
  iris += `<circle cx="${cx}" cy="${iy}" r="${pupilR.toFixed(1)}" fill="${ink}"/>`;
  iris += `<ellipse cx="${(cx - irisR * 0.35).toFixed(1)}" cy="${(iy - irisR * 0.4).toFixed(1)}" rx="${(6 - f * 3).toFixed(1)}" ry="${(4 - f * 2).toFixed(1)}" fill="#fff" opacity="${(1 - f * 0.7).toFixed(2)}"/>`;
  ball += `<g class="dream-eye__iris">${iris}</g>`;
  ball += `<path d="${upper}" fill="none" stroke="${ink}" stroke-opacity="0.18" stroke-width="${(8 + f * 10).toFixed(1)}" transform="translate(0 4)"/>`;

  // outline, lashes (droop with fatigue), closed-lid line for blinks, tear
  let front = `<path d="${upper}" fill="none" stroke="${ink}" stroke-width="${(3.2 + f).toFixed(1)}" stroke-linecap="round"/>`;
  front += `<path d="M ${R} ${cy - tilt} ${lower}" fill="none" stroke="${ink}" stroke-width="1.6" stroke-linecap="round" stroke-opacity="0.85"/>`;
  const lashes = 9 + Math.floor(r() * 7);
  for (let k = 1; k < lashes; k++) {
    const t = k / lashes, u = 1 - t;
    const x0 = u * u * u * L + 3 * u * u * t * (cx - half * 0.55) + 3 * u * t * t * (cx + half * 0.55) + t * t * t * R;
    const y0 = u * u * u * (cy + tilt) + 3 * u * u * t * (cy - upH * 1.25) + 3 * u * t * t * (cy - upH * 1.25) + t * t * t * (cy - tilt);
    const ang = -Math.PI / 2 + (t - 0.5) * 1.6 + f * 0.54 * (t < 0.5 ? -1 : 1);
    const len = 9 + r() * 7 - f * 3;
    const x1 = x0 + Math.cos(ang) * len, y1 = y0 + Math.sin(ang) * len + f * 6;
    front += `<path d="M ${x0.toFixed(1)} ${y0.toFixed(1)} Q ${((x0 + x1) / 2 + (t - 0.5) * 6).toFixed(1)} ${((y0 + y1) / 2 - 3).toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}" fill="none" stroke="${ink}" stroke-width="1.1" stroke-linecap="round"/>`;
  }
  front += `<path class="dream-eye__lidline" d="M ${L + 4} ${cy + tilt} Q ${cx} ${cy + 14} ${R - 4} ${cy - tilt}" fill="none" stroke="${ink}" stroke-width="2.4" stroke-linecap="round"/>`;
  if (f > 0.85) {
    front += `<path d="M ${L + 8} ${cy + tilt + 3} q -3 10 0 16 q 3 -6 0 -16" fill="#9ec3d6" fill-opacity="0.7" stroke="${ink}" stroke-width="0.8"/>`;
  }

  return `<svg viewBox="0 0 240 150" aria-hidden="true">
    <defs>
      <clipPath id="${id}c"><path d="${outline}"/></clipPath>
      <clipPath id="${id}h"><path d="${hole}"/></clipPath>
      <filter id="${id}w"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="${seed % 100}"/><feDisplacementMap in="SourceGraphic" scale="1.8"/></filter>
      <filter id="${id}t" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.18" numOctaves="2" seed="${seed % 100}"/><feDisplacementMap in="SourceGraphic" scale="${(4 + f * 3).toFixed(1)}"/></filter>
      <filter id="${id}b"><feGaussianBlur stdDeviation="4"/></filter>
      <linearGradient id="${id}f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${flapColor}"/><stop offset="1" stop-color="#8f8370"/></linearGradient>
    </defs>
    <g class="dream-eye__tear">
      ${tear}
      <g filter="url(#${id}w)">${back}</g>
      <g class="dream-eye__ball" clip-path="url(#${id}c)">${ball}</g>
      <g filter="url(#${id}w)">${front}</g>
      ${flaps}
    </g>
  </svg>`;
}

function initLivingEyes() {
  const eyes = Array.from(document.querySelectorAll('.dream-eye'));
  if (!eyes.length) return;

  // Fatigue from the eye's position on the page; interludes are a short rest
  const sections = Array.from(document.querySelectorAll('section, footer'));
  eyes.forEach((eye, i) => {
    const section = eye.closest('section, footer');
    const progress = sections.indexOf(section) / Math.max(1, sections.length - 1);
    let fatigue = Math.pow(progress, 0.85);
    if (section.classList.contains('interlude')) fatigue *= 0.5;
    fatigue = Math.min(1, Math.max(0, fatigue + (Math.sin(i * 12.9898) * 0.04)));
    eye.dataset.fatigue = fatigue.toFixed(2);
    eye.innerHTML = drawEye(fatigue, i * 97 + 13);
  });

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    eyes.forEach((eye) => eye.classList.add('is-torn', 'is-awake'));
    return;
  }

  // The page rips open when an eye scrolls into view, then the eye opens
  const tearObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const eye = entry.target;
      tearObserver.unobserve(eye);
      eye.classList.add('is-torn');
      setTimeout(() => eye.classList.add('is-awake'), 550);
    });
  }, { threshold: 0.6 });
  // wait for the preloader, so the first eyes tear open in view
  setTimeout(() => eyes.forEach((eye) => tearObserver.observe(eye)), 1300);

  // Pupil gaze tracking (Desktop only - skip on touchscreens)
  if (!window.matchMedia('(pointer: coarse)').matches && window.innerWidth > 768) {
    document.addEventListener('mousemove', (e) => {
      eyes.forEach((eye) => {
        const rect = eye.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        const factor = Math.min(Math.hypot(dx, dy) / 400, 1);
        const angle = Math.atan2(dy, dx);
        const maxOffset = 14; // in drawing units
        const iris = eye.querySelector('.dream-eye__iris');
        if (iris) {
          iris.style.transform = `translate(${(Math.cos(angle) * maxOffset * factor).toFixed(1)}px, ${(Math.sin(angle) * maxOffset * 0.6 * factor).toFixed(1)}px)`;
        }
      });
    }, { passive: true });
  }

  // Blinking: calm when awake, slow and heavy when tired,
  // hectic and irregular (with half-closed flutters) when overwhelmed
  const visible = new Set();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => (entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target)));
  });
  eyes.forEach((eye) => observer.observe(eye));

  function blink(eye, fatigue) {
    const hectic = fatigue > 0.78;
    const count = hectic ? 1 + Math.floor(Math.random() * 4) : 1;
    let done = 0;
    const once = () => {
      eye.style.setProperty('--blink-depth', hectic && Math.random() < 0.4 ? '0.4' : '0.05');
      eye.classList.add('is-blinking');
      const hold = hectic ? 60 + Math.random() * 90 : 110 + fatigue * 260;
      setTimeout(() => {
        eye.classList.remove('is-blinking');
        if (++done < count) setTimeout(once, 60 + Math.random() * 140);
      }, hold);
    };
    once();
  }

  eyes.forEach((eye) => {
    const fatigue = parseFloat(eye.dataset.fatigue);
    const hectic = fatigue > 0.78;
    const schedule = () => {
      const wait = hectic ? 500 + Math.random() * 2200 : 2500 + Math.random() * 5500;
      setTimeout(() => {
        if (visible.has(eye) && eye.classList.contains('is-awake') && !eye.classList.contains('dream-eye--shut')) blink(eye, fatigue);
        schedule();
      }, wait);
    };
    schedule();
  });
}

/* ========================================== */
/* DREAMCORE SCENE SCROLL TRANSITIONS         */
/* ========================================== */
function initSceneTransitions() {
  const sections = document.querySelectorAll('.gallery-chapter, .hero, .manifesto, .interlude, footer');
  if (!sections.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // On mobile touch devices, use a fixed clean ambient opacity to prevent scroll framedrops
  if (window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 768) {
    sections.forEach((section) => {
      const layers = section.querySelectorAll('.scene-layer');
      layers.forEach((layer) => {
        layer.style.opacity = '0.55';
      });
    });
    return;
  }

  let ticking = false;

  function update() {
    const vh = window.innerHeight;
    const scrollY = window.scrollY;

    sections.forEach((section) => {
      const layers = section.querySelectorAll('.scene-layer');
      if (!layers.length) return;
      
      const layer = layers[0];
      const rect = section.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const isHero = section.classList.contains('hero');
      
      // Calculate viewport overlap
      const visibleTop = Math.max(0, rect.top);
      const visibleBottom = Math.min(vh, rect.bottom);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);
      const visibilityRatio = Math.min(1, Math.max(0, visibleHeight / Math.min(vh, Math.max(200, rect.height))));

      // Normalized distance from center
      const rawProximity = Math.abs(centerY - vh / 2) / (vh * 0.75);
      const factor = Math.max(0, 1 - rawProximity);
      const smoothed = factor * factor * (3 - 2 * factor);

      const baseMax = isHero ? 0.72 : 0.65;
      const opacity = isHero 
        ? Math.max(0.50, Math.min(baseMax, smoothed * baseMax))
        : Math.max(0.35, Math.min(baseMax, smoothed * baseMax * (visibilityRatio > 0.05 ? 1 : 0.8)));
      
      layer.style.opacity = opacity.toFixed(3);
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update();
}

/* ========================================== */
/* RETRO WINDOWS DISMISS (Option D Shatter)   */
/* ========================================== */
function initRetroWindows() {
  const dismissButtons = document.querySelectorAll('.retro-window__btn--close, .retro-window__btn--dismiss');
  if (!dismissButtons.length) return;

  dismissButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const windowEl = btn.closest('.retro-window');
      if (!windowEl || windowEl.classList.contains('retro-window--shattering')) return;

      windowEl.classList.add('retro-window--shattering');
      setTimeout(() => {
        windowEl.style.display = 'none';
      }, 620);
    });
  });
}

/* ========================================== */
/* START MENU (Navigation + random.exe)       */
/* ========================================== */
function initStartMenu(openPhoto) {
  const button = document.getElementById('start-menu-button');
  const panel = document.getElementById('start-menu-panel');
  const random = document.getElementById('start-menu-random');
  if (!button || !panel) return;

  const setOpen = (open) => {
    panel.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
  };

  button.addEventListener('click', () => setOpen(panel.hidden));

  // Close after choosing an item
  panel.querySelectorAll('.start-menu__item').forEach((item) => {
    item.addEventListener('click', () => setOpen(false));
  });

  // Close when clicking elsewhere or pressing Escape
  document.addEventListener('click', (e) => {
    if (!panel.hidden && !e.target.closest('#start-menu')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) {
      setOpen(false);
      button.focus();
    }
  });

  if (random && openPhoto) {
    random.addEventListener('click', () => {
      const count = document.querySelectorAll('.photo-window__frame img').length;
      openPhoto(Math.floor(Math.random() * count));
    });
  }
}

/* ========================================== */
/* HIDDEN DETAIL: click one eye three times   */
/* ========================================== */
function initSecretEye() {
  const secret = document.getElementById('secret-window');
  const eyes = document.querySelectorAll('.dream-eye');
  if (!secret || !eyes.length) return;

  let lastEye = null;
  let clicks = 0;
  let lastClick = 0;
  let found = false;

  // Eyes sit behind the content layers, so we check the click position
  // against each eye instead of relying on the click target.
  document.addEventListener('click', (e) => {
    if (found || e.target.closest('a, button, .photo-window__frame, .retro-window, #start-menu, #lightbox')) return;

    const eye = Array.from(eyes).find((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    });
    if (!eye) return;

    const now = Date.now();
    clicks = (eye === lastEye && now - lastClick < 1500) ? clicks + 1 : 1;
    lastEye = eye;
    lastClick = now;

    // Small blink as feedback that the eye noticed
    eye.classList.add('dream-eye--shut');
    setTimeout(() => eye.classList.remove('dream-eye--shut'), 160);

    if (clicks < 3) return;
    found = true;

    // All eyes close at once, then the hidden window appears
    setTimeout(() => {
      eyes.forEach((el) => el.classList.add('dream-eye--shut'));
      setTimeout(() => {
        eyes.forEach((el) => el.classList.remove('dream-eye--shut'));
        secret.hidden = false;
      }, 1400);
    }, 200);
  });
}

/* ========================================== */
/* INITIALIZE EVERYTHING                      */
/* ========================================== */
initPreloader();
initCursor();
initParallax();
initScrollReveal();
initTilt();
const openPhoto = initLightbox();
initLivingEyes();
initSceneTransitions();
initRetroWindows();
initStartMenu(openPhoto);
initSecretEye();


