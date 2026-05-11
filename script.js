// Tab switching
document.querySelectorAll('.cat-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.cat-panel').forEach(p => p.classList.remove('active'));
    
    tab.classList.add('active');
    const panel = document.getElementById('panel-' + tab.dataset.cat);
    panel.classList.add('active');
    revealCards(panel);
  });
});

function revealCards(container) {
  container.querySelectorAll('.flip-card').forEach((c, i) => {
    c.classList.remove('visible');
    void c.offsetWidth; // Force reflow
    setTimeout(() => c.classList.add('visible'), i * 80);
  });
}

// Reveal on scroll using Intersection Observer
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      revealCards(document.getElementById('panel-hamburguesa'));
      io.disconnect();
    }
  });
}, { threshold:.1 });

const menuSection = document.getElementById('menu');
if (menuSection) {
  io.observe(menuSection);
}

(function () {
  const CARDS = [
    { title: 'Combo Especial', img: 'img/Promociones/Combo1.png',  alt: 'Combo Pizza',  desc: 'Gaseosa 1.5L + Pizza mediana + papas fritas', price: '$40.000' },
    { title: '2x1',            img: 'img/Promociones/Perro1.png', alt: 'Combo Perros', desc: 'Dos perros calientes sencillos',               price: '$16.000' },
      { title: 'Top del día', img: 'img/tex mex 1.png', alt: 'Tex Mex', desc: 'Hamburguesa Texana Mexicana', price: '$18.000' },
      { title: 'Mega Pizza', img: 'img/Promociones/Combo2.png', alt: 'PizzPep', desc: 'Pizza Grande de Pepperoni con Extra Queso', price: '$52.000' },
      { title: 'Francesillas', img: 'img/Promociones/Combo3.png', alt: 'FrancePap', desc: 'Porcion de francesas mediano', price: '$11.000' },
      { title: 'Refrezcaso', img: 'img/Promociones/Combo4.png', alt: 'GaseosaTop', desc: 'Vaso de gaseosa grande', price: '$6.000' },
      { title: 'Carnivorizate', img: 'img/Promociones/Hamburguesa2.png', alt: 'CarneAd', desc: 'Porcion de carne adicional para hamburguesa', price: '$5.000' },
  ];
 
  const INTERVAL = 3500;
  const CARD_W   = 290;
  const GAP      = 28;
  const STEP     = CARD_W + GAP;
  const N        = CARDS.length;
 
  const track   = document.getElementById('promoTrack');
  const outer   = document.getElementById('promoOuter');
  const dotsWrap= document.getElementById('promoDots');
  const bar     = document.getElementById('promoBar');
  const btnPrev = document.getElementById('promoPrev');
  const btnNext = document.getElementById('promoNext');
 
  /* Triple set para loop infinito */
  [...CARDS, ...CARDS, ...CARDS].forEach(c => {
    const el = document.createElement('div');
    el.className = 'promo-card';
    el.innerHTML =
      `<div class="pc-img"><img src="${c.img}" alt="${c.alt}" loading="lazy"></div>
       <div class="pc-body">
         <h3>${c.title}</h3>
         <p>${c.desc}</p>
         <div class="pc-price">${c.price}</div>
         <button class="btn-promo">Ver más</button>
       </div>`;
    track.appendChild(el);
  });
 
  /* Empezamos en el set del medio */
  let cur = N;
 
  function moveTo(idx, animate) {
    if (!animate) track.classList.add('no-anim');
    track.style.transform = `translateX(-${idx * STEP}px)`;
    if (!animate) requestAnimationFrame(() => requestAnimationFrame(() => track.classList.remove('no-anim')));
  }
 
  /* Dots */
  for (let i = 0; i < N; i++) {
    const d = document.createElement('span');
    d.className = 'p-dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => { cur = N + i; moveTo(cur, true); refreshDots(); resetTimer(); });
    dotsWrap.appendChild(d);
  }
  const dots = dotsWrap.querySelectorAll('.p-dot');
 
  function refreshDots() {
    const rel = ((cur % N) + N) % N;
    dots.forEach((d, i) => d.classList.toggle('active', i === rel));
  }
 
  function silentJump() {
    track.addEventListener('transitionend', function once() {
      track.removeEventListener('transitionend', once);
      if (cur >= N * 2) { cur -= N; moveTo(cur, false); }
      else if (cur < N) { cur += N; moveTo(cur, false); }
    });
  }
 
  function advance(dir) {
    cur += dir;
    moveTo(cur, true);
    refreshDots();
    silentJump();
  }
 
  moveTo(cur, false);
  refreshDots();
 
  /* ── Auto-play con barra de progreso ── */
  let elapsed = 0, lastT = performance.now(), paused = false;
 
  function tick(now) {
    if (!paused) {
      elapsed += now - lastT;
      bar.style.width = Math.min(elapsed / INTERVAL * 100, 100) + '%';
      if (elapsed >= INTERVAL) { elapsed = 0; advance(1); }
    }
    lastT = now;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
 
  function resetTimer() { elapsed = 0; bar.style.width = '0%'; lastT = performance.now(); }
 
  btnNext.addEventListener('click', () => { advance(1);  resetTimer(); });
  btnPrev.addEventListener('click', () => { advance(-1); resetTimer(); });
 
  outer.addEventListener('mouseenter', () => { paused = true; });
  outer.addEventListener('mouseleave', () => { paused = false; lastT = performance.now(); });
 
  /* ── Drag / Swipe ── */
  let dragX = null, delta = 0, dragging = false;
  const getX = e => e.touches ? e.touches[0].clientX : e.clientX;
 
  outer.addEventListener('mousedown',  e => startDrag(e));
  outer.addEventListener('touchstart', e => startDrag(e), { passive: true });
 
  function startDrag(e) {
    dragging = true; paused = true;
    dragX = getX(e); delta = 0;
    track.classList.add('no-anim');
  }
 
  window.addEventListener('mousemove',  onDrag);
  window.addEventListener('touchmove',  onDrag, { passive: false });
 
  function onDrag(e) {
    if (!dragging) return;
    if (e.cancelable) e.preventDefault();
    delta = getX(e) - dragX;
    track.style.transform = `translateX(${-(cur * STEP) + delta}px)`;
  }
 
  window.addEventListener('mouseup',  endDrag);
  window.addEventListener('touchend', endDrag);
 
  function endDrag() {
    if (!dragging) return;
    dragging = false;
    track.classList.remove('no-anim');
    if (Math.abs(delta) > 60) advance(delta < 0 ? 1 : -1);
    else moveTo(cur, true);
    paused = false; lastT = performance.now(); resetTimer();
  }
 
  outer.addEventListener('click', e => { if (Math.abs(delta) > 10) e.preventDefault(); }, true);
})();