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
            gasPerToot: 0.06, gasPerPower: 0.08, gasComboBonus: 0.3,
            decayPerSec: 0.03,    // how fast the screen gas clears once the combo drops
            puffsPerCombo: 0.2 }, // extra puffs per combo step (fraction)
  puffs:  { base: 14, extra: 50, colors: [[110, 155, 40], [160, 195, 40]] }
}};
