// Combo: farts chained inside a time window build a multiplier.
// The screen-filling gas itself is the particle cloud in puffs.js.
GV.combo = (() => {
  const cfg = GV.config.combo;
  const comboEl = document.getElementById("combo");
  const textEl = document.getElementById("comboText");
  const barEl = document.getElementById("comboFill");

  let count = 0, last = 0;

  function hit() {
    const now = performance.now();
    count = (count > 0 && now - last <= cfg.windowMs) ? count + 1 : 1;
    last = now;
    return { count };
  }

  // Label is refreshed after the burst is emitted so the cloud level is current.
  function show(blast = false) {
    const maxed = !blast && GV.puffs.level() > 0.9;
    textEl.textContent = maxed ? "GAS MAXED! BIG FART = BLAST" : count > 1 ? "x" + count + " COMBO" : "";
    comboEl.classList.toggle("on", maxed || count > 1);
    textEl.classList.remove("pop"); void textEl.offsetWidth; textEl.classList.add("pop");
  }

  function loop(now) {
    const left = cfg.windowMs - (now - last);
    if (count > 0 && left > 0) barEl.style.width = (left / cfg.windowMs) * 100 + "%";
    else if (count > 0) { count = 0; comboEl.classList.remove("on"); }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  return { hit, show };
})();
