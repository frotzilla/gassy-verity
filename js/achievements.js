// Achievements: unlock from the conditions in data.js, +1% to all gas each. Shown in the stats panel.
GV.ach = (() => {
  const G = GV.game, D = GV.data;
  const listEl = document.getElementById("achList");
  const countEl = document.getElementById("achCount");
  const queue = [];
  let showing = false;

  function ctx() {
    const S = G.state;
    let buildings = 0, types = 0;
    for (const g of D.generators) { const n = S.gens[g.id] || 0; buildings += n; if (n > 0) types++; }
    return { S, st: GV.stats.get(), buildings, types };
  }

  function check() {
    const c = ctx();
    for (const a of D.achievements) {
      if (!c.S.ach[a.id] && a.test(c) && G.unlock(a.id)) queue.push(a);
    }
    if (queue.length) render();
    drain();
  }

  // One toast at a time, so several unlocks in the same moment don't overwrite each other.
  function drain() {
    if (showing || !queue.length) return;
    showing = true;
    const a = queue.shift();
    GV.ui.toast("Achievement: " + a.name, 1600);
    if (GV.audio) GV.audio.chime();
    render();
    setTimeout(() => { showing = false; drain(); }, 1800);
  }

  function render() {
    const have = G.state.ach;
    countEl.textContent = Object.keys(have).length + "/" + D.achievements.length + "  (+" + Object.keys(have).length + "% gas)";
    listEl.innerHTML = D.achievements.map(a => {
      const on = !!have[a.id];
      return `<div class="ach ${on ? "on" : ""}" title="${a.desc}"><span>${on ? a.name : "???"}</span><span class="adesc">${a.desc}</span></div>`;
    }).join("");
  }

  G.onChange(check);
  setInterval(check, 3000);
  render();
  setTimeout(check, 800);
  return { check };
})();
