# Gassy Verity

Hold the round yellow Verity (or press space) to inflate it, let go for a big fart.
No build step: open `index.html` in a browser.

## Layout

- `index.html` - page markup and the Verity SVG
- `css/style.css` - all styling
- `js/config.js` - tweakable numbers (size, timings, sound, gas, blast, sky)
- `js/ui.js` - toast and screen flash
- `js/stats.js` - lifetime stats in localStorage and the stats panel
- `js/haptics.js` - phone vibration
- `js/audio.js` - squeak, fart variants (squeak, classic, rumble, finale) and the blast boom
- `js/puffs.js` - canvas gas particles (fixed pool, capped, lingers to fill the screen, blast shockwave)
- `js/face.js` - expressions: blush, bulging eyes, watering eyes, relief
- `js/combo.js` - combo counter
- `js/sky.js` - day/night cycle from the real time and IP location
- `js/motion.js` - squash spring and screen shake (one loop, continuous state)
- `js/blast.js` - gas blast: packed cloud + a big hold clears the screen
- `js/verity.js` - charge and release behavior
- `js/main.js` - input wiring

Scripts are plain (non-module) files sharing a `GV` namespace, so the page works from
`file://`. Load order in `index.html` matters.

## Sky

The sky follows the sun at your location. Location comes from an IP lookup (ipwho.is, then
ipapi.co as a fallback), cached in localStorage for 24 hours. **That request shows your IP to
those services.** If it fails the sky uses the device clock and a longitude guessed from the
time zone, and the label says "(approx)". The sun and moon positions are computed locally.

URL overrides for testing: `?time=21:30`, `?lat=59.9&lon=10.7&city=Oslo`, `?loc=off`
(skip the lookup), `?speed=30` (sky minutes per real second, a time-lapse).

## Controls

Hold Verity (or space) to inflate, release for a fart. On a phone, touch anywhere in the
scene. Chain farts for a combo. Pack the screen with gas, then release a real hold (about
2.3 s or more) for a gas blast.

Verity is the round yellow companion from ThatMob's videos.

## Archived: the laggy version

Tag `v1-laggy-combo` (also branch `archive/laggy-combo`) is the version with the combo
system and screen-filling gas. It is very funny and very laggy when spammed: every fart
spawns up to ~100 DOM puffs scaled up to 4x, they pile up, and each fart also starts
several oscillators feeding a shared reverb. Kept as-is for fun. Check it out with:

    git checkout v1-laggy-combo

## License

GPL-3.0. See `LICENSE`. Copyright (C) 2026 Redwan Hossain.
