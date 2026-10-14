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
  //   mouth is one of: "smile" "w" "line" "zigzag" "o"
  // poop: { count, windowSec } makes the skin poop if you fart count times within windowSec.
  skins: [
    { id: "verity", name: "Verity",      cost: 0,      desc: "The original.",                       file: "assets/skins/verity.svg",  face: {} },
    { id: "mint",   name: "Mint Verity", cost: 3000,   desc: "A cool green coat.",                  file: "assets/skins/mint.svg",    face: {} },
    { id: "catboy", name: "Cat Boy",     cost: 20000,  desc: "Ears, whiskers, and a weak stomach. Fart too much and he poops.",
      file: "assets/skins/catboy.svg", face: { eyeColor: "#3a2a10", eyeY: 46, mouth: "w", mouthWidth: 3.2 }, poop: { count: 14, windowSec: 6 } },
    { id: "pumpkin", name: "Pumpkin Verity", cost: 150000, desc: "Spooky season, all year.",       file: "assets/skins/pumpkin.svg", face: { eyeColor: "#2a1300", eyeY: 50, eyeRx: 6, eyeRy: 7, mouth: "zigzag", mouthColor: "#2a1300" } },
    { id: "robot",  name: "Robo Verity", cost: 300000, desc: "Beep. Boop. Pffft.",                  file: "assets/skins/robot.svg",   face: { eyeColor: "#6df0ff", mouth: "line", mouthColor: "#6df0ff" } },
    { id: "ghost",  name: "Ghost Verity", cost: 1.5e6, desc: "Boo. Also, ew.",                      file: "assets/skins/ghost.svg",   face: { eyeY: 50, eyeRx: 5, eyeRy: 8, mouth: "o", mouthWidth: 3 } }
  ]
};
