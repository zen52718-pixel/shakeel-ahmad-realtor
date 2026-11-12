/* Progressive motion: no video request for reduced motion or data-saving users. */
(() => {
  'use strict';
  const hero = document.querySelector('.cinematic-hero');
  const video = document.querySelector('#hero-film');
  const toggle = document.querySelector('.film-toggle');
  if (!hero || !video || !toggle) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const connection = navigator.connection;
  let userPaused = reduced.matches || Boolean(connection?.saveData);
  let visible = true;
  let failed = false;
  let frame = 0;
  video.muted = true;
  toggle.hidden = false;
  const label = () => { toggle.textContent = video.paused ? 'Play background' : 'Pause background'; };
  async function play() {
    if (failed || !visible || document.hidden || userPaused) return;
    if (!video.getAttribute('src')) {
      video.src = innerWidth <= 700 ? video.dataset.mobileSrc : video.dataset.desktopSrc;
    }
    try { await video.play(); } catch { label(); }
  }
  video.addEventListener('playing', () => { video.classList.add('is-playing'); label(); });
  video.addEventListener('pause', label);
  video.addEventListener('error', () => { failed = true; video.classList.remove('is-playing'); toggle.hidden = true; });
  toggle.addEventListener('click', () => {
    if (video.paused) { userPaused = false; play(); }
    else { userPaused = true; video.pause(); }
  });
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) play(); else video.pause();
  }, {threshold:0.05});
  observer.observe(hero);
  document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); else play(); });
  function motionChanged() {
    if (reduced.matches || connection?.saveData) { userPaused = true; video.pause(); }
    hero.style.removeProperty('--film-scale');
    document.querySelectorAll('.service-card').forEach(resetTilt);
  }
  reduced.addEventListener('change', motionChanged);
  connection?.addEventListener('change', motionChanged);
  function updateScroll() {
    frame = 0;
    if (!reduced.matches && visible) {
      const progress = Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / hero.offsetHeight));
      hero.style.setProperty('--film-scale', String(1 + progress * .035));
    }
  }
  window.addEventListener('scroll', () => { if (!frame && !reduced.matches) frame = requestAnimationFrame(updateScroll); }, {passive:true});
  function resetTilt(card) { card.style.removeProperty('--tilt-x'); card.style.removeProperty('--tilt-y'); }
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      if (reduced.matches || !fine.matches) return;
      const box = card.getBoundingClientRect();
      card.style.setProperty('--tilt-x', `${(0.5 - (event.clientY-box.top)/box.height)*3}deg`);
      card.style.setProperty('--tilt-y', `${((event.clientX-box.left)/box.width-0.5)*3}deg`);
    });
    card.addEventListener('pointerleave', () => resetTilt(card));
    card.addEventListener('blur', () => resetTilt(card));
  });
})();
