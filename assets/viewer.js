// Robotics 101: shows one slide at a time, scales it to the window, draws the connectors
// and runs each slide's live demo in a frame of its own while that slide is on screen.
(() => {
  const W = 1920, H = 1080;
  const stage = document.querySelector('.stage');
  const slides = [...document.querySelectorAll('.deck > section')];
  const total = slides.length;
  const $ = (id) => document.getElementById(id);
  const prevBtn = $('prev'), nextBtn = $('next'), count = $('count'), part = $('part'), full = $('full');
  const siteTitle = document.title;
  let cur = -1;

  // ---- Connectors: <x-connector> becomes a drawn line with an arrow head ----
  for (const c of document.querySelectorAll('x-connector')) {
    const w = parseFloat(c.style.borderWidth) || 2, h = 4 * w + 4;
    const head = (c.getAttribute('head') || 'end') !== 'none';
    if (c.hasAttribute('x1')) {
      const [x1, y1, x2, y2] = ['x1', 'y1', 'x2', 'y2'].map((k) => parseFloat(c.getAttribute(k)));
      const route = c.getAttribute('route');
      const pts = route === 'hv' ? [[x1, y1], [x2, y1], [x2, y2]] : route === 'vh' ? [[x1, y1], [x1, y2], [x2, y2]] : [[x1, y1], [x2, y2]];
      const [ax, ay] = pts[pts.length - 2], [bx, by] = pts[pts.length - 1];
      const a = Math.atan2(by - ay, bx - ax);
      if (head) pts[pts.length - 1] = [bx - 0.7 * h * Math.cos(a), by - 0.7 * h * Math.sin(a)];
      const tip = (d) => `${bx - h * Math.cos(a + d)},${by - h * Math.sin(a + d)}`;
      c.style.cssText += ';position:absolute;left:0;top:0;width:0;height:0;overflow:visible;pointer-events:none';
      c.innerHTML =
        `<svg width="1" height="1" aria-hidden="true" style="position:absolute;left:0;top:0;overflow:visible">` +
        `<polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>` +
        (head ? `<polygon points="${bx},${by} ${tip(-0.42)} ${tip(0.42)}" fill="currentColor"/>` : '') +
        `</svg>`;
    } else {
      // A connector with no coordinates is a short arrow between two boxes in a row
      const half = 0.42 * h;
      c.style.cssText += ';position:relative;height:0;flex:none';
      c.innerHTML =
        `<i aria-hidden="true" style="position:absolute;left:0;right:${head ? h - 2 : 0}px;top:${-w / 2}px;height:${w}px;background:currentColor;border-radius:${w}px"></i>` +
        (head ? `<i aria-hidden="true" style="position:absolute;right:0;top:${-half}px;border-left:${h}px solid currentColor;border-top:${half}px solid transparent;border-bottom:${half}px solid transparent"></i>` : '');
    }
  }

  // ---- Per-slide setup: page number, accessible name ----
  slides.forEach((s, i) => {
    const h = s.querySelector('h1, h2');
    s.dataset.title = h ? h.textContent.trim() : '';
    s.style.counterReset = `page ${i}`;
    s.setAttribute('role', 'group');
    s.setAttribute('aria-roledescription', 'slide');
    s.setAttribute('aria-label', `Slide ${i + 1} of ${total}: ${s.dataset.title}`);
  });

  // ---- Live demos: each <x-embed> holds its page in a <template>; it runs only while shown ----
  function mountDemos(s) {
    for (const e of s.querySelectorAll('x-embed')) {
      const t = e.querySelector('template');
      if (!t || e.querySelector('iframe')) continue;
      const f = document.createElement('iframe');
      f.title = `Animated demo: ${s.dataset.title}`;
      f.srcdoc = `<!doctype html><html><head><meta charset="utf-8"></head><body>${t.innerHTML}</body></html>`;
      e.appendChild(f);
    }
  }
  const unmountDemos = (s) => s.querySelectorAll('x-embed iframe').forEach((f) => f.remove());

  function fit() {
    const s = Math.min(innerWidth / W, innerHeight / H);
    stage.style.transform = `translate(${(innerWidth - W * s) / 2}px, ${(innerHeight - H * s) / 2}px) scale(${s})`;
  }

  function show(i) {
    i = Math.max(0, Math.min(total - 1, i));
    if (i === cur) return;
    if (cur >= 0) { slides[cur].classList.remove('active'); unmountDemos(slides[cur]); }
    cur = i;
    const s = slides[i];
    s.classList.add('active');
    // Restart the drawing animations so they play from the start on every visit
    s.querySelectorAll('svg').forEach((v) => { try { v.setCurrentTime(0); } catch (e) { /* not animated */ } });
    mountDemos(s);
    count.textContent = `${i + 1} / ${total}`;
    prevBtn.disabled = i === 0;
    nextBtn.disabled = i === total - 1;
    let p = 0;
    [...part.options].forEach((o, k) => { if (+o.value <= i + 1) p = k; });
    part.selectedIndex = p;
    document.title = i ? `${i + 1} · ${s.dataset.title} · ${siteTitle}` : siteTitle;
    const hash = `#slide-${i + 1}`;
    if (location.hash !== hash) history.replaceState(null, '', hash);
  }
  const fromHash = () => { const m = /^#slide-(\d+)$/.exec(location.hash); return m ? +m[1] - 1 : 0; };

  // ---- Controls ----
  prevBtn.addEventListener('click', () => show(cur - 1));
  nextBtn.addEventListener('click', () => show(cur + 1));
  part.addEventListener('change', () => { show(+part.value - 1); part.blur(); });
  if (document.documentElement.requestFullscreen) {
    full.addEventListener('click', () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()));
  } else full.hidden = true;

  addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.target.closest && e.target.closest('select, button, a') && (e.key === ' ' || e.key === 'Enter' || e.target.tagName === 'SELECT')) return;
    const k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || k === ' ' || k === 'Enter') show(cur + 1);
    else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp' || k === 'Backspace') show(cur - 1);
    else if (k === 'Home') show(0);
    else if (k === 'End') show(total - 1);
    else if (k === 'f' || k === 'F') full.click();
    else return;
    e.preventDefault();
  });

  let tx = 0, ty = 0;
  addEventListener('touchstart', (e) => { tx = e.changedTouches[0].clientX; ty = e.changedTouches[0].clientY; }, { passive: true });
  addEventListener('touchend', (e) => {
    if (e.target.closest && e.target.closest('.bar')) return;
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 48 && Math.abs(dx) > 1.5 * Math.abs(dy)) show(cur + (dx < 0 ? 1 : -1));
  }, { passive: true });

  // The toolbar fades out when the pointer rests
  let idle;
  const wake = () => { document.body.classList.remove('idle'); clearTimeout(idle); idle = setTimeout(() => document.body.classList.add('idle'), 2800); };
  ['mousemove', 'mousedown', 'touchstart', 'keydown'].forEach((ev) => addEventListener(ev, wake, { passive: true }));

  addEventListener('resize', fit);
  addEventListener('hashchange', () => show(fromHash()));
  fit();
  show(fromHash());
  wake();
})();
