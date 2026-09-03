/* ink.js — minimal motion for Ink theme
   · IntersectionObserver stagger reveal
   · Subtle hero parallax (rAF)
   · Reading progress bar
   · All deferred to browser idle
*/
(function () {
  'use strict';
  if (typeof window === 'undefined') return;

  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    document.querySelectorAll('.ink-reveal').forEach(function (el) { el.classList.add('is-in'); });
    return;
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    // 1. Stagger reveal
    var reveals = document.querySelectorAll('.ink-reveal');
    if (reveals.length && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
      reveals.forEach(function (el, i) {
        if (!el.hasAttribute('data-delay')) {
          // auto-stagger up to 9 items
          el.setAttribute('data-delay', String((i % 9) + 1));
        }
        io.observe(el);
      });
    } else {
      reveals.forEach(function (el) { el.classList.add('is-in'); });
    }

    // 2. Hero parallax
    var heroImage = document.querySelector('.ink-hero-image img');
    if (heroImage && !prefersReduced) {
      var ticking = false;
      function onScroll() {
        if (!ticking) {
          window.requestAnimationFrame(function () {
            var rect = heroImage.getBoundingClientRect();
            var vh = window.innerHeight;
            if (rect.bottom > 0 && rect.top < vh) {
              var progress = (vh - rect.top) / (vh + rect.height);
              var shift = Math.max(-12, Math.min(12, (progress - 0.5) * 12));
              heroImage.style.transform = 'translate3d(0, ' + shift.toFixed(2) + 'px, 0)';
            }
            ticking = false;
          });
          ticking = true;
        }
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    // 3. Reading progress bar (post pages only)
    var progress = document.querySelector('.ink-progress');
    if (progress) {
      var ticking2 = false;
      function onScrollProg() {
        if (!ticking2) {
          window.requestAnimationFrame(function () {
            var article = document.querySelector('.ink-article') || document.body;
            var rect = article.getBoundingClientRect();
            var articleTop = window.scrollY + rect.top;
            var articleHeight = rect.height;
            var winH = window.innerHeight;
            var scrolled = window.scrollY - articleTop + winH * 0.3;
            var pct = Math.max(0, Math.min(100, (scrolled / articleHeight) * 100));
            progress.style.width = pct + '%';
            ticking2 = false;
          });
          ticking2 = true;
        }
      }
      window.addEventListener('scroll', onScrollProg, { passive: true });
      onScrollProg();
    }

    // 4. Smooth in-page anchor links (already handled by CSS scroll-behavior, this is for older browsers)
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href').slice(1);
        if (!id) return;
        var target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  });
})();
