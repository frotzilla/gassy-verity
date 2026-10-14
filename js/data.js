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
  //     { blast: x } bigger blast bonus | { golden: x } golden clouds come x times as often (<1)
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

  [["Lucky Gas I", 1e4, 0.7], ["Lucky Gas II", 5e5, 0.6]]
    .forEach(([n, c, f], i) => add("golden" + i, n, "Golden clouds show up more often.", c, { golden: f }));

  // Four 2x tiers per building, unlocked by owning 1, 10, 25 and 50 of it.
  const tiers = [[1, 10, "I"], [10, 50, "II"], [25, 500, "III"], [50, 5000, "IV"]];
  for (const g of generators) {
    for (const [req, mult, roman] of tiers) {
      add(g.id + "_t" + roman, g.name + " Tuning " + roman, g.name + "s make 2x gas.", g.base * mult,
          { gen: g.id, mult: 2 }, s => (s.gens[g.id] || 0) >= req);
    }
  }
  upgrades.sort((a, b) => a.cost - b.cost);

  return { generators, upgrades };
})();
