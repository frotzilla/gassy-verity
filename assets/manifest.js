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

  // wiki: the Veritypedia page the skin was drawn from (shown as a link in the skins tab). Omit it for skins that are not from the wiki.
  // face: how the animated eyes and mouth are drawn on top of the image (coordinates are on a
  //       100x100 grid over the image). Use  face: false  if your image already has a face.
  //   eyeColor, eyeY, eyeDX (distance from center), eyeRx, eyeRy, mouth, mouthColor, mouthWidth
  //   eyeShape: "ellipse" (default) or "rect"; mouthDy shifts the mouth up/down on the grid
  //   faceScale and faceDy shrink and shift the whole face (for a pyramid or a tiny ball). A skin entry can also set flip: true.
  //   alwaysEmoticon: true gives a skin a text face in JetBrains Mono (only Chellsity has one): emoIdle, emoCharge and
  //   emoRelief are lists of ASCII faces like ":3"; emoSize and emoY place the text.
  //   eyesClosed: true draws closed eyes. mouth is one of: "smile" "frown" "w" "line" "zigzag" "o" "none"
  skins: [
    { id: "verity", name: "Verity", cost: 0, desc: "The original: a lemon-yellow ball with a black smile.",
      file: "assets/skins/verity.svg", wiki: "https://verityminecraft.fandom.com/wiki/Verity%E2%84%A2", face: {} },
    { id: "falsity", name: "Falsity", cost: 5000, desc: "The blue variant. Always wrong.",
      file: "assets/skins/falsity.svg", wiki: "https://verityminecraft.fandom.com/wiki/Falsity", face: {} },
    { id: "chellsity", name: "Chellsity", cost: 10000, desc: "Chellsea's own variant: hot pink, with a >_< in JetBrains Mono.",
      file: "assets/skins/chellsity.svg", face: { alwaysEmoticon: true, eyeColor: "#ffffff", eyeY: 52, emoY: 52, emoSize: 34,
               emoIdle: [">_<", ">_<", ":3", "UwU", "^w^"], emoCharge: [":o", "O_O", "@_@"], emoRelief: ["^_^", "UwU", ":3"] } },
    { id: "lovity", name: "Lovity", cost: 15000, desc: "The pink variant, eyes closed, completely benevolent.",
      file: "assets/skins/lovity.svg", wiki: "https://verityminecraft.fandom.com/wiki/Lovity", face: { eyesClosed: true } },
    { id: "blarity", name: "Blarity", cost: 25000, desc: "The weakest variant, a light yellow one. Up to four at once.",
      file: "assets/skins/blarity.svg", wiki: "https://verityminecraft.fandom.com/wiki/User_blog:DurableLapwing176/Blarity", face: {} },
    { id: "curiosity", name: "Curiosity", cost: 40000, desc: "The green variant. Wants to know everything.",
      file: "assets/skins/curiosity.svg", wiki: "https://verityminecraft.fandom.com/wiki/Curiosity", face: {} },
    { id: "chillity", name: "Chillity", cost: 60000, desc: "An orange variant. Chill, I guess.",
      file: "assets/skins/chillity.svg", wiki: "https://verityminecraft.fandom.com/wiki/User_blog:EnergeticLobster974/Chillity", face: {} },
    { id: "larpity", name: "Larpity", cost: 80000, desc: "A lime green variant that larps as Verity.",
      file: "assets/skins/larpity.svg", wiki: "https://verityminecraft.fandom.com/wiki/Larpity", face: {} },
    { id: "timeity", name: "Timeity", cost: 100000, desc: "The dark green orb that can reach all of space and time.",
      file: "assets/skins/timeity.svg", wiki: "https://verityminecraft.fandom.com/wiki/User_blog:Adol4fo/Timeity", face: {} },
    { id: "nothinity", name: "Nothinity", cost: 120000, desc: "An orange variant that knows nothing. IDK.",
      file: "assets/skins/nothinity.svg", wiki: "https://verityminecraft.fandom.com/wiki/User_blog:O1253/Nothinity", face: { mouth: "line" } },
    // Clawd is Anthropic's Claude Code mascot; this is an unofficial fan drawing. See NOTICE.md.
    { id: "clawd", name: "Clawd", cost: 150000, desc: "Unofficial fan tribute to the Claude Code mascot (Anthropic's character).",
      file: "assets/skins/clawd.svg", face: { eyeColor: "#1a1a1a", eyeShape: "rect", eyeY: 44, eyeDX: 18, eyeRx: 4, eyeRy: 6, mouth: "none" } },
    { id: "gypsy", name: "Gypsy Verity", cost: 200000, desc: "Yellow ball in a hat with a hoop earring.",
      file: "assets/skins/gypsy.svg", wiki: "https://verityminecraft.fandom.com/wiki/User_blog:AVFCFan/Gypsy_Verity", face: {} },
    { id: "mandity", name: "Mandity", cost: 250000, desc: "The orange variant. Hostile, bossy.",
      file: "assets/skins/mandity.svg", wiki: "https://verityminecraft.fandom.com/wiki/Mandity", face: {} },
    { id: "stupidity", name: "Stupidity", cost: 280000, desc: "The purple variant.",
      file: "assets/skins/stupidity.svg", wiki: "https://verityminecraft.fandom.com/wiki/User_blog:Smoji_the_Emoji/Stupidity", face: {} },
    { id: "acclivity", name: "Acclivity", cost: 320000, desc: "The pyramid variant. Always got a point.",
      file: "assets/skins/acclivity.svg", wiki: "https://verityminecraft.fandom.com/wiki/User_blog:VerityFan2012/Acclivity", face: { faceScale: 0.62, faceDy: 12 } },
    { id: "cruelty", name: "Cruelty", cost: 400000, desc: "The red variant. Always angry.",
      file: "assets/skins/cruelty.svg", wiki: "https://verityminecraft.fandom.com/wiki/Cruelty", face: { mouth: "frown" } },
    { id: "angelity", name: "Angelity", cost: 450000, desc: "A version of Verity. Drawn with a halo (my guess).",
      file: "assets/skins/angelity.svg", wiki: "https://verityminecraft.fandom.com/wiki/User_blog:PurposefulTapir573/Angelity", face: { faceScale: 0.85, faceDy: 6 } },
    { id: "vapority", name: "Vapority", cost: 600000, desc: "An orange ball in vaporwave glasses. Bored.",
      file: "assets/skins/vapority.svg", wiki: "https://verityminecraft.fandom.com/wiki/User_blog:SplendidScorpion966/Vapority", face: { mouth: "line" } },
    { id: "manipulity", name: "Manipulity", cost: 800000, desc: "The purple variant. Ball of mind control.",
      file: "assets/skins/manipulity.svg", wiki: "https://verityminecraft.fandom.com/wiki/Manipulity", face: {} },
    { id: "auraity", name: "Auraity", cost: 900000, desc: "Wants you to gain immense aura. Drawn with aura rings (my guess).",
      file: "assets/skins/auraity.svg", wiki: "https://verityminecraft.fandom.com/wiki/User_blog:AttractiveManatee091/Auraity", face: { faceScale: 0.8, faceDy: 0 } },
    { id: "smallity", name: "Smallity", cost: 1000000, desc: "The smallest variant, about 5.6 mm across.",
      file: "assets/skins/smallity.svg", wiki: "https://verityminecraft.fandom.com/wiki/User:StaunchCapybara666/Smallity", face: { faceScale: 0.2, faceDy: -2 } },
    { id: "purity", name: "Purity", cost: 1200000, desc: "An off-white variant, a little sullied.",
      file: "assets/skins/purity.svg", wiki: "https://verityminecraft.fandom.com/wiki/User_blog:AdvantageousWallaby374/Purity", face: {} },
    { id: "narity", name: "Narity", cost: 1500000, desc: "The white variant that disguised itself as Falsity.",
      file: "assets/skins/narity.svg", wiki: "https://verityminecraft.fandom.com/wiki/Narity", face: {} },
    { id: "calamity", name: "Calamity", cost: 2000000, desc: "Orange ball with black splotch eyes and a goopy mouth.",
      file: "assets/skins/calamity.svg", wiki: "https://verityminecraft.fandom.com/wiki/User_blog:NobleJackal107/Calamity", face: { eyeColor: "rgba(0,0,0,0)", mouth: "none" } },
    { id: "moggity", name: "Moggity", cost: 3000000, desc: "A yellow variant with a Roblox-style face.",
      file: "assets/skins/moggity.svg", wiki: "https://verityminecraft.fandom.com/wiki/Moggity", face: { eyeRx: 4, eyeRy: 6 } },
    { id: "powerity", name: "Powerity", cost: 4500000, desc: "Powered up, glowing with an aura.",
      file: "assets/skins/powerity.svg", wiki: "https://verityminecraft.fandom.com/wiki/User_blog:Im_Jerry_and_im_coming/Powerity", face: { faceScale: 0.72, faceDy: 0 } },
    { id: "freakity", name: "Freakity", cost: 6000000, desc: "Verity's playful, freaky son, in a hat.",
      file: "assets/skins/freakity.svg", wiki: "https://verityminecraft.fandom.com/wiki/Freakity", face: {} },
    { id: "homosexuality", name: "Homosexuality", cost: 7000000, desc: "Gay Verity: a rainbow variant, good for fashion advice.",
      file: "assets/skins/homosexuality.svg", wiki: "https://verityminecraft.fandom.com/wiki/User_blog:VerityFan2012/Homosexuality", face: {} },
    { id: "upsidedown", name: "Upside-down Verity", cost: 9000000, desc: "Please flip me over! Blood is rushing to my head!",
      file: "assets/skins/upsidedown.svg", wiki: "https://verityminecraft.fandom.com/wiki/User_blog:BreaddShell/Upside-down_Verity", face: {}, flip: true },
    { id: "obesity", name: "Obesity", cost: 12000000, desc: "Fat Verity. Feed him anything.",
      file: "assets/skins/obesity.svg", wiki: "https://verityminecraft.fandom.com/wiki/Obesity", face: {} },
    { id: "eclipsity", name: "Eclipsity", cost: 30000000, desc: "The black variant. The final boss.",
      file: "assets/skins/eclipsity.svg", wiki: "https://verityminecraft.fandom.com/wiki/Eclipsity", face: { eyeColor: "#e8e8f0", mouthColor: "#e8e8f0" } },
    { id: "variety", name: "Variety", cost: 50000000, desc: "The rainbow variant, switching personalities at random.",
      file: "assets/skins/variety.svg", wiki: "https://verityminecraft.fandom.com/wiki/User_blog:DarkestAbyss7/Variety", face: {} },
    { id: "monster", name: "Monster Verity", cost: 80000000, desc: "The tall true form. Fan-drawn.",
      file: "assets/skins/monster.svg", wiki: "https://verityminecraft.fandom.com/wiki/Verity%E2%84%A2", face: { eyeColor: "#0a0a0a", eyeY: 26, eyeDX: 10, eyeRx: 5, eyeRy: 9, mouth: "zigzag", mouthColor: "#f3ecd0", mouthWidth: 3, mouthDy: -28 } },
    { id: "lordverity", name: "Lord Verity", cost: 200000000, desc: "The monster form in a fancy hat and a gold-striped blazer.",
      file: "assets/skins/lordverity.svg", wiki: "https://verityminecraft.fandom.com/wiki/Lord_Verity", face: { eyeColor: "#0a0a0a", eyeY: 38, eyeDX: 9, eyeRx: 4.5, eyeRy: 8, mouth: "zigzag", mouthColor: "#f3ecd0", mouthWidth: 3, mouthDy: -16 } }
  ]

};
