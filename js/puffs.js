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
  const fadeLeft = new Float32Array(N), fadeTotal = new Float32Array(N); // blast: seconds until gone
  let alive = 0, running = false, prev = 0;

  // Pre-rendered flat discs, one per tint. drawImage of these is cheap; the look comes from
  // alpha and overlap.
  const sprites = cfg.colors.map(([r, gr, b]) => {
    const s = document.createElement("canvas"); s.width = s.height = 64;
    const c = s.getContext("2d");
    c.fillStyle = `rgb(${r},${gr},${b})`;
    c.beginPath(); c.arc(32, 32, 31, 0, 6.2832); c.fill();
    return s;
  });

  // The canvas covers the whole oversized #world (viewport + margin on each side), so the
  // gas never ends at a visible edge when the world shakes. Canvas coords = viewport + M.
  const M = GV.config.worldMargin;
  function resize() { canvas.width = innerWidth + 2 * M; canvas.height = innerHeight + 2 * M; }
  addEventListener("resize", resize); resize();

  // Pick a slot for a new puff: a dead one if the probes find it, else the most-faded of a few
  // random probes. Recycling by insertion order would eat young, still-visible gas and thin
  // the cloud out when you tap fast; this only takes gas that is already mostly gone.
  function slot() {
    let best = -1, bestAge = -1;
    for (let k = 0; k < cfg.probes; k++) {
      const i = Math.random() * N | 0;
      const a = life[i] <= 0 ? 2 : age[i] / life[i];
      if (a > bestAge) { bestAge = a; best = i; }
    }
    return best;
  }

  function emit(stage, power, combo = 1, scale = 1) {
    const r = stage.getBoundingClientRect();
    const ox = r.left + M + r.width * 0.1, oy = r.top + M + r.height * 0.7;
    // Combo bonuses stop growing after comboCap, and a crowded screen gets fewer new puffs.
    // Otherwise fast spam floods the pool with fresh gas around Verity, which evicts the old
    // gas that had already spread across the screen and makes the cloud look like it clears.
    const bonus = Math.min(combo, cfg.comboCap) - 1;
    const crowd = alive / N;
    const n = Math.max(1, Math.min(cfg.perBurst,
      Math.round((cfg.base + power * cfg.extra) * (1 + GV.config.combo.puffsPerCombo * bonus) * (1 - crowd * cfg.crowdDamp) * scale)));
    for (let k = 0; k < n; k++) {
      const i = slot();
      if (life[i] <= 0) alive++;
      // Starts leftwards; harder farts fan out toward a full circle. Speed scales with the
      // screen so a big one can reach the far side.
      const ang = Math.PI + (Math.random() - 0.5) * (cfg.spreadBase + power * cfg.spreadPower);
      const sp = innerWidth * (cfg.speedMin + Math.random() * cfg.speedRand + power * cfg.speedPower);
      x[i] = ox; y[i] = oy + (Math.random() - 0.5) * 30;
      vx[i] = Math.cos(ang) * sp; vy[i] = Math.sin(ang) * sp - 60;
      size[i] = (60 + Math.random() * (60 + power * 90)) * Math.min(1.6, Math.min(innerWidth, innerHeight) / 700);
      age[i] = 0; fadeTotal[i] = 0;
      life[i] = cfg.lifeMin + Math.random() * cfg.lifeExtra + Math.min(combo, cfg.comboCap) * cfg.lifePerCombo;
      tint[i] = Math.random() * sprites.length | 0;
      wob[i] = Math.random() * 6.28;
    }
    if (!running) { running = true; prev = performance.now(); requestAnimationFrame(frame); }
  }

  function frame(now) {
    const dt = Math.min((now - prev) / 1000, 0.05); prev = now;
    const W = canvas.width, H = canvas.height, drag = Math.exp(-cfg.drag * dt);
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
      x[i] += (vx[i] + Math.sin(wob[i]) * 30) * dt;
      y[i] += (vy[i] + Math.cos(wob[i] * 0.7) * 24) * dt;
      // Soft walls so the gas piles up on screen instead of leaving it.
      if (x[i] < 0) { x[i] = 0; vx[i] = Math.abs(vx[i]); }
      else if (x[i] > W) { x[i] = W; vx[i] = -Math.abs(vx[i]); }
      if (y[i] < 0) { y[i] = 0; vy[i] = Math.abs(vy[i]); }
      else if (y[i] > H) { y[i] = H; vy[i] = -Math.abs(vy[i]); }
      // Grow, quick fade in, long fade out.
      const s = size[i] * (1 + t * 0.8);
      let a = Math.min(t * 12, 1) * (1 - t * t) * cfg.alpha;
      if (fadeTotal[i] > 0) {                       // being cleared by a blast
        fadeLeft[i] -= dt;
        if (fadeLeft[i] <= 0) { life[i] = 0; alive--; continue; }
        a *= fadeLeft[i] / fadeTotal[i];
      }
      g.globalAlpha = a;
      g.drawImage(sprites[tint[i]], x[i] - s / 2, y[i] - s / 2, s, s);
    }
    g.globalAlpha = 1;
    if (alive > 0) requestAnimationFrame(frame);
    else running = false;
  }

  // Gas blast: shove every puff away from Verity and fade them all out over clearSec.
  function shock(stage, strength, clearSec) {
    const r = stage.getBoundingClientRect();
    const ox = r.left + M + r.width / 2, oy = r.top + M + r.height / 2;
    for (let i = 0; i < N; i++) {
      if (life[i] <= 0) continue;
      let dx = x[i] - ox, dy = y[i] - oy;
      const d = Math.hypot(dx, dy) || 1;
      const k = strength * innerWidth * (0.6 + 0.8 * Math.exp(-d / (innerWidth * 0.5)));
      vx[i] += dx / d * k; vy[i] += dy / d * k;
      fadeTotal[i] = fadeLeft[i] = clearSec * (0.55 + Math.random() * 0.45);
    }
    if (!running) { running = true; prev = performance.now(); requestAnimationFrame(frame); }
  }

  // 0..1, how packed the screen is. Used for the "GAS MAXED" label.
  function level() { return alive / N; }

  return { emit, shock, level };
})();
