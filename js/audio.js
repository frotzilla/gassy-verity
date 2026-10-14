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
      const o = c.createOscillator(), o2 = c.createOscillator();
      const flutter = c.createGain(), env = c.createGain();
      o.type = "sawtooth"; o2.type = "square";
      const f0 = f.baseHz + Math.random() * f.jitterHz;
      o.frequency.setValueAtTime(f0, t);
      o2.frequency.setValueAtTime(f0 * 0.5, t);
      for (const x of [o, o2]) x.frequency.exponentialRampToValueAtTime(30, t + dur);

      // Flutter is applied before the envelope, so it fades out with the sound
      // instead of leaving an audible buzz that gets cut off.
      const lfo = c.createOscillator(), lg = c.createGain();
      lfo.frequency.setValueAtTime(34 + Math.random() * 10, t);
      lfo.frequency.linearRampToValueAtTime(12, t + dur); // flaps slow down as it tapers
      flutter.gain.value = 0.6;
      lg.gain.value = 0.4;
      lfo.connect(lg).connect(flutter.gain);

      // Quick attack, long smooth tail down to true silence.
      const peak = 0.25 + power * 0.35;
      env.gain.setValueAtTime(0.0001, t);
      env.gain.linearRampToValueAtTime(peak, t + 0.02);
      env.gain.exponentialRampToValueAtTime(peak * 0.5, t + dur * 0.3);
      env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      env.gain.setValueAtTime(0, t + dur);

      o.connect(flutter); o2.connect(flutter);
      flutter.connect(env); env.connect(c.destination);
      for (const x of [o, o2, lfo]) { x.start(t); x.stop(t + dur + 0.05); }
    } catch (e) {}
  }

  return { startSqueak, setSqueak, stopSqueak, fart };
})();
