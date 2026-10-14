// Pets wander the ground (or hover) near Verity. Their art and bonuses are in assets/manifest.js;
// this file is just how they move (the `move` field: hover, hop, crawl, walk, sit). One shared animation loop for all of them.
GV.pets = (() => {
  const layer = document.getElementById("pets");
  const G = GV.game;

  const live = {};                       // id -> pet state
  let raf = 0, last = 0, kick = 0;

  function make(def) {
    const id = def.id, el = document.createElement("div");
    el.className = "pet";
    const im = document.createElement("img");
    im.src = def.file; im.alt = def.name; im.draggable = false;
    el.appendChild(im);
    layer.appendChild(el);
    const W = layer.clientWidth || innerWidth;
    live[id] = { id, move: def.move || "walk", el, x: W * (0.25 + Math.random() * 0.5), y: 0, vy: 0, dir: 1, tx: 0, wait: Math.random() * 2, t: Math.random() * 6 };
    start();
  }

  function sync() {                      // spawn anything newly bought
    for (const pt of GV.data.pets) if (G.state.pets[pt.id] && !live[pt.id]) make(pt);
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
      switch (p.move) {
        case "hover": {                                    // hover around Verity
          const tx = center + Math.sin(p.t * 1.1) * 150, ty = -210 - Math.sin(p.t * 1.9) * 30 - kick * 30;
          p.x += (tx - p.x) * Math.min(1, dt * 2.5); p.y += (ty - p.y) * Math.min(1, dt * 2.5);
          p.dir = tx > p.x ? 1 : -1; y = p.y; break;
        }
        case "hop": {                                   // hop to a new spot every couple of seconds
          p.wait -= dt;
          if (p.y >= 0 && p.vy >= 0 && p.wait <= 0) {
            p.tx = lo + Math.random() * (hi - lo); p.dir = p.tx > p.x ? 1 : -1;
            p.vy = -260; p.wait = 1.4 + Math.random() * 1.8;
          }
          if (p.vy !== 0 || p.y < 0) { p.vy += 900 * dt; p.y += p.vy * dt; p.x += (p.tx - p.x) * dt * 2; if (p.y >= 0) { p.y = 0; p.vy = 0; } }
          if (kick > 0.4 && p.y === 0 && p.vy === 0) p.vy = -200 * kick;
          y = p.y; break;
        }
        case "crawl": { p.x += p.dir * 14 * dt; if (p.x < lo || p.x > hi) p.dir *= -1; break; }
        case "walk": { p.x += p.dir * 34 * dt; if (p.x < lo || p.x > hi) p.dir *= -1; y = Math.abs(Math.sin(p.t * 6)) * -2; break; }
        case "sit": {                                    // sits beside Verity, startles on big farts
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
