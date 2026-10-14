// Sound: rising squeak while charging, flappy fart on release.
GV.audio = (() => {
  const cfg = GV.config;
  let ctx = null, charger = null;

  function context() {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function startSqueak() {
    try {
      const c = context(), o = c.createOscillator(), g = c.createGain();
      o.type = "triangle"; o.frequency.value = cfg.squeak.baseHz; g.gain.value = cfg.squeak.gain;
      o.connect(g).connect(c.destination); o.start();
      charger = o;
    } catch (e) {}
  }

  function setSqueak(power) {
    if (charger) charger.frequency.value = cfg.squeak.baseHz + power * cfg.squeak.riseHz;
  }

  function stopSqueak() {
    if (!charger) return;
    try { charger.stop(); } catch (e) {}
    charger = null;
  }

  function fart(power) {
    try {
      const c = context(), t = c.currentTime, f = cfg.fart;
      const dur = f.minSec + power * f.extraSec;
      const o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain();
      o.type = "sawtooth"; o2.type = "square";
      const f0 = f.baseHz + Math.random() * f.jitterHz;
      o.frequency.setValueAtTime(f0, t);
      o2.frequency.setValueAtTime(f0 * 0.5, t);
      for (const x of [o, o2]) x.frequency.exponentialRampToValueAtTime(30, t + dur);
      // flutter
      const lfo = c.createOscillator(), lg = c.createGain();
      lfo.frequency.value = 28 + Math.random() * 12; lg.gain.value = 0.2 + power * 0.25;
      lfo.connect(lg).connect(g.gain);
      g.gain.setValueAtTime(0.25 + power * 0.35, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g); o2.connect(g); g.connect(c.destination);
      for (const x of [o, o2, lfo]) { x.start(t); x.stop(t + dur); }
    } catch (e) {}
  }

  return { startSqueak, setSqueak, stopSqueak, fart };
})();
