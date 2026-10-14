// Bank readout and the shop panel (buildings, upgrades, save tools).
// Rows are built once and updated in place, so clicks never land on a replaced element.
GV.shop = (() => {
  const G = GV.game, D = GV.data, fmt = GV.fmt;
  const btn = document.getElementById("shopBtn");
  const panel = document.getElementById("shopPanel");
  const bankNum = document.getElementById("bankNum");
  const bankRate = document.getElementById("bankRate");
  let buyN = 1;                            // 1, 10 or "max"
  let upKey = "";

  panel.innerHTML =
    `<div class="shopHead"><b>Shop</b><span class="buyN">` +
    [1, 10, "max"].map(n => `<button type="button" data-n="${n}">${n === "max" ? "max" : "x" + n}</button>`).join("") +
    `</span></div>` +
    `<div class="shopSec">Upgrades</div><div id="shopUps"></div>` +
    `<div class="shopSec">Auto-farters</div><div id="shopGens"></div>` +
    `<div class="shopSec">Skins</div><div id="shopSkins"></div>` +
    `<div class="shopSec">Ascension</div><div class="ascend" id="shopAscend"><div id="ascInfo"></div><button type="button" data-act="ascend">Ascend</button></div>` +
    `<div class="shopFoot"><button type="button" data-act="export">export</button>` +
    `<button type="button" data-act="import">import</button><button type="button" data-act="reset">reset</button></div>`;
  const upsEl = panel.querySelector("#shopUps"), gensEl = panel.querySelector("#shopGens");

  // Skins: one-time buys, rows built once.
  const skinsEl = panel.querySelector("#shopSkins");
  const skinRows = {};
  for (const sk of D.skins) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "up skin-row"; b.dataset.skin = sk.id; b.title = sk.desc;
    b.innerHTML = `<span>${sk.name}</span><span class="ucost"></span><span class="udesc">${sk.desc}</span>`;
    skinsEl.appendChild(b); skinRows[sk.id] = { b, cost: b.children[1] };
  }

  const rows = {};
  for (const g of D.generators) {
    const row = document.createElement("button");
    row.type = "button"; row.className = "gen"; row.dataset.gen = g.id; row.title = g.desc;
    row.innerHTML = `<span class="gname"></span><span class="gown"></span><span class="gcost"></span><span class="grate"></span>`;
    gensEl.appendChild(row);
    rows[g.id] = { row, name: row.children[0], own: row.children[1], cost: row.children[2], rate: row.children[3] };
  }

  function nextUpgrades() {
    const S = G.state;
    return D.upgrades.filter(u => !S.ups[u.id] && u.show(S)).slice(0, 8);
  }

  function renderUps() {
    const list = nextUpgrades(), key = list.map(u => u.id).join();
    if (key !== upKey) {
      upKey = key;
      upsEl.innerHTML = list.length ? "" : `<div class="none">Nothing yet. Keep farting.</div>`;
      for (const u of list) {
        const b = document.createElement("button");
        b.type = "button"; b.className = "up"; b.dataset.up = u.id; b.title = u.desc;
        b.innerHTML = `<span>${u.name}</span><span class="ucost">${fmt(u.cost)}</span><span class="udesc">${u.desc}</span>`;
        upsEl.appendChild(b);
      }
    }
    for (const b of upsEl.querySelectorAll(".up")) {
      const u = D.upgrades.find(x => x.id === b.dataset.up);
      b.classList.toggle("off", u.cost > G.state.gas);
    }
  }

  function update() {
    const S = G.state, gps = G.gps();
    bankNum.textContent = fmt(S.gas) + " gas";
    bankRate.textContent = "per second: " + fmt(gps);

    const maxOwned = D.generators.reduce((m, g, i) => G.owned(g.id) > 0 ? i : m, -1);
    D.generators.forEach((g, i) => {
      const r = rows[g.id], n = buyN === "max" ? Math.max(1, G.maxAffordable(g.id)) : buyN;
      const show = i <= maxOwned + 1 || S.total >= g.base * 0.5;
      r.row.hidden = !show;
      if (!show) return;
      r.name.textContent = g.name;
      r.own.textContent = G.owned(g.id);
      r.cost.textContent = (buyN === "max" ? "x" + n + "  " : "") + fmt(G.genCost(g.id, n));
      r.rate.textContent = "+" + fmt(G.gpsOf(g.id) / Math.max(1, G.owned(g.id)) || g.gps) + "/s each";
      r.row.classList.toggle("off", G.genCost(g.id, n) > S.gas);
    });
    renderUps();
    const gain = G.crystalGain();
    panel.querySelector("#ascInfo").innerHTML =
      `Methane crystals: <b>${S.crystals}</b> (+${S.crystals}% gas)<br>Total multiplier: <b>x${G.mult().toFixed(2)}</b> (crystals and achievements)<br>` +
      `Ascending now gives <b>${gain}</b> more. Resets gas, auto-farters and upgrades; keeps skins, achievements and crystals.`;
    panel.querySelector('[data-act="ascend"]').disabled = gain < 1;
    for (const sk of D.skins) {
      const r = skinRows[sk.id], has = !!S.skins[sk.id];
      r.cost.textContent = S.skin === sk.id ? "equipped" : has ? "equip" : fmt(sk.cost);
      r.b.classList.toggle("off", !has && sk.cost > S.gas);
      r.b.classList.toggle("own", has);
    }
    for (const b of panel.querySelectorAll(".buyN button")) b.classList.toggle("on", String(buyN) === b.dataset.n);
  }

  panel.addEventListener("click", e => {
    const t = e.target.closest("button"); if (!t) return;
    if (t.dataset.gen) G.buyGen(t.dataset.gen, buyN);
    else if (t.dataset.up) G.buyUpgrade(t.dataset.up);
    else if (t.dataset.skin) { if (!G.setSkin(t.dataset.skin)) G.buySkin(t.dataset.skin); }
    else if (t.dataset.n) buyN = t.dataset.n === "max" ? "max" : +t.dataset.n;
    else if (t.dataset.act === "export") prompt("Copy this save code:", G.exportCode());
    else if (t.dataset.act === "import") {
      const code = prompt("Paste a save code:");
      if (code) GV.ui.toast(G.importCode(code) ? "Save loaded" : "Bad save code", 1500);
    } else if (t.dataset.act === "ascend") {
      const gain = G.crystalGain();
      if (gain >= 1 && confirm("Ascend for " + gain + " crystal" + (gain > 1 ? "s" : "") + "? This resets your gas, auto-farters and upgrades.")) {
        G.ascend(); GV.ui.toast("Ascended! +" + gain + " crystals", 2200);
      }
    } else if (t.dataset.act === "reset") {
      if (confirm("Delete all progress and start over?")) G.reset();
    }
    update();
  });

  GV.ui.bindPanel(btn, panel, "right", update);
  panel.hidden = innerWidth < 900;          // open by default only on wide screens

  G.onChange(update);
  setInterval(update, 250);                 // also catches price changes
  update();

  return { update };
})();
