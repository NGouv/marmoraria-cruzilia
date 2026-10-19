
document.documentElement.classList.add('js-motion');

const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.primary-navigation');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

// Cabeçalho ao rolar a página
function updateHeader() {
  if (!header) return;
  header.classList.toggle('scrolled', window.scrollY > 24);
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

// Menu mobile
function closeMenu() {
  if (!menuToggle || !navigation) return;

  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menu');
  navigation.classList.remove('open');
  document.body.classList.remove('menu-open');
}

if (menuToggle && navigation) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';

    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute(
      'aria-label',
      isOpen ? 'Abrir menu' : 'Fechar menu'
    );

    navigation.classList.toggle('open', !isOpen);
    document.body.classList.toggle('menu-open', !isOpen);
  });

  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) closeMenu();
  });
}

// Ano automático no rodapé
const year = document.querySelector('#current-year');

if (year) {
  year.textContent = new Date().getFullYear();
}

// Animações de entrada
const revealItems = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && !motionPreference.matches) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -30px 0px'
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
}

// Galeria com visualização ampliada
const galleryItems = [
  ...document.querySelectorAll('.gallery-item')
];

const lightbox = document.querySelector('.lightbox');

if (lightbox && galleryItems.length > 0) {
  const lightboxImage = lightbox.querySelector('figure img');
  const lightboxCaption = lightbox.querySelector('figcaption');
  const closeButton = lightbox.querySelector('.lightbox-close');
  const previousButton = lightbox.querySelector('.lightbox-prev');
  const nextButton = lightbox.querySelector('.lightbox-next');

  let activeGalleryIndex = 0;
  let lastFocusedElement = null;

  function showGalleryImage(index) {
    activeGalleryIndex =
      (index + galleryItems.length) % galleryItems.length;

    const button = galleryItems[activeGalleryIndex];
    const image = button.querySelector('img');
    const heading = button.closest('.gallery-group')?.querySelector('h3');

    if (!image || !lightboxImage) return;

    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;

    // Mantém somente o título da galeria como legenda
    if (lightboxCaption) {
      lightboxCaption.textContent = heading
        ? heading.textContent.trim()
        : '';
    }
  }

  function openLightbox(index) {
    lastFocusedElement = document.activeElement;

    showGalleryImage(index);
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');

    if (closeButton) closeButton.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');

    if (lastFocusedElement) lastFocusedElement.focus();
  }

  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
  });

  if (closeButton) {
    closeButton.addEventListener('click', closeLightbox);
  }

  if (previousButton) {
    previousButton.addEventListener('click', () => {
      showGalleryImage(activeGalleryIndex - 1);
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      showGalleryImage(activeGalleryIndex + 1);
    });
  }

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (lightbox.classList.contains('active')) {
        closeLightbox();
      }

      closeMenu();
    }

    if (!lightbox.classList.contains('active')) return;

    if (event.key === 'ArrowLeft') {
      showGalleryImage(activeGalleryIndex - 1);
    }

    if (event.key === 'ArrowRight') {
      showGalleryImage(activeGalleryIndex + 1);
    }

    if (event.key === 'Tab' && closeButton && previousButton && nextButton) {
      const focusable = [closeButton, previousButton, nextButton];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
}
