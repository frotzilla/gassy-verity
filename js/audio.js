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

  // Reverb impulse response: noise with an exponential decay, built once.
  let bus = null;
  function reverb(c) {
    if (bus) return bus;
    const len = Math.floor(c.sampleRate * cfg.fart.reverbSec);
    const ir = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    const convolver = c.createConvolver(), wet = c.createGain();
    convolver.buffer = ir;
    wet.gain.value = cfg.fart.reverbMix;
    convolver.connect(wet).connect(c.destination);
    bus = convolver; // shared by every fart, wired to the output once
    return bus;
  }

  function fart(power) {
    try {
      const c = context(), t = c.currentTime, f = cfg.fart;
      const dur = f.minSec + power * f.extraSec;
      const o = c.createOscillator(), o2 = c.createOscillator();
      const flutter = c.createGain(), env = c.createGain();
      o.type = "sawtooth"; o2.type = "square";

      // The tail comes from the math, not a volume fade: pitch keeps sliding
      // down and the flaps keep slowing for the whole duration, so the sound
      // winds down on its own like a long, low rumble.
      const f0 = f.baseHz + Math.random() * f.jitterHz;
      o.frequency.setValueAtTime(f0, t);
      o2.frequency.setValueAtTime(f0 * 0.5, t);
      o.frequency.exponentialRampToValueAtTime(14, t + dur);
      o2.frequency.exponentialRampToValueAtTime(7, t + dur);

      const lfo = c.createOscillator(), lg = c.createGain();
      lfo.frequency.setValueAtTime(38 + Math.random() * 10, t);
      lfo.frequency.exponentialRampToValueAtTime(3, t + dur); // flaps stretch out
      flutter.gain.value = 0.6;
      lg.gain.value = 0.4;
      lfo.connect(lg).connect(flutter.gain);

      // Volume stays up and eases down slowly; only the very end is faded,
      // and the reverb carries it past that.
      const peak = 0.25 + power * 0.35;
      env.gain.setValueAtTime(0.0001, t);
      env.gain.linearRampToValueAtTime(peak, t + 0.02);
      env.gain.exponentialRampToValueAtTime(peak * 0.45, t + dur * 0.85);
      env.gain.linearRampToValueAtTime(0, t + dur);

      // Dry + reverb send.
      o.connect(flutter); o2.connect(flutter);
      flutter.connect(env);
      env.connect(c.destination);
      env.connect(reverb(c));

      for (const x of [o, o2, lfo]) { x.start(t); x.stop(t + dur + 0.05); }
    } catch (e) {}
  }

  return { startSqueak, setSqueak, stopSqueak, fart };
})();
