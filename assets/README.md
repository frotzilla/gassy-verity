# Assets

Every image in the game is a file in this folder. `manifest.js` lists them.

    assets/
      manifest.js        the list (edit this to add things)
      favicon.svg        browser tab icon (linked from index.html)
      skins/             Verity's bodies (100x100 grid)
      sky/               sun.svg, moon.svg
      poop.svg
      weather/           cloud.svg

SVG or PNG both work. Keep skins roughly square.

## Add a skin

1. **Draw the body.** Drop `mything.svg` (or `.png`) in `assets/skins/`. Roughly square; SVG uses a 100x100 grid.
2. **Add one entry** to `skins` in `manifest.js`:

        { id: "mything", name: "My Thing", cost: 5000, desc: "Hello.",
          file: "assets/skins/mything.svg", pronoun: "she", face: {} }

   - `id`: lowercase letters and digits, unique.
   - `cost`: gas price (`0` = free). The shop lists skins in file order, so keep them roughly sorted by price.
   - `pronoun`: `"he"`, `"she"`, `"it"` or `"they"`. Used in messages like "...she pooped." Leave it out and the
     default (`defaultPronoun` in `js/config.js`, currently "they") is used.
   - `wiki`: optional URL; shows a "wiki" link under the card in the skins tab.
   - `face`: see below.
3. **Check it:** `node tools/check-assets.js` (missing files, duplicate ids, typos in face settings, bad pronouns).
4. **Try it:** open the page, open the admin panel and use "unlock all skins", then equip it in the skins tab.

### The face

The eyes and mouth are a separate layer drawn over your image (so they can animate), set by `face`.
`face: {}` uses the defaults. Settings (coordinates are on a 100x100 grid over the image, so line them up with
your art): `eyeColor`, `eyeY`, `eyeDX` (distance from center), `eyeRx`, `eyeRy`, `eyeShape` ("ellipse" or "rect"),
`eyesClosed`, `mouth` ("smile", "frown", "w", "line", "zigzag", "o", "none"), `mouthColor`, `mouthWidth`, `mouthDy`,
`faceScale` and `faceDy` (shrink and shift the whole face for odd shapes). If your image already has a face, use
`face: false` (it still inflates, shakes and squashes, but the eyes and mouth will not animate). A skin with
`alwaysEmoticon: true` gets a text face (as Chellsity does): `emoIdle`, `emoCharge`, `emoRelief` are lists of ASCII
faces like ":3", and `emoSize` / `emoY` place the text. A skin entry can also set `flip: true` (upside down).

## Replace anything else

Overwrite `poop.svg`, `sky/sun.svg`, `sky/moon.svg`, `weather/cloud.svg` or
`favicon.svg` with your own. Keep the same file names (or change the path in `manifest.js`).

Only use images you have the right to use if you publish the repo.

See `../NOTICE.md` for which assets depict third-party characters (Verity, and Clawd, the Claude Code mascot owned by
Anthropic) and how they are used.
