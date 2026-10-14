Voice clips. Drop audio files (mp3, wav, ogg, m4a, aac, flac, webm) in this folder and push.
The game plays a random one now and then (on some farts, and more often on blasts, big combos
and poops).

The page cannot list a folder by itself, so it reads clips/manifest.js. That file is generated:
  - on GitHub, a workflow regenerates it whenever you push files to clips/
  - locally, run:  node tools/clips-manifest.js

Chance and volume are in js/config.js (the "clips" block). Only add clips you have the right to
use, since this repo is public.
