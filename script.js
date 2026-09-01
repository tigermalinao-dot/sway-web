(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Reveal on scroll ---- */
  var revealTargets = document.querySelectorAll('[data-reveal-id]');
  var countersRun = false;

  function runCounters() {
    if (countersRun) return;
    countersRun = true;
    var nums = document.querySelectorAll('.stat-num');
    var start = performance.now();
    var dur = 1200;

    function step(t) {
      var p = Math.min(1, (t - start) / dur);
      var ease = 1 - Math.pow(1 - p, 3);
      nums.forEach(function (el) {
        var target = parseFloat(el.dataset.target);
        var val = Math.round(target * ease);
        var prefix = el.dataset.prefix || '';
        var suffix = el.dataset.suffix || '';
        el.textContent = prefix + val + suffix;
      });
      if (p < 1) requestAnimationFrame(step);
    }
    if (reduceMotion) {
      nums.forEach(function (el) {
        el.textContent = (el.dataset.prefix || '') + el.dataset.target + (el.dataset.suffix || '');
      });
    } else {
      requestAnimationFrame(step);
    }
  }

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          if (entry.target.dataset.revealId === 'stats') runCounters();
        }
      });
    }, { threshold: 0.25 });

    revealTargets.forEach(function (el) { observer.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-revealed'); });
    runCounters();
  }

  /* ---- Chat demo conversation animation (auditoria.html) ---- */
  var chatCards = document.querySelectorAll('.demo-example-visual');
  if (chatCards.length) {
    var MSG_STEP = 750;
    var playChat = function (card) {
      if (card.dataset.played) return;
      card.dataset.played = 'true';
      if (reduceMotion) return;

      var msgs = card.querySelectorAll('.demo-chat-msg');
      var inputbar = card.querySelector('.demo-chat-inputbar');
      var triggered = card.querySelector('.demo-triggered');
      var stat = card.querySelector('.demo-stat');
      var t = 300;

      msgs.forEach(function (msg) {
        setTimeout(function () { msg.classList.add('is-visible'); }, t);
        t += MSG_STEP;
      });
      if (inputbar) {
        setTimeout(function () { inputbar.classList.add('is-visible'); }, t);
        t += 500;
      }
      if (triggered) {
        setTimeout(function () { triggered.classList.add('is-visible'); }, t);
        t += 1300;
      }
      if (stat) {
        setTimeout(function () { stat.classList.add('is-visible'); }, t);
      }
    };

    if ('IntersectionObserver' in window) {
      var chatObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            playChat(entry.target);
            chatObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });
      chatCards.forEach(function (card) { chatObserver.observe(card); });
    } else {
      chatCards.forEach(function (card) { playChat(card); });
    }
  }

  /* ---- Mobile nav toggle ---- */
  var navToggle = document.getElementById('navToggle');
  var navRight = document.getElementById('navRight');
  if (navToggle && navRight) {
    var closeNav = function () {
      navRight.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.querySelector('i').className = 'ph-light ph-list';
    };
    navToggle.addEventListener('click', function () {
      var open = navRight.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.querySelector('i').className = open ? 'ph-light ph-x' : 'ph-light ph-list';
    });
    navRight.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeNav);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
    document.addEventListener('click', function (e) {
      if (!navRight.classList.contains('is-open')) return;
      if (navRight.contains(e.target) || navToggle.contains(e.target)) return;
      closeNav();
    });
  }

  /* ---- Back-to-top arrow ---- */
  var scrollArrow = document.createElement('button');
  scrollArrow.type = 'button';
  scrollArrow.className = 'scroll-side-arrow';
  scrollArrow.setAttribute('aria-label', 'Subir');
  scrollArrow.innerHTML = '<i class="ph-light ph-caret-up"></i>';
  document.body.appendChild(scrollArrow);

  function updateScrollArrow() {
    scrollArrow.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
  }
  scrollArrow.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
  window.addEventListener('scroll', updateScrollArrow, { passive: true });
  updateScrollArrow();

  /* ---- Service "Qué incluye" accordion ---- */
  document.querySelectorAll('.svc-includes-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var wrap = btn.closest('.svc-includes');
      if (wrap) wrap.classList.toggle('is-open');
    });
  });

  /* ---- Project implementation disclosure (proyectos.html) ---- */
  document.querySelectorAll('.proj-implementation-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var wrap = btn.closest('.proj-implementation');
      var open = wrap.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* ---- Project image slider (proyectos.html) ---- */
  var lightbox = document.getElementById('projLightbox');
  var lightboxImg = lightbox ? lightbox.querySelector('.proj-lightbox-img') : null;
  var lightboxClose = lightbox ? lightbox.querySelector('.proj-lightbox-close') : null;
  function openLightbox(src, alt) {
    if (!lightbox) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
  }
  if (lightbox) {
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  document.querySelectorAll('.proj-slider').forEach(function (slider) {
    var track = slider.querySelector('.proj-slider-track');
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.proj-slider-img'));
    var prevBtn = slider.querySelector('.proj-slider-arrow-left');
    var nextBtn = slider.querySelector('.proj-slider-arrow-right');
    if (!track || slides.length < 2) return;

    var index = 0;
    var timer = null;
    var AUTOPLAY_MS = 3200;

    function render() {
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
    }
    function goTo(i) {
      index = (i + slides.length) % slides.length;
      render();
    }
    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }
    if (prevBtn) prevBtn.addEventListener('click', function (e) { e.stopPropagation(); prev(); restart(); });
    if (nextBtn) nextBtn.addEventListener('click', function (e) { e.stopPropagation(); next(); restart(); });
    function start() {
      if (reduceMotion) return;
      stop();
      timer = setInterval(next, AUTOPLAY_MS);
    }
    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }
    function restart() { stop(); start(); }

    /* Manual drag / swipe */
    var startX = 0, deltaX = 0, dragging = false, width = 1, justDragged = false;
    function pointerDown(x) {
      dragging = true;
      startX = x;
      deltaX = 0;
      width = slider.getBoundingClientRect().width || 1;
      stop();
      track.style.transition = 'none';
    }
    function pointerMove(x) {
      if (!dragging) return;
      deltaX = x - startX;
      var pct = (deltaX / width) * 100;
      track.style.transform = 'translateX(calc(-' + (index * 100) + '% + ' + pct + '%))';
    }
    function pointerUp() {
      if (!dragging) return;
      dragging = false;
      track.style.transition = '';
      var threshold = width * 0.15;
      justDragged = Math.abs(deltaX) > 5;
      if (deltaX < -threshold) goTo(index + 1);
      else if (deltaX > threshold) goTo(index - 1);
      else render();
      restart();
    }

    slider.addEventListener('mousedown', function (e) { pointerDown(e.clientX); });
    window.addEventListener('mousemove', function (e) { pointerMove(e.clientX); });
    window.addEventListener('mouseup', pointerUp);
    slider.addEventListener('touchstart', function (e) { pointerDown(e.touches[0].clientX); }, { passive: true });
    slider.addEventListener('touchmove', function (e) { pointerMove(e.touches[0].clientX); }, { passive: true });
    slider.addEventListener('touchend', pointerUp);
    slider.addEventListener('dragstart', function (e) { e.preventDefault(); });

    slider.addEventListener('click', function () {
      if (justDragged) { justDragged = false; return; }
      openLightbox(slides[index].src, slides[index].alt);
    });

    render();
    start();
  });

  /* ---- Magnetic buttons ---- */
  if (!reduceMotion) {
    ['magnetHero', 'magnetCta'].forEach(function (id) {
      var btn = document.getElementById(id);
      if (!btn) return;
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = ((e.clientX - r.left) / r.width - 0.5) * 14;
        var y = ((e.clientY - r.top) / r.height - 0.5) * 14;
        btn.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = 'translate(0,0)';
      });
    });
  }
})();
