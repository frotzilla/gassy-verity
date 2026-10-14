// Fart too much, too fast, and Verity poops (any skin). Click the poop to clean it up.
GV.poop = (() => {
  const layer = document.getElementById("poops");
  const G = GV.game;
  let times = [], cooldownUntil = 0, count = 0;

  // Call once per fart.
  function note() {
    const rule = GV.config.poop;
    const now = performance.now();
    times.push(now);
    while (times.length && now - times[0] > rule.windowSec * 1000) times.shift();
    if (times.length >= rule.count && now > cooldownUntil && count < rule.limit) {
      times = []; cooldownUntil = now + 8000;
      drop();
    }
  }

  function drop() {
    const el = document.createElement("button");
    el.type = "button"; el.className = "poop"; el.setAttribute("aria-label", "clean up");
    const im = document.createElement("img");
    im.src = GV.assets.poop; im.alt = ""; im.draggable = false;
    el.appendChild(im);
    el.style.left = (30 + Math.random() * 40) + "%";
    el.style.top = (64 + Math.random() * 2.5) + "%";
    el.addEventListener("pointerdown", e => e.stopPropagation());
    el.addEventListener("click", () => {
      el.remove(); count--;
      GV.stats.bump("poops");
      const reward = G.baseGps() * 20 + 25;
      G.earn(reward);
      GV.ui.floatText("+" + GV.fmt(reward), el.getBoundingClientRect());
    });
    layer.appendChild(el); count++;
    GV.audio.plop();
    GV.ui.toast("...he pooped.", 1800);
    if (GV.clips) GV.clips.maybe("big");
  }

  return { note, drop };
})();
