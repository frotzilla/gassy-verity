# Gassy Verity

> **Work in progress.** This is an unfinished fan game. Balance, art and features change often, bugs happen, and saves can break
> or reset between updates (use the shop's export to back up). Issues and feedback are welcome.

Hold the round yellow Verity (or press space) to inflate it, let go for a big fart.
No build step: open `index.html` in a browser.

## Layout

- `index.html` - page markup
- `assets/` - all the art (SVG/PNG), listed in `assets/manifest.js`; see `assets/README.md` to add your own
- `clips/` - voice clips: drop audio files here (see `clips/README.txt`)
- `tools/check-assets.js` - checks `assets/manifest.js` after you add or edit a skin
- `tools/clips-manifest.js` - regenerates `clips/manifest.js` (a GitHub Action also does it on push)
- `css/style.css` - all styling
- `js/config.js` - tweakable numbers (size, timings, sound, gas, blast, sky)
- `js/format.js` - number formatting (1.23K, 5.10B)
- `js/ui.js` - toast, screen flash, floating gain text
- `js/data.js` - the content: auto-farters, upgrades and achievements (add new ones here)
- `js/game.js` - economy: gas, buying, offline earnings, save/load
- `js/shop.js` - bank readout and the shop panel
- `js/skinspanel.js` - the skins tab (a grid of every skin)
- `js/stats.js` - lifetime stats in localStorage and the stats panel
- `js/haptics.js` - phone vibration
- `js/audio.js` - squeak, fart variants (squeak, classic, rumble, finale) and the blast boom
- `js/puffs.js` - canvas gas particles (fixed pool, capped, lingers to fill the screen, blast shockwave)
- `js/face.js` - expressions: blush, bulging eyes, watering eyes, relief
- `js/skins.js` - skins: the body is an image from assets/, the animated face is drawn over it
- `js/clips.js` - plays random clips from `clips/`
- `js/achievements.js` - achievements (+1% gas each) and their list in the stats panel
- `js/weather.js` - optional real weather: clouds, fog, rain, snow, storms
- `js/screenshot.js` - the snap button (saves a PNG of the scene)
- `js/about.js` - credits and privacy, in its own dialog
- `js/admin.js` - password-gated admin panel (time, weather, location, gas)
- `js/combo.js` - combo counter
- `js/sky.js` - day/night cycle from the real time and IP location
- `js/motion.js` - squash spring and screen shake (one loop, continuous state)
- `js/poop.js` - fart too much, too fast, and Verity poops (any skin)
- `js/blast.js` - gas blast: packed cloud + a big hold clears the screen
- `js/verity.js` - charge and release behavior
- `js/main.js` - input wiring

Scripts are plain (non-module) files sharing a `GV` namespace, so the page works from
`file://`. Load order in `index.html` matters.

## Game

Every fart earns gas: a tap is worth about 1, a full hold about 12, and chained farts add up to
+100%. Spend gas in the shop on auto-farters (they produce gas per second and leak puffs onto
the screen) and on upgrades (2x farts, faster charge, longer combo window, bigger blasts, and four 2x tiers per auto-farter). A gas blast pays out about 45
seconds of production. Progress saves to localStorage every 15 s, and while you are away it
earns half production for up to 8 hours. The shop has save export and import, and reset.

## Ascension, achievements, weather, screenshots

Once you have earned about 100 million gas, Ascend (in the shop) to trade your run for methane
crystals: each is a permanent +1% gas. It resets gas, auto-farters and upgrades, and keeps
skins, achievements and crystals. Each of the 22 achievements is also +1% gas. Buying, achievements
and ascending have little sounds, and the sound button mutes everything.

Weather is opt-in (About panel): it asks open-meteo.com for the current conditions at your
approximate location, with the coordinates rounded to about 10 km, and shows clouds, fog, rain,
snow or storms.

The snap button saves a PNG of the scene (or opens the share sheet on a phone). It reads the
page's own images back, so it needs the page served over http(s); opened from a file:// URL the
browser blocks it and the button says so.

## Skins and clips

To add your own skin: drop an image in `assets/skins/`, add one line to `assets/manifest.js` (id, name, cost,
file, pronoun, face), and run `node tools/check-assets.js`. Full steps are in `assets/README.md`.

Chellsity's face is a text emoticon in JetBrains Mono (the other skins keep dot eyes). It changes with mood: a random idle face
every few seconds (mostly `>_<`, with `:3`, `UwU` and `^w^`), `:o`, `O_O`, `@_@` as it swells, and `^_^` after a fart.

Skins live in their own tab (the "skins" button): a grid of every skin with its picture; click one to buy or equip it.
Skins are bought once and switched any time. They are the Verity variants from the
[Veritypedia](https://verityminecraft.fandom.com/) (Falsity, Lovity, Curiosity, Larpity, Mandity, Cruelty,
Manipulity, Narity, Moggity, Freakity, Obesity, Eclipsity, Monster Verity and Lord Verity, plus fan-blog variants:
Timeity, Acclivity, Vapority, Smallity, Calamity, Powerity, Upside-down Verity, Variety, Blarity,
Chillity, Nothinity, Stupidity, Purity, Homosexuality, and two I drew from the name alone, Angelity and Auraity), Chellsity (hot pink
`>_<`, from the author's GitHub avatar) and Clawd, a little
orange guy with claws (an unofficial fan tribute to Anthropic's Claude Code mascot; see `NOTICE.md`). Fart about 14 times in 6 seconds, on any skin, and Verity poops; click the poop
to clean it up for a little gas. The art is my own drawings based on the wiki's descriptions; the wiki's text is
CC-BY-SA. This is an unofficial fan project.

Voice clips: put audio files in the `clips/` folder and push. They play at random on some farts,
more often on blasts and big combos. The page reads `clips/manifest.js`, which is generated:
a GitHub Action rebuilds it whenever you push files to `clips/`, or run
`node tools/clips-manifest.js` locally. Chance and volume are in `js/config.js`. Only add clips you
have the right to use, since the repo is public.

## Sky

The sky follows the sun at your location. Location comes from an IP lookup (ipwho.is, then
ipapi.co as a fallback), cached in localStorage for 24 hours. **That request shows your IP to
those services.** You can turn the lookup off from the About panel, and there is a notice the
first time you visit. If it fails the sky uses the device clock and a longitude guessed from the
time zone, and the label says "(approx)". The sun and moon positions are computed locally.

To test other times, places or weather, use the admin panel.

## Admin panel

Add `?admin` to the URL (or use "Open admin" in the About dialog) and enter the password:
`ughImSoBigAndFatAndGassyAndGay`. It can set the time (or run it fast), the weather,
the location, give gas and crystals, unlock everything, and more.
The password is checked against a salted hash in the source. It is public on purpose: this is a cheat-menu
gate, not real security: the game runs entirely in your browser, so anyone with the dev tools
open can edit their own game state anyway. There is nothing server-side to protect.

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

The GPL covers this project's code and original drawings only. The characters it depicts (the Verity
series, and Clawd, the Claude Code mascot owned by Anthropic) belong to their owners and are used here as
unofficial, non-commercial fan tributes. See `NOTICE.md` for details and how to ask for something to be removed.
