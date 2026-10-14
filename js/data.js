// Game content: auto-farters and upgrades. To add something, add a row here.
GV.data = (() => {
  // base = starting price, gps = gas per second each
  const generators = [
    { id: "bean",     name: "Bean Can",        base: 15,     gps: 0.1,    desc: "A can of beans on a low simmer." },
    { id: "chili",    name: "Chili Pot",       base: 100,    gps: 1,      desc: "Slow cooked and very spicy." },
    { id: "cow",      name: "Dairy Cow",       base: 1100,   gps: 8,      desc: "Methane on four legs." },
    { id: "pipe",     name: "Sewer Pipe",      base: 12000,  gps: 47,     desc: "The city's biggest vent." },
    { id: "swamp",    name: "Swamp",           base: 130000, gps: 260,    desc: "Bubbles up all day." },
    { id: "landfill", name: "Landfill",        base: 1.4e6,  gps: 1400,   desc: "Decades of leftovers." },
    { id: "vent",     name: "Volcano Vent",    base: 2e7,    gps: 7800,   desc: "Sulfur straight from the crust." },
    { id: "giant",    name: "Gas Giant",       base: 3.3e8,  gps: 44000,  desc: "A whole planet of gas." },
    { id: "hole",     name: "Black Hole Burp", base: 5.1e9,  gps: 260000, desc: "Gas goes in. Some comes out." },
    { id: "cosmic",   name: "Cosmic Fart",     base: 7.5e10, gps: 1.6e6,  desc: "The universe lets one go." }
  ];

  // fx: { tap: x } farts earn x more | { gen, mult } that building makes x more
  //     { charge: x } charge time times x | { window: ms } longer combo window
  //     { blast: x } bigger blast bonus
  const upgrades = [];
  const earlyShow = cost => s => s.total >= cost / 2;
  const add = (id, name, desc, cost, fx, show = earlyShow(cost)) => upgrades.push({ id, name, desc, cost, fx, show });

  [["Bean Burrito", 100], ["Triple Bean Burrito", 500], ["Fiber Supplement", 1e4],
   ["Methane Lungs", 1e5], ["Gas Station Hot Dog", 1e7], ["Eight-Alarm Chili", 1e9]]
    .forEach(([n, c], i) => add("tap" + i, n, "Every fart earns 2x gas.", c, { tap: 2 }));

  [["Quick Pump I", 2e3], ["Quick Pump II", 5e4], ["Quick Pump III", 1e6]]
    .forEach(([n, c], i) => add("charge" + i, n, "Verity charges 20% faster.", c, { charge: 0.8 }));

  [["Steady Rhythm I", 3e3, 500], ["Steady Rhythm II", 8e4, 500], ["Steady Rhythm III", 2e6, 1000]]
    .forEach(([n, c, ms], i) => add("window" + i, n, "Combo window +" + ms / 1000 + "s.", c, { window: ms }));

  [["Bigger Boom I", 2.5e4, 2], ["Bigger Boom II", 2e6, 3]]
    .forEach(([n, c, m], i) => add("blast" + i, n, "Gas blasts pay " + m + "x.", c, { blast: m }));


  // Four 2x tiers per building, unlocked by owning 1, 10, 25 and 50 of it.
  const tiers = [[1, 10, "I"], [10, 50, "II"], [25, 500, "III"], [50, 5000, "IV"]];
  for (const g of generators) {
    for (const [req, mult, roman] of tiers) {
      add(g.id + "_t" + roman, g.name + " Tuning " + roman, g.name + "s make 2x gas.", g.base * mult,
          { gen: g.id, mult: 2 }, s => (s.gens[g.id] || 0) >= req);
    }
  }
  upgrades.sort((a, b) => a.cost - b.cost);

  // Skins are art, so they live in assets/manifest.js.
  const { skins } = GV.assets;

  // Achievements: each unlocked one adds +1% to all gas. test(c) gets c.S (game state),
  // c.st (lifetime stats), c.buildings (total owned) and c.types (kinds of building owned).
  const achievements = [
    ["first",    "First Toot",       "Let one out.",                   c => c.st.toots >= 1],
    ["toots100", "Regular",          "100 toots.",                     c => c.st.toots >= 100],
    ["toots1k",  "Gas Station",      "1,000 toots.",                   c => c.st.toots >= 1000],
    ["toots10k", "Wind Tunnel",      "10,000 toots.",                  c => c.st.toots >= 10000],
    ["combo10",  "On a Roll",        "A combo of 10.",                 c => c.st.bestCombo >= 10],
    ["combo25",  "Chain Reaction",   "A combo of 25.",                 c => c.st.bestCombo >= 25],
    ["combo50",  "Unstoppable",      "A combo of 50.",                 c => c.st.bestCombo >= 50],
    ["hold3",    "Patient",          "Hold for a full charge.",        c => c.st.longestHold >= 3],
    ["blast1",   "Kaboom",           "Set off a gas blast.",           c => c.st.blasts >= 1],
    ["blast10",  "Demolition",       "10 gas blasts.",                 c => c.st.blasts >= 10],
    ["blast50",  "Controlled Burn",  "50 gas blasts.",                 c => c.st.blasts >= 50],
    ["poop1",    "Oops",             "Clean up your first poop.",      c => c.st.poops >= 1],
    ["poop10",   "Janitor",          "Clean up 10 poops.",             c => c.st.poops >= 10],
    ["gas1k",    "Pocket Change",    "Earn 1,000 gas.",                c => c.S.lifetime >= 1e3],
    ["gas1m",    "Millionaire",      "Earn 1 million gas.",            c => c.S.lifetime >= 1e6],
    ["gas1b",    "Billionaire",      "Earn 1 billion gas.",            c => c.S.lifetime >= 1e9],
    ["gas1t",    "Atmospheric",      "Earn 1 trillion gas.",           c => c.S.lifetime >= 1e12],
    ["build1",   "Hired Help",       "Buy your first auto-farter.",    c => c.buildings >= 1],
    ["build50",  "Small Business",   "Own 50 auto-farters.",           c => c.buildings >= 50],
    ["build200", "Industry",         "Own 200 auto-farters.",          c => c.buildings >= 200],
    ["allTypes", "Full House",       "Own every kind of auto-farter.", c => c.types >= generators.length],
    ["skin1",    "New Look",         "Buy a skin.",                    c => Object.keys(c.S.skins).length >= 2],
    ["skinAll",  "Wardrobe",         "Own every skin.",                c => Object.keys(c.S.skins).length >= skins.length],
    ["ascend1",  "Rebirth",          "Ascend for the first time.",     c => (c.S.ascensions || 0) >= 1]
  ].map(([id, name, desc, test]) => ({ id, name, desc, test }));

  return { generators, upgrades, skins, achievements };
})();
