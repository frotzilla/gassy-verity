# Gassy Verity

Hold the round yellow Verity (or press space) to inflate it, let go for a big fart.
No build step: open `index.html` in a browser.

## Layout

- `index.html` - page markup and the Verity SVG
- `css/style.css` - all styling
- `js/config.js` - tweakable numbers (size, timings, sound, gas)
- `js/audio.js` - squeak and fart sounds
- `js/puffs.js` - gas cloud particles
- `js/combo.js` - combo counter and screen-filling gas
- `js/verity.js` - charge and release behavior
- `js/main.js` - input wiring

Scripts are plain (non-module) files sharing a `GV` namespace, so the page works from
`file://`. Load order in `index.html` matters: config, audio, puffs, combo, verity, main.

Verity is the round yellow companion from ThatMob's videos.
