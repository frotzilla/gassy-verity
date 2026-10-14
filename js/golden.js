// Golden clouds: now and then a glowing puff appears. Click it before it fades for a prize.
GV.golden = (() => {
  const gc = GV.config.game, G = GV.game;
  let el = null, hideTimer = 0;

  const rand = (a, b) => a + Math.random() * (b - a);

  function schedule() {
    setTimeout(spawn, rand(gc.goldenMinSec, gc.goldenMaxSec) * 1000 * G.goldenFactor);
  }

  function spawn() { schedule(); show(); }

  function show() {
    if (el || document.hidden) return;
    el = document.createElement("button");
    el.type = "button"; el.className = "golden"; el.setAttribute("aria-label", "golden gas cloud");
    el.style.backgroundImage = `url("${GV.assets.golden}")`;
    el.style.left = rand(10, 80) + "%"; el.style.top = rand(22, 75) + "%";
    el.addEventListener("pointerdown", e => e.stopPropagation());
    el.addEventListener("click", claim);
    document.body.appendChild(el);
    hideTimer = setTimeout(remove, gc.goldenLifeSec * 1000);
  }

  function remove() { clearTimeout(hideTimer); if (el) { el.remove(); el = null; } }

  function claim() {
    remove();
    GV.stats.bump("goldens");
    if (Math.random() < 0.5) {
      const prize = Math.min(G.state.gas * 0.15, G.baseGps() * 900) + 13;
      G.earn(prize);
      GV.ui.toast("Lucky! +" + GV.fmt(prize), 2000);
    } else {
      G.startFrenzy();
      GV.ui.toast("Frenzy! x" + gc.frenzyMult + " for " + gc.frenzySec + "s", 2000);
    }
  }

  schedule();
  return { show };        // show() is exposed for testing
})();
