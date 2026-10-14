// The character: charge (inflate) and release (deflate + fart, or a gas blast).
GV.verity = (() => {
  const cfg = GV.config;
  const stage = document.getElementById("stage");
  const fill = document.getElementById("fill");
  const countEl = document.getElementById("count");

  let holdStart = 0, raf = 0, power = 0, toots = 0;

  function tick() {
    const now = performance.now();
    power = Math.min((now - holdStart) / cfg.fullChargeMs, 1);
    GV.motion.set(1 + (cfg.maxScale - 1) * power, power);
    fill.style.width = power * 100 + "%";
    GV.audio.setSqueak(power);
    GV.haptics.charge(power, now);
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
    // Power comes from the clock, not the last animation frame, so a throttled or hidden
    // tab (no frames) still gets the right charge.
    const holdSec = (performance.now() - holdStart) / 1000;
    const p = Math.max(Math.min(holdSec * 1000 / cfg.fullChargeMs, 1), cfg.minPower);
    holdStart = 0; power = 0;
    GV.audio.stopSqueak();
    GV.haptics.cancel();
    toots++; countEl.textContent = "Toots: " + toots;
    fill.style.width = "0";
    GV.motion.set(1, 0);

    // Chained farts hit harder.
    const c = GV.combo.hit(p);
    const boosted = Math.min(1, p + cfg.combo.powerPerCombo * (c.count - 1));
    const blast = GV.blast.ready(p); // needs a real hold, not combo-boosted taps
    if (blast) {
      GV.blast.fire(stage);
    } else {
      GV.audio.fart(boosted, c.count);
      GV.puffs.emit(stage, boosted, c.count);
    }
    GV.combo.show(blast);
    GV.motion.pop(boosted);
    GV.face.relief();
    GV.haptics.release(boosted, blast);

    const broke = GV.stats.record(holdSec, c.count);
    if (!blast) {
      if (broke.includes("combo")) GV.ui.toast("NEW BEST COMBO x" + c.count);
      else if (broke.includes("hold")) GV.ui.toast("NEW LONGEST HOLD " + holdSec.toFixed(1) + "s");
    }
  }

  return { stage, hold, release };
})();
