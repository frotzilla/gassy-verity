// Sound: rising squeak while charging, then a fart whose character depends on power and combo
// (squeaky toot, classic flap, long rumble, combo finale), plus the blast boom.
GV.audio = (() => {
  const cfg = GV.config;
  let ctx = null, charger = null, noiseBuf = null, voices = 0;

  function context() {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  // ---- charge squeak ----
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

  // ---- shared pieces ----
  // Reverb: decaying-noise impulse response, one shared convolver wired to the output once.
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
    bus = convolver;
    return bus;
  }

  function noise(c) {
    if (noiseBuf) return noiseBuf;
    noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }

  // Filtered noise burst that decays; adds wetness to rumbles and body to the boom.
  function noiseLayer(c, t, dur, gain, fromHz, toHz, wet = 1) {
    const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    src.buffer = noise(c); src.loop = true;
    f.type = "lowpass"; f.frequency.setValueAtTime(fromHz, t);
    f.frequency.exponentialRampToValueAtTime(toHz, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(c.destination);
    if (wet) g.connect(reverb(c));
    src.start(t); src.stop(t + dur + 0.05);
  }

  // One flapping, pitch-sliding fart voice. All the variants are parameter sets for this.
  //   p: { dur, f0, fEnd, type, type2, ratio2, flapStart, flapEnd, peak, tail, sub }
  function flap(c, t, p) {
    const o = c.createOscillator(), o2 = c.createOscillator();
    const flutter = c.createGain(), env = c.createGain();
    o.type = p.type; o2.type = p.type2;
    o.frequency.setValueAtTime(p.f0, t);
    o2.frequency.setValueAtTime(p.f0 * p.ratio2, t);
    o.frequency.exponentialRampToValueAtTime(p.fEnd, t + p.dur);
    o2.frequency.exponentialRampToValueAtTime(p.fEnd * p.ratio2, t + p.dur);

    // Flaps keep slowing for the whole sound, so the tail comes from the math, not a fade.
    const lfo = c.createOscillator(), lg = c.createGain();
    lfo.frequency.setValueAtTime(p.flapStart, t);
    lfo.frequency.exponentialRampToValueAtTime(p.flapEnd, t + p.dur);
    flutter.gain.value = 0.6; lg.gain.value = 0.4;
    lfo.connect(lg).connect(flutter.gain);

    env.gain.setValueAtTime(0.0001, t);
    env.gain.linearRampToValueAtTime(p.peak, t + 0.02);
    env.gain.exponentialRampToValueAtTime(p.peak * p.tail, t + p.dur * 0.85);
    env.gain.linearRampToValueAtTime(0, t + p.dur);

    o.connect(flutter); o2.connect(flutter);
    flutter.connect(env);
    env.connect(c.destination);
    env.connect(reverb(c));
    const stop = t + p.dur + 0.05, oscs = [o, o2, lfo];
    if (p.sub) {            // low sine underneath for rumbles
      const s = c.createOscillator(), sg = c.createGain();
      s.type = "sine"; s.frequency.setValueAtTime(p.f0 * 0.5, t);
      s.frequency.exponentialRampToValueAtTime(8, t + p.dur);
      sg.gain.value = p.sub;
      s.connect(sg).connect(env); oscs.push(s);
    }
    for (const x of oscs) { x.start(t); x.stop(stop); }
  }

  // ---- variants ----
  function classic(c, t, power, scale = 1) {
    const f = cfg.fart, f0 = f.baseHz + Math.random() * f.jitterHz;
    flap(c, t, { dur: (f.minSec + power * f.extraSec) * scale, f0, fEnd: 14,
      type: "sawtooth", type2: "square", ratio2: 0.5, flapStart: 38 + Math.random() * 10, flapEnd: 3,
      peak: 0.25 + power * 0.35, tail: 0.45, sub: 0 });
  }

  function rumble(c, t, power, scale = 1) {
    const f = cfg.fart, dur = (f.minSec + power * f.extraSec * 1.4) * scale, f0 = 52 + Math.random() * 26;
    flap(c, t, { dur, f0, fEnd: 9, type: "sawtooth", type2: "square", ratio2: 0.5,
      flapStart: 24 + Math.random() * 8, flapEnd: 2, peak: 0.34 + power * 0.3, tail: 0.5, sub: 0.7 });
    noiseLayer(c, t, dur * 0.8, 0.22, 900, 90);
  }

  function squeakToot(c, t, power) {
    const dur = 0.14 + Math.random() * 0.2 + power * 0.3, f0 = 520 + Math.random() * 520;
    flap(c, t, { dur, f0, fEnd: 190 + Math.random() * 120, type: "triangle", type2: "sine", ratio2: 1.5,
      flapStart: 70, flapEnd: 22, peak: 0.16 + power * 0.2, tail: 0.5, sub: 0 });
  }

  // Three flaps in a row, the last the biggest, then a boom: the "you earned it" fart.
  function finale(c, t, power) {
    classic(c, t, power, 0.8);
    rumble(c, t + 0.32, Math.min(1, power + 0.1), 0.9);
    rumble(c, t + 0.7, 1, 1.1);
    boomAt(c, t + 0.7, 0.55);
  }

  function fart(power, combo = 1) {
    try {
      if (voices >= cfg.maxFarts) return;
      const c = context(), t = c.currentTime, f = cfg.fart;
      let dur;
      if (combo >= f.finaleCombo && power >= 0.5) { finale(c, t, power); dur = 3.2; }
      else if (power < f.squeakBelow) { squeakToot(c, t, power); dur = 0.8; }
      else if (power > f.rumbleAbove) { rumble(c, t, power); dur = f.minSec + power * f.extraSec * 1.4 + 0.2; }
      else { classic(c, t, power); dur = f.minSec + power * f.extraSec + 0.2; }
      voices++; setTimeout(() => voices--, dur * 1000);
    } catch (e) {}
  }

  // Deep boom with a noise crack: the gas blast.
  function boomAt(c, t, gain = 1) {
    const o = c.createOscillator(), g = c.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(24, t + 1.4);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.7 * gain, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
    o.connect(g); g.connect(c.destination); g.connect(reverb(c));
    o.start(t); o.stop(t + 1.6);
    noiseLayer(c, t, 1.4, 0.5 * gain, 2500, 70);
  }
  function boom() { try { boomAt(context(), context().currentTime, 1); } catch (e) {} }

  // Short wet "plop" for the poop.
  function plop() {
    try {
      const c = context(), t = c.currentTime, o = c.createOscillator(), g = c.createGain();
      o.type = "sine"; o.frequency.setValueAtTime(320, t);
      o.frequency.exponentialRampToValueAtTime(70, t + 0.16);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.35, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      o.connect(g); g.connect(c.destination); g.connect(reverb(c));
      o.start(t); o.stop(t + 0.25);
    } catch (e) {}
  }

  return { startSqueak, setSqueak, stopSqueak, fart, boom, plop };
})();
