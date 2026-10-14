// The economy: gas balance, buildings, upgrades, frenzy, offline earnings and saving.
// UI lives in shop.js; content (prices, names) lives in data.js.
GV.game = (() => {
  const cfg = GV.config, gc = cfg.game, D = GV.data;
  const KEY = "gassyVerity.game.v1";
  const baseCharge = cfg.fullChargeMs, baseWindow = cfg.combo.windowMs;
  const genById = Object.fromEntries(D.generators.map(g => [g.id, g]));
  const upById = Object.fromEntries(D.upgrades.map(u => [u.id, u]));
  const listeners = [];

  const blank = () => ({ gas: 0, total: 0, gens: {}, ups: {}, pets: {}, skins: { verity: 1 }, skin: "verity", ach: {}, lifetime: 0, crystals: 0, ascensions: 0, frenzyUntil: 0, saved: Date.now() });
  let S = blank();
  let d = { tap: 1, gen: {}, charge: 1, window: 0, blast: 1, golden: 1, gps: 1 };  // derived from upgrades and pets

  const onChange = fn => listeners.push(fn);
  const sfx = name => { if (GV.audio && GV.audio[name]) GV.audio[name](); };
  let queued = false;
  function changed() {                  // coalesce bursts into one notification per frame-ish
    if (queued) return;
    queued = true;
    setTimeout(() => { queued = false; listeners.forEach(f => f()); }, 50);
  }

  // ---- derived values ----
  function recalc() {
    d = { tap: 1, gen: {}, charge: 1, window: 0, blast: 1, golden: 1, gps: 1 };
    let petTap = 0, petBlast = 0, petGps = 0;
    for (const pt of D.pets) {
      if (!S.pets[pt.id]) continue;
      const f = pt.fx;
      petGps += f.gps || 0; petTap += f.tap || 0; petBlast += f.blast || 0;
      if (f.golden) d.golden *= f.golden;
    }
    d.gps = 1 + petGps; d.tap *= 1 + petTap; d.blast *= 1 + petBlast;
    for (const u of D.upgrades) {
      if (!S.ups[u.id]) continue;
      const f = u.fx;
      if (f.tap) d.tap *= f.tap;
      if (f.gen) d.gen[f.gen] = (d.gen[f.gen] || 1) * f.mult;
      if (f.charge) d.charge *= f.charge;
      if (f.window) d.window += f.window;
      if (f.blast) d.blast *= f.blast;
      if (f.golden) d.golden *= f.golden;
    }
    cfg.fullChargeMs = Math.max(1000, baseCharge * d.charge);
    cfg.combo.windowMs = baseWindow + d.window;
  }

  const frenzyOn = () => Date.now() < S.frenzyUntil;
  const frenzyMult = () => frenzyOn() ? gc.frenzyMult : 1;

  function gpsOf(id) { return (S.gens[id] || 0) * genById[id].gps * (d.gen[id] || 1); }
  function baseGps() { let t = 0; for (const g of D.generators) t += gpsOf(g.id); return t * d.gps; }
  // Permanent bonuses: +1% per ascension crystal, +1% per achievement.
  const mult = () => (1 + 0.01 * S.crystals) * (1 + 0.01 * Object.keys(S.ach).length);
  const gps = () => baseGps() * mult() * frenzyMult();

  // Gas for one fart. p = how long it was held (0..1). A tap is ~1, a full hold is ~12.
  function tapValue(p, combo) {
    return d.tap * mult() * (1 + 11 * Math.pow(p, 1.5)) * (1 + 0.05 * Math.min(combo - 1, 20)) * frenzyMult();
  }

  // ---- earning ----
  function earn(x) { S.gas += x; S.total += x; S.lifetime += x; changed(); }

  // Called on every release. Returns { gain, bonus }; bonus is the gas blast payout.
  function fart({ power, combo, blast }) {
    const gain = tapValue(power, combo);
    let bonus = 0;
    if (blast) bonus = Math.max(gps() * 45, gain * 30) * d.blast;
    earn(gain + bonus);
    return { gain, bonus };
  }

  // ---- buying ----
  const owned = id => S.gens[id] || 0;

  // Price of n more of a building: geometric sum of base * growth^k.
  function genCost(id, n = 1) {
    const g = genById[id], r = gc.growth;
    return g.base * Math.pow(r, owned(id)) * (Math.pow(r, n) - 1) / (r - 1);
  }
  function maxAffordable(id) {
    let n = 0;
    while (n < 500 && genCost(id, n + 1) <= S.gas) n++;
    return n;
  }

  function buyGen(id, n) {
    if (n === "max") n = maxAffordable(id);
    if (!(n >= 1)) return false;
    const cost = genCost(id, n);
    if (cost > S.gas) return false;
    S.gas -= cost; S.gens[id] = owned(id) + n;
    recalc(); changed(); save(); sfx("buy");
    return true;
  }

  function buyUpgrade(id) {
    const u = upById[id];
    if (!u || S.ups[id] || u.cost > S.gas) return false;
    S.gas -= u.cost; S.ups[id] = 1;
    recalc(); changed(); save(); sfx("buy");
    return true;
  }

  function buyPet(id) {
    const pt = D.pets.find(x => x.id === id);
    if (!pt || S.pets[id] || pt.cost > S.gas) return false;
    S.gas -= pt.cost; S.pets[id] = 1;
    recalc(); changed(); save(); sfx("buy");
    return true;
  }

  function buySkin(id) {
    const sk = D.skins.find(x => x.id === id);
    if (!sk || S.skins[id] || sk.cost > S.gas) return false;
    S.gas -= sk.cost; S.skins[id] = 1; S.skin = id;
    changed(); save(); sfx("buy");
    return true;
  }

  function setSkin(id) {
    if (!S.skins[id]) return false;
    S.skin = id; changed(); save();
    return true;
  }

  // ---- achievements and prestige ----
  function unlock(id) {
    if (S.ach[id]) return false;
    S.ach[id] = 1; changed(); save();
    return true;
  }

  // Ascension crystals come from all gas ever earned: sqrt(lifetime / 1e8) in total.
  const crystalsEverEarned = () => Math.floor(Math.sqrt(S.lifetime / 1e8));
  const crystalGain = () => Math.max(0, crystalsEverEarned() - S.crystals);

  // Resets the run (gas, auto-farters, upgrades). Keeps pets, skins, achievements, crystals.
  function ascend() {
    const gain = crystalGain();
    if (gain < 1) return 0;
    S.crystals += gain; S.ascensions = (S.ascensions || 0) + 1;
    S.gas = 0; S.total = 0; S.gens = {}; S.ups = {}; S.frenzyUntil = 0;
    recalc(); changed(); save(); sfx("whoosh");
    return gain;
  }

  function startFrenzy() { S.frenzyUntil = Date.now() + gc.frenzySec * 1000; changed(); }

  // ---- save / load ----
  function save() {
    S.saved = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
  }

  function adopt(raw) {                 // validate loaded data field by field
    const n = blank();
    if (!raw || typeof raw !== "object") return n;
    const num = x => (typeof x === "number" && isFinite(x) && x >= 0 ? x : 0);
    n.gas = num(raw.gas); n.total = Math.max(num(raw.total), n.gas);
    n.frenzyUntil = num(raw.frenzyUntil); n.saved = num(raw.saved) || Date.now();
    for (const g of D.generators) if (raw.gens) n.gens[g.id] = Math.floor(num(raw.gens[g.id]));
    n.lifetime = Math.max(num(raw.lifetime), n.total); n.crystals = Math.floor(num(raw.crystals)); n.ascensions = Math.floor(num(raw.ascensions));
    for (const a of D.achievements) if (raw.ach && raw.ach[a.id]) n.ach[a.id] = 1;
    for (const u of D.upgrades) if (raw.ups && raw.ups[u.id]) n.ups[u.id] = 1;
    for (const pt of D.pets) if (raw.pets && raw.pets[pt.id]) n.pets[pt.id] = 1;
    for (const sk of D.skins) if (raw.skins && raw.skins[sk.id]) n.skins[sk.id] = 1;
    if (typeof raw.skin === "string" && n.skins[raw.skin]) n.skin = raw.skin;
    return n;
  }

  function load() {
    try { S = adopt(JSON.parse(localStorage.getItem(KEY) || "null")); } catch (e) { S = blank(); }
    recalc();
  }

  const exportCode = () => btoa(JSON.stringify(S));
  function importCode(code) {
    try {
      S = adopt(JSON.parse(atob(code.trim())));
      recalc(); save(); changed();
      return true;
    } catch (e) { return false; }
  }

  function reset() { S = blank(); recalc(); save(); changed(); }

  // ---- time ----
  // Gaps longer than 10s (closed tab, sleeping laptop) count as away time at reduced rate.
  let last = Date.now(), puffTimer = 0;
  function away(sec) {
    const eff = Math.min(sec, gc.offlineCapHours * 3600) * baseGps() * mult() * gc.offlineEff;
    if (eff > 0) { earn(eff); GV.ui.toast("Away " + GV.fmt.time(sec) + ": +" + GV.fmt(eff) + " gas", 3200); }
  }

  function tick() {
    const now = Date.now(), dt = (now - last) / 1000; last = now;
    if (dt > 10) { away(dt); return; }
    const g = gps();
    if (g > 0) earn(g * dt);
    // Passive production leaks a few puffs so an idle screen slowly fills with gas.
    puffTimer += dt;
    if (puffTimer > 0.8 && g > 0) {
      puffTimer = 0;
      GV.puffs.emit(document.getElementById("stage"), 0.15, 1, Math.min(1, Math.max(0.1, Math.log10(g + 1) / 8)));
    }
  }

  load();
  const gap = (Date.now() - S.saved) / 1000;
  if (gap > 30) setTimeout(() => away(gap), 600);   // after the page has drawn once
  last = Date.now();
  setInterval(tick, 100);
  setInterval(save, gc.saveSec * 1000);
  addEventListener("beforeunload", save);
  document.addEventListener("visibilitychange", () => { if (document.hidden) save(); });

  // Used by the admin panel (js/admin.js).
  const admin = {
    setGas(x) { S.gas = Math.max(0, x); changed(); save(); },
    giveCrystals(n) { S.crystals += Math.max(0, Math.floor(n)); changed(); save(); },
    unlockAll() {
      for (const s of D.skins) S.skins[s.id] = 1;
      for (const p of D.pets) S.pets[p.id] = 1;
      for (const a of D.achievements) S.ach[a.id] = 1;
      recalc(); changed(); save();
    }
  };

  return {
    admin,
    get state() { return S; },
    get goldenFactor() { return d.golden; },
    onChange, fart, gps, baseGps, gpsOf, tapValue, owned, genCost, maxAffordable,
    buyGen, buyUpgrade, buyPet, buySkin, setSkin, startFrenzy, mult, unlock, crystalGain, ascend, frenzyOn, earn,
    save, exportCode, importCode, reset
  };
})();
