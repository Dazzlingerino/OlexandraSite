(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------
     Footer year
     ------------------------------------------ */
  var yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ------------------------------------------
     Fixed header scroll effect
     ------------------------------------------ */
  var header = document.getElementById('site-header');
  var scrollThreshold = 40;

  function handleHeaderScroll() {
    if (!header) return;
    if (window.scrollY > scrollThreshold) {
      header.classList.add('site-header--scrolled');
    } else {
      header.classList.remove('site-header--scrolled');
    }
  }

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  /* ------------------------------------------
     Mobile menu
     ------------------------------------------ */
  var burgerBtn = document.getElementById('burger-btn');
  var menuCloseBtn = document.getElementById('menu-close-btn');
  var mobileMenu = document.getElementById('mobile-menu');
  var menuOverlay = document.getElementById('menu-overlay');

  function openMenu() {
    if (!mobileMenu || !burgerBtn) return;
    mobileMenu.classList.add('mobile-menu--open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    burgerBtn.setAttribute('aria-expanded', 'true');
    if (menuOverlay) {
      menuOverlay.classList.add('menu-overlay--visible');
      menuOverlay.setAttribute('aria-hidden', 'false');
    }
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (!mobileMenu || !burgerBtn) return;
    mobileMenu.classList.remove('mobile-menu--open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    burgerBtn.setAttribute('aria-expanded', 'false');
    if (menuOverlay) {
      menuOverlay.classList.remove('menu-overlay--visible');
      menuOverlay.setAttribute('aria-hidden', 'true');
    }
    document.body.style.overflow = '';
  }

  if (burgerBtn) {
    burgerBtn.addEventListener('click', function () {
      var isOpen = burgerBtn.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (menuCloseBtn) {
    menuCloseBtn.addEventListener('click', closeMenu);
  }

  if (menuOverlay) {
    menuOverlay.addEventListener('click', closeMenu);
  }

  var menuLinks = document.querySelectorAll('.mobile-menu__link');
  menuLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeMenu();
    }
  });

  /* ------------------------------------------
     Smooth scroll for anchor links
     ------------------------------------------ */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;

      var target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      var headerHeight = header ? header.offsetHeight : 0;
      var targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  });

  /* ------------------------------------------
     Section reveal on scroll
     ------------------------------------------ */
  var revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length > 0) {
    if (prefersReducedMotion) {
      revealElements.forEach(function (el) {
        el.classList.add('reveal--visible');
      });
    } else {
      var revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('reveal--visible');
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
      );

      revealElements.forEach(function (el) {
        revealObserver.observe(el);
      });
    }
  }

  /* ------------------------------------------
     About image soft reveal with gradient
     ------------------------------------------ */
  var aboutImageWrap = document.getElementById('about-image-wrap');

  if (aboutImageWrap) {
    if (prefersReducedMotion) {
      aboutImageWrap.classList.add('about__image-wrap--visible', 'about__image-wrap--revealed');
    } else {
      var aboutObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              aboutImageWrap.classList.add('about__image-wrap--visible');

              setTimeout(function () {
                aboutImageWrap.classList.add('about__image-wrap--revealed');
              }, 800);

              aboutObserver.unobserve(aboutImageWrap);
            }
          });
        },
        { threshold: 0.25 }
      );

      aboutObserver.observe(aboutImageWrap);
    }
  }

  /* ------------------------------------------
     Carousel (scroll-snap + arrows + dots)
     ------------------------------------------ */
  function initCarousel(carouselEl) {
    var track = carouselEl.querySelector('.carousel__track');
    var prevBtn = carouselEl.querySelector('.carousel__btn--prev');
    var nextBtn = carouselEl.querySelector('.carousel__btn--next');
    var dotsContainer = carouselEl.querySelector('.carousel__dots');
    var slides = carouselEl.querySelectorAll('.carousel__slide');

    if (!track || slides.length === 0) return;

    var currentIndex = 0;

    slides.forEach(function (_, index) {
      var dot = document.createElement('button');
      dot.classList.add('carousel__dot');
      dot.setAttribute('type', 'button');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Слайд ' + (index + 1));
      if (index === 0) {
        dot.classList.add('carousel__dot--active');
        dot.setAttribute('aria-selected', 'true');
      }
      dot.addEventListener('click', function () {
        goToSlide(index);
      });
      dotsContainer.appendChild(dot);
    });

    var dots = dotsContainer.querySelectorAll('.carousel__dot');

    function goToSlide(index) {
      if (index < 0) index = 0;
      if (index >= slides.length) index = slides.length - 1;

      currentIndex = index;
      var slide = slides[index];
      var scrollLeft = slide.offsetLeft - track.offsetLeft;

      track.scrollTo({
        left: scrollLeft,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });

      updateDots();
    }

    function updateDots() {
      dots.forEach(function (dot, i) {
        var isActive = i === currentIndex;
        dot.classList.toggle('carousel__dot--active', isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }

    function getCurrentIndexFromScroll() {
      var trackScrollLeft = track.scrollLeft;
      var closest = 0;
      var closestDist = Infinity;

      slides.forEach(function (slide, i) {
        var dist = Math.abs(slide.offsetLeft - track.offsetLeft - trackScrollLeft);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      });

      return closest;
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        goToSlide(currentIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        goToSlide(currentIndex + 1);
      });
    }

    var scrollTimeout;
    track.addEventListener('scroll', function () {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(function () {
        currentIndex = getCurrentIndexFromScroll();
        updateDots();
      }, 80);
    }, { passive: true });

    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToSlide(currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToSlide(currentIndex + 1);
      }
    });
  }

  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    initCarousel(carousel);
  });

})();
