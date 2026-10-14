// Gas particles on one canvas, from a fixed-size pool (no DOM nodes, no per-frame allocation).
// Particles linger and drift, so repeated farts build up a cloud that fills the screen.
GV.puffs = (() => {
  const cfg = GV.config.puffs;
  const canvas = document.getElementById("gasCanvas");
  const g = canvas.getContext("2d");
  const N = cfg.max;

  // Pool as parallel typed arrays. `life` > 0 means alive.
  const x = new Float32Array(N), y = new Float32Array(N);
  const vx = new Float32Array(N), vy = new Float32Array(N);
  const size = new Float32Array(N), age = new Float32Array(N), life = new Float32Array(N);
  const tint = new Uint8Array(N), wob = new Float32Array(N);
  let next = 0, alive = 0, running = false, prev = 0;

  // Pre-rendered soft blobs, one per tint. drawImage of these is cheap.
  const sprites = cfg.colors.map(([r, gr, b]) => {
    const s = document.createElement("canvas"); s.width = s.height = 64;
    const c = s.getContext("2d"), grad = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, `rgba(${r},${gr},${b},.9)`);
    grad.addColorStop(0.5, `rgba(${r},${gr},${b},.45)`);
    grad.addColorStop(1, `rgba(${r},${gr},${b},0)`);
    c.fillStyle = grad; c.fillRect(0, 0, 64, 64);
    return s;
  });

  function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
  addEventListener("resize", resize); resize();

  function emit(stage, power, combo = 1) {
    const r = stage.getBoundingClientRect();
    const ox = r.left + r.width * 0.1, oy = r.top + r.height * 0.7;
    const n = Math.min(cfg.perBurst, Math.round((cfg.base + power * cfg.extra) * (1 + GV.config.combo.puffsPerCombo * (combo - 1))));
    for (let k = 0; k < n; k++) {
      const i = next; next = (next + 1) % N;       // ring buffer: oldest particle gets recycled
      if (life[i] <= 0) alive++;
      const ang = Math.PI + (Math.random() - 0.5) * 2.2;   // mostly leftwards, wide spread
      const sp = (120 + Math.random() * (260 + power * 520));
      x[i] = ox; y[i] = oy + (Math.random() - 0.5) * 30;
      vx[i] = Math.cos(ang) * sp; vy[i] = Math.sin(ang) * sp - 60;
      size[i] = 40 + Math.random() * (50 + power * 50);
      age[i] = 0;
      life[i] = cfg.lifeMin + Math.random() * cfg.lifeExtra + combo * cfg.lifePerCombo;
      tint[i] = Math.random() * sprites.length | 0;
      wob[i] = Math.random() * 6.28;
    }
    if (!running) { running = true; prev = performance.now(); requestAnimationFrame(frame); }
  }

  function frame(now) {
    const dt = Math.min((now - prev) / 1000, 0.05); prev = now;
    const W = canvas.width, H = canvas.height, drag = Math.exp(-1.6 * dt);
    g.clearRect(0, 0, W, H);
    alive = 0;
    for (let i = 0; i < N; i++) {
      const L = life[i];
      if (L <= 0) continue;
      age[i] += dt;
      const t = age[i] / L;
      if (t >= 1) { life[i] = 0; continue; }
      alive++;
      // Burst velocity bleeds off, then a lazy drift takes over so the cloud hangs around.
      vx[i] *= drag; vy[i] *= drag;
      wob[i] += dt * 0.8;
      x[i] += (vx[i] + Math.sin(wob[i]) * 14) * dt;
      y[i] += (vy[i] - 10 + Math.cos(wob[i] * 0.7) * 10) * dt;
      // Soft walls so the gas piles up on screen instead of leaving it.
      if (x[i] < 0) { x[i] = 0; vx[i] = Math.abs(vx[i]); }
      else if (x[i] > W) { x[i] = W; vx[i] = -Math.abs(vx[i]); }
      if (y[i] < 0) { y[i] = 0; vy[i] = Math.abs(vy[i]); }
      else if (y[i] > H) { y[i] = H; vy[i] = -Math.abs(vy[i]); }
      // Grow, quick fade in, long fade out.
      const s = size[i] * (1 + t * 0.8);
      g.globalAlpha = Math.min(t * 12, 1) * (1 - t * t) * cfg.alpha;
      g.drawImage(sprites[tint[i]], x[i] - s / 2, y[i] - s / 2, s, s);
    }
    g.globalAlpha = 1;
    if (alive > 0) requestAnimationFrame(frame);
    else running = false;
  }

  // 0..1, how packed the screen is. Used for the "GAS MAXED" label.
  function level() { return alive / N; }

  return { emit, level };
})();
