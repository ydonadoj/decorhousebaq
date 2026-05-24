/**
 * DECORHOUSE BAQ — LÓGICA PRINCIPAL
 * main.js — Navbar scroll, IntersectionObserver, Contadores animados, Modales
 */

'use strict';

/* ==========================================================================
   1. NAVBAR — SCROLL BEHAVIOR
   Cambia de transparente a sólido al bajar la página.
   ========================================================================== */

const Navbar = (() => {
  const navbar = document.getElementById('navbar');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navLinks = document.getElementById('navLinks');
  let lastScrollY = 0;
  let ticking = false;

  function onScroll() {
    lastScrollY = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }

  function updateNavbar() {
    if (lastScrollY > 60) {
      navbar.classList.add('is-scrolled');
    } else {
      navbar.classList.remove('is-scrolled');
    }
    ticking = false;
  }

  function toggleMenu() {
    const isOpen = navLinks.classList.toggle('is-open');
    hamburgerBtn.classList.toggle('is-active', isOpen);
    hamburgerBtn.setAttribute('aria-expanded', isOpen.toString());
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  function closeMenu() {
    navLinks.classList.remove('is-open');
    hamburgerBtn.classList.remove('is-active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function init() {
    if (!navbar) return;

    window.addEventListener('scroll', onScroll, { passive: true });

    if (hamburgerBtn) {
      hamburgerBtn.addEventListener('click', toggleMenu);
    }

    /* Cerrar menú al hacer clic en un link */
    navLinks.querySelectorAll('.navbar__link').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    /* Cerrar menú al hacer clic fuera */
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && navLinks.classList.contains('is-open')) {
        closeMenu();
      }
    });

    /* Actualizar al redimensionar */
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        closeMenu();
      }
    });
  }

  return { init };
})();


/* ==========================================================================
   2. ANIMACIONES ON SCROLL — IntersectionObserver
   Detecta elementos con clases .fade-up, .fade-left, .fade-right, .scale-in
   y les agrega .is-visible cuando entran en viewport.
   ========================================================================== */

const ScrollAnimations = (() => {
  const ANIMATED_SELECTOR = '.fade-up, .fade-left, .fade-right, .scale-in';

  let observer = null;

  function handleEntry(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('is-visible');
        }, parseInt(delay, 10));
        observer.unobserve(entry.target);
      }
    });
  }

  function init() {
    /* Si el usuario prefiere movimiento reducido, mostrar todo de inmediato */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll(ANIMATED_SELECTOR).forEach(el => {
        el.classList.add('is-visible');
      });
      return;
    }

    observer = new IntersectionObserver(handleEntry, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll(ANIMATED_SELECTOR).forEach(el => {
      observer.observe(el);
    });
  }

  return { init };
})();


/* ==========================================================================
   3. HERO — CARGA DE IMAGEN Y EFECTO PARALLAX SUAVE
   ========================================================================== */

const Hero = (() => {
  function init() {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;

    /* Activar animación de entrada (zoom out suave del fondo) */
    setTimeout(() => {
      heroSection.classList.add('is-loaded');
    }, 100);

    /* Botón WhatsApp del hero abre el chatbot */
    const heroWhatsappBtn = document.getElementById('heroWhatsappBtn');
    if (heroWhatsappBtn) {
      heroWhatsappBtn.addEventListener('click', () => {
        /* Intenta abrir el chatbot si existe, si no redirige directo a WhatsApp */
        if (window.ChatBot && typeof window.ChatBot.open === 'function') {
          window.ChatBot.open();
        } else {
          window.open('https://wa.me/573016094742', '_blank', 'noopener,noreferrer');
        }
      });
    }

    /* Parallax suave en el fondo del hero */
    const heroBg = heroSection.querySelector('.hero__bg');
    if (!heroBg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        heroBg.style.transform = `scale(1) translateY(${scrolled * 0.3}px)`;
      }
    }, { passive: true });
  }

  return { init };
})();


/* ==========================================================================
   4. CONTADOR ANIMADO — Stats bar
   Anima los números del 0 al valor final (data-target).
   ========================================================================== */

const CounterAnimation = (() => {
  const DURATION = 2000; /* ms */

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const start = performance.now();

    el.classList.add('counting');

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / DURATION, 1);
      const easedProgress = easeOutQuart(progress);
      const current = Math.round(easedProgress * target);

      el.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target + suffix;
        el.classList.remove('counting');
      }
    }

    requestAnimationFrame(tick);
  }

  function init() {
    const counters = document.querySelectorAll('.stats__number[data-target]');
    if (!counters.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      counters.forEach(el => {
        el.textContent = el.dataset.target + (el.dataset.suffix || '');
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  return { init };
})();


/* ==========================================================================
   5. MODALES — Política de Privacidad y Términos de Uso
   ========================================================================== */

const Modals = (() => {
  function openModal(modal) {
    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    /* Focus al primer elemento focuseable */
    const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) focusable.focus();
  }

  function closeModal(modal) {
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  function handleTrapFocus(modal, e) {
    if (e.key !== 'Tab') return;
    const focusables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function setupModal(btnId, modalId, closeId, backdropId) {
    const btn = document.getElementById(btnId);
    const modal = document.getElementById(modalId);
    const closeBtn = document.getElementById(closeId);
    const backdrop = document.getElementById(backdropId);

    if (!btn || !modal) return;

    btn.addEventListener('click', () => openModal(modal));

    if (closeBtn) closeBtn.addEventListener('click', () => closeModal(modal));
    if (backdrop) backdrop.addEventListener('click', () => closeModal(modal));

    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal(modal);
      handleTrapFocus(modal, e);
    });
  }

  function init() {
    setupModal('privacyBtn', 'privacyModal', 'privacyClose', 'privacyBackdrop');
    setupModal('termsBtn', 'termsModal', 'termsClose', 'termsBackdrop');
  }

  return { init };
})();


/* ==========================================================================
   6. SMOOTH SCROLL CON OFFSET (compensa la navbar fija)
   ========================================================================== */

const SmoothScroll = (() => {
  function init() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        const navbarHeight = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--navbar-height') || '72',
          10
        );
        const top = target.getBoundingClientRect().top + window.scrollY - navbarHeight;

        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  return { init };
})();


/* ==========================================================================
   7. FOOTER — AÑO DINÁMICO
   ========================================================================== */

function setFooterYear() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
}


/* ==========================================================================
   8. GALERÍA — FILTROS Y LIGHTBOX
   ========================================================================== */

const Gallery = (() => {
  let currentItems = [];
  let currentIndex = 0;

  /* Filtros */
  function initFilters() {
    const filterBtns = document.querySelectorAll('.gallery-filter');
    const items = document.querySelectorAll('.gallery-item');
    if (!filterBtns.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        filterBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        items.forEach(item => {
          const match = filter === 'all' || item.dataset.category === filter;
          item.classList.toggle('is-hidden', !match);
          item.classList.toggle('is-shown', match);
        });

        /* Actualiza lista de items visibles para el lightbox */
        currentItems = Array.from(document.querySelectorAll('.gallery-item:not(.is-hidden)'));
      });
    });
  }

  /* Lightbox */
  function openLightbox(index) {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    currentIndex = index;
    const item = currentItems[currentIndex];
    const img = item.querySelector('.gallery-item__img');
    const category = item.querySelector('.gallery-item__category');
    const title = item.querySelector('.gallery-item__title');

    document.getElementById('lightboxImg').src = img.src;
    document.getElementById('lightboxImg').alt = img.alt;
    document.getElementById('lightboxCategory').textContent = category ? category.textContent : '';
    document.getElementById('lightboxTitle').textContent = title ? title.textContent : '';

    lightbox.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    document.getElementById('lightboxClose').focus();
  }

  function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    lightbox.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  function navigate(direction) {
    currentIndex = (currentIndex + direction + currentItems.length) % currentItems.length;
    openLightbox(currentIndex);
  }

  function initLightbox() {
    currentItems = Array.from(document.querySelectorAll('.gallery-item'));

    /* Clic en cada item */
    currentItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        currentItems = Array.from(document.querySelectorAll('.gallery-item:not(.is-hidden)'));
        const visibleIndex = currentItems.indexOf(item);
        if (visibleIndex !== -1) openLightbox(visibleIndex);
      });
    });

    /* Controles del lightbox */
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');
    const backdrop = document.getElementById('lightboxBackdrop');

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (backdrop) backdrop.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', () => navigate(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => navigate(1));

    /* Teclado */
    document.addEventListener('keydown', (e) => {
      const lightbox = document.getElementById('lightbox');
      if (!lightbox || lightbox.hasAttribute('hidden')) return;
      if (e.key === 'Escape')     closeLightbox();
      if (e.key === 'ArrowLeft')  navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    });
  }

  function init() {
    initFilters();
    initLightbox();
  }

  return { init };
})();


/* ==========================================================================
   9. SERVICIOS — BOTONES COTIZAR (pre-seleccionar servicio en chatbot/contacto)
   ========================================================================== */

const ServiceButtons = (() => {
  function init() {
    document.querySelectorAll('.service-card__btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const service = btn.dataset.service;

        /* Si el chatbot está disponible (Fase 3), abrir con servicio preseleccionado */
        if (window.ChatBot && typeof window.ChatBot.openWithService === 'function') {
          window.ChatBot.openWithService(service);
        } else {
          /* Fallback: scroll al formulario y preseleccionar servicio */
          const select = document.getElementById('formServicio');
          if (select) {
            select.value = service;
            select.dispatchEvent(new Event('change'));
          }
          const contactSection = document.getElementById('contacto');
          if (contactSection) {
            const navbarHeight = 72;
            const top = contactSection.getBoundingClientRect().top + window.scrollY - navbarHeight;
            window.scrollTo({ top, behavior: 'smooth' });
          }
        }
      });
    });
  }

  return { init };
})();


/* ==========================================================================
   10. FORMULARIO DE CONTACTO — VALIDACIÓN Y WHATSAPP
   ========================================================================== */

const ContactForm = (() => {
  const WHATSAPP_NUMBER = '573016094742';

  /* Reglas de validación */
  const validators = {
    nombre: {
      validate: (v) => v.trim().length >= 2 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(v.trim()),
      message: 'Ingresa tu nombre completo (solo letras y espacios).'
    },
    telefono: {
      validate: (v) => /^[\d\s\-\+\(\)]{7,15}$/.test(v.trim()),
      message: 'Ingresa un número de teléfono válido (7-15 dígitos).'
    },
    ciudad: {
      validate: (v) => v.trim().length >= 2,
      message: 'Ingresa el nombre de tu ciudad.'
    },
    servicio: {
      validate: (v) => v !== '',
      message: 'Selecciona el servicio de tu interés.'
    },
    mensaje: {
      validate: (v) => v.trim().length >= 10,
      message: 'Cuéntanos un poco más sobre tu proyecto (mínimo 10 caracteres).'
    }
  };

  function showError(input, message) {
    const errorEl = document.getElementById(input.id + 'Error');
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    if (errorEl) errorEl.textContent = message;
  }

  function showSuccess(input) {
    const errorEl = document.getElementById(input.id + 'Error');
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    if (errorEl) errorEl.textContent = '';
  }

  function validateField(input) {
    const name = input.name;
    const rule = validators[name];
    if (!rule) return true;
    const valid = rule.validate(input.value);
    if (valid) {
      showSuccess(input);
    } else {
      showError(input, rule.message);
    }
    return valid;
  }

  function buildWhatsAppMessage(data) {
    /* Construir el mensaje pre-llenado */
    const text = [
      `¡Hola Decorhouse BAQ! 👋 Los contacto desde su sitio web.`,
      `Mi nombre es *${data.nombre}*.`,
      `Estoy interesado/a en: *${data.servicio}*`,
      `Ciudad: *${data.ciudad}*`,
      `Teléfono: ${data.telefono}`,
      `Mensaje: ${data.mensaje}`,
      `¡Quedo atento/a a su cotización! 😊`
    ].join('\n');

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  }

  function init() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    /* Validación en tiempo real al salir de cada campo */
    form.querySelectorAll('.form-input').forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('is-invalid')) {
          validateField(input);
        }
      });
    });

    /* Submit */
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const inputs = Array.from(form.querySelectorAll('.form-input'));
      let allValid = true;

      inputs.forEach(input => {
        if (!validateField(input)) allValid = false;
      });

      if (!allValid) {
        /* Focus al primer campo inválido */
        const firstInvalid = form.querySelector('.is-invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      /* Construir datos (sanitizados con textContent approach) */
      const data = {
        nombre:   form.querySelector('#formNombre').value.trim(),
        telefono: form.querySelector('#formTelefono').value.trim(),
        ciudad:   form.querySelector('#formCiudad').value.trim(),
        servicio: form.querySelector('#formServicio').value,
        mensaje:  form.querySelector('#formMensaje').value.trim()
      };

      const waURL = buildWhatsAppMessage(data);
      window.open(waURL, '_blank', 'noopener,noreferrer');
    });
  }

  return { init };
})();


/* ==========================================================================
   8. INICIALIZACIÓN
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  Navbar.init();
  ScrollAnimations.init();
  Hero.init();
  CounterAnimation.init();
  Modals.init();
  SmoothScroll.init();
  setFooterYear();
  Gallery.init();
  ServiceButtons.init();
  ContactForm.init();
});
