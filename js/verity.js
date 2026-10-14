// The character: charge (inflate) and release (deflate + fart).
GV.verity = (() => {
  const cfg = GV.config;
  const stage = document.getElementById("stage");
  const bodyEl = document.getElementById("body");
  const svg = document.getElementById("verity");
  const mouth = document.getElementById("mouth");
  const fill = document.getElementById("fill");
  const countEl = document.getElementById("count");

  let holdStart = 0, raf = 0, power = 0, toots = 0;

  function setMouth(p) {
    mouth.setAttribute("d", `M36 ${66 - p * 6} Q50 ${64 + p * 6} 64 ${66 - p * 6}`);
  }

  function tick() {
    power = Math.min((performance.now() - holdStart) / cfg.fullChargeMs, 1);
    bodyEl.style.transform = `scale(${1 + (cfg.maxScale - 1) * power})`;
    fill.style.width = power * 100 + "%";
    setMouth(power);
    GV.audio.setSqueak(power);
    raf = requestAnimationFrame(tick);
  }

  function hold() {
    if (holdStart) return;
    holdStart = performance.now();
    svg.classList.add("strain");
    GV.audio.startSqueak();
    raf = requestAnimationFrame(tick);
  }

  function release() {
    if (!holdStart) return;
    cancelAnimationFrame(raf);
    const p = Math.max(power, cfg.minPower);
    const from = bodyEl.style.transform || "scale(1)";
    holdStart = 0; power = 0;
    GV.audio.stopSqueak();
    svg.classList.remove("strain");
    toots++; countEl.textContent = "Toots: " + toots;
    fill.style.width = "0";
    mouth.setAttribute("d", "M33 62 Q50 78 67 62");

    bodyEl.animate([{ transform: from },
                    { transform: "scale(0.82)", offset: 0.25 },
                    { transform: "scale(1.06)", offset: 0.6 },
                    { transform: "scale(1)" }], { duration: 400 + p * 700, easing: "ease-out" });
    bodyEl.style.transform = "scale(1)";

    GV.audio.fart(p);
    GV.puffs.emit(stage, p);
    if (p > cfg.shakeThreshold) {
      document.body.classList.remove("shake"); void document.body.offsetWidth;
      document.body.classList.add("shake");
    }
  }

  return { stage, hold, release };
})();
