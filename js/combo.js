// Combo: farts chained inside a time window build a multiplier,
// and each one adds gas that slowly fills the screen.
GV.combo = (() => {
  const cfg = GV.config.combo;
  const gasEl = document.getElementById("gas");
  const comboEl = document.getElementById("combo");
  const textEl = document.getElementById("comboText");
  const barEl = document.getElementById("comboFill");

  let count = 0, last = 0, level = 0, prev = performance.now();

  function render() {
    gasEl.style.height = level * 100 + "%";
  }

  function hit(power) {
    const now = performance.now();
    count = (count > 0 && now - last <= cfg.windowMs) ? count + 1 : 1;
    last = now;
    level = Math.min(1, level + (cfg.gasPerToot + cfg.gasPerPower * power) * (1 + cfg.gasComboBonus * (count - 1)));
    render();

    textEl.textContent = level >= 1 ? "GAS MAXED x" + count : count > 1 ? "x" + count + " COMBO" : "";
    comboEl.classList.toggle("on", count > 1);
    textEl.classList.remove("pop"); void textEl.offsetWidth; textEl.classList.add("pop");
    return { count, level };
  }

  function loop(now) {
    const dt = (now - prev) / 1000; prev = now;
    const left = cfg.windowMs - (now - last);
    if (count > 0 && left > 0) {
      barEl.style.width = (left / cfg.windowMs) * 100 + "%";
    } else {
      if (count > 0) { count = 0; comboEl.classList.remove("on"); }
      if (level > 0) { level = Math.max(0, level - cfg.decayPerSec * dt); render(); }
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  return { hit };
})();
