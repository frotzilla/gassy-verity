// Tweakable numbers live here. Everything else reads from GV.config.
window.GV = { config: {
  worldMargin: 40,      // px the scene is oversized by (keep in sync with #world in style.css)
  maxScale: 2.4,        // how big Verity gets at full charge
  fullChargeMs: 3000,   // hold time to reach full charge
  minPower: 0.08,       // power of a quick tap
  motion: { stiffness: 100, damping: 9,  // squash spring (lower damping = bouncier)
            popKick: 2.5,                  // squash impulse on release, per power
            jelly: 0.025, jitterPx: 3,    // stretch along motion, strain shiver
            traumaPerPower: 0.55, traumaDecay: 1.3, shakePx: 18, shakeDeg: 0.8 },
  squeak: { baseHz: 180, riseHz: 700, gain: 0.04 },
  fart:   { minSec: 0.3, extraSec: 1.6, baseHz: 70, jitterHz: 40, reverbSec: 1.6, reverbMix: 0.5 },
  combo:  { windowMs: 2500,       // time to land the next fart and keep the combo
            powerPerCombo: 0.12,  // extra fart power per combo step
            puffsPerCombo: 0.2 }, // extra puffs per combo step (fraction)
  puffs:  { max: 700,            // hard cap on live particles (the lag guard)
            perBurst: 110,       // cap on particles from a single fart
            spreadBase: 2.6, spreadPower: 3.4,            // fan angle (radians), grows with power
            speedMin: 0.25, speedRand: 0.5, speedPower: 0.9,  // launch speed, in screen widths per second
            drag: 0.9,           // lower = gas travels farther
            base: 8, extra: 40,
            lifeMin: 4, lifeExtra: 5, lifePerCombo: 1.2,  // seconds a puff lingers
            alpha: 0.5,
            colors: [[110, 155, 40], [140, 180, 40], [165, 200, 50]] },
  maxFarts: 5            // simultaneous fart sounds
}};
