// Tweakable numbers live here. Everything else reads from GV.config.
window.GV = { config: {
  maxScale: 2.4,        // how big Verity gets at full charge
  fullChargeMs: 3000,   // hold time to reach full charge
  minPower: 0.08,       // power of a quick tap
  shakeThreshold: 0.5,  // power above which the screen shakes
  squeak: { baseHz: 180, riseHz: 700, gain: 0.04 },
  fart:   { minSec: 0.3, extraSec: 1.6, baseHz: 70, jitterHz: 40, reverbSec: 1.6, reverbMix: 0.5 },
  combo:  { windowMs: 2500,       // time to land the next fart and keep the combo
            powerPerCombo: 0.12,  // extra fart power per combo step
            puffsPerCombo: 0.2 }, // extra puffs per combo step (fraction)
  puffs:  { max: 600,            // hard cap on live particles (the lag guard)
            perBurst: 90,        // cap on particles from a single fart
            base: 8, extra: 40,
            lifeMin: 4, lifeExtra: 5, lifePerCombo: 1.2,  // seconds a puff lingers
            alpha: 0.5,
            colors: [[110, 155, 40], [140, 180, 40], [165, 200, 50]] },
  maxFarts: 5            // simultaneous fart sounds
}};
