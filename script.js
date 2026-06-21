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
     Carousel (scroll-snap + synced dots)
     ------------------------------------------ */
  function initCarousel(carouselEl) {
    var track = carouselEl.querySelector('.carousel__track');
    var prevBtn = carouselEl.querySelector('.carousel__btn--prev');
    var nextBtn = carouselEl.querySelector('.carousel__btn--next');
    var dotsContainer = carouselEl.querySelector('.carousel__dots');
    var slides = carouselEl.querySelectorAll('.carousel__slide');

    if (!track || slides.length === 0) return;

    // When several slides are visible at once (e.g. 3-up on desktop), the cards
    // near the end share the same final scroll offset — centering the very last
    // card is impossible because there is no room left to scroll. So instead of
    // one dot per card, we build one dot per *distinct* scroll position. This
    // guarantees every "next" step actually moves the track and reveals new
    // cards, and the indicator never advances past what can be shown.
    var positions = [];
    var currentIndex = 0;
    var dots = [];

    function getMaxScroll() {
      return Math.max(0, track.scrollWidth - track.clientWidth);
    }

    function getCenteredScroll(slide) {
      var target = slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2;
      return Math.max(0, Math.min(target, getMaxScroll()));
    }

    function computePositions() {
      positions = [];
      slides.forEach(function (slide) {
        var pos = getCenteredScroll(slide);
        // Slides whose centered offset clamps to the same edge collapse onto a
        // single position (1px tolerance absorbs sub-pixel rounding).
        if (!positions.length || Math.abs(pos - positions[positions.length - 1]) > 1) {
          positions.push(pos);
        }
      });
    }

    function buildDots() {
      dotsContainer.innerHTML = '';
      positions.forEach(function (_, index) {
        var dot = document.createElement('button');
        dot.classList.add('carousel__dot');
        dot.setAttribute('type', 'button');
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', 'Слайд ' + (index + 1));
        dot.addEventListener('click', function () {
          goToPosition(index);
        });
        dotsContainer.appendChild(dot);
      });
      dots = dotsContainer.querySelectorAll('.carousel__dot');
    }

    function getCurrentIndex() {
      var scrollLeft = track.scrollLeft;
      var closest = 0;
      var minDist = Infinity;

      positions.forEach(function (pos, i) {
        var dist = Math.abs(pos - scrollLeft);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });

      return closest;
    }

    function updateDots() {
      dots.forEach(function (dot, i) {
        var isActive = i === currentIndex;
        dot.classList.toggle('carousel__dot--active', isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }

    function goToPosition(index, smooth) {
      if (index < 0 || index >= positions.length) return;

      currentIndex = index;
      track.scrollTo({
        left: positions[index],
        behavior: smooth !== false && !prefersReducedMotion ? 'smooth' : 'auto'
      });
      updateDots();
    }

    function onTrackScroll() {
      var index = getCurrentIndex();
      if (index !== currentIndex) {
        currentIndex = index;
        updateDots();
      }
    }

    function rebuild() {
      computePositions();
      buildDots();
      if (currentIndex >= positions.length) {
        currentIndex = positions.length - 1;
      }
      updateDots();
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        goToPosition(currentIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        goToPosition(currentIndex + 1);
      });
    }

    track.addEventListener('scroll', onTrackScroll, { passive: true });

    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPosition(currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToPosition(currentIndex + 1);
      }
    });

    rebuild();

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        rebuild();
        goToPosition(currentIndex, false);
      }, 150);
    });

    // Lazy-loaded images (certificates) change slide widths after init, which
    // shifts every scroll position — recompute once everything has settled.
    window.addEventListener('load', function () {
      rebuild();
      goToPosition(currentIndex, false);
    });
  }

  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    initCarousel(carousel);
  });

})();
