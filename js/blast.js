// Gas blast: when the cloud is packed and you let out a big one, the old gas gets blown
// away and fades, the screen flashes, and everything shakes. Then you can build it up again.
GV.blast = (() => {
  const cfg = GV.config.blast;

  function ready(power) {
    return GV.puffs.level() >= cfg.minLevel && power >= cfg.minPower;
  }

  function fire(stage) {
    GV.audio.boom();
    GV.puffs.shock(stage, cfg.push, cfg.clearSec);
    GV.ui.flash(cfg.flashMs);
    GV.ui.toast("GAS BLAST!", 1800);
    GV.motion.pop(2);
    GV.stats.blast();
  }

  return { ready, fire };
})();
