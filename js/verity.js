// The character: charge (inflate) and release (deflate + fart).
GV.verity = (() => {
  const cfg = GV.config;
  const stage = document.getElementById("stage");
  const fill = document.getElementById("fill");
  const countEl = document.getElementById("count");

  let holdStart = 0, raf = 0, power = 0, toots = 0;

  function tick() {
    power = Math.min((performance.now() - holdStart) / cfg.fullChargeMs, 1);
    GV.motion.set(1 + (cfg.maxScale - 1) * power, power);
    fill.style.width = power * 100 + "%";
    GV.audio.setSqueak(power);
    raf = requestAnimationFrame(tick);
  }

  function hold() {
    if (holdStart) return;
    holdStart = performance.now();
    GV.audio.startSqueak();
    raf = requestAnimationFrame(tick);
  }

  function release() {
    if (!holdStart) return;
    cancelAnimationFrame(raf);
    const p = Math.max(power, cfg.minPower);
    holdStart = 0; power = 0;
    GV.audio.stopSqueak();
    toots++; countEl.textContent = "Toots: " + toots;
    fill.style.width = "0";
    GV.motion.set(1, 0);

    // Chained farts hit harder.
    const c = GV.combo.hit(p);
    const boosted = Math.min(1, p + cfg.combo.powerPerCombo * (c.count - 1));
    GV.audio.fart(boosted);
    GV.puffs.emit(stage, boosted, c.count);
    GV.combo.show();
    GV.motion.pop(boosted);
  }

  return { stage, hold, release };
})();
