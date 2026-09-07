// Smooth in-page navigation
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Scroll Reveal Animations
const reveal = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      reveal.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(
  '.section, .project-feature, .skill-grid article, .timeline-item, .extra article, .about-card, .training-card'
).forEach(el => {
  el.classList.add('reveal');
  reveal.observe(el);
});

// Hero Photo Fallback Handling
const heroPhoto = document.getElementById('hero-photo');
const photoFallback = document.getElementById('photo-fallback');
if (heroPhoto && photoFallback) {
  const showFallback = () => {
    heroPhoto.style.display = 'none';
    photoFallback.style.display = 'flex';
  };
  const showPhoto = () => {
    heroPhoto.style.display = 'block';
    photoFallback.style.display = 'none';
  };

  heroPhoto.addEventListener('error', showFallback);
  heroPhoto.addEventListener('load', showPhoto);

  // If already checked before script execution
  if (heroPhoto.complete) {
    if (heroPhoto.naturalWidth === 0) {
      showFallback();
    } else {
      showPhoto();
    }
  }
}

// Ambient Cursor Glow Lighting Effect
const cursorGlow = document.querySelector('.cursor-glow');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (cursorGlow && hasFinePointer && !prefersReducedMotion) {
  let mouseX = -1000;
  let mouseY = -1000;
  let currentX = -1000;
  let currentY = -1000;
  let isMoving = false;
  let rafId = null;

  const updateGlow = () => {
    const ease = 0.14;
    currentX += (mouseX - currentX) * ease;
    currentY += (mouseY - currentY) * ease;

    cursorGlow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;

    if (Math.abs(mouseX - currentX) > 0.2 || Math.abs(mouseY - currentY) > 0.2) {
      rafId = requestAnimationFrame(updateGlow);
    } else {
      isMoving = false;
    }
  };

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!cursorGlow.classList.contains('active')) {
      cursorGlow.classList.add('active');
      currentX = mouseX;
      currentY = mouseY;
    }

    if (!isMoving) {
      isMoving = true;
      rafId = requestAnimationFrame(updateGlow);
    }
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    cursorGlow.classList.remove('active');
  });

  document.addEventListener('mouseenter', () => {
    cursorGlow.classList.add('active');
  });
}

// ==========================================================================
// Apple-Inspired Dynamic Liquid Glass Physics & Refraction Engine
// ==========================================================================
if (hasFinePointer && !prefersReducedMotion) {
  const glassCards = Array.from(document.querySelectorAll('.glass-card'));
  const navHeader = document.querySelector('.nav');
  const contactButtons = document.querySelectorAll('.contact-cta, .button.contact-btn');

  // Track cards currently visible in the viewport using IntersectionObserver
  // This guarantees O(visible) instead of O(all) calculations per frame!
  const visibleCards = new Set();
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        visibleCards.add(entry.target);
      } else {
        visibleCards.delete(entry.target);
        // Reset card state when leaving viewport
        entry.target.style.setProperty('--light-intensity', '0');
        entry.target.style.setProperty('--border-intensity', '0.15');
        entry.target.style.setProperty('--tilt-x', '0deg');
        entry.target.style.setProperty('--tilt-y', '0deg');
        entry.target.style.setProperty('--tilt-z', '0px');
      }
    });
  }, { rootMargin: '80px 0px 80px 0px' });

  glassCards.forEach(card => cardObserver.observe(card));

  let mouseX = -2000;
  let mouseY = -2000;
  let isMouseActive = false;
  let engineRafId = null;
  let framesWithoutMotion = 0;

  // Active state cache to avoid redundant DOM writes
  const cardStates = new WeakMap();

  const updateLiquidGlass = () => {
    if (!isMouseActive) {
      // Mouse left window: gracefully reset active cards
      visibleCards.forEach(card => {
        const state = cardStates.get(card);
        if (state && state.active) {
          card.style.setProperty('--light-intensity', '0');
          card.style.setProperty('--border-intensity', '0.15');
          card.style.setProperty('--tilt-x', '0deg');
          card.style.setProperty('--tilt-y', '0deg');
          card.style.setProperty('--tilt-z', '0px');
          state.active = false;
        }
      });
      if (navHeader) {
        navHeader.style.setProperty('--nav-light-opacity', '0');
      }
      engineRafId = null;
      return;
    }

    // 1. Navigation Bar Specular Track
    if (navHeader) {
      navHeader.style.setProperty('--nav-mouse-x', `${mouseX}px`);
      // When cursor is within 180px of top, intensify the nav light streak
      const navDistance = Math.max(0, mouseY - 74);
      const navOpacity = Math.max(0.35, Math.min(1, 1 - (navDistance / 180)));
      navHeader.style.setProperty('--nav-light-opacity', `${navOpacity.toFixed(2)}`);
    }

    // 2. Visible Glass Cards Proximity & Refraction Calculations
    visibleCards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const cardW = rect.width;
      const cardH = rect.height;
      const centerX = rect.left + cardW / 2;
      const centerY = rect.top + cardH / 2;

      const dx = mouseX - centerX;
      const dy = mouseY - centerY;
      const dist = Math.hypot(dx, dy);

      // Card optical reach: larger cards have larger refraction field
      const cardReach = Math.max(cardW, cardH) * 0.6;
      const proximityRadius = cardReach + 420;

      let state = cardStates.get(card);
      if (!state) {
        state = { active: false };
        cardStates.set(card, state);
      }

      if (dist < proximityRadius) {
        state.active = true;
        const lightX = mouseX - rect.left;
        const lightY = mouseY - rect.top;

        // Incident light angle in degrees
        const angleRad = Math.atan2(dy, dx);
        const angleDeg = (angleRad * 180 / Math.PI + 90 + 360) % 360;

        const isHovered = (
          mouseX >= rect.left &&
          mouseX <= rect.right &&
          mouseY >= rect.top &&
          mouseY <= rect.bottom
        );

        let intensity = 0;
        let borderIntensity = 0.15;
        let tiltX = 0;
        let tiltY = 0;
        let tiltZ = 0;

        if (isHovered) {
          intensity = 1.0;
          borderIntensity = 1.0;
          // Smooth 3D liquid tilt when hovering directly
          const normX = (lightX - cardW / 2) / (cardW / 2);
          const normY = (lightY - cardH / 2) / (cardH / 2);
          tiltX = -normY * 2.8;
          tiltY = normX * 2.8;
          tiltZ = 6;
        } else {
          // Dynamic proximity curve (smooth quadratic falloff)
          const factor = Math.max(0, 1 - (dist - cardReach * 0.4) / 420);
          intensity = Math.pow(factor, 1.35);
          borderIntensity = Math.min(1, 0.15 + intensity * 0.85);

          // Subtle ambient tilt towards light source
          const normDx = Math.max(-1, Math.min(1, dx / proximityRadius));
          const normDy = Math.max(-1, Math.min(1, dy / proximityRadius));
          tiltX = -normDy * 1.2 * intensity;
          tiltY = normDx * 1.2 * intensity;
          tiltZ = intensity * 3;
        }

        // Apply optical CSS variables
        card.style.setProperty('--light-x', `${lightX.toFixed(1)}px`);
        card.style.setProperty('--light-y', `${lightY.toFixed(1)}px`);
        card.style.setProperty('--light-angle', `${angleDeg.toFixed(1)}deg`);
        card.style.setProperty('--light-intensity', `${intensity.toFixed(3)}`);
        card.style.setProperty('--border-intensity', `${borderIntensity.toFixed(3)}`);
        card.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
        card.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);
        card.style.setProperty('--tilt-z', `${tiltZ.toFixed(1)}px`);

      } else if (state.active) {
        // Reset once outside proximity range
        card.style.setProperty('--light-intensity', '0');
        card.style.setProperty('--border-intensity', '0.15');
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
        card.style.setProperty('--tilt-z', '0px');
        state.active = false;
      }
    });

    // Idle throttle to conserve power when mouse is still
    framesWithoutMotion++;
    if (framesWithoutMotion < 30) {
      engineRafId = requestAnimationFrame(updateLiquidGlass);
    } else {
      engineRafId = null;
    }
  };

  const wakeEngine = () => {
    framesWithoutMotion = 0;
    if (!engineRafId) {
      engineRafId = requestAnimationFrame(updateLiquidGlass);
    }
  };

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    isMouseActive = true;
    wakeEngine();
  }, { passive: true });

  window.addEventListener('scroll', () => {
    if (isMouseActive) {
      wakeEngine();
    }
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    isMouseActive = false;
    wakeEngine();
  });

  document.addEventListener('mouseenter', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    isMouseActive = true;
    wakeEngine();
  });

  // Contact Buttons Specular Lens Sweep
  contactButtons.forEach(btn => {
    btn.addEventListener('pointermove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      btn.style.setProperty('--btn-x', `${x}px`);
      btn.style.setProperty('--btn-y', `${y}px`);
      btn.style.setProperty('--btn-sheen', '1');
    }, { passive: true });

    btn.addEventListener('pointerleave', () => {
      btn.style.setProperty('--btn-sheen', '0');
    }, { passive: true });
  });
}

// Dynamic Floating Glass Navigation on Scroll
const nav = document.querySelector('.nav');
if (nav) {
  const updateNavGlass = () => {
    if (window.scrollY > 15) {
      nav.classList.add('nav-scrolled');
    } else {
      nav.classList.remove('nav-scrolled');
    }
  };
  window.addEventListener('scroll', updateNavGlass, { passive: true });
  updateNavGlass();
}

