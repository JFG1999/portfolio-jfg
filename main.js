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
  if (!cursor || !trail) return;

  if (window.matchMedia('(pointer: coarse)').matches) {
    cursor.remove();
    trail.remove();
    return;
  }

  let mouseX = 0;
  let mouseY = 0;
  let trailX = 0;
  let trailY = 0;

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
    requestAnimationFrame(animateTrail);
  }
  animateTrail();

  // Hover effect on interactive elements
  function updateHoverTargets() {
    const hoverTargets = document.querySelectorAll('a, button, .photo-window__frame');
    hoverTargets.forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('custom-cursor--hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('custom-cursor--hover'));
    });
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
/* COMIC SCENE SCROLL TRANSITIONS             */
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
      const proximity = Math.abs(centerY - vh / 2) / (vh / 2);
      
      // Fade in as the section approaches the center of the screen
      const opacity = 0.02 + (1 - Math.min(proximity, 1)) * 0.15;
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
/* INITIALIZE EVERYTHING                      */
/* ========================================== */
initPreloader();
initCursor();
initParallax();
initScrollReveal();
initTilt();
initLightbox();
initSceneTransitions();
