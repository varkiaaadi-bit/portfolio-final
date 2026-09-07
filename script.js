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

