// Lifetime stats kept in localStorage (best combo, longest hold, totals), plus the stats panel.
GV.stats = (() => {
  const KEY = "gassyVerity.stats.v1";
  const blank = { toots: 0, bestCombo: 0, longestHold: 0, blasts: 0, poops: 0, goldens: 0 };
  const btn = document.getElementById("statsBtn");
  const panel = document.getElementById("statsPanel");
  let data = { ...blank };

  try { data = { ...blank, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} }

  panel.innerHTML = `<div id="statsRows"></div><div class="shopSec">Achievements <span id="achCount"></span></div><div id="achList"></div>`;
  const rowsEl = panel.querySelector("#statsRows");

  function render() {
    rowsEl.innerHTML =
      `<div><span>Toots</span><b>${data.toots}</b></div>` +
      `<div><span>Best combo</span><b>x${data.bestCombo}</b></div>` +
      `<div><span>Longest hold</span><b>${data.longestHold.toFixed(1)}s</b></div>` +
      `<div><span>Gas blasts</span><b>${data.blasts}</b></div>` +
      `<div><span>Poops cleaned</span><b>${data.poops}</b></div>` +
      `<div><span>Golden clouds</span><b>${data.goldens}</b></div>` +
      `<button type="button" id="statsReset">reset</button>`;
    rowsEl.querySelector("#statsReset").onclick = () => {
      if (confirm("Reset all stats?")) { data = { ...blank }; save(); render(); }
    };
  }

  // Call once per release. Returns which records were broken (not on the very first fart).
  function record(holdSec, combo) {
    const broke = [];
    if (combo > data.bestCombo) { if (combo === data.bestCombo + 1 && data.bestCombo >= 2) broke.push("combo"); data.bestCombo = combo; }
    if (holdSec > data.longestHold) { if (data.longestHold > 0 && holdSec > 1.5) broke.push("hold"); data.longestHold = holdSec; }
    data.toots++;
    save(); render();
    return broke;
  }

  function blast() { data.blasts++; save(); render(); }
  function bump(field) { data[field] = (data[field] || 0) + 1; save(); render(); }

  GV.ui.bindPanel(btn, panel, "left");
  render();

  return { record, blast, bump, get: () => data };
})();
