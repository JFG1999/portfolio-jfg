import './style.css';

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

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px',
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
      cardImg.src = img.src;
      cardImg.alt = img.alt;
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

  // Click handlers on gallery photos
  allPhotos.forEach((img, i) => {
    img.style.cursor = 'none';
    img.addEventListener('click', () => openLightbox(i));
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
}

/* ========================================== */
/* ========================================== */
/* DREAMCORE LIVING EYES (Progressive Fatigue)*/
/* ========================================== */
function initLivingEyes() {
  const eyes = document.querySelectorAll('.dream-eye');
  if (!eyes.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Set progressive baseline fatigue based on vertical order
  const totalEyes = eyes.length;
  eyes.forEach((eye, index) => {
    // 0% at hero, reaching 100% at footer
    const baseFatigue = index / Math.max(1, totalEyes - 1);
    eye.style.setProperty('--eye-fatigue', baseFatigue.toFixed(2));
  });

  // Dynamic Scroll Progression: overall fatigue increases as user reads deeper
  function updateFatigueOnScroll() {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const globalProgress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollY / maxScroll)) : 0;

    eyes.forEach((eye, index) => {
      const baseFatigue = index / Math.max(1, totalEyes - 1);
      // Blend base position with current scroll progress
      const dynamicFatigue = Math.min(1, baseFatigue * 0.7 + globalProgress * 0.35);
      eye.style.setProperty('--eye-fatigue', dynamicFatigue.toFixed(2));
    });
  }

  window.addEventListener('scroll', updateFatigueOnScroll, { passive: true });
  updateFatigueOnScroll();

  // Pupil gaze tracking
  document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    eyes.forEach((eye) => {
      const rect = eye.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;

      // Distance and angle
      const dx = mouseX - eyeCenterX;
      const dy = mouseY - eyeCenterY;
      const dist = Math.hypot(dx, dy);

      // Max pupil offset in pixels
      const maxOffset = 6;
      const factor = Math.min(dist / 400, 1);
      const angle = Math.atan2(dy, dx);
      const offsetX = Math.cos(angle) * maxOffset * factor;
      const offsetY = Math.sin(angle) * maxOffset * factor;

      const iris = eye.querySelector('.dream-eye__iris');
      if (iris) {
        iris.style.transform = `translate(calc(-50% + ${offsetX.toFixed(1)}px), calc(-50% + ${offsetY.toFixed(1)}px))`;
      }
    });
  }, { passive: true });

  // Random twitch & slower, heavier blinks for tired eyes
  setInterval(() => {
    const randomEye = eyes[Math.floor(Math.random() * eyes.length)];
    if (!randomEye) return;

    const fatigue = parseFloat(randomEye.style.getPropertyValue('--eye-fatigue') || '0');
    // Tired eyes stay closed slightly longer (120ms fresh -> 240ms exhausted)
    const closeDuration = 120 + Math.round(fatigue * 140);

    const lids = randomEye.querySelectorAll('.dream-eye__lid');
    lids.forEach(lid => {
      lid.style.transform = 'scaleY(1)';
    });

    setTimeout(() => {
      const topLid = randomEye.querySelector('.dream-eye__lid--top');
      const bottomLid = randomEye.querySelector('.dream-eye__lid--bottom');
      if (topLid) topLid.style.transform = `scaleY(${(fatigue * 0.45).toFixed(2)})`;
      if (bottomLid) bottomLid.style.transform = `scaleY(${(fatigue * 0.15).toFixed(2)})`;
    }, closeDuration);
  }, 4000);
}

/* ========================================== */
/* DREAMCORE SCENE SCROLL TRANSITIONS         */
/* ========================================== */
function initSceneTransitions() {
  const sections = document.querySelectorAll('.gallery-chapter, .hero, .manifesto, .interlude, footer');
  if (!sections.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

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
/* INITIALIZE EVERYTHING                      */
/* ========================================== */
initPreloader();
initCursor();
initParallax();
initScrollReveal();
initTilt();
initLightbox();
initLivingEyes();
initSceneTransitions();
initRetroWindows();


