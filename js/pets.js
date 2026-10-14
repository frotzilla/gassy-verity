// Pets wander the ground (or hover) near Verity. Their bonuses are in data.js and game.js;
// this file is just their bodies and behavior. One shared animation loop for all of them.
GV.pets = (() => {
  const layer = document.getElementById("pets");
  const G = GV.game;

  // Flat little sprites, 32x24 viewBox, facing right.
  const SPRITE = {
    fly:    `<ellipse cx="14" cy="14" rx="7" ry="5" fill="#3b3b3b"/><circle cx="21" cy="13" r="4" fill="#5a5a5a"/><ellipse cx="12" cy="7" rx="6" ry="3.5" fill="#cfe9ff" opacity=".85"/><circle cx="23" cy="12" r="1.2" fill="#e33"/>`,
    frog:   `<ellipse cx="16" cy="16" rx="11" ry="7" fill="#4f9d3a"/><circle cx="10" cy="9" r="4" fill="#5fb347"/><circle cx="22" cy="9" r="4" fill="#5fb347"/><circle cx="10" cy="9" r="1.7" fill="#111"/><circle cx="22" cy="9" r="1.7" fill="#111"/><path d="M10 18 Q16 22 22 18" stroke="#245e18" stroke-width="1.5" fill="none"/>`,
    snail:  `<ellipse cx="14" cy="20" rx="13" ry="3.5" fill="#c9b79c"/><circle cx="15" cy="12" r="8" fill="#a8743f"/><path d="M15 12 m-4 0 a4 4 0 1 1 4 4" stroke="#6d4620" stroke-width="1.6" fill="none"/><path d="M26 18 l3 -8 M28 19 l5 -6" stroke="#c9b79c" stroke-width="1.6" stroke-linecap="round"/>`,
    beetle: `<ellipse cx="13" cy="15" rx="9" ry="6" fill="#2b2b3a"/><circle cx="22" cy="14" r="3.6" fill="#3d3d52"/><path d="M13 9 v12" stroke="#555" stroke-width="1"/><circle cx="29" cy="17" r="4.5" fill="#7a4a24"/>`,
    pug:    `<ellipse cx="16" cy="17" rx="10" ry="6" fill="#d6b384"/><circle cx="21" cy="10" r="7" fill="#d6b384"/><ellipse cx="21" cy="12" rx="4.5" ry="3.2" fill="#3a2e22"/><circle cx="18.5" cy="8.6" r="1.4" fill="#111"/><circle cx="23.5" cy="8.6" r="1.4" fill="#111"/><path d="M15 6 l-4 5 l4 1z M27 6 l3 5 l-4 1z" fill="#8a6a45"/>`
  };

  const live = {};                       // id -> pet state
  let raf = 0, last = 0, kick = 0;

  function make(id) {
    const el = document.createElement("div");
    el.className = "pet";
    el.innerHTML = `<svg viewBox="0 0 34 24" width="100%" height="100%">${SPRITE[id]}</svg>`;
    layer.appendChild(el);
    const W = layer.clientWidth || innerWidth;
    live[id] = { id, el, x: W * (0.25 + Math.random() * 0.5), y: 0, vy: 0, dir: 1, tx: 0, wait: Math.random() * 2, t: Math.random() * 6 };
    start();
  }

  function sync() {                      // spawn anything newly bought
    for (const pt of GV.data.pets) if (G.state.pets[pt.id] && !live[pt.id]) make(pt.id);
  }

  // Called on every release: ground pets hop, the fly zips.
  function react(power) { kick = Math.max(kick, 0.3 + power * 0.7); }

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    const W = layer.clientWidth, H = layer.clientHeight;
    const ground = H * 0.65, lo = 70, hi = W - 70, center = W / 2;
    kick = Math.max(0, kick - dt * 1.5);
    for (const p of Object.values(live)) {
      p.t += dt;
      let x = p.x, y = 0;
      switch (p.id) {
        case "fly": {                                    // hover around Verity
          const tx = center + Math.sin(p.t * 1.1) * 150, ty = -210 - Math.sin(p.t * 1.9) * 30 - kick * 30;
          p.x += (tx - p.x) * Math.min(1, dt * 2.5); p.y += (ty - p.y) * Math.min(1, dt * 2.5);
          p.dir = tx > p.x ? 1 : -1; y = p.y; break;
        }
        case "frog": {                                   // hop to a new spot every couple of seconds
          p.wait -= dt;
          if (p.y >= 0 && p.vy >= 0 && p.wait <= 0) {
            p.tx = lo + Math.random() * (hi - lo); p.dir = p.tx > p.x ? 1 : -1;
            p.vy = -260; p.wait = 1.4 + Math.random() * 1.8;
          }
          if (p.vy !== 0 || p.y < 0) { p.vy += 900 * dt; p.y += p.vy * dt; p.x += (p.tx - p.x) * dt * 2; if (p.y >= 0) { p.y = 0; p.vy = 0; } }
          if (kick > 0.4 && p.y === 0 && p.vy === 0) p.vy = -200 * kick;
          y = p.y; break;
        }
        case "snail": { p.x += p.dir * 14 * dt; if (p.x < lo || p.x > hi) p.dir *= -1; break; }
        case "beetle": { p.x += p.dir * 34 * dt; if (p.x < lo || p.x > hi) p.dir *= -1; y = Math.abs(Math.sin(p.t * 6)) * -2; break; }
        case "pug": {                                    // sits beside Verity, startles on big farts
          p.x += (center - 150 - p.x) * Math.min(1, dt * 2); y = -kick * 18; p.dir = 1; break;
        }
      }
      p.el.style.transform = `translate(${p.x - 17}px,${ground - 24 + y}px) scaleX(${p.dir})`;
    }
    raf = requestAnimationFrame(frame);
  }

  function start() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }

  G.onChange(sync);
  sync();
  return { react };
})();
