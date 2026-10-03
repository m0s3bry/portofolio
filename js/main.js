/**
 * ====================================================================
 * Portfolio Website - Main JavaScript
 * ====================================================================
 * Modern ES6+ Vanilla JavaScript implementation covering:
 * 1. Smooth Scroll Navigation (Offset by 70px navbar height)
 * 2. Active Section Highlighting (Intersection Observer)
 * 3. Navbar Background on Scroll (> 50px adds 'scrolled')
 * 4. Responsive Mobile Navigation Menu (Toggle, outside & link click)
 * 5. Scroll Reveal Animations (Intersection Observer & Staggered delays)
 * 6. Hero Title Typing Effect & Cursor Blink
 * 7. Animated Statistics Counters on View
 * 8. Back to Top Floating Button (> 500px)
 * 9. Subtle Mousemove Parallax on Hero Elements
 * ====================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ==================================================================
  // Configuration Settings
  // ==================================================================
  const CONFIG = {
    NAVBAR_HEIGHT: 70,              // Height in px for scroll offset
    NAVBAR_SCROLL_THRESHOLD: 50,     // Scroll distance (px) to activate navbar background
    BACK_TO_TOP_THRESHOLD: 500,      // Scroll distance (px) to show back-to-top button
    COUNTER_DURATION: 1800,          // Duration of number counters in ms
    TYPING_SPEED: 100,               // Typing speed per character (ms)
    DELETING_SPEED: 50,              // Backspacing speed per character (ms)
    WORD_PAUSE: 2000,                // Pause at complete word before backspacing (ms)
  };

  // ==================================================================
  // Helper / Utility Functions
  // ==================================================================

  /**
   * Inject baseline styles for utility elements (e.g., cursor blink and dynamic back-to-top)
   * if they are not already defined in the external stylesheet.
   */
  const injectEssentialStyles = () => {
    if (document.getElementById('portfolio-js-injected-styles')) return;

    const styleEl = document.createElement('style');
    styleEl.id = 'portfolio-js-injected-styles';
    styleEl.textContent = `
      .typing-cursor {
        display: inline-block;
        margin-left: 2px;
        font-weight: 300;
        animation: cursorBlink 1s step-end infinite;
      }
      @keyframes cursorBlink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }
      .back-to-top {
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 46px;
        height: 46px;
        border-radius: 50%;
        background: #2563eb;
        color: #ffffff;
        border: none;
        outline: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
        opacity: 0;
        visibility: hidden;
        transform: translateY(15px);
        transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease, background-color 0.2s ease;
        z-index: 999;
      }
      .back-to-top.visible,
      .back-to-top.show,
      .back-to-top.active {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }
      .back-to-top:hover {
        background: #1d4ed8;
        transform: translateY(-3px);
      }
    `;
    document.head.appendChild(styleEl);
  };

  injectEssentialStyles();

  // ==================================================================
  // 1. Smooth Scroll Navigation
  // ==================================================================
  /**
   * Smoothly scrolls to target section offset by navbar height (70px)
   * when any internal hash link is clicked.
   */
  const initSmoothScroll = () => {
    const navAnchors = document.querySelectorAll('a[href^="#"]:not([href="#"]):not([href="#!"])');

    navAnchors.forEach((link) => {
      link.addEventListener('click', (event) => {
        const hash = link.getAttribute('href');
        if (!hash || !hash.startsWith('#')) return;

        const targetElement = document.querySelector(hash);
        if (!targetElement) return;

        event.preventDefault();

        // Calculate offset position relative to current scroll
        const targetTop = targetElement.getBoundingClientRect().top + window.pageYOffset;
        const scrollPosition = Math.max(0, targetTop - CONFIG.NAVBAR_HEIGHT);

        window.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });

        // Update URL hash without instant jump
        if (window.history && window.history.pushState) {
          window.history.pushState(null, '', hash);
        }
      });
    });
  };

  initSmoothScroll();

  // ==================================================================
  // 2. Active Section Highlighting
  // ==================================================================
  /**
   * Uses Intersection Observer to highlight current active navigation link.
   * Options: threshold 0.3, rootMargin: '-70px 0px 0px 0px'
   */
  const initActiveSectionHighlighting = () => {
    const navLinks = document.querySelectorAll('.nav-links a, nav a, .navbar a, .nav-menu a');
    if (!navLinks.length) return;

    // Identify corresponding section elements that have an ID
    const sectionIds = Array.from(navLinks)
      .map((link) => {
        const href = link.getAttribute('href');
        return href && href.startsWith('#') && href.length > 1 ? href.slice(1) : null;
      })
      .filter((id, index, self) => Boolean(id) && self.indexOf(id) === index);

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!sections.length) return;

    const observerOptions = {
      threshold: 0.3,
      rootMargin: '-70px 0px 0px 0px'
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute('id');
          if (!currentId) return;

          navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            if (href === `#${currentId}` || href?.endsWith(`#${currentId}`)) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach((section) => sectionObserver.observe(section));
  };

  initActiveSectionHighlighting();

  // ==================================================================
  // 3. Navbar Background on Scroll
  // ==================================================================
  /**
   * On scroll, if scrollY > 50, adds 'scrolled' class to the navbar
   * to enhance contrast/opacity. Removes it when back at the top.
   */
  const initNavbarBackground = () => {
    const navbar = document.querySelector('.navbar, header.navbar, header, nav');
    if (!navbar) return;

    let ticking = false;

    const updateNavbar = () => {
      if (window.scrollY > CONFIG.NAVBAR_SCROLL_THRESHOLD) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateNavbar);
        ticking = true;
      }
    }, { passive: true });

    // Initial check on page load
    updateNavbar();
  };

  initNavbarBackground();

  // ==================================================================
  // 4. Mobile Menu
  // ==================================================================
  /**
   * Mobile menu controller:
   * - Toggles '.mobile-menu-open' class on document.body when .menu-toggle is clicked
   * - Closes menu when any nav link is clicked
   * - Closes menu when clicking outside
   * - Toggles hamburger animation (adds/removes 'active' class on .menu-toggle)
   */
  const initMobileMenu = () => {
    const menuToggle = document.querySelector('.menu-toggle, .hamburger, [data-menu-toggle]');
    const navMenu = document.querySelector('.nav-menu, .nav-links, .navbar-nav, .mobile-menu');

    if (!menuToggle) return;

    const openMenu = () => {
      document.body.classList.add('mobile-menu-open');
      menuToggle.classList.add('active');
      menuToggle.setAttribute('aria-expanded', 'true');
      if (navMenu) navMenu.classList.add('active');
    };

    const closeMenu = () => {
      document.body.classList.remove('mobile-menu-open');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      if (navMenu) navMenu.classList.remove('active');
    };

    const toggleMenu = (e) => {
      e.stopPropagation();
      const isOpen = document.body.classList.contains('mobile-menu-open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    };

    // Toggle button click
    menuToggle.addEventListener('click', toggleMenu);

    // Close when any nav link is clicked
    const linksToClose = document.querySelectorAll('.nav-links a, .nav-menu a, .navbar-nav a, .mobile-menu a, nav a');
    linksToClose.forEach((link) => {
      link.addEventListener('click', () => {
        if (document.body.classList.contains('mobile-menu-open')) {
          closeMenu();
        }
      });
    });

    // Close when clicking outside of the menu and hamburger toggle
    document.addEventListener('click', (event) => {
      if (!document.body.classList.contains('mobile-menu-open')) return;

      const target = event.target;
      const isInsideToggle = menuToggle.contains(target);
      const isInsideMenu = navMenu ? navMenu.contains(target) : false;

      if (!isInsideToggle && !isInsideMenu) {
        closeMenu();
      }
    });

    // Accessibility: Close on Escape key press
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && document.body.classList.contains('mobile-menu-open')) {
        closeMenu();
      }
    });
  };

  initMobileMenu();

  // ==================================================================
  // 5. Scroll Animations
  // ==================================================================
  /**
   * Observes elements with '.fade-in', '.slide-left', '.slide-right', '.scale-in'
   * and adds 'visible' class once in viewport (threshold: 0.1, triggers once).
   * Applies staggered delays to children inside '.stagger-children' containers.
   */
  const initScrollAnimations = () => {
    // 1. Apply staggered transition/animation delays to children of .stagger-children containers
    const staggerContainers = document.querySelectorAll('.stagger-children');
    staggerContainers.forEach((container) => {
      const animatableChildren = container.querySelectorAll('.fade-in, .slide-left, .slide-right, .scale-in');
      const items = animatableChildren.length > 0 ? Array.from(animatableChildren) : Array.from(container.children);

      items.forEach((child, index) => {
        const delayMs = (index + 1) * 120; // 120ms stagger increment
        child.style.transitionDelay = `${delayMs}ms`;
        child.style.animationDelay = `${delayMs}ms`;
      });
    });

    // 2. Intersection Observer with threshold 0.1, unobserving upon entry
    const animationObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });

    const animatedElements = document.querySelectorAll('.fade-in, .slide-left, .slide-right, .scale-in');
    animatedElements.forEach((el) => animationObserver.observe(el));
  };

  initScrollAnimations();

  // ==================================================================
  // 6. Hero Title Typing Effect & Cursor Blink
  // ==================================================================
  /**
   * Implements a typing effect with a subtle cursor blink effect for the hero title.
   * Supports rotating phrases via [data-words] or .typing-text, and guarantees
   * a blinking cursor element.
   */
  const initTypingEffect = () => {
    const typingTarget = document.querySelector('.typing-text, .typed-text, [data-typing], .hero-title .typed');
    const heroTitle = document.querySelector('.hero-title, .hero h1, header h1');

    // Create cursor element
    const createCursor = () => {
      const cursor = document.createElement('span');
      cursor.className = 'typing-cursor';
      cursor.setAttribute('aria-hidden', 'true');
      cursor.textContent = '|';
      return cursor;
    };

    if (typingTarget) {
      // Determine array of phrases to cycle through
      let words = [];
      const dataWords = typingTarget.getAttribute('data-words');

      if (dataWords) {
        try {
          words = JSON.parse(dataWords);
        } catch {
          words = dataWords.split(',').map((w) => w.trim());
        }
      } else if (typingTarget.textContent.trim().length > 0) {
        words = [typingTarget.textContent.trim()];
      } else {
        words = ['Web Developer', 'UI/UX Designer', 'Creative Thinker'];
      }

      // Clear static text and append cursor
      typingTarget.textContent = '';
      const cursor = createCursor();
      typingTarget.parentNode.insertBefore(cursor, typingTarget.nextSibling);

      let wordIndex = 0;
      let charIndex = 0;
      let isDeleting = false;

      const typeLoop = () => {
        const currentWord = words[wordIndex % words.length];

        if (isDeleting) {
          charIndex--;
          typingTarget.textContent = currentWord.substring(0, charIndex);
        } else {
          charIndex++;
          typingTarget.textContent = currentWord.substring(0, charIndex);
        }

        let speed = isDeleting ? CONFIG.DELETING_SPEED : CONFIG.TYPING_SPEED;

        if (!isDeleting && charIndex === currentWord.length) {
          // Pause when word is completely typed out
          speed = CONFIG.WORD_PAUSE;
          isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
          // Move to next word when deleted
          isDeleting = false;
          wordIndex++;
          speed = 400; // brief pause before starting new word
        }

        setTimeout(typeLoop, speed);
      };

      typeLoop();
    } else if (heroTitle) {
      // If no dynamic typing element exists, attach the subtle blinking cursor to the hero title
      if (!heroTitle.querySelector('.typing-cursor')) {
        const cursor = createCursor();
        heroTitle.appendChild(cursor);
      }
    }
  };

  initTypingEffect();

  // ==================================================================
  // 7. Counter Animation
  // ==================================================================
  /**
   * Animates numbers from 0 up to their target value (data-target)
   * using requestAnimationFrame when they enter the viewport.
   */
  const initCounterAnimation = () => {
    const counterElements = document.querySelectorAll('.counter');
    if (!counterElements.length) return;

    /**
     * Smoothly counts up an individual counter element
     */
    const animateCounter = (el) => {
      // Extract target number and potential prefix/suffix (e.g. "99+", "98%", "1,500")
      const rawTarget = el.getAttribute('data-target') || el.textContent.trim();
      const match = rawTarget.match(/([^\d.,]*)([\d.,]+)([^\d.,]*)/);

      let targetNumber = 0;
      let prefix = '';
      let suffix = '';
      let hasDecimals = false;
      let decimalPlaces = 0;

      if (match) {
        prefix = match[1] || '';
        const numberStr = match[2].replace(/,/g, '');
        targetNumber = parseFloat(numberStr) || 0;
        suffix = match[3] || '';

        if (numberStr.includes('.')) {
          hasDecimals = true;
          decimalPlaces = numberStr.split('.')[1].length;
        }
      } else {
        targetNumber = parseFloat(rawTarget) || 0;
      }

      const duration = CONFIG.COUNTER_DURATION;
      const startTime = performance.now();

      const easeOutQuad = (t) => t * (2 - t);

      const updateCount = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = easeOutQuad(progress);

        const currentVal = easeProgress * targetNumber;
        const formattedVal = hasDecimals
          ? currentVal.toFixed(decimalPlaces)
          : Math.floor(currentVal).toLocaleString();

        el.textContent = `${prefix}${formattedVal}${suffix}`;

        if (progress < 1) {
          window.requestAnimationFrame(updateCount);
        } else {
          // Ensure precise final target value is set
          const finalVal = hasDecimals
            ? targetNumber.toFixed(decimalPlaces)
            : Math.floor(targetNumber).toLocaleString();
          el.textContent = `${prefix}${finalVal}${suffix}`;
        }
      };

      window.requestAnimationFrame(updateCount);
    };

    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2
    });

    counterElements.forEach((counter) => counterObserver.observe(counter));
  };

  initCounterAnimation();

  // ==================================================================
  // 8. Back to Top Button
  // ==================================================================
  /**
   * Floating button shown when scrolled past 500px.
   * Smoothly scrolls to top on click.
   */
  const initBackToTop = () => {
    let backToTopBtn = document.querySelector('.back-to-top, #back-to-top, .scroll-to-top, .btn-back-to-top');

    // Create the button automatically if not present in the HTML template
    if (!backToTopBtn) {
      backToTopBtn = document.createElement('button');
      backToTopBtn.className = 'back-to-top';
      backToTopBtn.setAttribute('aria-label', 'Back to top');
      backToTopBtn.innerHTML = `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 15l-6-6-6 6"/>
        </svg>
      `;
      document.body.appendChild(backToTopBtn);
    }

    let ticking = false;

    const toggleButtonVisibility = () => {
      const isPastThreshold = window.scrollY > CONFIG.BACK_TO_TOP_THRESHOLD;
      if (isPastThreshold) {
        backToTopBtn.classList.add('visible', 'show', 'active');
      } else {
        backToTopBtn.classList.remove('visible', 'show', 'active');
      }
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(toggleButtonVisibility);
        ticking = true;
      }
    }, { passive: true });

    // Smooth scroll to top on click
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    // Initial check
    toggleButtonVisibility();
  };

  initBackToTop();

  // ==================================================================
  // 9. Parallax Subtle Effect
  // ==================================================================
  /**
   * On mouse move, slightly shifts hero background elements for a subtle 3D depth effect.
   * Respects prefers-reduced-motion and pointer accuracy.
   */
  const initHeroParallax = () => {
    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Only enable on desktop pointer devices
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    const heroSection = document.querySelector('.hero, header.hero, #hero, .hero-section');
    if (!heroSection) return;

    // Query potential parallax elements inside the hero section
    const parallaxElements = heroSection.querySelectorAll(
      '.parallax-element, .hero-bg, .hero-shape, .hero-blob, .hero-image, .floating-badge, .floating-icon, [data-parallax]'
    );

    if (!parallaxElements.length) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let isMoving = false;

    // Update target positions on mouse move
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const relativeX = e.clientX - rect.left - rect.width / 2;
      const relativeY = e.clientY - rect.top - rect.height / 2;

      targetX = relativeX / (rect.width / 2); // Normalized between -1 and 1
      targetY = relativeY / (rect.height / 2); // Normalized between -1 and 1

      if (!isMoving) {
        isMoving = true;
        window.requestAnimationFrame(renderParallax);
      }
    });

    // Reset smoothly when cursor leaves the hero area
    heroSection.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
    });

    // Render loop with subtle linear interpolation (lerp) for buttery smooth motion
    const renderParallax = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      parallaxElements.forEach((el, index) => {
        // Read custom factor or assign gentle varied speeds
        const customFactor = parseFloat(el.getAttribute('data-parallax-speed'));
        const factor = !isNaN(customFactor) ? customFactor : (index + 1) * 12;

        const moveX = currentX * factor;
        const moveY = currentY * factor;

        el.style.transform = `translate3d(${moveX.toFixed(2)}px, ${moveY.toFixed(2)}px, 0)`;
      });

      // Keep running if there is remaining movement
      if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
        window.requestAnimationFrame(renderParallax);
      } else {
        isMoving = false;
      }
    };
  };

  initHeroParallax();
});
