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
  golden: "assets/golden.svg",

  // face: how the animated eyes and mouth are drawn on top of the image (coordinates are on a
  //       100x100 grid over the image). Use  face: false  if your image already has a face.
  //   eyeColor, eyeY, eyeDX (distance from center), eyeRx, eyeRy, mouth, mouthColor, mouthWidth
  //   eyeShape: "ellipse" (default) or "rect"; mouthDy shifts the mouth up/down on the grid
  //   mouth is one of: "smile" "w" "line" "zigzag" "o" "none"
  // poop: { count, windowSec } makes the skin poop if you fart count times within windowSec.
  skins: [
    { id: "verity",  name: "Verity",         cost: 0,       desc: "The original.",                         file: "assets/skins/verity.svg",  face: {} },
    { id: "mint",    name: "Mint Verity",    cost: 3000,    desc: "A cool green coat.",                    file: "assets/skins/mint.svg",    face: {} },
    { id: "lovity",  name: "Lovity",         cost: 20000,   desc: "The pink, affectionate variant.",       file: "assets/skins/lovity.svg",  face: {} },
    { id: "catboy",  name: "Cat Boy",        cost: 40000,   desc: "Regular Verity with cat ears and a tail. Fart too much and he poops.",
      file: "assets/skins/catboy.svg", face: { eyeY: 50, eyeDX: 13 }, poop: { count: 14, windowSec: 6 } },
    { id: "falsity", name: "Falsity",        cost: 120000,  desc: "The blue variant, associated with lies.", file: "assets/skins/falsity.svg", face: {} },
    { id: "pumpkin", name: "Pumpkin Verity", cost: 150000,  desc: "Spooky season, all year.",              file: "assets/skins/pumpkin.svg", face: { eyeColor: "#2a1300", eyeY: 50, eyeRx: 6, eyeRy: 7, mouth: "zigzag", mouthColor: "#2a1300" } },
    { id: "clawd",   name: "Clawd",          cost: 300000,  desc: "A little orange guy with claws.",       file: "assets/skins/clawd.svg",   face: { eyeColor: "#1a1a1a", eyeShape: "rect", eyeY: 44, eyeDX: 18, eyeRx: 4, eyeRy: 6, mouth: "none" } },
    { id: "cruelty", name: "Cruelty",        cost: 400000,  desc: "The red, aggressive variant.",          file: "assets/skins/cruelty.svg", face: {} },
    { id: "ghost",   name: "Ghost Verity",   cost: 1.5e6,   desc: "Boo. Also, ew.",                        file: "assets/skins/ghost.svg",   face: { eyeY: 50, eyeRx: 5, eyeRy: 8, mouth: "o", mouthWidth: 3 } },
    { id: "monster", name: "Monster Verity", cost: 4e6,     desc: "A fan-drawn take on the tall true form.", file: "assets/skins/monster.svg", face: { eyeColor: "#0a0a0a", eyeY: 26, eyeDX: 10, eyeRx: 5, eyeRy: 9, mouth: "zigzag", mouthColor: "#f3ecd0", mouthWidth: 3, mouthDy: -28 } }
  ],
};
