// Motion: one animation loop for Verity's squash/inflate spring and the screen shake.
// Everything is continuous state (position, velocity, trauma), so interrupting or
// spamming never restarts an animation or snaps back to a rest pose.
GV.motion = (() => {
  const cfg = GV.config.motion, maxScale = GV.config.maxScale;
  const bodyEl = document.getElementById("body");
  const mouth = document.getElementById("mouth");

  let s = 1, v = 0, target = 1, jit = 0, trauma = 0;
  let time = 0, prev = 0, running = false;

  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const wave = (f, ph) => (Math.sin(time * f + ph) + Math.sin(time * f * 1.7 + ph * 2.3)) * 0.5;

  // Where the spring should settle, and how hard Verity is straining (0..1).
  function set(t, strain) { target = t; jit = strain; wake(); }

  // Release: knock the spring (squash) and add screen-shake trauma. Both stack smoothly.
  function pop(power) {
    v -= power * cfg.popKick;
    trauma = Math.min(1, trauma + power * cfg.traumaPerPower);
    wake();
  }

  function wake() {
    if (running) return;
    running = true; prev = performance.now();
    requestAnimationFrame(frame);
  }

  function frame(now) {
    const dt = Math.min((now - prev) / 1000, 1 / 30); prev = now; time += dt;

    // Spring toward target.
    v += (cfg.stiffness * (target - s) - cfg.damping * v) * dt;
    s += v * dt;
    s = clamp(s, 0.5, maxScale * 1.4);

    // Jelly stretch along the velocity, plus a smooth strain shiver (no random per-frame jumps).
    const stretch = clamp(v * cfg.jelly, -0.2, 0.2);
    const jx = wave(61, 0) * jit * cfg.jitterPx, jy = wave(83, 1.3) * jit * cfg.jitterPx;
    bodyEl.style.transform = `translate(${jx}px,${jy}px) scale(${s * (1 - stretch)},${s * (1 + stretch)})`;

    // Mouth follows how inflated Verity currently is, so it eases back to the smile.
    const p = clamp((s - 1) / (maxScale - 1), 0, 1);
    mouth.setAttribute("d", `M${33 + p * 3} ${62 + p * 4} Q50 ${78 - p * 14} ${67 - p * 3} ${62 + p * 4}`);

    // Screen shake: trauma decays smoothly; shake strength is trauma squared.
    trauma = Math.max(0, trauma - cfg.traumaDecay * dt);
    const sh = trauma * trauma;
    document.body.style.transform = sh > 0.0004
      ? `translate(${wave(31, 2) * sh * cfg.shakePx}px,${wave(37, 4) * sh * cfg.shakePx}px) rotate(${wave(23, 6) * sh * cfg.shakeDeg}deg)`
      : "";

    const settled = Math.abs(s - target) < 0.0005 && Math.abs(v) < 0.005 && jit === 0 && trauma === 0;
    if (settled) { running = false; bodyEl.style.transform = `scale(${target})`; }
    else requestAnimationFrame(frame);
  }

  return { set, pop };
})();
