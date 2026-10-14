// Random voice clips from the repo's clips/ folder (listed in clips/manifest.js, which is
// generated: see clips/README.txt). Plays one now and then on farts, more often on big moments.
GV.clips = (() => {
  const cfg = GV.config.clips;
  const files = GV.clipFiles || [];
  let lastPlay = 0;

  // kind: "fart" (normal chance) or "big" (blast, big combo).
  function maybe(kind = "fart") {
    if (!files.length || GV.audio.muted) return;
    const now = performance.now();
    if (now - lastPlay < cfg.minGapMs) return;
    if (Math.random() > (kind === "big" ? cfg.bigChance : cfg.chance)) return;
    lastPlay = now;
    const a = new Audio("clips/" + encodeURIComponent(files[Math.random() * files.length | 0]));
    a.volume = cfg.volume;
    a.play().catch(() => {});
  }

  return { maybe, count: files.length };
})();
