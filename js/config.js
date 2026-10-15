// Tweakable numbers live here. Everything else reads from GV.config.
window.GV = { config: {
  worldMargin: 40,      // px the scene is oversized by (keep in sync with #world in style.css)
  maxScale: 2.4,        // how big Verity gets at full charge
  fullChargeMs: 3000,   // hold time to reach full charge
  minPower: 0.08,       // power of a quick tap
  motion: { stiffness: 100, damping: 18,  // squash spring (damping near 2*sqrt(stiffness) = no bounce)
            popKick: 1,                    // squash impulse on release, per power
            traumaPerPower: 0.45, traumaDecay: 1.6, shakePx: 10 },
  squeak: { baseHz: 180, riseHz: 700, gain: 0.04 },
  fart:   { minSec: 0.3, extraSec: 1.6, baseHz: 70, jitterHz: 40, reverbSec: 1.6, reverbMix: 0.5,
            squeakBelow: 0.22,   // powers under this make squeaky toots
            rumbleAbove: 0.7,    // powers over this make long low rumbles
            finaleCombo: 12 },   // combo at which big farts become a 3-part finale
  blast:  { minLevel: 0.85,      // cloud fullness needed ...
            minPower: 0.75,      // ... plus a fart this strong sets off a gas blast
            clearSec: 2.2,       // how long the old gas takes to fade out after the blast
            push: 1.3,           // shockwave strength, in screen widths per second
            flashMs: 700 },
  game:   { growth: 1.15,        // each owned building raises its price by this factor
            offlineCapHours: 8,  // away time that still earns gas
            offlineEff: 0.5,     // fraction of normal production earned while away
            saveSec: 15 },
  clips:  { chance: 0.15,        // chance a normal fart plays a random clip
            bigChance: 0.8,      // chance for blasts, big combos and poops
            volume: 0.8, minGapMs: 2500 },
  audioFinaleCombo: 12,          // combo at which clips use the "big" chance
  defaultPronoun: "they",         // for skins that do not set a pronoun in the manifest
  poop:   { count: 14, windowSec: 6, limit: 6 },   // this many farts in this many seconds makes a poop; most on screen
  haptics: true,                 // phone vibration (Android browsers; iOS ignores it)
  sky:    { refreshSec: 20,      // how often the sky is recomputed
            ipTimeoutMs: 4000,   // give up on the IP lookup after this long
            cacheHours: 24 },    // reuse the looked-up location for this long
  combo:  { windowMs: 1500,       // time to land the next fart and keep the combo
            powerPerCombo: 0.12,  // extra fart power per combo step
            puffsPerCombo: 0.2 }, // extra puffs per combo step (fraction)
  puffs:  { max: 700,            // hard cap on live particles (the lag guard)
            perBurst: 110,       // cap on particles from a single fart
            spreadBase: 2.6, spreadPower: 3.4,            // fan angle (radians), grows with power
            speedMin: 0.25, speedRand: 0.5, speedPower: 0.9,  // launch speed, in screen widths per second
            comboCap: 8,         // combo steps past this add no extra puffs or lifetime
            crowdDamp: 0.85,     // how much a packed screen cuts new puffs (0 = none)
            probes: 8,           // recycling picks the most-faded of this many random puffs
            drag: 0.9,           // lower = gas travels farther
            base: 8, extra: 40,
            lifeMin: 4, lifeExtra: 5, lifePerCombo: 1.2,  // seconds a puff lingers
            alpha: 0.5,
            colors: [[110, 155, 40], [140, 180, 40], [165, 200, 50]] },
  maxFarts: 5            // simultaneous fart sounds
}};
