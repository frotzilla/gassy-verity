# Gassy Verity

Hold the round yellow Verity (or press space) to inflate it, let go for a big fart.
No build step: open `index.html` in a browser.

## Layout

- `index.html` - page markup and the Verity SVG
- `css/style.css` - all styling
- `js/config.js` - tweakable numbers (size, timings, sound, gas)
- `js/audio.js` - squeak and fart sounds
- `js/puffs.js` - canvas gas particles (fixed pool, capped, lingers to fill the screen)
- `js/combo.js` - combo counter
- `js/motion.js` - squash spring and screen shake (one loop, continuous state)
- `js/verity.js` - charge and release behavior
- `js/main.js` - input wiring

Scripts are plain (non-module) files sharing a `GV` namespace, so the page works from
`file://`. Load order in `index.html` matters: config, audio, puffs, combo, motion, verity, main.

Verity is the round yellow companion from ThatMob's videos.

## Archived: the laggy version

Tag `v1-laggy-combo` (also branch `archive/laggy-combo`) is the version with the combo
system and screen-filling gas. It is very funny and very laggy when spammed: every fart
spawns up to ~100 DOM puffs scaled up to 4x, they pile up, and each fart also starts
several oscillators feeding a shared reverb. Kept as-is for fun. Check it out with:

    git checkout v1-laggy-combo
