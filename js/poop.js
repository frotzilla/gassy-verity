// Cat Boy has a weak stomach: fart too much, too fast, and he poops. Click it to clean up.
GV.poop = (() => {
  const layer = document.getElementById("poops");
  const G = GV.game;
  let times = [], cooldownUntil = 0, count = 0;

  const SWIRL = `<svg viewBox="0 0 40 36" width="100%" height="100%"><path d="M20 3 q5 0 5 5 q8 1 8 8 q6 2 6 8 q0 8 -9 8 h-20 q-9 0 -9 -8 q0 -6 6 -8 q0 -7 8 -8 q0 -5 5 -5z" fill="#7a4a24"/><path d="M12 22 q8 4 16 0" stroke="#9c6a3a" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;

  // Call once per fart.
  function note() {
    const rule = GV.skins.rule();
    if (!rule) { times = []; return; }
    const now = performance.now();
    times.push(now);
    while (times.length && now - times[0] > rule.windowSec * 1000) times.shift();
    if (times.length >= rule.count && now > cooldownUntil && count < GV.config.poopLimit) {
      times = []; cooldownUntil = now + 8000;
      drop();
    }
  }

  function drop() {
    const el = document.createElement("button");
    el.type = "button"; el.className = "poop"; el.setAttribute("aria-label", "clean up");
    el.innerHTML = SWIRL;
    el.style.left = (30 + Math.random() * 40) + "%";
    el.style.top = (64 + Math.random() * 2.5) + "%";
    el.addEventListener("pointerdown", e => e.stopPropagation());
    el.addEventListener("click", () => {
      el.remove(); count--;
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
