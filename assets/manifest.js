// The art list. Every image the game shows is a file under assets/; this file says which
// files exist and what they do. To add your own, drop the image in the right folder and add
// one entry below. See assets/README.md.
//
// Skins cost gas in the shop (cost) and show up there automatically.
window.GV = window.GV || {};
GV.assets = {
  sun: "assets/sky/sun.svg",
  moon: "assets/sky/moon.svg",
  cloud: "assets/weather/cloud.svg",
  poop: "assets/poop.svg",

  // face: how the animated eyes and mouth are drawn on top of the image (coordinates are on a
  //       100x100 grid over the image). Use  face: false  if your image already has a face.
  //   eyeColor, eyeY, eyeDX (distance from center), eyeRx, eyeRy, mouth, mouthColor, mouthWidth
  //   eyeShape: "ellipse" (default) or "rect"; mouthDy shifts the mouth up/down on the grid
  //   emoticon: ">_<" draws a text face in JetBrains Mono instead (emoticonHappy for after a fart, emoticonSize, eyeColor)
  //   eyesClosed: true draws closed eyes. mouth is one of: "smile" "frown" "w" "line" "zigzag" "o" "none"
  skins: [
    { id: "verity", name: "Verity", cost: 0, desc: "The original: a lemon-yellow ball with a black smile.",
      file: "assets/skins/verity.svg", face: {} },
    { id: "falsity", name: "Falsity", cost: 5000, desc: "The blue variant. Always wrong.",
      file: "assets/skins/falsity.svg", face: {} },
    { id: "chellsity", name: "Chellsity", cost: 10000, desc: "Chellsea's own variant: hot pink, with a >_< in JetBrains Mono.",
      file: "assets/skins/chellsity.svg", face: { emoticon: ">_<", emoticonHappy: "^_^", eyeColor: "#ffffff", eyeY: 52, emoticonSize: 34 } },
    { id: "lovity", name: "Lovity", cost: 15000, desc: "The pink variant, eyes closed, completely benevolent.",
      file: "assets/skins/lovity.svg", face: { eyesClosed: true } },
    { id: "curiosity", name: "Curiosity", cost: 40000, desc: "The green variant. Wants to know everything.",
      file: "assets/skins/curiosity.svg", face: {} },
    { id: "larpity", name: "Larpity", cost: 80000, desc: "A lime green variant that larps as Verity.",
      file: "assets/skins/larpity.svg", face: {} },
    { id: "clawd", name: "Clawd", cost: 150000, desc: "A little orange guy with claws.",
      file: "assets/skins/clawd.svg", face: { eyeColor: "#1a1a1a", eyeShape: "rect", eyeY: 44, eyeDX: 18, eyeRx: 4, eyeRy: 6, mouth: "none" } },
    { id: "mandity", name: "Mandity", cost: 250000, desc: "The orange variant. Hostile, bossy.",
      file: "assets/skins/mandity.svg", face: {} },
    { id: "cruelty", name: "Cruelty", cost: 400000, desc: "The red variant. Always angry.",
      file: "assets/skins/cruelty.svg", face: { mouth: "frown" } },
    { id: "manipulity", name: "Manipulity", cost: 800000, desc: "The purple variant. Ball of mind control.",
      file: "assets/skins/manipulity.svg", face: {} },
    { id: "narity", name: "Narity", cost: 1500000.0, desc: "The white variant that disguised itself as Falsity.",
      file: "assets/skins/narity.svg", face: {} },
    { id: "moggity", name: "Moggity", cost: 3000000.0, desc: "A yellow variant with a Roblox-style face.",
      file: "assets/skins/moggity.svg", face: { eyeRx: 4, eyeRy: 6 } },
    { id: "freakity", name: "Freakity", cost: 6000000.0, desc: "Verity's playful, freaky son, in a hat.",
      file: "assets/skins/freakity.svg", face: {} },
    { id: "obesity", name: "Obesity", cost: 12000000.0, desc: "Fat Verity. Feed him anything.",
      file: "assets/skins/obesity.svg", face: {} },
    { id: "eclipsity", name: "Eclipsity", cost: 30000000.0, desc: "The black variant. The final boss.",
      file: "assets/skins/eclipsity.svg", face: { eyeColor: "#e8e8f0", mouthColor: "#e8e8f0" } },
    { id: "monster", name: "Monster Verity", cost: 80000000.0, desc: "The tall true form. Fan-drawn.",
      file: "assets/skins/monster.svg", face: { eyeColor: "#0a0a0a", eyeY: 26, eyeDX: 10, eyeRx: 5, eyeRy: 9, mouth: "zigzag", mouthColor: "#f3ecd0", mouthWidth: 3, mouthDy: -28 } },
    { id: "lordverity", name: "Lord Verity", cost: 200000000.0, desc: "The monster form in a fancy hat and a gold-striped blazer.",
      file: "assets/skins/lordverity.svg", face: { eyeColor: "#0a0a0a", eyeY: 38, eyeDX: 9, eyeRx: 4.5, eyeRy: 8, mouth: "zigzag", mouthColor: "#f3ecd0", mouthWidth: 3, mouthDy: -16 } }
  ]

};
