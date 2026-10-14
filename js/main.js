// Input wiring only. Add new controls here.
(() => {
  const { stage, hold, release } = GV.verity;
  const world = document.getElementById("world");

  // Mouse: press Verity. Touch: press anywhere in the scene (small targets are hard to hit).
  stage.addEventListener("pointerdown", e => { e.preventDefault(); hold(); });
  world.addEventListener("pointerdown", e => {
    if (e.pointerType === "touch" && !stage.contains(e.target)) { e.preventDefault(); hold(); }
  });
  addEventListener("pointerup", release);
  addEventListener("pointercancel", release);

  // Never get stuck charging if focus is lost mid-hold.
  addEventListener("blur", release);
  document.addEventListener("visibilitychange", () => { if (document.hidden) release(); });

  // Sound on/off.
  const mute = document.getElementById("muteBtn");
  const paintMute = () => { mute.textContent = GV.audio.muted ? "sound off" : "sound on"; };
  mute.addEventListener("click", () => { GV.audio.setMuted(!GV.audio.muted); paintMute(); });
  mute.addEventListener("pointerdown", e => e.stopPropagation());
  paintMute();

  // No long-press menu on phones.
  addEventListener("contextmenu", e => e.preventDefault());

  addEventListener("keydown", e => {
    if (e.code === "Space") { e.preventDefault(); if (!e.repeat) hold(); }
  });
  addEventListener("keyup", e => { if (e.code === "Space") release(); });
})();
