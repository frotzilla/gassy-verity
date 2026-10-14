// Input wiring only. Add new controls here.
(() => {
  const { stage, hold, release } = GV.verity;

  stage.addEventListener("pointerdown", e => { e.preventDefault(); hold(); });
  addEventListener("pointerup", release);
  addEventListener("pointercancel", release);

  addEventListener("keydown", e => {
    if (e.code === "Space") { e.preventDefault(); if (!e.repeat) hold(); }
  });
  addEventListener("keyup", e => { if (e.code === "Space") release(); });
})();
