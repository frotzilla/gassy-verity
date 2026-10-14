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

1. Drop `mything.svg` (or `.png`) in `assets/skins/`.
2. Add an entry to `skins` in `manifest.js`:

        { id: "mything", name: "My Thing", cost: 5000, desc: "Hello.",
          file: "assets/skins/mything.svg", face: {} }

`face: {}` draws the animated eyes and mouth over your image with defaults. Tweak with
`eyeColor`, `eyeY`, `eyeDX`, `eyeRx`, `eyeRy`, `mouth` ("smile", "frown", "w", "line", "zigzag", "o", "none"),
`mouthColor`, `mouthWidth`. A text face like `emoticon: ">_<"` (JetBrains Mono) works too. Eyes and mouth are placed on a 100x100 grid over the image, so line them
up with where your art has a face. If your image already has a face, use `face: false` (it still
inflates, shakes and squashes, but the eyes and mouth will not animate).

## Replace anything else

Overwrite `poop.svg`, `sky/sun.svg`, `sky/moon.svg`, `weather/cloud.svg` or
`favicon.svg` with your own. Keep the same file names (or change the path in `manifest.js`).

Only use images you have the right to use if you publish the repo.
