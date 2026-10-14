// The skins tab: a grid of every skin with its picture. Click to buy or equip.
// Cards are built once and updated in place.
GV.skinsPanel = (() => {
  const G = GV.game, D = GV.data, fmt = GV.fmt;
  const btn = document.getElementById("skinsBtn");
  const panel = document.getElementById("skinsPanel");

  panel.innerHTML =
    `<div class="shopHead"><b>Skins</b><span id="skinCount" class="small"></span></div>` +
    `<div id="skinGrid"></div>`;
  const grid = panel.querySelector("#skinGrid"), countEl = panel.querySelector("#skinCount");

  const cards = {};
  for (const sk of D.skins) {
    const wrap = document.createElement("div");
    wrap.className = "skinWrap";
    const b = document.createElement("button");
    b.type = "button"; b.className = "skinCard"; b.dataset.skin = sk.id; b.title = sk.desc;
    b.innerHTML = `<span class="skinPic"><img src="${sk.file}" alt="" draggable="false" loading="lazy"></span>` +
                  `<span class="skinName">${sk.name}</span><span class="skinState"></span>`;
    wrap.appendChild(b);
    if (sk.wiki) {
      const a = document.createElement("a");
      a.className = "wikiLink"; a.href = sk.wiki; a.target = "_blank"; a.rel = "noopener"; a.textContent = "wiki";
      a.setAttribute("aria-label", sk.name + " on the Veritypedia");
      wrap.appendChild(a);
    }
    grid.appendChild(wrap);
    cards[sk.id] = { b, state: b.querySelector(".skinState") };
  }

  function update() {
    const S = G.state;
    let owned = 0;
    for (const sk of D.skins) {
      const c = cards[sk.id], has = !!S.skins[sk.id];
      if (has) owned++;
      c.state.textContent = S.skin === sk.id ? "equipped" : has ? "equip" : fmt(sk.cost);
      c.b.classList.toggle("locked", !has);
      c.b.classList.toggle("afford", !has && sk.cost <= S.gas);
      c.b.classList.toggle("on", S.skin === sk.id);
    }
    countEl.textContent = owned + "/" + D.skins.length;
  }

  panel.addEventListener("click", e => {
    const c = e.target.closest(".skinCard"); if (!c) return;
    const id = c.dataset.skin;
    if (!G.setSkin(id)) G.buySkin(id);
    update();
  });

  GV.ui.bindPanel(btn, panel, "right", update);
  G.onChange(update);
  setInterval(update, 500);
  update();
  return { update };
})();
