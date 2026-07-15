// Dark mode toggle. Initial theme is set in <head> before paint;
// this only wires the button and persists the choice.
(function () {
  var toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;
  toggle.addEventListener('click', function () {
    var current = document.documentElement.getAttribute('data-theme') || 'light';
    var next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
})();

(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function showAll() {
    document.querySelectorAll('.js-anim, .hero-rule').forEach(function (el) {
      el.classList.add('is-in');
    });
  }

  if (reduced) {
    showAll();
    return;
  }

  // Hero: staggered fade-up on page load only — it's above the fold,
  // no scroll trigger needed.
  document.querySelectorAll('[data-anim="hero"]').forEach(function (el, i) {
    setTimeout(function () { el.classList.add('is-in'); }, i * 80);
  });
  var rule = document.querySelector('.hero-rule');
  if (rule) rule.classList.add('is-in');

  // Cards + fade sections: single shared observer, one-shot, staggered
  // per parent container so each register/list animates independently.
  var counters = new WeakMap();
  var observer = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var parent = el.parentElement;
      var i = counters.get(parent) || 0;
      el.style.transitionDelay = (i * 60) + 'ms';
      counters.set(parent, i + 1);
      el.classList.add('is-in');
      obs.unobserve(el);
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('[data-anim="card"], [data-anim="fade"]').forEach(function (el) {
    observer.observe(el);
  });
})();
